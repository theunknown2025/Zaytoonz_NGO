import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// LLM Configuration
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

// Enhanced AI responses with database integration
const enhancedAIResponses: { [key: string]: string } = {
  'job search': `I can help you find job opportunities! Let me search our database for you.

🔍 **Searching Available Positions...**
I'll look through our current job listings to find the best matches for you.

💡 **What I can do:**
• Search through real job opportunities in our database
• Filter by location, experience level, and job type
• Provide detailed information about each position
• Help you understand application requirements

Let me check what's available right now...`,

  'cv review': `I'd be happy to help you review your CV! Here's what I can assist with:

📝 **CV Review Services:**
• Structure and formatting analysis
• Content optimization suggestions
• Skills and experience highlighting
• ATS (Applicant Tracking System) optimization
• Industry-specific recommendations

🛠️ **Available Tools:**
• CV Maker: Create professional CVs from scratch
• CV Analyzer: Get detailed feedback on your existing CV
• Template Library: Access professional templates

To get started, you can:
1. Upload your current CV for analysis
2. Use the CV Maker to create a new one
3. Get specific feedback on sections you want to improve

What would you like to focus on?`,

  'career advice': `Great question! I'm here to provide comprehensive career guidance:

🎯 **Career Guidance Areas:**
• Career path exploration
• Skill development recommendations
• Industry insights and trends
• Networking strategies
• Professional development planning

📚 **Resources Available:**
• Training opportunities from our database
• Skill-building workshops
• Industry reports and insights
• Mentorship programs
• Professional certifications

💼 **For Your Career Journey:**
• Identify your strengths and areas for growth
• Explore different career paths
• Develop relevant skills
• Build your professional network
• Stay updated with industry trends

What specific career advice are you looking for?`,

  'interview tips': `Excellent! Let me share some valuable interview preparation tips:

🎤 **Interview Preparation:**
• Research the organization thoroughly
• Practice common interview questions
• Prepare your "elevator pitch"
• Dress appropriately for the role
• Arrive early and be prepared

💡 **Key Interview Tips:**
• Use the STAR method for behavioral questions
• Ask thoughtful questions about the role
• Show enthusiasm and genuine interest
• Follow up with a thank-you email
• Be authentic and confident

📋 **Common Interview Questions:**
• "Tell me about yourself"
• "Why do you want this position?"
• "What are your strengths and weaknesses?"
• "Where do you see yourself in 5 years?"
• "Why should we hire you?"

🔧 **Available Resources:**
• Mock interview sessions
• Interview question databases
• Industry-specific preparation guides
• Video interview tips

Would you like specific tips for a particular type of interview?`,

  'default': `Hello! I'm Morchid, your AI career assistant. I can help you with:

🔍 **Job Search & Opportunities**
• Find relevant job postings from our real-time database
• Filter by location, experience, and type
• Track your applications

📝 **CV & Resume Help**
• CV creation and optimization
• Resume analysis and feedback
• Professional template selection

💼 **Career Guidance**
• Career path exploration
• Skill development advice
• Industry insights

🎤 **Interview Preparation**
• Interview tips and strategies
• Common question preparation
• Mock interview practice

I have access to real opportunities in our database, so I can provide you with specific, up-to-date information about available positions, funding, and training programs.

How can I assist you today?`
};

// LLM Response Generation Function
async function generateLLMResponse(message: string, opportunities: any[] = [], context: any = {}) {
  if (!OPENAI_API_KEY) {
    console.warn('OpenAI API key not configured, using fallback responses');
    return null;
  }

  try {
    const systemPrompt = `You are Morchid, an intelligent AI career assistant for the Zaytoonz NGO platform. You help users find opportunities, get career advice, and navigate the platform.

Your capabilities:
- Search through real opportunities in the database (jobs, funding, training)
- Provide career guidance and advice
- Help with CV/resume optimization
- Offer interview preparation tips
- Guide users to relevant sections of the platform
- Answer specific questions about opportunities and their details

Current context:
${opportunities.length > 0 ? `Found ${opportunities.length} opportunities in database` : 'No specific opportunities found'}
${context.userType ? `User type: ${context.userType}` : ''}

Important: When users ask about specific opportunities (like "recent funding opportunities"), provide detailed, intelligent responses based on the actual data available. Don't give generic responses - be specific and helpful.

Respond in a helpful, professional, and engaging manner. Use emojis sparingly but effectively. Always provide actionable next steps when possible.`;

    const userPrompt = `User message: "${message}"

${opportunities.length > 0 ? `Available opportunities from database: ${JSON.stringify(opportunities, null, 2)}` : 'No opportunities found in database'}

Please provide a helpful, intelligent response that directly addresses the user's request. If they're asking about specific opportunities, provide detailed information about what's available.`;

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
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 1500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || null;

  } catch (error) {
    console.error('LLM generation error:', error);
    return null;
  }
}

