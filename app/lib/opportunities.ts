import { supabase } from './supabase';

export interface Opportunity {
  id: string;
  title: string;
  organization?: string;
  organizationProfile?: {
    name: string;
    email: string;
    profileImage?: string;
  };
  location?: string;
  compensation?: string;
  type?: string;
  category: 'job' | 'funding' | 'training';
  posted: string;
  description?: string;
  deadline?: string;
  status?: string;
  hours?: string;
  contactEmails?: string[];
  referenceCodes?: string[];
  applicationForm?: {
    id: string;
    title: string;
    form_structure?: any;
    instructions?: string;
    status?: string;
  };
  metadata?: any;
  criteria?: {
    contractType?: string;
    level?: string;
    sector?: string;
    location?: string;
    fundingType?: string;
    eligibility?: string;
    amountRange?: string;
    purpose?: string;
    format?: string;
    duration?: string;
    certification?: string;
    cost?: string;
    deadline?: string;
    customFilters?: { [key: string]: string };
  };
}

// Enhanced function to fetch all opportunities with complete information
export async function getOpportunities(): Promise<{ opportunities: Opportunity[] | null, error: string | null }> {
  try {
    // Query opportunities with all related data (excluding processes)
    const { data, error } = await supabase
      .from('opportunities')
      .select(`
        id,
        title,
        opportunity_type,
        created_at,
        updated_at,
        opportunity_description (
          id,
          title,
          description,
          location,
          hours,
          status,
          metadata,
          criteria,
          created_at,
          updated_at,
          user_id,
          users!opportunity_description_user_id_fkey (
            id,
            full_name,
            email,
            ngo_profile!ngo_profile_user_id_fkey (
              id,
              name,
              email,
              profile_image_url
            )
          )
        ),
        opportunity_form_email (
          contact_emails,
          reference_codes
        ),
        opportunity_form_choice!fk_opportunity_form_choice_opportunity (
          form_id,
          forms_templates (
            id,
            title,
            sections,
            description,
            status,
            published
          )
        )
      `)
      .eq('opportunity_description.status', 'published')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching opportunities:', error);
      return { opportunities: null, error: error.message };
    }

    if (!data || data.length === 0) {
      return { opportunities: [], error: null };
    }

    // Transform the data to match the frontend interface
    const opportunities: Opportunity[] = data.map((item: any) => {
      // Handle both array and single object cases for opportunity_description
      const description = Array.isArray(item.opportunity_description) 
        ? item.opportunity_description[0] 
        : item.opportunity_description;
      
      const metadata = description?.metadata || {};
      const criteria = description?.criteria || {};
      
      // Fix: users is not an array, it's a single object
      const user = description?.users;
      const ngoProfile = user?.ngo_profile?.[0];
      
      const emailData = item.opportunity_form_email?.[0];
      const formChoice = item.opportunity_form_choice?.[0];
      const formTemplates = formChoice?.forms_templates as any;
      const formData = Array.isArray(formTemplates) ? formTemplates[0] : formTemplates;
      
      // Get location from criteria if description.location is null
      const location = description?.location || criteria?.location || null;
      
      // Get type from criteria or metadata
      const type = criteria?.contractType || metadata?.employment_type || metadata?.funding_type || getTypeLabel(item.opportunity_type);
      
      // Get compensation from criteria or metadata
      const compensation = criteria?.amountRange || metadata?.compensation || metadata?.salary || metadata?.funding_amount || null;
      
      return {
        id: item.id,
        title: description?.title || item.title,
        organization: ngoProfile?.name || user?.full_name || 'Organization',
        organizationProfile: ngoProfile ? {
          name: ngoProfile.name,
          email: ngoProfile.email,
          profileImage: ngoProfile.profile_image_url
        } : undefined,
        location: location,
        compensation: compensation,
        type: type,
        category: item.opportunity_type as 'job' | 'funding' | 'training',
        posted: formatDate(item.created_at),
        description: description?.description || 'No description available',
        deadline: criteria?.deadline || metadata?.deadline || metadata?.application_deadline,
        status: description?.status,
        hours: description?.hours || criteria?.duration || metadata?.duration,
        contactEmails: emailData?.contact_emails || [],
        referenceCodes: emailData?.reference_codes || [],
        applicationForm: formData ? {
          id: formData.id,
          title: formData.title,
          form_structure: formData.sections,
          instructions: formData.description,
          status: formData.status
        } : undefined,
        metadata: metadata,
        criteria: criteria
      };
    });

    return { opportunities, error: null };
  } catch (error: any) {
    console.error('Error in getOpportunities:', error);
    return { opportunities: null, error: error.message || 'An unexpected error occurred' };
  }
}

