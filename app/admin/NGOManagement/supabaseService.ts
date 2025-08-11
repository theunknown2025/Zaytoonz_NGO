import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export interface NGOProfile {
  id: string;
  user_id: string;
  name: string;
  email: string;
  year_created: string;
  legal_rep_name: string;
  legal_rep_email: string;
  legal_rep_phone: string;
  legal_rep_function: string;
  profile_image_url?: string;
  created_at: string;
  updated_at: string;
  approval_status: 'pending' | 'approved' | 'rejected';
  admin_notes?: string;
  approved_at?: string;
  approved_by?: string;
  // Statistics
  opportunities_count?: number;
  applications_count?: number;
  active_opportunities_count?: number;
  user?: {
    full_name: string;
    email: string;
    user_type: string;
  };
}

// Get paginated NGO profiles with user information
export async function getPaginatedNGOProfiles(
  page: number = 1, 
  limit: number = 10
): Promise<{ data: NGOProfile[] | null; error: any; totalCount: number }> {
  try {
    const offset = (page - 1) * limit;

    // Get total count
    const { count: totalCount, error: countError } = await supabase
      .from('ngo_profile')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      return { data: null, error: countError, totalCount: 0 };
    }

    // Get paginated data with user information
    const { data, error } = await supabase
      .from('ngo_profile')
      .select(`
        *,
        user:users!user_id(full_name, email, user_type)
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching NGO profiles:', error);
      return { data: null, error, totalCount: 0 };
    }

    // Get statistics for each NGO
    const ngosWithStats = await Promise.all(
      (data || []).map(async (ngo) => {
        try {
          // Get opportunities created by this NGO user
          const { data: opportunities, error: oppError } = await supabase
            .from('opportunity_description')
            .select('id, opportunity_id, status, title')
            .eq('user_id', ngo.user_id);

          if (oppError) {
            console.error('Error fetching opportunities:', oppError);
          }

          const opportunitiesCount = opportunities?.length || 0;
          const activeOpportunitiesCount = opportunities?.filter(o => 
            o.status === 'published' || o.status === 'active'
          ).length || 0;

          // Get applications count
          let applicationsCount = 0;
          if (opportunities && opportunities.length > 0) {
            const opportunityIds = opportunities.map(o => o.opportunity_id).filter(Boolean);
            const { data: applications, error: appError } = await supabase
              .from('opportunity_applications')
              .select('id')
              .in('opportunity_id', opportunityIds);
            
            if (!appError) {
              applicationsCount = applications?.length || 0;
            }
          }

          return {
            ...ngo,
            opportunities_count: opportunitiesCount,
            applications_count: applicationsCount,
            active_opportunities_count: activeOpportunitiesCount,
          };
        } catch (statError) {
          console.error(`Error fetching stats for NGO ${ngo.id}:`, statError);
          return {
            ...ngo,
            opportunities_count: 0,
            applications_count: 0,
            active_opportunities_count: 0,
          };
        }
      })
    );

    return { data: ngosWithStats as NGOProfile[], error: null, totalCount: totalCount || 0 };
  } catch (error) {
    console.error('Error in getPaginatedNGOProfiles:', error);
    return { data: null, error, totalCount: 0 };
  }
}

// Get all NGO profiles with user information
export async function getAllNGOProfiles(): Promise<{ data: NGOProfile[] | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('ngo_profile')
      .select(`
        *,
        user:users!user_id(full_name, email, user_type)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching NGO profiles:', error);
      return { data: null, error };
    }

    // Get statistics for each NGO
    const ngosWithStats = await Promise.all(
      (data || []).map(async (ngo) => {
        try {
          // Get opportunities created by this NGO user
          const { data: opportunities, error: oppError } = await supabase
            .from('opportunity_description')
            .select('id, opportunity_id, status, title')
            .eq('user_id', ngo.user_id);

          if (oppError) {
            console.error('Error fetching opportunities:', oppError);
          }

          const opportunitiesCount = opportunities?.length || 0;
          const activeOpportunitiesCount = opportunities?.filter(o => 
            o.status === 'published' || o.status === 'active'
          ).length || 0;

          // Get applications count
          let applicationsCount = 0;
          if (opportunities && opportunities.length > 0) {
            const opportunityIds = opportunities.map(o => o.opportunity_id).filter(Boolean);
            const { data: applications, error: appError } = await supabase
              .from('opportunity_applications')
              .select('id')
              .in('opportunity_id', opportunityIds);
            
            if (!appError) {
              applicationsCount = applications?.length || 0;
            }
          }

          return {
            ...ngo,
            opportunities_count: opportunitiesCount,
            applications_count: applicationsCount,
            active_opportunities_count: activeOpportunitiesCount,
          };
        } catch (statError) {
          console.error(`Error fetching stats for NGO ${ngo.id}:`, statError);
          return {
            ...ngo,
            opportunities_count: 0,
            applications_count: 0,
            active_opportunities_count: 0,
          };
        }
      })
    );

    return { data: ngosWithStats as NGOProfile[], error: null };
  } catch (error) {
    console.error('Error in getAllNGOProfiles:', error);
    return { data: null, error };
  }
}