// Function to search opportunities in the database
async function searchOpportunities(message: string, userId?: string) {
  try {
    const lowerMessage = message.toLowerCase();
    let opportunityType = null;
    
    // Determine opportunity type from message
    if (lowerMessage.includes('job') || lowerMessage.includes('work') || lowerMessage.includes('employment')) {
      opportunityType = 'job';
    } else if (lowerMessage.includes('funding') || lowerMessage.includes('grant') || lowerMessage.includes('financial')) {
      opportunityType = 'funding';
    } else if (lowerMessage.includes('training') || lowerMessage.includes('course') || lowerMessage.includes('learn')) {
      opportunityType = 'training';
    }

    // Search opportunities
    let query = supabase.from('opportunities').select('*');
    
    if (opportunityType) {
      query = query.eq('opportunity_type', opportunityType);
    }
    
    const { data: opportunities, error } = await query.limit(5);
    
    if (error) {
      console.error('Error searching opportunities:', error);
      return [];
    }

    // Get detailed information for each opportunity
    const detailedOpportunities = [];
    for (const opp of opportunities || []) {
      const { data: description } = await supabase
        .from('opportunity_description')
        .select('*')
        .eq('opportunity_id', opp.id)
        .single();

      detailedOpportunities.push({
        id: opp.id,
        title: opp.title,
        type: opp.opportunity_type,
        description: description?.description || '',
        location: description?.location || '',
        hours: description?.hours || '',
        metadata: description?.metadata || {},
        created_at: opp.created_at
      });
    }

    return detailedOpportunities;
  } catch (error) {
    console.error('Error in searchOpportunities:', error);
    return [];
  }
}

// Function to format opportunities response
function formatOpportunitiesResponse(opportunities: any[], intentType: string): string {
  if (!opportunities || opportunities.length === 0) {
    return getNoOpportunitiesResponse(intentType);
  }

  let response = `I found ${opportunities.length} relevant opportunities for you:\n\n`;

  // Show top 3 opportunities
  opportunities.slice(0, 3).forEach((opp, index) => {
    response += `**${index + 1}. ${opp.title}**\n`;
    response += `📍 **Type**: ${opp.type.charAt(0).toUpperCase() + opp.type.slice(1)}\n`;
    
    if (opp.location) {
      response += `🌍 **Location**: ${opp.location}\n`;
    }
    
    if (opp.description) {
      const desc = opp.description.length > 200 
        ? opp.description.substring(0, 200) + '...' 
        : opp.description;
      response += `📝 **Description**: ${desc}\n`;
    }
    
    response += '\n';
  });

  response += '💡 **Next Steps**:\n';
  response += '• Visit the Opportunities section to see all available positions\n';
  response += '• Use the filters to narrow down your search\n';
  response += '• Save interesting opportunities to your favorites\n';
  response += '• Apply directly through our platform\n\n';
  
  response += 'Would you like me to help you with anything specific about these opportunities?';

  return response;
}

