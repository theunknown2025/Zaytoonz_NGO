import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// LLM Configuration
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';
const NLWEB_URL = process.env.NLWEB_URL || 'http://localhost:8000';

// ============================================================
// TYPES
// ============================================================

interface Opportunity {
  id: string;
  title: string;
  type: 'job' | 'funding' | 'training';
  description?: string;
  location?: string;
  organization?: string;
  company?: string;
  deadline?: string;
  salary_range?: string;
  requirements?: string;
  benefits?: string;
  tags?: string[];
  hours?: string;
  source_url?: string;
  source_type: 'internal' | 'scraped' | 'partner';
  created_at?: string;
  score?: number;
}

interface CVData {
  id: string;
  name: string;
  general_info: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    address?: string;
    nationality?: string;
  };
  summary?: string;
  work_experiences: Array<{
    position: string;
    company: string;
    location?: string;
    start_date?: string;
    end_date?: string;
    is_current?: boolean;
    description?: string;
  }>;
  education: Array<{
    degree: string;
    institution: string;
    location?: string;
    start_date?: string;
    end_date?: string;
  }>;
  skills: Array<{
    name: string;
    level?: string;
  }>;
  languages: Array<{
    language: string;
    proficiency?: string;
  }>;
  certificates: Array<{
    name: string;
    issuer?: string;
    issue_date?: string;
  }>;
  projects: Array<{
    title: string;
    role?: string;
    description?: string;
    url?: string;
  }>;
}

interface UserProfile {
  first_name?: string;
  last_name?: string;
  latest_job_title?: string;
  fields_of_experience?: string[];
  years_of_experience?: number;
  about_me?: string;
  nationality?: string;
}

interface ConversationContext {
  opportunities_found: number;
  opportunities_by_type: { job: number; funding: number; training: number };
  search_query: boolean;
  llm_used: boolean;
  nlweb_used: boolean;
  query_type: string;
  user_has_cv: boolean;
  cv_skills?: string[];
  timestamp: string;
  previous_queries?: string[];
}

// ============================================================
// INTENT DETECTION
// ============================================================

const intentPatterns = {
  job_search: ['job', 'work', 'employment', 'position', 'vacancy', 'hiring', 'career opportunity', 'opening', 'employ'],
  funding_search: ['funding', 'grant', 'financial', 'money', 'budget', 'sponsor', 'donation', 'support', 'subvention'],
  training_search: ['training', 'course', 'learn', 'skill', 'workshop', 'certification', 'education', 'program', 'formation'],
  cv_review: ['cv', 'resume', 'curriculum', 'profile review', 'improve cv', 'cv tips', 'my cv', 'check cv'],
  cv_create: ['create cv', 'make cv', 'build cv', 'new cv', 'write cv'],
  career_advice: ['career advice', 'career path', 'guidance', 'direction', 'future', 'growth', 'what should i'],
  interview_prep: ['interview', 'preparation', 'tips', 'practice', 'questions', 'succeed', 'prepare'],
  skill_match: ['match', 'suitable', 'fit', 'qualify', 'eligible', 'right for me'],
  application_help: ['apply', 'application', 'how to apply', 'submit', 'candidature'],
  general_greeting: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'help', 'bonjour', 'salut'],
};

function detectIntent(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  for (const [intent, patterns] of Object.entries(intentPatterns)) {
    if (patterns.some(pattern => lowerMessage.includes(pattern))) {
      return intent;
    }
  }
  
  return 'general_query';
}

// ============================================================
// DATABASE QUERIES - CVs
// ============================================================