// Get NGO profile statistics
export async function getNGOProfileStats(): Promise<{ data: any | null; error: any }> {
  try {
    // Get total count
    const { count: totalCount, error: countError } = await supabase
      .from('ngo_profile')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      return { data: null, error: countError };
    }

    // Get profiles created in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { count: recentCount, error: recentError } = await supabase
      .from('ngo_profile')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', thirtyDaysAgo.toISOString());

    if (recentError) {
      return { data: null, error: recentError };
    }

    // Get approval status distribution
    const { data: approvalData, error: approvalError } = await supabase
      .from('ngo_profile')
      .select('approval_status');

    if (approvalError) {
      return { data: null, error: approvalError };
    }

    // Process approval status
    const approvalCounts = {
      pending: 0,
      approved: 0,
      rejected: 0
    };

    approvalData?.forEach(profile => {
      const status = profile.approval_status || 'pending';
      approvalCounts[status as keyof typeof approvalCounts]++;
    });

    return {
      data: {
        totalCount: totalCount || 0,
        recentCount: recentCount || 0,
        approvalCounts
      },
      error: null
    };
  } catch (error) {
    console.error('Error in getNGOProfileStats:', error);
    return { data: null, error };
  }
}

// Search NGO profiles with pagination
export async function searchNGOProfiles(
  searchTerm: string, 
  page: number = 1, 
  limit: number = 10
): Promise<{ data: NGOProfile[] | null; error: any; totalCount: number }> {
  try {
    const offset = (page - 1) * limit;

    // Get total count for search
    const { count: totalCount, error: countError } = await supabase
      .from('ngo_profile')
      .select('*', { count: 'exact', head: true })
      .or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,legal_rep_name.ilike.%${searchTerm}%`);

    if (countError) {
      return { data: null, error: countError, totalCount: 0 };
    }

    // Get paginated search results
    const { data, error } = await supabase
      .from('ngo_profile')
      .select(`
        *,
        user:users!user_id(full_name, email, user_type)
      `)
      .or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,legal_rep_name.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error searching NGO profiles:', error);
      return { data: null, error, totalCount: 0 };
    }

    // Get statistics for each NGO
    const ngosWithStats = await Promise.all(
      (data || []).map(async (ngo) => {
        try {
          // Get opportunities created by this NGO user
          const { data: opportunities, error: oppError } = await supabase
            .from('opportunity_description')
            .select('id, opportunity_id, status, title')
            .eq('user_id', ngo.user_id);

          if (oppError) {
            console.error('Error fetching opportunities:', oppError);
          }

          const opportunitiesCount = opportunities?.length || 0;
          const activeOpportunitiesCount = opportunities?.filter(o => 
            o.status === 'published' || o.status === 'active'
          ).length || 0;

          // Get applications count
          let applicationsCount = 0;
          if (opportunities && opportunities.length > 0) {
            const opportunityIds = opportunities.map(o => o.opportunity_id).filter(Boolean);
            const { data: applications, error: appError } = await supabase
              .from('opportunity_applications')
              .select('id')
              .in('opportunity_id', opportunityIds);
            
            if (!appError) {
              applicationsCount = applications?.length || 0;
            }
          }

          return {
            ...ngo,
            opportunities_count: opportunitiesCount,
            applications_count: applicationsCount,
            active_opportunities_count: activeOpportunitiesCount,
          };
        } catch (statError) {
          console.error(`Error fetching stats for NGO ${ngo.id}:`, statError);
          return {
            ...ngo,
            opportunities_count: 0,
            applications_count: 0,
            active_opportunities_count: 0,
          };
        }
      })
    );

    return { data: ngosWithStats as NGOProfile[], error: null, totalCount: totalCount || 0 };
  } catch (error) {
    console.error('Error in searchNGOProfiles:', error);
    return { data: null, error, totalCount: 0 };
  }
}

// Update NGO approval status
export async function updateNGOApprovalStatus(
  ngoId: string, 
  action: 'approve' | 'reject', 
  notes?: string
): Promise<{ data: any | null; error: any }> {
  try {
    const updateData = {
      approval_status: action === 'approve' ? 'approved' : 'rejected',
      admin_notes: notes,
      approved_at: action === 'approve' ? new Date().toISOString() : null,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('ngo_profile')
      .update(updateData)
      .eq('id', ngoId)
      .select()
      .single();

    if (error) {
      console.error('Error updating NGO approval status:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error in updateNGOApprovalStatus:', error);
    return { data: null, error };
  }
}