// Function to fetch opportunities by category
export async function getOpportunitiesByCategory(category: 'job' | 'funding' | 'training'): Promise<{ opportunities: Opportunity[] | null, error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('opportunities')
      .select(`
        id,
        title,
        opportunity_type,
        created_at,
        updated_at,
        opportunity_description!inner (
          id,
          title,
          description,
          location,
          hours,
          status,
          metadata,
          criteria,
          created_at,
          updated_at,
          user_id,
          users!opportunity_description_user_id_fkey (
            id,
            full_name,
            email,
            ngo_profile!ngo_profile_user_id_fkey (
              id,
              name,
              email,
              profile_image_url
            )
          )
        ),
        opportunity_form_email (
          contact_emails,
          reference_codes
        ),
        opportunity_form_choice!fk_opportunity_form_choice_opportunity (
          form_id,
          forms_templates (
            id,
            title,
            sections,
            description,
            status,
            published
          )
        )
      `)
      .eq('opportunity_type', category)
      .eq('opportunity_description.status', 'published')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching opportunities by category:', error);
      return { opportunities: null, error: error.message };
    }

    if (!data || data.length === 0) {
      return { opportunities: [], error: null };
    }

    // Transform the data
    const opportunities: Opportunity[] = data.map((item: any) => {
      const description = item.opportunity_description[0];
      const metadata = description?.metadata || {};
      const user = description?.users?.[0];
      const ngoProfile = user?.ngo_profile?.[0];
      const emailData = item.opportunity_form_email?.[0];
      const formChoice = item.opportunity_form_choice?.[0];
      const formTemplates = formChoice?.forms_templates as any;
      const formData = Array.isArray(formTemplates) ? formTemplates[0] : formTemplates;
      
      return {
        id: item.id,
        title: description?.title || item.title,
        organization: ngoProfile?.name || user?.full_name || 'Organization',
        organizationProfile: ngoProfile ? {
          name: ngoProfile.name,
          email: ngoProfile.email,
          profileImage: ngoProfile.profile_image_url
        } : undefined,
        location: description?.location || 'Location not specified',
        compensation: metadata?.compensation || metadata?.salary || metadata?.funding_amount || 'Not specified',
        type: metadata?.employment_type || metadata?.funding_type || getTypeLabel(item.opportunity_type),
        category: item.opportunity_type as 'job' | 'funding' | 'training',
        posted: formatDate(item.created_at),
        description: description?.description || 'No description available',
        deadline: metadata?.deadline || metadata?.application_deadline,
        status: description?.status,
        hours: description?.hours || metadata?.duration,
        contactEmails: emailData?.contact_emails || [],
        referenceCodes: emailData?.reference_codes || [],
        applicationForm: formData ? {
          id: formData.id,
          title: formData.title,
          form_structure: formData.sections,
          instructions: formData.description,
          status: formData.status
        } : undefined,
        metadata: metadata,
        criteria: description?.criteria || {}
      };
    });

    return { opportunities, error: null };
  } catch (error: any) {
    console.error('Error in getOpportunitiesByCategory:', error);
    return { opportunities: null, error: error.message || 'An unexpected error occurred' };
  }
}

// Function to search opportunities
export async function searchOpportunities(searchQuery: string, category?: 'job' | 'funding' | 'training'): Promise<{ opportunities: Opportunity[] | null, error: string | null }> {
  try {
    let query = supabase
      .from('opportunities')
      .select(`
        id,
        title,
        opportunity_type,
        created_at,
        updated_at,
        opportunity_description!inner (
          id,
          title,
          description,
          location,
          hours,
          status,
          metadata,
          criteria,
          created_at,
          updated_at,
          user_id,
          users!opportunity_description_user_id_fkey (
            id,
            full_name,
            email,
            ngo_profile!ngo_profile_user_id_fkey (
              id,
              name,
              email,
              profile_image_url
            )
          )
        ),
        opportunity_form_email (
          contact_emails,
          reference_codes
        ),
        opportunity_form_choice!fk_opportunity_form_choice_opportunity (
          form_id,
          forms_templates (
            id,
            title,
            sections,
            description,
            status,
            published
          )
        )
      `)
      .eq('opportunity_description.status', 'published');

    // Add category filter if specified
    if (category) {
      query = query.eq('opportunity_type', category);
    }

    // Add search filters
    if (searchQuery) {
      query = query.or(`
        title.ilike.%${searchQuery}%,
        opportunity_description.title.ilike.%${searchQuery}%,
        opportunity_description.description.ilike.%${searchQuery}%
      `);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error searching opportunities:', error);
      return { opportunities: null, error: error.message };
    }

    if (!data || data.length === 0) {
      return { opportunities: [], error: null };
    }

    // Transform the data
    const opportunities: Opportunity[] = data.map((item: any) => {
      const description = item.opportunity_description[0];
      const metadata = description?.metadata || {};
      const user = description?.users?.[0];
      const ngoProfile = user?.ngo_profile?.[0];
      const emailData = item.opportunity_form_email?.[0];
      const formChoice = item.opportunity_form_choice?.[0];
      const formTemplates = formChoice?.forms_templates as any;
      const formData = Array.isArray(formTemplates) ? formTemplates[0] : formTemplates;
      
      return {
        id: item.id,
        title: description?.title || item.title,
        organization: ngoProfile?.name || user?.full_name || 'Organization',
        organizationProfile: ngoProfile ? {
          name: ngoProfile.name,
          email: ngoProfile.email,
          profileImage: ngoProfile.profile_image_url
        } : undefined,
        location: description?.location || 'Location not specified',
        compensation: metadata?.compensation || metadata?.salary || metadata?.funding_amount || 'Not specified',
        type: metadata?.employment_type || metadata?.funding_type || getTypeLabel(item.opportunity_type),
        category: item.opportunity_type as 'job' | 'funding' | 'training',
        posted: formatDate(item.created_at),
        description: description?.description || 'No description available',
        deadline: metadata?.deadline || metadata?.application_deadline,
        status: description?.status,
        hours: description?.hours || metadata?.duration,
        contactEmails: emailData?.contact_emails || [],
        referenceCodes: emailData?.reference_codes || [],
        applicationForm: formData ? {
          id: formData.id,
          title: formData.title,
          form_structure: formData.sections,
          instructions: formData.description,
          status: formData.status
        } : undefined,
        metadata: metadata,
        criteria: description?.criteria || {}
      };
    });

    return { opportunities, error: null };
  } catch (error: any) {
    console.error('Error in searchOpportunities:', error);
    return { opportunities: null, error: error.message || 'An unexpected error occurred' };
  }
}