async function getUserCVs(userId: string): Promise<CVData[]> {
  try {
    // Fetch all CVs for the user
    const { data: cvs, error: cvsError } = await supabase
      .from('cvs')
      .select('*')
      .eq('user_id', userId);

    if (cvsError || !cvs || cvs.length === 0) {
      return [];
    }

    // For each CV, fetch related data
    const cvDataList: CVData[] = [];

    for (const cv of cvs) {
      // Fetch work experiences
      const { data: workExp } = await supabase
        .from('cv_work_experiences')
        .select('*')
        .eq('cv_id', cv.id)
        .order('sort_order');

      // Fetch education
      const { data: education } = await supabase
        .from('cv_education')
        .select('*')
        .eq('cv_id', cv.id)
        .order('sort_order');

      // Fetch skills
      const { data: skills } = await supabase
        .from('cv_skills')
        .select('*')
        .eq('cv_id', cv.id)
        .order('sort_order');

      // Fetch languages
      const { data: languages } = await supabase
        .from('cv_languages')
        .select('*')
        .eq('cv_id', cv.id)
        .order('sort_order');

      // Fetch certificates
      const { data: certificates } = await supabase
        .from('cv_certificates')
        .select('*')
        .eq('cv_id', cv.id)
        .order('sort_order');

      // Fetch projects
      const { data: projects } = await supabase
        .from('cv_projects')
        .select('*')
        .eq('cv_id', cv.id)
        .order('sort_order');

      cvDataList.push({
        id: cv.id,
        name: cv.name,
        general_info: cv.general_info || {},
        summary: cv.summary,
        work_experiences: (workExp || []).map(w => ({
          position: w.position,
          company: w.company,
          location: w.location,
          start_date: w.start_date,
          end_date: w.end_date,
          is_current: w.is_current,
          description: w.description
        })),
        education: (education || []).map(e => ({
          degree: e.degree,
          institution: e.institution,
          location: e.location,
          start_date: e.start_date,
          end_date: e.end_date
        })),
        skills: (skills || []).map(s => ({
          name: s.name,
          level: s.level
        })),
        languages: (languages || []).map(l => ({
          language: l.language,
          proficiency: l.proficiency
        })),
        certificates: (certificates || []).map(c => ({
          name: c.name,
          issuer: c.issuer,
          issue_date: c.issue_date
        })),
        projects: (projects || []).map(p => ({
          title: p.title,
          role: p.role,
          description: p.description,
          url: p.url
        }))
      });
    }

    return cvDataList;
  } catch (error) {
    console.error('Error fetching user CVs:', error);
    return [];
  }
}

// ============================================================
// DATABASE QUERIES - OPPORTUNITIES
// ============================================================

