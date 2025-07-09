import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';

interface FieldMapping {
  id: string;
  name: string;
  selector: string;
  type: 'text' | 'link' | 'image' | 'date';
  required: boolean;
}

interface ExtractedItem {
  [key: string]: string | null;
}

export async function POST(request: NextRequest) {
  try {
    const { item, sourceUrl, fields } = await request.json();

    if (!item || !sourceUrl || !fields) {
      return NextResponse.json(
        { error: 'Missing required data: item, sourceUrl, and fields are required' },
        { status: 400 }
      );
    }

    console.log('🔍 Saving scraped opportunity:', item);

    // Determine the opportunity type based on the source URL or content
    const opportunityType = determineOpportunityType(sourceUrl, item, fields);

    // Map the scraped data to database fields
    const opportunityData = mapScrapedDataToDatabase(item, fields, sourceUrl, opportunityType);

    // Save to the scraped_opportunities table (separate from user opportunities)
    const { data: scrapedOpportunity, error: scrapedOpportunityError } = await supabase
      .from('scraped_opportunities')
      .insert({
        title: opportunityData.title,
        opportunity_type: opportunityType,
        source_url: sourceUrl,
        scraper_config: {
          fields: fields,
          scraped_fields: Object.keys(item),
          scraper_version: '1.0'
        },
        status: 'active',
        scraped_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (scrapedOpportunityError) {
      console.error('Error creating scraped opportunity:', scrapedOpportunityError);
      return NextResponse.json(
        { error: 'Failed to create scraped opportunity', details: scrapedOpportunityError.message },
        { status: 500 }
      );
    }

    // Save detailed information to scraped_opportunity_details table
    const { error: detailsError } = await supabase
      .from('scraped_opportunity_details')
      .insert({
        scraped_opportunity_id: scrapedOpportunity.id,
        description: opportunityData.description,
        location: opportunityData.location,
        company: opportunityData.company,
        hours: opportunityData.hours,
        deadline: opportunityData.deadline,
        requirements: opportunityData.requirements,
        benefits: opportunityData.benefits,
        salary_range: opportunityData.salary,
        contact_info: opportunityData.contact,
        tags: opportunityData.tags,
        metadata: {
          ...opportunityData.metadata,
          original_scraped_data: item
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (detailsError) {
      console.error('Error creating scraped opportunity details:', detailsError);
      // If details fail, we should clean up the main record
      await supabase.from('scraped_opportunities').delete().eq('id', scrapedOpportunity.id);
      return NextResponse.json(
        { error: 'Failed to create scraped opportunity details', details: detailsError.message },
        { status: 500 }
      );
    }

    // Also save to legacy scraped_jobs table for backward compatibility if it's a job
    if (opportunityType === 'job') {
      const { error: legacyJobError } = await supabase
        .from('scraped_jobs')
        .insert({
          title: opportunityData.title,
          company: opportunityData.company,
          location: opportunityData.location,
          description: opportunityData.description,
          source_url: sourceUrl,
          scraped_at: new Date().toISOString(),
          is_active: true,
          tags: opportunityData.tags,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (legacyJobError) {
        console.warn('Failed to save to legacy scraped_jobs table:', legacyJobError);
        // This is not critical, so we don't fail the request
      }
    }

    console.log('✅ Successfully saved scraped opportunity:', scrapedOpportunity.id);

    return NextResponse.json({
      success: true,
      opportunity: {
        id: scrapedOpportunity.id,
        title: opportunityData.title,
        type: opportunityType,
        source_url: sourceUrl,
        created_at: scrapedOpportunity.created_at
      }
    });

  } catch (error) {
    console.error('❌ Error saving scraped opportunity:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Helper function to determine opportunity type based on URL and content
function determineOpportunityType(sourceUrl: string, item: ExtractedItem, fields: FieldMapping[]): 'job' | 'funding' | 'training' {
  const url = sourceUrl.toLowerCase();
  const content = JSON.stringify(item).toLowerCase();

  // Check URL patterns
  if (url.includes('job') || url.includes('emploi') || url.includes('career') || url.includes('vacancy')) {
    return 'job';
  }
  
  if (url.includes('funding') || url.includes('grant') || url.includes('finance') || url.includes('bourse')) {
    return 'funding';
  }
  
  if (url.includes('training') || url.includes('formation') || url.includes('course') || url.includes('workshop')) {
    return 'training';
  }

  // Check content patterns
  if (content.includes('job') || content.includes('emploi') || content.includes('position') || content.includes('poste')) {
    return 'job';
  }
  
  if (content.includes('funding') || content.includes('grant') || content.includes('bourse') || content.includes('financement')) {
    return 'funding';
  }
  
  if (content.includes('training') || content.includes('formation') || content.includes('cours') || content.includes('atelier')) {
    return 'training';
  }

  // Default to job if we can't determine
  return 'job';
}

// Helper function to map scraped data to database structure
function mapScrapedDataToDatabase(item: ExtractedItem, fields: FieldMapping[], sourceUrl: string, opportunityType: string) {
  const result = {
    title: '',
    description: '',
    location: '',
    hours: '',
    company: '',
    deadline: null as Date | null,
    requirements: '',
    benefits: '',
    salary: '',
    contact: '',
    metadata: {} as any,
    tags: [] as string[]
  };

  // Map common fields
  const fieldMap = {
    'title': ['title', 'titre', 'job title', 'nom', 'name'],
    'description': ['description', 'summary', 'details', 'résumé', 'détails'],
    'location': ['location', 'lieu', 'place', 'city', 'ville'],
    'company': ['company', 'employer', 'organization', 'entreprise', 'organisation'],
    'date': ['date', 'deadline', 'échéance', 'published', 'publié'],
    'link': ['link', 'url', 'lien'],
    'hours': ['hours', 'time', 'duration', 'durée', 'temps'],
    'salary': ['salary', 'salaire', 'compensation', 'rémunération'],
    'requirements': ['requirements', 'qualifications', 'exigences'],
    'benefits': ['benefits', 'avantages'],
    'contact': ['contact', 'email', 'phone', 'telephone']
  };

  // Process each scraped field
  Object.entries(item).forEach(([key, value]) => {
    if (!value) return;

    const fieldName = key.toLowerCase();
    
    // Find matching database field
    for (const [dbField, variations] of Object.entries(fieldMap)) {
      if (variations.some(variation => fieldName.includes(variation))) {
        switch (dbField) {
          case 'title':
            result.title = value;
            break;
          case 'description':
            result.description = value;
            break;
          case 'location':
            result.location = value;
            break;
          case 'company':
            result.company = value;
            break;
          case 'hours':
            result.hours = value;
            break;
          case 'date':
            // Try to parse date
            try {
              const parsedDate = new Date(value);
              if (!isNaN(parsedDate.getTime())) {
                result.deadline = parsedDate;
              } else {
                result.metadata[dbField] = value;
              }
            } catch {
              result.metadata[dbField] = value;
            }
            break;
          case 'salary':
            result.salary = value;
            break;
          case 'requirements':
            result.requirements = value;
            break;
          case 'benefits':
            result.benefits = value;
            break;
          case 'contact':
            result.contact = value;
            break;
          default:
            result.metadata[dbField] = value;
        }
        return;
      }
    }

    // If no mapping found, add to metadata
    result.metadata[key] = value;
  });

  // Ensure we have a title
  if (!result.title) {
    result.title = Object.values(item).find(v => v && v.length > 10) || 'Scraped Opportunity';
  }

  // Add tags based on content
  const contentText = (result.title + ' ' + result.description + ' ' + result.company).toLowerCase();
  
  if (opportunityType === 'job') {
    if (contentText.includes('remote') || contentText.includes('télétravail')) result.tags.push('remote');
    if (contentText.includes('full-time') || contentText.includes('temps plein')) result.tags.push('full-time');
    if (contentText.includes('part-time') || contentText.includes('temps partiel')) result.tags.push('part-time');
    if (contentText.includes('internship') || contentText.includes('stage')) result.tags.push('internship');
  }

  result.tags.push('scraped');
  result.tags.push(opportunityType);

  return result;
} 