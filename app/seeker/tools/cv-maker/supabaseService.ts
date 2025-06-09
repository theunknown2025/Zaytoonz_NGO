import { createClient } from '@supabase/supabase-js';
import { CVData } from './types';
import { AuthService } from '@/app/lib/auth';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Function to get current user ID
const getCurrentUserId = async (): Promise<string | null> => {
  try {
    const { user } = await AuthService.getUser();
    return user?.id || null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

export interface SavedCV {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  sections: string[];
  available_sections: string[];
  general_info: any;
  summary: string;
  additional: string;
  work_experiences?: any[];
  education?: any[];
  skills?: any[];
  languages?: any[];
  certificates?: any[];
  projects?: any[];
}

// Save a new CV or update existing one
export async function saveCV(cvData: CVData, cvName: string, cvId?: string, sections: string[] = [], availableSections: string[] = []) {
  try {
    // Get current user ID
    const userId = await getCurrentUserId();
    if (!userId) {
      throw new Error('User not authenticated');
    }

    let cvResult;
    
    if (cvId) {
      // Update existing CV
      cvResult = await supabase
        .from('cvs')
        .update({
          name: cvName,
          general_info: cvData.general,
          summary: cvData.summary,
          additional: cvData.additional,
          sections: sections,
          available_sections: availableSections,
          updated_at: new Date().toISOString()
        })
        .eq('id', cvId)
        .eq('user_id', userId) // Ensure user can only update their own CVs
        .select()
        .single();
    } else {
      // Create new CV
      cvResult = await supabase
        .from('cvs')
        .insert({
          user_id: userId,
          name: cvName,
          general_info: cvData.general,
          summary: cvData.summary,
          additional: cvData.additional,
          sections: sections,
          available_sections: availableSections
        })
        .select()
        .single();
    }

    if (cvResult.error) {
      throw cvResult.error;
    }

    const savedCvId = cvResult.data.id;

    // If updating, delete existing related data first
    if (cvId) {
      await Promise.all([
        supabase.from('cv_work_experiences').delete().eq('cv_id', cvId),
        supabase.from('cv_education').delete().eq('cv_id', cvId),
        supabase.from('cv_skills').delete().eq('cv_id', cvId),
        supabase.from('cv_languages').delete().eq('cv_id', cvId),
        supabase.from('cv_certificates').delete().eq('cv_id', cvId),
        supabase.from('cv_projects').delete().eq('cv_id', cvId)
      ]);
    }

    // Save related data
    const savePromises = [];

    // Save work experiences
    if (cvData.work && cvData.work.length > 0) {
      const workData = cvData.work.map((work, index) => ({
        cv_id: savedCvId,
        position: work.position,
        company: work.company,
        location: work.location,
        start_date: work.startDate || null,
        end_date: work.endDate || null,
        is_current: work.current,
        description: work.description,
        sort_order: index
      }));
      savePromises.push(supabase.from('cv_work_experiences').insert(workData));
    }

    // Save education
    if (cvData.education && cvData.education.length > 0) {
      const eduData = cvData.education.map((edu, index) => ({
        cv_id: savedCvId,
        degree: edu.degree,
        institution: edu.institution,
        location: edu.location,
        start_date: edu.startDate || null,
        end_date: edu.endDate || null,
        description: edu.description,
        sort_order: index
      }));
      savePromises.push(supabase.from('cv_education').insert(eduData));
    }

    // Save skills
    if (cvData.skills && cvData.skills.length > 0) {
      const skillsData = cvData.skills.map((skill, index) => ({
        cv_id: savedCvId,
        name: skill.name,
        level: skill.level,
        sort_order: index
      }));
      savePromises.push(supabase.from('cv_skills').insert(skillsData));
    }

    // Save languages
    if (cvData.languages && cvData.languages.length > 0) {
      const languagesData = cvData.languages.map((lang, index) => ({
        cv_id: savedCvId,
        language: lang.language,
        proficiency: lang.proficiency,
        sort_order: index
      }));
      savePromises.push(supabase.from('cv_languages').insert(languagesData));
    }

    // Save certificates
    if (cvData.certificates && cvData.certificates.length > 0) {
      const certsData = cvData.certificates.map((cert, index) => ({
        cv_id: savedCvId,
        name: cert.name,
        issuer: cert.issuer,
        issue_date: cert.date || null,
        description: cert.description,
        sort_order: index
      }));
      savePromises.push(supabase.from('cv_certificates').insert(certsData));
    }

    // Save projects
    if (cvData.projects && cvData.projects.length > 0) {
      const projectsData = cvData.projects.map((project, index) => ({
        cv_id: savedCvId,
        title: project.title,
        role: project.role,
        start_date: project.startDate || null,
        end_date: project.endDate || null,
        description: project.description,
        url: project.url,
        sort_order: index
      }));
      savePromises.push(supabase.from('cv_projects').insert(projectsData));
    }

    // Execute all save operations
    await Promise.all(savePromises);

    return { data: cvResult.data, error: null };
  } catch (error) {
    console.error('Error saving CV:', error);
    return { data: null, error };
  }
}

// Get all CVs for the user
export async function getCVs() {
  try {
    // Get current user ID
    const userId = await getCurrentUserId();
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const result = await supabase
      .from('cvs')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (result.error) {
      throw result.error;
    }

    return { data: result.data, error: null };
  } catch (error) {
    console.error('Error fetching CVs:', error);
    return { data: null, error };
  }
}

// Get a specific CV with all related data
export async function getCVById(cvId: string): Promise<{ data: any | null; error: any }> {
  try {
    // Get current user ID
    const userId = await getCurrentUserId();
    if (!userId) {
      throw new Error('User not authenticated');
    }

    // Get main CV data
    const cvResult = await supabase
      .from('cvs')
      .select('*')
      .eq('id', cvId)
      .eq('user_id', userId) // Ensure user can only access their own CVs
      .single();

    if (cvResult.error) {
      throw cvResult.error;
    }

    // Get all related data
    const [workResult, eduResult, skillsResult, languagesResult, certsResult, projectsResult] = await Promise.all([
      supabase.from('cv_work_experiences').select('*').eq('cv_id', cvId).order('sort_order'),
      supabase.from('cv_education').select('*').eq('cv_id', cvId).order('sort_order'),
      supabase.from('cv_skills').select('*').eq('cv_id', cvId).order('sort_order'),
      supabase.from('cv_languages').select('*').eq('cv_id', cvId).order('sort_order'),
      supabase.from('cv_certificates').select('*').eq('cv_id', cvId).order('sort_order'),
      supabase.from('cv_projects').select('*').eq('cv_id', cvId).order('sort_order')
    ]);

    // Transform data back to CV format
    const cvData: CVData = {
      general: cvResult.data.general_info,
      work: workResult.data?.map((work: any) => ({
        id: work.id,
        position: work.position,
        company: work.company,
        location: work.location,
        startDate: work.start_date,
        endDate: work.end_date,
        current: work.is_current,
        description: work.description
      })) || [],
      education: eduResult.data?.map((edu: any) => ({
        id: edu.id,
        degree: edu.degree,
        institution: edu.institution,
        location: edu.location,
        startDate: edu.start_date,
        endDate: edu.end_date,
        description: edu.description
      })) || [],
      skills: skillsResult.data?.map((skill: any) => ({
        id: skill.id,
        name: skill.name,
        level: skill.level
      })) || [],
      languages: languagesResult.data?.map((lang: any) => ({
        id: lang.id,
        language: lang.language,
        proficiency: lang.proficiency
      })) || [],
      summary: cvResult.data.summary || '',
      certificates: certsResult.data?.map((cert: any) => ({
        id: cert.id,
        name: cert.name,
        issuer: cert.issuer,
        date: cert.issue_date,
        description: cert.description
      })) || [],
      projects: projectsResult.data?.map((project: any) => ({
        id: project.id,
        title: project.title,
        role: project.role,
        startDate: project.start_date,
        endDate: project.end_date,
        description: project.description,
        url: project.url
      })) || [],
      volunteering: [],
      publications: [],
      references: [],
      additional: cvResult.data.additional || ''
    };

    const fullCV = {
      id: cvResult.data.id,
      name: cvResult.data.name,
      created_at: cvResult.data.created_at,
      updated_at: cvResult.data.updated_at,
      sections: cvResult.data.sections,
      availableSections: cvResult.data.available_sections,
      data: cvData
    };

    return { data: fullCV, error: null };
  } catch (error) {
    console.error('Error fetching CV by ID:', error);
    return { data: null, error };
  }
}

// Delete a CV and all related data
export async function deleteCV(cvId: string) {
  try {
    // Get current user ID
    const userId = await getCurrentUserId();
    if (!userId) {
      throw new Error('User not authenticated');
    }

    // Delete main CV (cascade will handle related data)
    const result = await supabase
      .from('cvs')
      .delete()
      .eq('id', cvId)
      .eq('user_id', userId); // Ensure user can only delete their own CVs

    if (result.error) {
      throw result.error;
    }

    return { data: true, error: null };
  } catch (error) {
    console.error('Error deleting CV:', error);
    return { data: null, error };
  }
}

// Update CV name
export async function updateCVName(cvId: string, newName: string) {
  try {
    // Get current user ID
    const userId = await getCurrentUserId();
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const result = await supabase
      .from('cvs')
      .update({ name: newName, updated_at: new Date().toISOString() })
      .eq('id', cvId)
      .eq('user_id', userId) // Ensure user can only update their own CVs
      .select()
      .single();

    if (result.error) {
      throw result.error;
    }

    return { data: result.data, error: null };
  } catch (error) {
    console.error('Error updating CV name:', error);
    return { data: null, error };
  }
} 