async function searchAllOpportunities(
  message: string,
  intent: string,
  userSkills: string[] = [],
  userProfile?: UserProfile
): Promise<Opportunity[]> {
  const allOpportunities: Opportunity[] = [];
  const lowerMessage = message.toLowerCase();

  // Determine opportunity type filter
  let typeFilter: string | null = null;
  if (intent === 'job_search' || lowerMessage.includes('job') || lowerMessage.includes('work')) {
    typeFilter = 'job';
  } else if (intent === 'funding_search' || lowerMessage.includes('funding') || lowerMessage.includes('grant')) {
    typeFilter = 'funding';
  } else if (intent === 'training_search' || lowerMessage.includes('training') || lowerMessage.includes('course')) {
    typeFilter = 'training';
  }

  try {
    // ========== 1. INTERNAL NGO OPPORTUNITIES ==========
    let internalQuery = supabase
      .from('opportunities')
      .select(`
        id,
        title,
        opportunity_type,
        created_at,
        opportunity_description (
          description,
          location,
          hours,
          status,
          metadata,
          criteria,
          users!opportunity_description_user_id_fkey (
            full_name,
            ngo_profile!ngo_profile_user_id_fkey (
              name
            )
          )
        )
      `)
      .eq('opportunity_description.status', 'published')
      .order('created_at', { ascending: false })
      .limit(15);

    if (typeFilter) {
      internalQuery = internalQuery.eq('opportunity_type', typeFilter);
    }

    const { data: internalData } = await internalQuery;

    if (internalData) {
      for (const opp of internalData) {
        const desc = opp.opportunity_description?.[0];
        if (!desc) continue;

        const users = desc.users as any;
        const ngoName = users?.[0]?.ngo_profile?.[0]?.name || users?.[0]?.full_name || 'NGO Partner';

        allOpportunities.push({
          id: opp.id,
          title: opp.title,
          type: opp.opportunity_type as 'job' | 'funding' | 'training',
          description: desc.description || '',
          location: desc.location || '',
          organization: ngoName,
          hours: desc.hours || '',
          source_type: 'internal',
          created_at: opp.created_at,
          score: 0
        });
      }
    }

    // ========== 2. SCRAPED OPPORTUNITIES (New Table) ==========
    let scrapedQuery = supabase
      .from('scraped_opportunities')
      .select(`
        *,
        scraped_opportunity_details (
          description,
          location,
          company,
          hours,
          deadline,
          requirements,
          benefits,
          salary_range,
          tags,
          metadata
        )
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(15);

    if (typeFilter) {
      scrapedQuery = scrapedQuery.eq('opportunity_type', typeFilter);
    }

    const { data: scrapedData } = await scrapedQuery;

    if (scrapedData) {
      for (const opp of scrapedData) {
        const details = opp.scraped_opportunity_details?.[0] || {};

        allOpportunities.push({
          id: opp.id,
          title: opp.title,
          type: opp.opportunity_type as 'job' | 'funding' | 'training',
          description: details.description || '',
          location: details.location || '',
          company: details.company || '',
          organization: details.company || 'External Source',
          deadline: details.deadline || '',
          salary_range: details.salary_range || '',
          requirements: details.requirements || '',
          benefits: details.benefits || '',
          tags: details.tags || [],
          source_url: opp.source_url,
          source_type: 'scraped',
          created_at: opp.created_at,
          score: 0
        });
      }
    }

    // ========== 3. LEGACY SCRAPPED OPPORTUNITIES ==========
    let legacyQuery = supabase
      .from('scrapped_opportunities')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(10);

    if (typeFilter) {
      legacyQuery = legacyQuery.eq('type', typeFilter);
    }

    const { data: legacyData } = await legacyQuery;

    if (legacyData) {
      for (const opp of legacyData) {
        // Check for duplicates by title
        const isDuplicate = allOpportunities.some(
          o => o.title.toLowerCase() === opp.title.toLowerCase()
        );
        if (isDuplicate) continue;

        allOpportunities.push({
          id: opp.id.toString(),
          title: opp.title,
          type: opp.type as 'job' | 'funding' | 'training',
          description: opp.description || '',
          location: opp.location || '',
          organization: opp.organization || '',
          deadline: opp.deadline || '',
          salary_range: opp.salary_range || '',
          requirements: Array.isArray(opp.requirements) ? opp.requirements.join(', ') : '',
          tags: opp.tags || [],
          source_url: opp.application_url || opp.source_url,
          source_type: 'partner',
          created_at: opp.created_at,
          score: 0
        });
      }
    }

    // ========== 4. SCRAPED JOBS (Specific Job Table) ==========
    if (!typeFilter || typeFilter === 'job') {
      const { data: scrapedJobs } = await supabase
        .from('scraped_jobs')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(10);

      if (scrapedJobs) {
        for (const job of scrapedJobs) {
          // Check for duplicates
          const isDuplicate = allOpportunities.some(
            o => o.title.toLowerCase() === job.title.toLowerCase()
          );
          if (isDuplicate) continue;

          allOpportunities.push({
            id: job.id,
            title: job.title,
            type: 'job',
            description: job.description || '',
            location: job.location || '',
            company: job.company || '',
            organization: job.company || 'External Source',
            deadline: job.application_deadline || '',
            salary_range: job.salary_range || '',
            requirements: job.requirements || '',
            benefits: job.benefits || '',
            tags: job.tags || [],
            source_url: job.source_url,
            source_type: 'scraped',
            created_at: job.created_at,
            score: 0
          });
        }
      }
    }

    // ========== SCORE OPPORTUNITIES BASED ON USER PROFILE & SKILLS ==========
    const scoredOpportunities = allOpportunities.map(opp => {
      let score = 0.3; // Base score

      const oppText = `${opp.title} ${opp.description || ''} ${opp.requirements || ''} ${(opp.tags || []).join(' ')}`.toLowerCase();

      // Match user skills
      if (userSkills.length > 0) {
        for (const skill of userSkills) {
          if (oppText.includes(skill.toLowerCase())) {
            score += 0.1;
          }
        }
      }

      // Match user's fields of experience
      if (userProfile?.fields_of_experience) {
        for (const field of userProfile.fields_of_experience) {
          if (oppText.includes(field.toLowerCase())) {
            score += 0.15;
          }
        }
      }

      // Match user's job title
      if (userProfile?.latest_job_title) {
        const titleWords = userProfile.latest_job_title.toLowerCase().split(' ');
        for (const word of titleWords) {
          if (word.length > 3 && oppText.includes(word)) {
            score += 0.1;
          }
        }
      }

      // Boost for keywords in message
      const messageWords = message.toLowerCase().split(' ').filter(w => w.length > 3);
      for (const word of messageWords) {
        if (oppText.includes(word)) {
          score += 0.05;
        }
      }

      // Boost internal NGO opportunities slightly
      if (opp.source_type === 'internal') {
        score += 0.05;
      }

      return { ...opp, score: Math.min(score, 1) };
    });

    // Sort by score descending
    return scoredOpportunities.sort((a, b) => (b.score || 0) - (a.score || 0));

  } catch (error) {
    console.error('Error searching opportunities:', error);
    return [];
  }
}

// ============================================================
// NLWEB INTEGRATION
// ============================================================

async function queryNLWeb(query: string, previousQueries: string[] = []): Promise<any | null> {
  try {
    const params = new URLSearchParams({
      query: query,
      site: 'zaytoonz',
      mode: 'list',
      streaming: 'false'
    });
    
    if (previousQueries.length > 0) {
      params.append('prev', previousQueries.join(','));
    }

    const response = await fetch(`${NLWEB_URL}/ask?${params.toString()}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(5000)
    });

    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.log('NLWeb not available:', error);
    return null;
  }
}

