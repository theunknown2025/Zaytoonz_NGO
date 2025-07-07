import os
from dotenv import load_dotenv
from supabase import create_client
from assets import MODELS_USED

load_dotenv()

def _get_streamlit_session_state():
    """Safely get streamlit session state, returns empty dict if not available"""
    try:
        # Only import streamlit if we're actually in a streamlit context
        import sys
        if 'streamlit' not in sys.modules and 'streamlit.runtime' not in sys.modules:
            return {}
        
        import streamlit as st
        # Check if we have a valid streamlit runtime context
        try:
            return st.session_state
        except Exception:
            # Streamlit is imported but not in proper context (e.g., API mode)
            return {}
    except ImportError:
        return {}
    except Exception:
        # If streamlit is not running in the proper context
        return {}

def get_api_key(model):
    """
    Returns an API key for a given model by:
      1) Looking up the environment var name in MODELS_USED[model].
         (We assume there's exactly one item in that set.)
      2) Returning the key from st.session_state if present;
         otherwise from os.environ.
    """
    env_var_name = list(MODELS_USED[model])[0]  # e.g., "GEMINI_API_KEY"
    session_state = _get_streamlit_session_state()
    return session_state.get(env_var_name) or os.getenv(env_var_name)

def get_supabase_client():
    """Returns a Supabase client if credentials exist, otherwise shows a guide."""
    session_state = _get_streamlit_session_state()
    supabase_url = session_state.get('SUPABASE_URL') or os.getenv('SUPABASE_URL')
    supabase_key = session_state.get('SUPABASE_ANON_KEY') or os.getenv('SUPABASE_ANON_KEY')

    if not supabase_url or not supabase_key or "your-supabase-url-here" in supabase_url:
        return None

    return create_client(supabase_url, supabase_key)
