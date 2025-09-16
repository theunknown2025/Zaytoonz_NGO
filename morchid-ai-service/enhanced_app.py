#!/usr/bin/env python3
"""
Enhanced Morchid AI Service - Database Integration
A Python service that provides AI-powered responses for the Morchid chat interface
with direct access to the Supabase database for real-time opportunity data.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import json
import os
import sys
import asyncio
from datetime import datetime
import httpx
from supabase import create_client, Client

# Add NLWeb path to system path
sys.path.append('../NLWeb-main/code/python')

try:
    from core.baseHandler import BaseHandler
    from core.state import State
    from llm_providers.openai import OpenAIProvider
    from retrieval_providers.azure_search_client import AzureSearchClient
    from prompts.prompts import Prompts
    NLWEB_AVAILABLE = True
except ImportError:
    NLWEB_AVAILABLE = False
    print("Warning: NLWeb components not available. Using enhanced fallback responses.")

app = FastAPI(title="Enhanced Morchid AI Service", version="2.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://your-domain.com"],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# Initialize Supabase client
supabase_url = os.getenv("SUPABASE_URL", "https://uroirdudxkfppocqcorm.supabase.co")
supabase_key = os.getenv("SUPABASE_SERVICE_KEY", "your-service-key-here")
supabase: Client = create_client(supabase_url, supabase_key)

# Request/Response Models
class ChatRequest(BaseModel):
    message: str
    user_id: Optional[str] = None
    conversation_id: Optional[str] = None
    context: Optional[Dict[str, Any]] = None

class ChatResponse(BaseModel):
    success: bool
    response: str
    timestamp: str
    error: Optional[str] = None
    opportunities: Optional[List[Dict[str, Any]]] = None

class DatabaseOpportunity:
    """Class to handle database operations for opportunities"""
    
    @staticmethod
    async def search_opportunities(query: str, opportunity_type: str = None, limit: int = 5) -> List[Dict[str, Any]]:
        """Search opportunities based on user query"""
        try:
            # Build the search query
            search_query = supabase.table('opportunities').select('*')
            
            if opportunity_type:
                search_query = search_query.eq('opportunity_type', opportunity_type)
            
            # Get opportunities with descriptions
            result = search_query.execute()
            
            if not result.data:
                return []
            
            # Get detailed information for each opportunity
            opportunities = []
            for opp in result.data[:limit]:
                # Get description details
                desc_result = supabase.table('opportunity_description').select('*').eq('opportunity_id', opp['id']).execute()
                description = desc_result.data[0] if desc_result.data else {}
                
                # Get scraped opportunities that might match
                scraped_result = supabase.table('scraped_opportunities').select('*').limit(3).execute()
                
                opportunity_info = {
                    'id': opp['id'],
                    'title': opp['title'],
                    'type': opp['opportunity_type'],
                    'description': description.get('description', ''),
                    'location': description.get('location', ''),
                    'hours': description.get('hours', ''),
                    'metadata': description.get('metadata', {}),
                    'created_at': opp['created_at']
                }
                
                opportunities.append(opportunity_info)
            
            return opportunities
            
        except Exception as e:
            print(f"Error searching opportunities: {e}")
            return []
    
    @staticmethod
    async def get_recent_opportunities(limit: int = 5) -> List[Dict[str, Any]]:
        """Get recent opportunities"""
        try:
            result = supabase.table('opportunities').select('*').order('created_at', desc=True).limit(limit).execute()
            return result.data
        except Exception as e:
            print(f"Error getting recent opportunities: {e}")
            return []
    
    @staticmethod
    async def get_opportunities_by_type(opportunity_type: str, limit: int = 5) -> List[Dict[str, Any]]:
        """Get opportunities by type (job, funding, training)"""
        try:
            result = supabase.table('opportunities').select('*').eq('opportunity_type', opportunity_type).limit(limit).execute()
            return result.data
        except Exception as e:
            print(f"Error getting opportunities by type: {e}")
            return []

class EnhancedResponseGenerator:
    """Enhanced response generator with database integration"""
    
    @staticmethod
    def analyze_user_intent(message: str) -> Dict[str, Any]:
        """Analyze user message to determine intent and extract parameters"""
        message_lower = message.lower()
        
        intent = {
            'type': 'general',
            'opportunity_type': None,
            'location': None,
            'keywords': [],
            'is_search': False
        }
        
        # Check for job search intent
        if any(word in message_lower for word in ['job', 'work', 'employment', 'position', 'career']):
            intent['type'] = 'job_search'
            intent['is_search'] = True
            if 'remote' in message_lower:
                intent['location'] = 'remote'
            if 'morocco' in message_lower:
                intent['location'] = 'morocco'
        
        # Check for funding intent
        elif any(word in message_lower for word in ['funding', 'grant', 'financial', 'money', 'support']):
            intent['type'] = 'funding_search'
            intent['opportunity_type'] = 'funding'
            intent['is_search'] = True
        
        # Check for training intent
        elif any(word in message_lower for word in ['training', 'course', 'learn', 'education', 'skill']):
            intent['type'] = 'training_search'
            intent['opportunity_type'] = 'training'
            intent['is_search'] = True
        
        # Check for CV/resume help
        elif any(word in message_lower for word in ['cv', 'resume', 'curriculum', 'application']):
            intent['type'] = 'cv_help'
        
        # Check for interview help
        elif any(word in message_lower for word in ['interview', 'preparation', 'questions']):
            intent['type'] = 'interview_help'
        
        return intent
    
    @staticmethod
    async def generate_response(message: str, user_id: str = None) -> Dict[str, Any]:
        """Generate intelligent response based on user message and database data"""
        intent = EnhancedResponseGenerator.analyze_user_intent(message)
        
        response_data = {
            'response': '',
            'opportunities': []
        }
        
        if intent['is_search']:
            # Search for relevant opportunities
            opportunities = await DatabaseOpportunity.search_opportunities(
                message, 
                intent['opportunity_type']
            )
            
            response_data['opportunities'] = opportunities
            
            if opportunities:
                response_data['response'] = EnhancedResponseGenerator.format_opportunities_response(
                    opportunities, intent['type']
                )
            else:
                response_data['response'] = EnhancedResponseGenerator.get_no_opportunities_response(intent['type'])
        else:
            # Generate general response
            response_data['response'] = EnhancedResponseGenerator.get_general_response(intent['type'])
        
        return response_data
    
    @staticmethod
    def format_opportunities_response(opportunities: List[Dict], intent_type: str) -> str:
        """Format opportunities into a readable response"""
        if not opportunities:
            return "I couldn't find any opportunities matching your criteria at the moment."
        
        response = f"I found {len(opportunities)} relevant opportunities for you:\n\n"
        
        for i, opp in enumerate(opportunities[:3], 1):  # Show top 3
            response += f"**{i}. {opp['title']}**\n"
            response += f"📍 **Type**: {opp['type'].title()}\n"
            
            if opp['location']:
                response += f"🌍 **Location**: {opp['location']}\n"
            
            if opp['description']:
                # Truncate description if too long
                desc = opp['description'][:200] + "..." if len(opp['description']) > 200 else opp['description']
                response += f"📝 **Description**: {desc}\n"
            
            response += "\n"
        
        response += "💡 **Next Steps**:\n"
        response += "• Visit the Opportunities section to see all available positions\n"
        response += "• Use the filters to narrow down your search\n"
        response += "• Save interesting opportunities to your favorites\n"
        response += "• Apply directly through our platform\n\n"
        
        response += "Would you like me to help you with anything specific about these opportunities?"
        
        return response
    
    @staticmethod
    def get_no_opportunities_response(intent_type: str) -> str:
        """Generate response when no opportunities are found"""
        responses = {
            'job_search': """I don't see any job opportunities matching your criteria right now, but here are some suggestions:

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