// ============================================================
// LLM RESPONSE GENERATION
// ============================================================

async function generateLLMResponse(
  message: string,
  opportunities: Opportunity[],
  cvData: CVData[],
  context: {
    userProfile?: UserProfile;
    previousQueries?: string[];
    intent: string;
    nlwebResults?: any;
  }
): Promise<string | null> {
  if (!OPENAI_API_KEY) {
    console.warn('OpenAI API key not configured');
    return null;
  }

  try {
    // Build comprehensive context
    let profileContext = '';
    if (context.userProfile) {
      const { first_name, latest_job_title, fields_of_experience, years_of_experience, nationality } = context.userProfile;
      profileContext = `
**User Profile:**
- Name: ${first_name || 'Not specified'}
- Current/Latest Role: ${latest_job_title || 'Not specified'}
- Experience: ${years_of_experience || 0} years
- Fields of Expertise: ${fields_of_experience?.join(', ') || 'Not specified'}
- Nationality: ${nationality || 'Not specified'}
`;
    }

    // CV context
    let cvContext = '';
    if (cvData.length > 0) {
      const cv = cvData[0]; // Use most recent CV
      const skills = cv.skills.map(s => s.name).join(', ');
      const languages = cv.languages.map(l => `${l.language} (${l.proficiency})`).join(', ');
      const workHistory = cv.work_experiences.slice(0, 3).map(w => 
        `${w.position} at ${w.company}${w.is_current ? ' (Current)' : ''}`
      ).join('; ');
      const education = cv.education.slice(0, 2).map(e => 
        `${e.degree} from ${e.institution}`
      ).join('; ');

      cvContext = `
**User's CV Summary (${cv.name}):**
- Skills: ${skills || 'None listed'}
- Languages: ${languages || 'None listed'}
- Recent Work: ${workHistory || 'None listed'}
- Education: ${education || 'None listed'}
- Certificates: ${cv.certificates.map(c => c.name).join(', ') || 'None listed'}
`;
    }

    // Opportunities context
    let opportunitiesContext = '';
    if (opportunities.length > 0) {
      const jobCount = opportunities.filter(o => o.type === 'job').length;
      const fundingCount = opportunities.filter(o => o.type === 'funding').length;
      const trainingCount = opportunities.filter(o => o.type === 'training').length;

      opportunitiesContext = `
**Available Opportunities Found:**
- Total: ${opportunities.length} (Jobs: ${jobCount}, Funding: ${fundingCount}, Training: ${trainingCount})
- Top matches (by relevance score):
${opportunities.slice(0, 5).map((o, i) => 
  `  ${i + 1}. [${o.type.toUpperCase()}] "${o.title}" at ${o.organization || o.company || 'N/A'} (Score: ${(o.score! * 100).toFixed(0)}%)
     Location: ${o.location || 'Not specified'} | Source: ${o.source_type}
     ${o.description ? `Brief: ${o.description.slice(0, 150)}...` : ''}`
).join('\n')}
`;
    }

    // Conversation history
    let historyContext = '';
    if (context.previousQueries && context.previousQueries.length > 0) {
      historyContext = `\n**Previous queries in this conversation:**\n${context.previousQueries.map((q, i) => `${i + 1}. "${q}"`).join('\n')}\n`;
    }

    const systemPrompt = `You are Morchid, an intelligent AI career assistant for the Zaytoonz NGO platform. You have access to REAL data from the database including:
- The user's CV(s) with skills, experience, and qualifications
- Real job, funding, and training opportunities (both from NGO partners and scraped from external sources)
- The user's profile information

Your capabilities:
1. Search and recommend opportunities that match the user's profile and CV
2. Provide personalized career guidance based on their actual skills and experience
3. Help with CV optimization with specific, actionable feedback
4. Offer interview preparation tailored to their target roles
5. Compare opportunities and explain why certain ones are better matches

Guidelines:
- Be specific and reference actual data from their CV and the opportunities
- When recommending opportunities, explain WHY they match based on their skills
- If they have no CV, encourage them to create one using the CV Maker tool
- Use formatting: **bold** for emphasis, bullet points for lists
- Include relevant emojis sparingly
- Always provide actionable next steps
- If opportunities are found, mention specific titles and organizations

Current Intent: ${context.intent}
${profileContext}
${cvContext}
${opportunitiesContext}
${historyContext}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `User's message: "${message}"\n\nProvide a helpful, personalized response using the data above.` }
        ],
        max_tokens: 2500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) throw new Error(`OpenAI API error: ${response.status}`);

    const data = await response.json();
    return data.choices[0]?.message?.content || null;

  } catch (error) {
    console.error('LLM generation error:', error);
    return null;
  }
}

