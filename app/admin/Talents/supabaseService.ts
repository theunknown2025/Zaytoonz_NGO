import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export interface SeekerProfile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string | null;
  nationality: string | null;
  years_of_experience: number | null;
  fields_of_experience: string[];
  about_me: string | null;
  profile_picture_url: string | null;
  created_at: string;
  updated_at: string;
  user: {
    full_name: string;
    email: string;
    user_type: string;
  };
}

// Get paginated seeker profiles with user information
export async function getPaginatedSeekerProfiles(
  page: number = 1, 
  limit: number = 5
): Promise<{ data: SeekerProfile[] | null; error: any; totalCount: number }> {
  try {
    const offset = (page - 1) * limit;

    // Get total count
    const { count: totalCount, error: countError } = await supabase
      .from('seeker_profiles')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      return { data: null, error: countError, totalCount: 0 };
    }

    // Get paginated data
    const { data, error } = await supabase
      .from('seeker_profiles')
      .select(`
        *,
        user:users(full_name, email, user_type)
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching seeker profiles:', error);
      return { data: null, error, totalCount: 0 };
    }

    return { data: data as SeekerProfile[], error: null, totalCount: totalCount || 0 };
  } catch (error) {
    console.error('Error in getPaginatedSeekerProfiles:', error);
    return { data: null, error, totalCount: 0 };
  }
}

// Get all seeker profiles with user information
export async function getAllSeekerProfiles(): Promise<{ data: SeekerProfile[] | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('seeker_profiles')
      .select(`
        *,
        user:users(full_name, email, user_type)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching seeker profiles:', error);
      return { data: null, error };
    }

    return { data: data as SeekerProfile[], error: null };
  } catch (error) {
    console.error('Error in getAllSeekerProfiles:', error);
    return { data: null, error };
  }
}

// Get application trends data for charts
export async function getApplicationTrends(period: 'day' | 'week' | 'month' = 'day'): Promise<{ data: any[] | null; error: any }> {
  try {
    let dateFormat: string;
    let groupBy: string;
    
    switch (period) {
      case 'day':
        dateFormat = 'YYYY-MM-DD';
        groupBy = 'DATE(created_at)';
        break;
      case 'week':
        dateFormat = 'YYYY-"W"WW';
        groupBy = 'DATE_TRUNC(\'week\', created_at)';
        break;
      case 'month':
        dateFormat = 'YYYY-MM';
        groupBy = 'DATE_TRUNC(\'month\', created_at)';
        break;
      default:
        dateFormat = 'YYYY-MM-DD';
        groupBy = 'DATE(created_at)';
    }

    const { data, error } = await supabase
      .rpc('get_application_trends', {
        period_type: period
      });

    if (error) {
      // Fallback to manual query if RPC doesn't exist
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('seeker_profiles')
        .select('created_at');

      if (fallbackError) {
        return { data: null, error: fallbackError };
      }

      // Process data manually
      const trends: { [key: string]: number } = {};
      fallbackData?.forEach(profile => {
        const date = new Date(profile.created_at);
        let key: string;
        
        switch (period) {
          case 'day':
            key = date.toISOString().split('T')[0];
            break;
          case 'week':
            const weekStart = new Date(date);
            weekStart.setDate(date.getDate() - date.getDay());
            key = weekStart.toISOString().split('T')[0];
            break;
          case 'month':
            key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            break;
          default:
            key = date.toISOString().split('T')[0];
        }
        
        trends[key] = (trends[key] || 0) + 1;
      });

      const processedData = Object.entries(trends)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date));

      return { data: processedData, error: null };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error in getApplicationTrends:', error);
    return { data: null, error };
  }
}

