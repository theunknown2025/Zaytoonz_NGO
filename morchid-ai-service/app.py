#!/usr/bin/env python3
"""
Morchid AI Service - NLWeb Integration
A Python service that provides AI-powered responses for the Morchid chat interface.
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
    print("Warning: NLWeb components not available. Using fallback responses.")

app = FastAPI(title="Morchid AI Service", version="1.0.0")

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

# Career-focused response templates
CAREER_RESPONSES = {
    "job_search": {
        "keywords": ["job", "opportunity", "position", "work", "employment", "career"],
        "response": """I can help you find job opportunities! Here are some ways to search:

🔍 **Quick Job Search Options:**
• Browse all opportunities: Navigate to the Opportunities section
• Filter by category: Use the category filters (Jobs, Funding, Training)
• Search by location: Look for remote or local positions
• Filter by experience level: Entry-level, Mid-level, Senior positions

💡 **Pro Tips:**
• Save interesting opportunities to your favorites
• Set up job alerts for new postings
• Check the "My Applications" section to track your submissions

Would you like me to help you with a specific type of job search?"""
    },
    "cv_review": {
        "keywords": ["cv", "resume", "curriculum", "application"],
        "response": """I'd be happy to help you review your CV! Here's what I can assist with:

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

What would you like to focus on?"""
    },
    "career_advice": {
        "keywords": ["career", "advice", "guidance", "development", "growth"],
        "response": """Great question! I'm here to provide comprehensive career guidance:

🎯 **Career Guidance Areas:**
• Career path exploration
• Skill development recommendations
• Industry insights and trends
• Networking strategies
• Professional development planning

📚 **Resources Available:**
• Training opportunities
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

What specific career advice are you looking for?"""
    },
    "interview_prep": {
        "keywords": ["interview", "preparation", "tips", "questions"],
        "response": """Excellent! Let me share some valuable interview preparation tips:

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

Would you like specific tips for a particular type of interview?"""
    },
    "skills_development": {
        "keywords": ["skills", "training", "learn", "development", "certification"],
        "response": """I can help you with skills development! Here are some options:

🎓 **Skills Development Areas:**
• Technical skills (programming, design, analysis)
• Soft skills (communication, leadership, teamwork)
• Industry-specific skills
• Digital literacy and tools
• Language skills

📚 **Available Resources:**
• Online training courses
• Certification programs
• Skill assessment tools
• Learning paths and roadmaps
• Mentorship opportunities

💡 **Recommended Approach:**
• Identify your current skill gaps
• Set specific learning goals
• Choose relevant training programs
• Practice and apply new skills
• Track your progress

What specific skills would you like to develop?"""
    },
    "application_tracking": {
        "keywords": ["track", "application", "follow", "status", "manage"],
        "response": """Great question! Here's how to effectively track your job applications:

📊 **Application Tracking System:**
• Use the "My Applications" section to monitor all submissions
• Set up reminders for follow-ups
• Track application status (Submitted, Under Review, Interview, etc.)
• Store important dates and deadlines
• Keep notes on each application

💡 **Best Practices:**
• Create a spreadsheet or use our built-in tracker
• Follow up appropriately (usually 1-2 weeks after applying)
• Keep copies of all application materials
• Network with company employees when possible
• Stay organized with application deadlines

🔄 **Follow-up Strategy:**
• Send thank-you emails after interviews
• Follow up on application status
• Keep in touch with recruiters
• Update your application status regularly

Would you like help setting up a tracking system?"""
    }
}

def analyze_message(message: str) -> str:
    """Analyze user message and return appropriate response category."""
    message_lower = message.lower()
    
    for category, data in CAREER_RESPONSES.items():
        if any(keyword in message_lower for keyword in data["keywords"]):
            return data["response"]
    
    # Default response
    return """Hello! I'm Morchid, your AI career assistant. I can help you with:

🔍 **Job Search & Opportunities**
• Find relevant job postings
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

How can I assist you today?"""

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    """Main chat endpoint that processes user messages."""
    try:
        # Analyze the message and get appropriate response
        response = analyze_message(request.message)
        
        return ChatResponse(
            success=True,
            response=response,
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
    """Health check endpoint."""
    return {
        "status": "healthy",
        "nlweb_available": NLWEB_AVAILABLE,
        "timestamp": datetime.now().isoformat()
    }

@app.get("/capabilities")
async def get_capabilities():
    """Get available capabilities."""
    return {
        "capabilities": [
            "job_search_assistance",
            "cv_review",
            "career_guidance", 
            "interview_preparation",
            "skills_development",
            "application_tracking"
        ],
        "nlweb_integration": NLWEB_AVAILABLE
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