// ============================================================
// FALLBACK RESPONSES
// ============================================================

function generateFallbackResponse(
  intent: string, 
  opportunities: Opportunity[], 
  cvData: CVData[],
  userProfile?: UserProfile
): string {
  const hasCv = cvData.length > 0;
  const userName = userProfile?.first_name || '';
  const greeting = userName ? `${userName}, ` : '';

  const oppSummary = opportunities.length > 0
    ? `I found **${opportunities.length} opportunities** that might interest you!`
    : 'I couldn\'t find opportunities matching your criteria right now.';

  const responses: { [key: string]: string } = {
    job_search: `${greeting}I can help you find job opportunities!

🔍 **Job Search Results**

${oppSummary}

${opportunities.slice(0, 3).map((o, i) => `**${i + 1}. ${o.title}**
   📍 ${o.location || 'Location not specified'} | 🏢 ${o.organization || o.company || 'N/A'}
   ${o.description ? o.description.slice(0, 100) + '...' : ''}`).join('\n\n')}

${hasCv ? '✅ I can see your CV - I\'m matching based on your skills!' : '💡 **Tip:** Create a CV to get better job matches!'}

Would you like more details about any of these positions?`,

    funding_search: `${greeting}Let me help you find funding opportunities!

💰 **Funding Opportunities**

${oppSummary}

${opportunities.slice(0, 3).map((o, i) => `**${i + 1}. ${o.title}**
   🏢 ${o.organization || 'Organization not specified'}
   ${o.deadline ? `⏰ Deadline: ${o.deadline}` : ''}
   ${o.description ? o.description.slice(0, 100) + '...' : ''}`).join('\n\n')}

Would you like help preparing an application for any of these?`,

    training_search: `${greeting}Here are training opportunities to help you grow!

📚 **Training & Development**

${oppSummary}

${opportunities.slice(0, 3).map((o, i) => `**${i + 1}. ${o.title}**
   🏢 ${o.organization || 'Provider not specified'}
   📍 ${o.location || 'Online/TBD'}
   ${o.description ? o.description.slice(0, 100) + '...' : ''}`).join('\n\n')}

${hasCv && cvData[0].skills.length > 0 ? `Based on your current skills (${cvData[0].skills.slice(0, 3).map(s => s.name).join(', ')}), these could complement your expertise!` : ''}

Want me to recommend specific programs based on your career goals?`,

    cv_review: hasCv ? `${greeting}I can help you improve your CV!

📝 **Your CV Analysis: "${cvData[0].name}"**

Here's what I found:
• **Skills listed:** ${cvData[0].skills.length} (${cvData[0].skills.slice(0, 5).map(s => s.name).join(', ')})
• **Work experiences:** ${cvData[0].work_experiences.length} positions
• **Education entries:** ${cvData[0].education.length}
• **Languages:** ${cvData[0].languages.map(l => l.language).join(', ') || 'None listed'}
• **Certificates:** ${cvData[0].certificates.length}

💡 **Quick Recommendations:**
${cvData[0].skills.length < 5 ? '• Add more specific skills relevant to your target roles\n' : ''}${cvData[0].work_experiences.length === 0 ? '• Add your work experience to strengthen your profile\n' : ''}${!cvData[0].summary ? '• Add a professional summary to make a strong first impression\n' : ''}

Would you like specific tips for a particular section?` : `${greeting}I'd be happy to help with your CV!

📝 **CV Services**

I notice you don't have a CV saved yet. You can:

1. **Create a CV** - Use our CV Maker tool to build a professional resume
2. **Get templates** - Access industry-specific CV templates
3. **Get tips** - I can share best practices for CV writing

🛠️ **Go to:** Tools → CV Maker to get started!

Once you create a CV, I can provide personalized feedback and match you with opportunities!`,

    cv_create: `${greeting}Let's create a professional CV!

📝 **CV Maker Tool**

I can guide you through creating an effective CV:

**Essential Sections:**
• Personal Information
• Professional Summary
• Work Experience
• Education
• Skills
• Languages

**Pro Tips:**
• Use action verbs to describe achievements
• Quantify results when possible (e.g., "Increased sales by 25%")
• Tailor your CV for each opportunity
• Keep it concise (1-2 pages)

🛠️ **Get Started:** Go to **Tools → CV Maker** to build your CV step by step!

Would you like tips for any specific section?`,

    career_advice: `${greeting}I'm here to help guide your career!

🎯 **Career Development**

${hasCv && cvData[0].work_experiences.length > 0 ? `Based on your experience as **${cvData[0].work_experiences[0].position}**, here are some paths to consider:` : 'Here are some areas I can help with:'}

• **Skill Development** - Identify in-demand skills in your field
• **Career Progression** - Plan your next moves strategically
• **Industry Trends** - Understand market demands
• **Networking** - Build valuable professional connections

${opportunities.length > 0 ? `\n📊 **Current Opportunities:** I found ${opportunities.length} opportunities that could align with your goals!` : ''}

What specific aspect of your career would you like to discuss?`,

    interview_prep: `${greeting}Let me help you prepare for interviews!

🎤 **Interview Preparation**

${hasCv && cvData[0].work_experiences.length > 0 ? `For your experience as **${cvData[0].work_experiences[0].position}**, focus on:` : 'Key areas to focus on:'}

**Before the Interview:**
• Research the organization thoroughly
• Review the job description and requirements
• Prepare your "tell me about yourself" response
• Have questions ready to ask

**Common Questions:**
• "What are your key strengths?"
• "Describe a challenge you overcame"
• "Why do you want this role?"
• "Where do you see yourself in 5 years?"

**The STAR Method:**
• **S**ituation - Set the context
• **T**ask - Describe your responsibility
• **A**ction - Explain what you did
• **R**esult - Share the outcome

Would you like to practice with specific interview questions?`,

    skill_match: `${greeting}Let me analyze how well you match available opportunities!

🎯 **Skill Matching Analysis**

${hasCv && cvData[0].skills.length > 0 
  ? `**Your Skills:** ${cvData[0].skills.map(s => s.name).join(', ')}

${opportunities.length > 0 
  ? `**Best Matches:**
${opportunities.slice(0, 3).map((o, i) => `${i + 1}. **${o.title}** - Match Score: ${(o.score! * 100).toFixed(0)}%`).join('\n')}`
  : 'No opportunities found matching your criteria.'}`
  : 'Create a CV with your skills to get personalized match recommendations!'}

Would you like detailed matching for a specific opportunity?`,

    general_greeting: `${userName ? `Hello ${userName}! 👋` : 'Hello! 👋'} I'm **Morchid**, your AI career assistant.

I have access to your data and can provide personalized help:

${hasCv ? `✅ **Your CV:** "${cvData[0].name}" - ${cvData[0].skills.length} skills, ${cvData[0].work_experiences.length} experiences` : '📝 **CV:** Not created yet - Use CV Maker to start!'}

**I can help you with:**
🔍 **Job Search** - Find opportunities matching your profile
💰 **Funding** - Discover grants and financial support
📚 **Training** - Find courses to grow your skills
📝 **CV Review** - Get feedback on your resume
🎯 **Career Guidance** - Personalized advice

What would you like to explore today?`,

    general_query: `I'm here to help! How can I assist you today?

I can help with:
• Finding job, funding, and training opportunities
• CV creation and optimization
• Career guidance and planning
• Interview preparation

Just ask me anything about your career journey!`
  };

  return responses[intent] || responses.general_query;
}