Would you like me to help you optimize your job search strategy?""",
            
            'funding_search': """I don't see any funding opportunities matching your criteria right now, but here are some suggestions:

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

Would you like me to help you find alternative funding sources?""",
            
            'training_search': """I don't see any training opportunities matching your criteria right now, but here are some suggestions:

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

Would you like me to help you find alternative learning resources?"""
        }
        
        return responses.get(intent_type, "I couldn't find any opportunities matching your criteria. Please try different keywords or check the Opportunities section for all available options.")
    
    @staticmethod
    def get_general_response(intent_type: str) -> str:
        """Generate general responses for non-search queries"""
        responses = {
            'cv_help': """I'd be happy to help you with your CV! Here's what I can assist with:

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

💡 **Pro Tips:**
• Keep your CV concise and relevant
• Use action verbs to describe your experience
• Include quantifiable achievements
• Tailor your CV to each job application
• Proofread carefully for errors

To get started, you can:
1. Upload your current CV for analysis
2. Use the CV Maker to create a new one
3. Get specific feedback on sections you want to improve

What would you like to focus on?""",
            
            'interview_help': """Excellent! Let me share some valuable interview preparation tips:

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

Would you like specific tips for a particular type of interview?""",
            
            'general': """Hello! I'm Morchid, your AI career assistant. I can help you with:

🔍 **Job Search & Opportunities**
• Find relevant job postings from our database
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

How can I assist you today?"""
        }
        
        return responses.get(intent_type, responses['general'])

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    """Enhanced chat endpoint with database integration"""
    try:
        # Generate intelligent response with database data
        response_data = await EnhancedResponseGenerator.generate_response(
            request.message, 
            request.user_id
        )
        
        return ChatResponse(
            success=True,
            response=response_data['response'],
            opportunities=response_data['opportunities'],
            timestamp=datetime.now().isoformat()
        )
        
    except Exception as e:
        return ChatResponse(
            success=False,
            response="I apologize, but I encountered an error processing your message. Please try again.",
            error=str(e),
            timestamp=datetime.now().isoformat()
        )

@app.get("/opportunities/search")
async def search_opportunities(q: str = "", type: str = None, limit: int = 5):
    """Search opportunities endpoint"""
    try:
        opportunities = await DatabaseOpportunity.search_opportunities(q, type, limit)
        return {
            "success": True,
            "opportunities": opportunities,
            "count": len(opportunities)
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "opportunities": []
        }

@app.get("/opportunities/recent")
async def get_recent_opportunities(limit: int = 5):
    """Get recent opportunities endpoint"""
    try:
        opportunities = await DatabaseOpportunity.get_recent_opportunities(limit)
        return {
            "success": True,
            "opportunities": opportunities,
            "count": len(opportunities)
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "opportunities": []
        }

@app.get("/health")
async def health_check():
    """Enhanced health check endpoint"""
    try:
        # Test database connection
        test_result = supabase.table('opportunities').select('id').limit(1).execute()
        db_status = "connected" if test_result.data is not None else "error"
    except Exception as e:
        db_status = f"error: {str(e)}"
    
    return {
        "status": "healthy",
        "nlweb_available": NLWEB_AVAILABLE,
        "database_status": db_status,
        "timestamp": datetime.now().isoformat()
    }

@app.get("/capabilities")
async def get_capabilities():
    """Get available capabilities"""
    return {
        "capabilities": [
            "job_search_assistance",
            "funding_search_assistance", 
            "training_search_assistance",
            "cv_review",
            "career_guidance",
            "interview_preparation",
            "database_integration",
            "real_time_opportunity_search"
        ],
        "nlweb_integration": NLWEB_AVAILABLE,
        "database_connected": True
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