// Get location distribution for radar chart
export async function getLocationDistribution(): Promise<{ data: any[] | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('seeker_profiles')
      .select('nationality')
      .not('nationality', 'is', null);

    if (error) {
      return { data: null, error };
    }

    // Process location data
    const locationCounts: { [key: string]: number } = {};
    data?.forEach(profile => {
      if (profile.nationality) {
        locationCounts[profile.nationality] = (locationCounts[profile.nationality] || 0) + 1;
      }
    });

    // Convert to array and get top 10 locations
    const processedData = Object.entries(locationCounts)
      .map(([location, count]) => ({ location, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return { data: processedData, error: null };
  } catch (error) {
    console.error('Error in getLocationDistribution:', error);
    return { data: null, error };
  }
}

// Get experience distribution for radar chart
export async function getExperienceDistribution(): Promise<{ data: any[] | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('seeker_profiles')
      .select('years_of_experience')
      .not('years_of_experience', 'is', null);

    if (error) {
      return { data: null, error };
    }

    // Process experience data into ranges
    const experienceRanges = {
      '0-1 years': 0,
      '2-3 years': 0,
      '4-5 years': 0,
      '6-10 years': 0,
      '11-15 years': 0,
      '16+ years': 0
    };

    data?.forEach(profile => {
      const years = profile.years_of_experience || 0;
      if (years <= 1) {
        experienceRanges['0-1 years']++;
      } else if (years <= 3) {
        experienceRanges['2-3 years']++;
      } else if (years <= 5) {
        experienceRanges['4-5 years']++;
      } else if (years <= 10) {
        experienceRanges['6-10 years']++;
      } else if (years <= 15) {
        experienceRanges['11-15 years']++;
      } else {
        experienceRanges['16+ years']++;
      }
    });

    const processedData = Object.entries(experienceRanges)
      .map(([range, count]) => ({ range, count }));

    return { data: processedData, error: null };
  } catch (error) {
    console.error('Error in getExperienceDistribution:', error);
    return { data: null, error };
  }
}

// Get seeker profile statistics
export async function getSeekerProfileStats(): Promise<{ data: any | null; error: any }> {
  try {
    // Get total count
    const { count: totalCount, error: countError } = await supabase
      .from('seeker_profiles')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      return { data: null, error: countError };
    }

    // Get profiles created in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { count: recentCount, error: recentError } = await supabase
      .from('seeker_profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', thirtyDaysAgo.toISOString());

    if (recentError) {
      return { data: null, error: recentError };
    }

    // Get most common fields of experience
    const { data: experienceData, error: experienceError } = await supabase
      .from('seeker_profiles')
      .select('fields_of_experience')
      .not('fields_of_experience', 'is', null);

    if (experienceError) {
      return { data: null, error: experienceError };
    }

    // Process fields of experience
    const fieldCounts: { [key: string]: number } = {};
    experienceData?.forEach(profile => {
      profile.fields_of_experience?.forEach((field: string) => {
        fieldCounts[field] = (fieldCounts[field] || 0) + 1;
      });
    });

    // Get top 5 fields
    const topFields = Object.entries(fieldCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([field, count]) => ({ field, count }));

    return {
      data: {
        totalCount: totalCount || 0,
        recentCount: recentCount || 0,
        topFields
      },
      error: null
    };
  } catch (error) {
    console.error('Error in getSeekerProfileStats:', error);
    return { data: null, error };
  }
}

// Search seeker profiles with pagination
export async function searchSeekerProfiles(
  searchTerm: string, 
  page: number = 1, 
  limit: number = 5
): Promise<{ data: SeekerProfile[] | null; error: any; totalCount: number }> {
  try {
    const offset = (page - 1) * limit;

    // Get total count for search
    const { count: totalCount, error: countError } = await supabase
      .from('seeker_profiles')
      .select('*', { count: 'exact', head: true })
      .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,nationality.ilike.%${searchTerm}%`);

    if (countError) {
      return { data: null, error: countError, totalCount: 0 };
    }

    // Get paginated search results
    const { data, error } = await supabase
      .from('seeker_profiles')
      .select(`
        *,
        user:users(full_name, email, user_type)
      `)
      .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,nationality.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error searching seeker profiles:', error);
      return { data: null, error, totalCount: 0 };
    }

    return { data: data as SeekerProfile[], error: null, totalCount: totalCount || 0 };
  } catch (error) {
    console.error('Error in searchSeekerProfiles:', error);
    return { data: null, error, totalCount: 0 };
  }
} 