// ============================================================
// SAVE CONVERSATION
// ============================================================

async function saveConversation(
  userId: string,
  conversationId: string,
  userMessage: string,
  aiResponse: string,
  context: ConversationContext
): Promise<void> {
  try {
    await supabase
      .from('morchid_conversations')
      .insert({
        id: conversationId,
        user_id: userId,
        user_message: userMessage,
        ai_response: aiResponse,
        conversation_context: context,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
  } catch (dbError) {
    console.error('Database error saving conversation:', dbError);
  }
}

// ============================================================
// MAIN HANDLERS
// ============================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      message, 
      userId, 
      conversationId, 
      previousQueries = [],
      userProfile,
      options = {}
    } = body;

    // Detect intent
    const intent = detectIntent(message);
    const isSearchQuery = ['job_search', 'funding_search', 'training_search', 'skill_match'].includes(intent);
    const isCvRelated = ['cv_review', 'cv_create'].includes(intent);

    // Fetch user's CVs
    let cvData: CVData[] = [];
    if (userId && userId !== 'anonymous') {
      cvData = await getUserCVs(userId);
    }

    // Extract skills from CV for matching
    const userSkills = cvData.length > 0 
      ? cvData[0].skills.map(s => s.name) 
      : [];

    // Try NLWeb if enabled
    let nlwebResults = null;
    if (options.useNLWeb) {
      nlwebResults = await queryNLWeb(message, previousQueries);
    }

    // Search opportunities
    let opportunities: Opportunity[] = [];
    if (isSearchQuery || options.includeOpportunities) {
      opportunities = await searchAllOpportunities(message, intent, userSkills, userProfile);
    }

    // Generate response
    let response: string;
    let llmUsed = false;

    // Try LLM first
    const llmResponse = await generateLLMResponse(message, opportunities, cvData, {
      userProfile,
      previousQueries,
      intent,
      nlwebResults
    });

    if (llmResponse) {
      response = llmResponse;
      llmUsed = true;
    } else {
      response = generateFallbackResponse(intent, opportunities, cvData, userProfile);
    }

    // Build context for storage
    const conversationContext: ConversationContext = {
      opportunities_found: opportunities.length,
      opportunities_by_type: {
        job: opportunities.filter(o => o.type === 'job').length,
        funding: opportunities.filter(o => o.type === 'funding').length,
        training: opportunities.filter(o => o.type === 'training').length
      },
      search_query: isSearchQuery,
      llm_used: llmUsed,
      nlweb_used: !!nlwebResults,
      query_type: intent,
      user_has_cv: cvData.length > 0,
      cv_skills: userSkills,
      timestamp: new Date().toISOString(),
      previous_queries: previousQueries
    };

    // Save conversation
    if (userId && userId !== 'anonymous') {
      const convId = conversationId || `conv_${Date.now()}`;
      await saveConversation(userId, convId, message, response, conversationContext);
    }

    return NextResponse.json({
      success: true,
      response,
      opportunities: opportunities.slice(0, 5),
      llm_used: llmUsed,
      nlweb_used: !!nlwebResults,
      query_type: intent,
      user_has_cv: cvData.length > 0,
      cv_count: cvData.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error processing message:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process message',
        response: 'I apologize, but I encountered an error processing your message. Please try again.'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ conversations: [] });
    }

    const { data: conversations, error } = await supabase
      .from('morchid_conversations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Error fetching conversations:', error);
      return NextResponse.json({ conversations: [] });
    }

    return NextResponse.json({ conversations: conversations || [] });

  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json({ conversations: [] });
  }
}