// Function to get response when no opportunities are found
function getNoOpportunitiesResponse(intentType: string): string {
  const responses = {
    'job_search': `I don't see any job opportunities matching your criteria right now, but here are some suggestions:

🔍 **Try These Search Tips:**
• Check the Opportunities section for all available positions
• Use different keywords in your search
• Consider broadening your location preferences
• Look at different experience levels

💡 **Alternative Actions:**
• Set up job alerts for new postings
• Update your profile to attract recruiters
• Network with other professionals in your field
• Consider freelance or contract work

Would you like me to help you optimize your job search strategy?`,

    'funding_search': `I don't see any funding opportunities matching your criteria right now, but here are some suggestions:

🔍 **Funding Search Tips:**
• Check the Funding section for all available grants
• Consider different types of funding (grants, loans, competitions)
• Look at opportunities from different organizations
• Review eligibility criteria carefully

💡 **Alternative Actions:**
• Set up funding alerts for new opportunities
• Network with other organizations
• Consider crowdfunding platforms
• Look into government programs

Would you like me to help you find alternative funding sources?`,

    'training_search': `I don't see any training opportunities matching your criteria right now, but here are some suggestions:

🔍 **Training Search Tips:**
• Check the Training section for all available courses
• Consider online learning platforms
• Look for industry-specific certifications
• Explore free resources and MOOCs

💡 **Alternative Actions:**
• Set up training alerts for new courses
• Check out free online resources
• Consider mentorship programs
• Look into professional development programs

Would you like me to help you find alternative learning resources?`
  };

  return responses[intentType as keyof typeof responses] || 
    "I couldn't find any opportunities matching your criteria. Please try different keywords or check the Opportunities section for all available options.";
}

export async function POST(request: NextRequest) {
  try {
    const { message, userId, conversationId } = await request.json();

    // Analyze user intent
    const lowerMessage = message.toLowerCase();
    let response = enhancedAIResponses.default;
    let opportunities: any[] = [];
    let isSearchQuery = false;

    // Check if this is a search query
    if (lowerMessage.includes('job') || lowerMessage.includes('opportunity') || lowerMessage.includes('position') || 
        lowerMessage.includes('work') || lowerMessage.includes('employment') || lowerMessage.includes('career')) {
      response = enhancedAIResponses['job search'];
      isSearchQuery = true;
    } else if (lowerMessage.includes('cv') || lowerMessage.includes('resume') || lowerMessage.includes('curriculum')) {
      response = enhancedAIResponses['cv review'];
    } else if (lowerMessage.includes('career') || lowerMessage.includes('advice') || lowerMessage.includes('guidance')) {
      response = enhancedAIResponses['career advice'];
    } else if (lowerMessage.includes('interview') || lowerMessage.includes('preparation') || lowerMessage.includes('tips')) {
      response = enhancedAIResponses['interview tips'];
    }

    // Always search the database for opportunities, regardless of query type
    opportunities = await searchOpportunities(message, userId);
    
    // If it's a search query, format the response
    if (isSearchQuery) {
      if (opportunities.length > 0) {
        response = formatOpportunitiesResponse(opportunities, 'job_search');
      } else {
        response = getNoOpportunitiesResponse('job_search');
      }
    }

    // Try to generate LLM response if available
    let llmResponse = null;
    try {
      console.log('Attempting LLM generation for message:', message);
      llmResponse = await generateLLMResponse(message, opportunities, {
        userType: 'seeker',
        isSearchQuery,
        opportunitiesFound: opportunities.length
      });
      console.log('LLM response generated:', llmResponse ? 'Yes' : 'No');
    } catch (error) {
      console.error('LLM generation failed:', error);
    }

    // Use LLM response if available, otherwise fall back to template response
    const finalResponse = llmResponse || response;

    // Save conversation to database if user is authenticated
    if (userId) {
      try {
        const { error } = await supabase
          .from('morchid_conversations')
          .upsert({
            id: conversationId,
            user_id: userId,
            user_message: message,
            ai_response: finalResponse,
            conversation_context: {
              opportunities_found: opportunities.length,
              search_query: isSearchQuery,
              llm_used: !!llmResponse,
              timestamp: new Date().toISOString()
            },
            created_at: new Date().toISOString()
          });

        if (error) {
          console.error('Error saving conversation:', error);
        }
      } catch (dbError) {
        console.error('Database error:', dbError);
      }
    }

    return NextResponse.json({
      success: true,
      response: finalResponse,
      opportunities,
      llm_used: !!llmResponse,
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

    // Fetch user's conversation history
    const { data: conversations, error } = await supabase
      .from('morchid_conversations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

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
