import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Public URL base for published opportunities
const publicBaseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

/**
 * Interface for publish status
 */
export interface PublishStatus {
  isPublished: boolean;
  publishedAt?: string;
  slug?: string;
  publicUrl?: string;
}

/**
 * Checks if code is running in browser environment
 */
const isBrowser = () => {
  return typeof window !== 'undefined';
};

/**
 * Publishes an opportunity by generating a slug based on its title
 * @param opportunityId The ID of the opportunity to publish
 * @returns Status object with success flag and the public URL
 */
export const publishOpportunity = async (opportunityId: string): Promise<{ success: boolean; publicUrl?: string; errorMessage?: string }> => {
  try {
    // Get the opportunity description to access its title
    const { data: description, error: descriptionError } = await supabase
      .from('opportunity_description')
      .select('title')
      .eq('opportunity_id', opportunityId)
      .maybeSingle();
    
    if (descriptionError) {
      console.error('Error fetching opportunity description:', descriptionError);
      return { 
        success: false, 
        errorMessage: 'Error fetching opportunity details' 
      };
    }
    
    // If no description found, get the title from the opportunities table
    let title = '';
    if (!description || !description.title) {
      const { data: opportunity, error: opportunityError } = await supabase
        .from('opportunities')
        .select('title')
        .eq('id', opportunityId)
        .single();
      
      if (opportunityError || !opportunity) {
        return { 
          success: false, 
          errorMessage: 'Opportunity not found' 
        };
      }
      
      title = opportunity.title;
    } else {
      title = description.title;
    }

    // Generate a slug for the opportunity
    const slug = generateSlug(title) + '-' + Date.now().toString().substring(7);
    
    // Store the slug in local storage only if in browser environment
    if (isBrowser()) {
      try {
        // Get existing published opportunities from storage
        const existingPublished = JSON.parse(localStorage.getItem('publishedOpportunities') || '{}');
        
        // Add/update this opportunity
        existingPublished[opportunityId] = {
          slug: slug,
          publishedAt: new Date().toISOString()
        };
        
        // Save back to storage
        localStorage.setItem('publishedOpportunities', JSON.stringify(existingPublished));
      } catch (storageError) {
        console.warn('Could not save to local storage:', storageError);
        // Continue anyway since this is just for tracking
      }
    }
    
    return { 
      success: true, 
      publicUrl: `${publicBaseUrl}/ngo/opportunities/${slug}?id=${opportunityId}` 
    };
  } catch (error: any) {
    console.error('Error publishing opportunity:', error);
    return { 
      success: false, 
      errorMessage: error.message || 'An error occurred while publishing' 
    };
  }
};

/**
 * Gets the publish status of an opportunity from local storage
 * @param opportunityId The ID of the opportunity to check
 * @returns Publish status object
 */
export const getPublishStatus = async (opportunityId: string): Promise<PublishStatus> => {
  try {
    // Only access localStorage in browser environment
    if (isBrowser()) {
      // Check local storage for published status
      const publishedOpportunities = JSON.parse(localStorage.getItem('publishedOpportunities') || '{}');
      const opportunityData = publishedOpportunities[opportunityId];
      
      if (!opportunityData) {
        return { isPublished: false };
      }
      
      return {
        isPublished: true,
        publishedAt: opportunityData.publishedAt,
        slug: opportunityData.slug,
        publicUrl: `${publicBaseUrl}/ngo/opportunities/${opportunityData.slug}?id=${opportunityId}`,
      };
    }
    
    // Default return for server environment
    return { isPublished: false };
  } catch (error) {
    console.error('Error getting publish status:', error);
    return { isPublished: false };
  }
};

/**
 * Generate a URL-friendly slug from a string
 * @param str The string to convert to a slug
 * @returns The slug
 */
const generateSlug = (str: string): string => {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove non-word chars
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
    .substring(0, 60); // Limit length
}; 