// Helper function to format dates
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    return '1 day ago';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
  } else {
    const months = Math.floor(diffDays / 30);
    return months === 1 ? '1 month ago' : `${months} months ago`;
  }
}

// Helper function to get type label
function getTypeLabel(opportunityType: string): string {
  switch (opportunityType) {
    case 'job':
      return 'Job Opportunity';
    case 'funding':
      return 'Funding Opportunity';
    case 'training':
      return 'Training Program';
    default:
      return 'Opportunity';
  }
}

// Dedicated function to fetch a single opportunity by ID with detailed debugging
export async function getOpportunityById(id: string): Promise<{ opportunity: Opportunity | null, error: string | null }> {
  try {
    // Get the opportunity with basic relationships that work
    const { data, error } = await supabase
      .from('opportunities')
      .select(`
        id,
        title,
        opportunity_type,
        created_at,
        updated_at,
        opportunity_description!inner (
          id,
          title,
          description,
          location,
          hours,
          status,
          metadata,
          criteria,
          created_at,
          updated_at,
          user_id,
          users!opportunity_description_user_id_fkey (
            id,
            full_name,
            email,
            ngo_profile!ngo_profile_user_id_fkey (
              id,
              name,
              email,
              profile_image_url
            )
          )
        ),
        opportunity_form_email (
          contact_emails,
          reference_codes
        )
      `)
      .eq('id', id)
      .eq('opportunity_description.status', 'published')
      .single();

    if (error) {
      console.error('Error fetching opportunity:', error);
      return { opportunity: null, error: error.message };
    }

    // Separately fetch form choices to avoid relationship conflicts
    const { data: formChoiceData, error: formChoiceError } = await supabase
      .from('opportunity_form_choice')
      .select(`
        id,
        form_id,
        forms_templates (
          id,
          title,
          sections,
          description,
          status,
          published
        )
      `)
      .eq('opportunity_id', id)
      .single();

    let formData = null;
    if (!formChoiceError && formChoiceData) {
      const formTemplates = formChoiceData.forms_templates as any;
      formData = Array.isArray(formTemplates) ? formTemplates[0] : formTemplates;
    }

    // Transform the data
    const description = data.opportunity_description[0];
    const metadata = description?.metadata || {};
    const user = description?.users?.[0];
    const ngoProfile = user?.ngo_profile?.[0];
    const emailData = data.opportunity_form_email?.[0];

    const opportunity: Opportunity = {
      id: data.id,
      title: description?.title || data.title,
      organization: ngoProfile?.name || user?.full_name || 'Organization',
      organizationProfile: ngoProfile ? {
        name: ngoProfile.name,
        email: ngoProfile.email,
        profileImage: ngoProfile.profile_image_url
      } : undefined,
      location: description?.location || 'Location not specified',
      compensation: metadata?.compensation || metadata?.salary || metadata?.funding_amount || 'Not specified',
      type: metadata?.employment_type || metadata?.funding_type || getTypeLabel(data.opportunity_type),
      category: data.opportunity_type as 'job' | 'funding' | 'training',
      posted: formatDate(data.created_at),
      description: description?.description || 'No description available',
      deadline: metadata?.deadline || metadata?.application_deadline,
      status: description?.status,
      hours: description?.hours || metadata?.duration,
      contactEmails: emailData?.contact_emails || [],
      referenceCodes: emailData?.reference_codes || [],
      applicationForm: formData ? {
        id: formData.id,
        title: formData.title,
        form_structure: formData.sections,
        instructions: formData.description,
        status: formData.status
      } : undefined,
      metadata: metadata,
      criteria: description?.criteria || {}
    };

    return { opportunity, error: null };

  } catch (error: any) {
    console.error('Error in getOpportunityById:', error);
    return { opportunity: null, error: error.message || 'An unexpected error occurred' };
  }
} 