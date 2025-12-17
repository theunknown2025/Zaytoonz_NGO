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
  sourceUrl?: string; // For scraped opportunities
  isScraped?: boolean; // Flag to identify scraped opportunities
  // Extracted opportunity fields (full-content extractions)
  isExtracted?: boolean;
  rawContent?: string;
  structuredContent?: any;
  mainInformation?: string;
  extractedFromScrapedId?: string | null;
  sortTimestamp?: number;
}

// Enhanced function to fetch all opportunities with complete information (both internal and scraped)
export async function getOpportunities(): Promise<{ opportunities: Opportunity[] | null, error: string | null }> {
  try {
    // Fetch internal NGO opportunities
    const { data: internalData, error: internalError } = await supabase
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

    if (internalError) {
      console.error('Error fetching internal opportunities:', internalError);
      return { opportunities: null, error: internalError.message };
    }

    // Fetch scraped opportunities
    const { data: scrapedData, error: scrapedError } = await supabase
      .from('scraped_opportunities')
      .select(`
        *,
        scraped_opportunity_details (
          *
        )
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (scrapedError) {
      console.error('Error fetching scraped opportunities:', scrapedError);
      return { opportunities: null, error: scrapedError.message };
    }

    // Fetch extracted opportunities (full-content)
    const { data: extractedData, error: extractedError } = await supabase
      .from('extracted_opportunity_content')
      .select('*')
      .eq('extraction_status', 'completed')
      .order('extracted_at', { ascending: false })
      .order('created_at', { ascending: false });

    if (extractedError) {
      console.error('Error fetching extracted opportunities:', extractedError);
      return { opportunities: null, error: extractedError.message };
    }

    // Transform internal opportunities
    const internalOpportunities: Opportunity[] = (internalData || []).map((item: any) => {
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
        sortTimestamp: item.created_at ? new Date(item.created_at).getTime() : 0,
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

    // Transform scraped opportunities
    const scrapedOpportunities: Opportunity[] = (scrapedData || []).map((item: any) => {
      const details = item.scraped_opportunity_details?.[0];
      const deadline = details?.deadline ? new Date(details.deadline).toLocaleDateString() : undefined;
      
      // Get the specific opportunity URL from metadata.link, fallback to source_url
      const specificUrl = details?.metadata?.link || item.source_url;
      
      return {
        id: `scraped_${item.id}`, // Prefix to distinguish from internal opportunities
        title: item.title,
        organization: details?.company || 'External Organization',
        organizationProfile: {
          name: details?.company || 'External Organization',
          email: details?.contact_info || '',
          profileImage: undefined
        },
        location: details?.location || 'Not specified',
        compensation: details?.salary_range || 'Competitive',
        type: getTypeLabel(item.opportunity_type),
        category: item.opportunity_type as 'job' | 'funding' | 'training',
        posted: formatDate(item.created_at),
        description: details?.description || 'No description available',
        deadline: deadline,
        status: 'published',
        hours: details?.hours || undefined,
        contactEmails: details?.contact_info ? [details.contact_info] : [],
        referenceCodes: [],
        metadata: details?.metadata || {},
        criteria: {
          contractType: details?.requirements || undefined,
          location: details?.location || undefined,
          deadline: deadline,
          customFilters: details?.tags || []
        },
        sourceUrl: specificUrl,
        isScraped: true,
        sortTimestamp: item.created_at ? new Date(item.created_at).getTime() : 0
      };
    });

    // Transform extracted opportunities (full-content)
    const extractedOpportunities: Opportunity[] = (extractedData || []).map((item: any) => {
      const deadlineString = item.deadline ? new Date(item.deadline).toLocaleDateString() : undefined;
      const mainInformation = [
        item.location,
        item.salary_range,
        item.job_type
      ].filter(Boolean).join(' • ');

      return {
        id: `extracted_${item.id}`,
        title: item.title,
        organization: item.company || 'External Organization',
        organizationProfile: {
          name: item.company || 'External Organization',
          email: item.contact_info || '',
          profileImage: undefined
        },
        location: item.location || 'Not specified',
        compensation: item.salary_range || 'Competitive',
        type: item.job_type || getTypeLabel(item.opportunity_type),
        category: item.opportunity_type as 'job' | 'funding' | 'training',
        posted: formatDate(item.extracted_at || item.created_at),
        description: item.description || item.raw_content || 'No description available',
        deadline: deadlineString,
        status: item.extraction_status === 'completed' ? 'published' : item.extraction_status,
        hours: item.responsibilities || undefined,
        contactEmails: item.contact_info ? [item.contact_info] : [],
        referenceCodes: [],
        metadata: item.structured_content || {},
        criteria: {
          contractType: item.job_type || undefined,
          location: item.location || undefined,
          deadline: deadlineString,
          customFilters: item.structured_content?.tags || []
        },
        sourceUrl: item.source_url,
        isExtracted: true,
        rawContent: item.raw_content,
        structuredContent: item.structured_content,
        mainInformation: mainInformation || undefined,
        extractedFromScrapedId: item.scraped_opportunity_id || null,
        sortTimestamp: (item.extracted_at || item.created_at) ? new Date(item.extracted_at || item.created_at).getTime() : 0
      };
    });

    // Combine and sort all opportunities by creation date (newest first)
    const allOpportunities = [...internalOpportunities, ...scrapedOpportunities, ...extractedOpportunities]
      .sort((a, b) => {
        const dateA = a.sortTimestamp ?? (a.posted ? new Date(a.posted).getTime() : 0);
        const dateB = b.sortTimestamp ?? (b.posted ? new Date(b.posted).getTime() : 0);
        return dateB - dateA;
      });

    return { opportunities: allOpportunities, error: null };
  } catch (error: any) {
    console.error('Error in getOpportunities:', error);
    return { opportunities: null, error: error.message || 'An unexpected error occurred' };
  }
}

// Function to fetch opportunities by category (both internal and scraped)
export async function getOpportunitiesByCategory(category: 'job' | 'funding' | 'training'): Promise<{ opportunities: Opportunity[] | null, error: string | null }> {
  try {
    // Fetch internal NGO opportunities by category
    const { data: internalData, error: internalError } = await supabase
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

    if (internalError) {
      console.error('Error fetching internal opportunities by category:', internalError);
      return { opportunities: null, error: internalError.message };
    }

    // Fetch scraped opportunities by category
    const { data: scrapedData, error: scrapedError } = await supabase
      .from('scraped_opportunities')
      .select(`
        *,
        scraped_opportunity_details (
          *
        )
      `)
      .eq('opportunity_type', category)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (scrapedError) {
      console.error('Error fetching scraped opportunities by category:', scrapedError);
      return { opportunities: null, error: scrapedError.message };
    }

    // Fetch extracted opportunities by category
    const { data: extractedData, error: extractedError } = await supabase
      .from('extracted_opportunity_content')
      .select('*')
      .eq('opportunity_type', category)
      .eq('extraction_status', 'completed')
      .order('extracted_at', { ascending: false })
      .order('created_at', { ascending: false });

    if (extractedError) {
      console.error('Error fetching extracted opportunities by category:', extractedError);
      return { opportunities: null, error: extractedError.message };
    }

    // Transform internal opportunities
    const internalOpportunities: Opportunity[] = (internalData || []).map((item: any) => {
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
        sortTimestamp: item.created_at ? new Date(item.created_at).getTime() : 0,
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

    // Transform scraped opportunities
    const scrapedOpportunities: Opportunity[] = (scrapedData || []).map((item: any) => {
      const details = item.scraped_opportunity_details?.[0];
      const deadline = details?.deadline ? new Date(details.deadline).toLocaleDateString() : undefined;
      
      // Get the specific opportunity URL from metadata.link, fallback to source_url
      const specificUrl = details?.metadata?.link || item.source_url;
      
      return {
        id: `scraped_${item.id}`,
        title: item.title,
        organization: details?.company || 'External Organization',
        organizationProfile: {
          name: details?.company || 'External Organization',
          email: details?.contact_info || '',
          profileImage: undefined
        },
        location: details?.location || 'Not specified',
        compensation: details?.salary_range || 'Competitive',
        type: getTypeLabel(item.opportunity_type),
        category: item.opportunity_type as 'job' | 'funding' | 'training',
        posted: formatDate(item.created_at),
        description: details?.description || 'No description available',
        deadline: deadline,
        status: 'published',
        hours: details?.hours || undefined,
        contactEmails: details?.contact_info ? [details.contact_info] : [],
        referenceCodes: [],
        metadata: details?.metadata || {},
        criteria: {
          contractType: details?.requirements || undefined,
          location: details?.location || undefined,
          deadline: deadline,
          customFilters: details?.tags || []
        },
        sourceUrl: specificUrl,
        isScraped: true,
        sortTimestamp: item.created_at ? new Date(item.created_at).getTime() : 0
      };
    });

    // Transform extracted opportunities
    const extractedOpportunities: Opportunity[] = (extractedData || []).map((item: any) => {
      const deadlineString = item.deadline ? new Date(item.deadline).toLocaleDateString() : undefined;
      const mainInformation = [
        item.location,
        item.salary_range,
        item.job_type
      ].filter(Boolean).join(' • ');

      return {
        id: `extracted_${item.id}`,
        title: item.title,
        organization: item.company || 'External Organization',
        organizationProfile: {
          name: item.company || 'External Organization',
          email: item.contact_info || '',
          profileImage: undefined
        },
        location: item.location || 'Not specified',
        compensation: item.salary_range || 'Competitive',
        type: item.job_type || getTypeLabel(item.opportunity_type),
        category: item.opportunity_type as 'job' | 'funding' | 'training',
        posted: formatDate(item.extracted_at || item.created_at),
        description: item.description || item.raw_content || 'No description available',
        deadline: deadlineString,
        status: item.extraction_status === 'completed' ? 'published' : item.extraction_status,
        hours: item.responsibilities || undefined,
        contactEmails: item.contact_info ? [item.contact_info] : [],
        referenceCodes: [],
        metadata: item.structured_content || {},
        criteria: {
          contractType: item.job_type || undefined,
          location: item.location || undefined,
          deadline: deadlineString,
          customFilters: item.structured_content?.tags || []
        },
        sourceUrl: item.source_url,
        isExtracted: true,
        rawContent: item.raw_content,
        structuredContent: item.structured_content,
        mainInformation: mainInformation || undefined,
        extractedFromScrapedId: item.scraped_opportunity_id || null,
        sortTimestamp: (item.extracted_at || item.created_at) ? new Date(item.extracted_at || item.created_at).getTime() : 0
      };
    });

    // Combine and sort all opportunities by creation date (newest first)
    const allOpportunities = [...internalOpportunities, ...scrapedOpportunities, ...extractedOpportunities]
      .sort((a, b) => {
        const dateA = a.sortTimestamp ?? (a.posted ? new Date(a.posted).getTime() : 0);
        const dateB = b.sortTimestamp ?? (b.posted ? new Date(b.posted).getTime() : 0);
        return dateB - dateA;
      });

    return { opportunities: allOpportunities, error: null };
  } catch (error: any) {
    console.error('Error in getOpportunitiesByCategory:', error);
    return { opportunities: null, error: error.message || 'An unexpected error occurred' };
  }
}

// Function to search opportunities (both internal and scraped)
export async function searchOpportunities(searchQuery: string, category?: 'job' | 'funding' | 'training'): Promise<{ opportunities: Opportunity[] | null, error: string | null }> {
  try {
    // Search internal NGO opportunities
    let internalQuery = supabase
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
      internalQuery = internalQuery.eq('opportunity_type', category);
    }

    // Add search filters
    if (searchQuery) {
      internalQuery = internalQuery.or(`
        title.ilike.%${searchQuery}%,
        opportunity_description.title.ilike.%${searchQuery}%,
        opportunity_description.description.ilike.%${searchQuery}%
      `);
    }

    const { data: internalData, error: internalError } = await internalQuery.order('created_at', { ascending: false });

    if (internalError) {
      console.error('Error searching internal opportunities:', internalError);
      return { opportunities: null, error: internalError.message };
    }

    // Search scraped opportunities
    let scrapedQuery = supabase
      .from('scraped_opportunities')
      .select(`
        *,
        scraped_opportunity_details (
          *
        )
      `)
      .eq('status', 'active');

    // Add category filter if specified
    if (category) {
      scrapedQuery = scrapedQuery.eq('opportunity_type', category);
    }

    // Add search filters for scraped opportunities
    if (searchQuery) {
      scrapedQuery = scrapedQuery.or(`
        title.ilike.%${searchQuery}%,
        scraped_opportunity_details.description.ilike.%${searchQuery}%,
        scraped_opportunity_details.company.ilike.%${searchQuery}%
      `);
    }

    const { data: scrapedData, error: scrapedError } = await scrapedQuery.order('created_at', { ascending: false });

    if (scrapedError) {
      console.error('Error searching scraped opportunities:', scrapedError);
      return { opportunities: null, error: scrapedError.message };
    }

    // Transform internal opportunities
    const internalOpportunities: Opportunity[] = (internalData || []).map((item: any) => {
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

    // Transform scraped opportunities
    const scrapedOpportunities: Opportunity[] = (scrapedData || []).map((item: any) => {
      const details = item.scraped_opportunity_details?.[0];
      const deadline = details?.deadline ? new Date(details.deadline).toLocaleDateString() : undefined;
      
      // Get the specific opportunity URL from metadata.link, fallback to source_url
      const specificUrl = details?.metadata?.link || item.source_url;
      
      return {
        id: `scraped_${item.id}`,
        title: item.title,
        organization: details?.company || 'External Organization',
        organizationProfile: {
          name: details?.company || 'External Organization',
          email: details?.contact_info || '',
          profileImage: undefined
        },
        location: details?.location || 'Not specified',
        compensation: details?.salary_range || 'Competitive',
        type: getTypeLabel(item.opportunity_type),
        category: item.opportunity_type as 'job' | 'funding' | 'training',
        posted: formatDate(item.created_at),
        description: details?.description || 'No description available',
        deadline: deadline,
        status: 'published',
        hours: details?.hours || undefined,
        contactEmails: details?.contact_info ? [details.contact_info] : [],
        referenceCodes: [],
        metadata: details?.metadata || {},
        criteria: {
          contractType: details?.requirements || undefined,
          location: details?.location || undefined,
          deadline: deadline,
          customFilters: details?.tags || []
        },
        sourceUrl: specificUrl,
        isScraped: true
      };
    });

    // Combine and sort all opportunities by creation date (newest first)
    const allOpportunities = [...internalOpportunities, ...scrapedOpportunities]
      .sort((a, b) => {
        const dateA = new Date(a.posted);
        const dateB = new Date(b.posted);
        return dateB.getTime() - dateA.getTime();
      });

    return { opportunities: allOpportunities, error: null };
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