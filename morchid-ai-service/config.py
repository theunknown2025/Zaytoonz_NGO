#!/usr/bin/env python3
"""
Configuration file for Enhanced Morchid AI Service
"""

import os
from typing import Dict, Any

class Config:
    """Configuration class for the Morchid AI Service"""
    
    # Supabase Configuration
    SUPABASE_URL = os.getenv("SUPABASE_URL", "https://uroirdudxkfppocqcorm.supabase.co")
    SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "")
    SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "")
    
    # Service Configuration
    SERVICE_HOST = os.getenv("SERVICE_HOST", "0.0.0.0")
    SERVICE_PORT = int(os.getenv("SERVICE_PORT", "8001"))
    
    # NLWeb Configuration
    NLWEB_PATH = os.getenv("NLWEB_PATH", "../NLWeb-main/code/python")
    
    # Database Tables
    TABLES = {
        "opportunities": "opportunities",
        "opportunity_description": "opportunity_description",
        "scraped_opportunities": "scraped_opportunities",
        "scraped_jobs": "scraped_jobs",
        "conversations": "morchid_conversations",
        "users": "users"
    }
    
    # Search Configuration
    MAX_SEARCH_RESULTS = int(os.getenv("MAX_SEARCH_RESULTS", "5"))
    MAX_DESCRIPTION_LENGTH = int(os.getenv("MAX_DESCRIPTION_LENGTH", "200"))
    
    # Response Templates
    RESPONSE_TEMPLATES = {
        "job_search": {
            "keywords": ["job", "work", "employment", "position", "career", "hire", "recruit"],
            "opportunity_type": "job"
        },
        "funding_search": {
            "keywords": ["funding", "grant", "financial", "money", "support", "sponsor"],
            "opportunity_type": "funding"
        },
        "training_search": {
            "keywords": ["training", "course", "learn", "education", "skill", "certification"],
            "opportunity_type": "training"
        }
    }
    
    @classmethod
    def validate_config(cls) -> Dict[str, Any]:
        """Validate configuration and return status"""
        status = {
            "supabase_configured": bool(cls.SUPABASE_URL and cls.SUPABASE_SERVICE_KEY),
            "nlweb_available": os.path.exists(cls.NLWEB_PATH),
            "service_ready": True
        }
        
        if not status["supabase_configured"]:
            status["service_ready"] = False
            status["error"] = "Supabase configuration missing"
        
        return status
    
    @classmethod
    def get_database_config(cls) -> Dict[str, str]:
        """Get database configuration"""
        return {
            "url": cls.SUPABASE_URL,
            "service_key": cls.SUPABASE_SERVICE_KEY,
            "anon_key": cls.SUPABASE_ANON_KEY
        }

# Environment variables that should be set
REQUIRED_ENV_VARS = [
    "SUPABASE_URL",
    "SUPABASE_SERVICE_KEY"
]

# Optional environment variables
OPTIONAL_ENV_VARS = [
    "SUPABASE_ANON_KEY",
    "SERVICE_HOST",
    "SERVICE_PORT",
    "NLWEB_PATH",
    "MAX_SEARCH_RESULTS",
    "MAX_DESCRIPTION_LENGTH"
]
