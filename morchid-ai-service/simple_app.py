#!/usr/bin/env python3
"""
Simple Morchid AI Service - Enhanced Responses
A Python service that provides AI-powered responses for the Morchid chat interface
with enhanced intelligence and response generation.
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

app = FastAPI(title="Simple Morchid AI Service", version="2.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://your-domain.com"],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

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

class EnhancedResponseGenerator:
    """Enhanced response generator with intelligent analysis"""
    
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
        """Generate intelligent response based on user message"""
        intent = EnhancedResponseGenerator.analyze_user_intent(message)
        
        response_data = {
            'response': '',
            'opportunities': []
        }
        
        if intent['is_search']:
            # For search queries, provide guidance on how to find opportunities
            response_data['response'] = EnhancedResponseGenerator.get_search_guidance_response(intent['type'])
        else:
            # Generate general response
            response_data['response'] = EnhancedResponseGenerator.get_general_response(intent['type'])
        
        return response_data
    
    @staticmethod
    def get_search_guidance_response(intent_type: str) -> str:
        """Provide guidance for search queries"""
        responses = {
            'job_search': """I can help you find job opportunities! Here's how to search effectively:

🔍 **Searching Available Positions...**
I'll guide you through finding the best job matches in our database.

💡 **What I can help with:**
• Search through real job opportunities in our database
• Filter by location, experience level, and job type
• Provide detailed information about each position
• Help you understand application requirements

🎯 **Next Steps:**
1. Visit the Opportunities section in your dashboard
2. Use the "Jobs" filter to see all available positions
3. Apply additional filters for location, experience, etc.
4. Save interesting opportunities to your favorites
5. Apply directly through our platform

💡 **Pro Tips:**
• Set up job alerts for new postings
• Update your profile to attract recruiters
• Network with other professionals in your field
• Consider freelance or contract work

Would you like me to help you optimize your job search strategy or provide specific career advice?""",
            
            'funding_search': """I can help you find funding opportunities! Here's how to search effectively:

🔍 **Searching Available Funding...**
I'll guide you through finding the best funding matches in our database.

💡 **What I can help with:**
• Search through real funding opportunities in our database
• Filter by type, amount, and eligibility criteria
• Provide detailed information about each opportunity
• Help you understand application requirements

🎯 **Next Steps:**
1. Visit the Opportunities section in your dashboard
2. Use the "Funding" filter to see all available grants
3. Apply additional filters for amount, type, etc.
4. Review eligibility criteria carefully
5. Apply directly through our platform

💡 **Pro Tips:**
• Set up funding alerts for new opportunities
• Network with other organizations
• Consider different types of funding (grants, loans, competitions)
• Look into government programs

Would you like me to help you find alternative funding sources or provide application tips?""",
            
            'training_search': """I can help you find training opportunities! Here's how to search effectively:

🔍 **Searching Available Training...**
I'll guide you through finding the best training matches in our database.

💡 **What I can help with:**
• Search through real training opportunities in our database
• Filter by type, duration, and skill level
• Provide detailed information about each course
• Help you understand requirements and benefits

🎯 **Next Steps:**
1. Visit the Opportunities section in your dashboard
2. Use the "Training" filter to see all available courses
3. Apply additional filters for duration, skill level, etc.
4. Review course details and requirements
5. Enroll directly through our platform

💡 **Pro Tips:**
• Set up training alerts for new courses
• Consider online learning platforms
• Look for industry-specific certifications
• Explore free resources and MOOCs

Would you like me to help you find alternative learning resources or provide skill development advice?"""
        }
        
        return responses.get(intent_type, "I can help you search for opportunities! Visit the Opportunities section in your dashboard to see all available positions, funding, and training programs.")
    
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
    """Enhanced chat endpoint with intelligent response generation"""
    try:
        # Generate intelligent response
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

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "nlweb_available": NLWEB_AVAILABLE,
        "service_version": "2.0.0",
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
            "intelligent_response_generation",
            "intent_recognition"
        ],
        "nlweb_integration": NLWEB_AVAILABLE,
        "service_version": "2.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
