# scraper.py

import json
from typing import List, Optional
from pydantic import BaseModel, Field, create_model
from assets import (OPENAI_MODEL_FULLNAME,GEMINI_MODEL_FULLNAME,SYSTEM_MESSAGE)
from llm_calls import (call_llm_model)
from markdown import read_raw_data
from api_management import get_supabase_client
from utils import  generate_unique_name

def get_supabase():
    """Get supabase client lazily to avoid module-level imports"""
    return get_supabase_client()

def create_dynamic_listing_model(field_names: List[str]):
    """
    Create a dynamic Pydantic model for extracting opportunity listings.
    All fields are optional to handle cases where data might not be available.
    """
    # Make fields optional with default None to handle missing data gracefully
    field_definitions = {field: (Optional[str], None) for field in field_names}
    return create_model('DynamicListingModel', **field_definitions)

def create_listings_container_model(listing_model: BaseModel):
    """
    Create a container model that holds a LIST of all opportunities.
    The listings field should contain ALL opportunities found on the page.
    """
    return create_model('DynamicListingsContainer', listings=(List[listing_model], ...))

def generate_system_message(listing_model: BaseModel) -> str:
    """
    Generate the system message for the LLM with instructions to extract ALL opportunities.
    """
    schema_info = listing_model.model_json_schema()
    field_descriptions = []
    for field_name, field_info in schema_info["properties"].items():
        # Handle cases where type might be in anyOf (for Optional fields)
        if "type" in field_info:
            field_type = field_info["type"]
        elif "anyOf" in field_info:
            # Get the non-null type
            types = [t.get("type") for t in field_info["anyOf"] if t.get("type") != "null"]
            field_type = types[0] if types else "string"
        else:
            field_type = "string"
        field_descriptions.append(f'"{field_name}": "{field_type}"')

    schema_structure = ",\n           ".join(field_descriptions)

    final_prompt = SYSTEM_MESSAGE + "\n" + f"""
CRITICAL: Extract ALL opportunities found on the page. Do NOT limit the number of results.
Each opportunity MUST include a description and URL/link if available.

Output strictly follows this JSON schema:
{{
   "listings": [
     {{
       {schema_structure}
     }},
     // ... include ALL opportunities found, no limit
   ]
}}

CRITICAL URL EXTRACTION (MARKDOWN FORMAT):
- The content is in MARKDOWN format where links appear as: [Link Text](URL)
- For the "url" or "link" field: Extract the URL from INSIDE the parentheses ()
- Example input: "[Consultancy Position](/en-us/job/588505/consultancy-position)"
- Correct extraction: url = "/en-us/job/588505/consultancy-position"
- Do NOT extract the link text, extract the actual URL path
- Relative URLs starting with "/" are valid - extract them as-is

IMPORTANT NOTES:
- Extract EVERY opportunity you find - there is no maximum limit
- For "description" fields: extract the full description or summary available for each opportunity
- If a field is not available, use null or empty string
- Handle French, Arabic, or other languages - extract data as-is
"""

    return final_prompt


def save_formatted_data(unique_name: str, formatted_data):
    if isinstance(formatted_data, str):
        try:
            data_json = json.loads(formatted_data)
        except json.JSONDecodeError:
            data_json = {"raw_text": formatted_data}
    elif hasattr(formatted_data, "dict"):
        data_json = formatted_data.dict()
    else:
        data_json = formatted_data

    supabase = get_supabase()
    supabase.table("scraped_data").update({
        "formatted_data": data_json
    }).eq("unique_name", unique_name).execute()
    MAGENTA = "\033[35m"
    RESET = "\033[0m"  # Reset color to default
    print(f"{MAGENTA}INFO:Scraped data saved for {unique_name}{RESET}")

def scrape_urls(unique_names: List[str], fields: List[str], selected_model: str):
    """
    For each unique_name:
      1) read raw_data from supabase
      2) parse with selected LLM to extract ALL opportunities
      3) save formatted_data
      4) accumulate cost
    Return total usage + list of final parsed data
    
    IMPORTANT: This function extracts ALL opportunities with no limit.
    Each opportunity should include description and URL if available.
    """
    total_input_tokens = 0
    total_output_tokens = 0
    total_cost = 0
    parsed_results = []

    # Ensure 'url' and 'description' are in the fields if not already
    enhanced_fields = list(fields)
    if 'url' not in enhanced_fields and 'link' not in enhanced_fields:
        enhanced_fields.append('url')
    if 'description' not in enhanced_fields:
        enhanced_fields.append('description')
    
    print(f"🔍 Extracting fields: {enhanced_fields}")

    DynamicListingModel = create_dynamic_listing_model(enhanced_fields)
    DynamicListingsContainer = create_listings_container_model(DynamicListingModel)
    
    # Generate enhanced system message that emphasizes extracting ALL opportunities
    enhanced_system_message = generate_system_message(DynamicListingModel)

    for uniq in unique_names:
        raw_data = read_raw_data(uniq)
        if not raw_data:
            BLUE = "\033[34m"
            RESET = "\033[0m"
            print(f"{BLUE}No raw_data found for {uniq}, skipping.{RESET}")
            continue
        
        # Log the size of raw data to understand content
        print(f"📄 Raw data size for {uniq}: {len(raw_data)} characters")

        # Use enhanced system message for better extraction
        parsed, token_counts, cost = call_llm_model(
            raw_data, 
            DynamicListingsContainer, 
            selected_model, 
            enhanced_system_message
        )

        # store
        save_formatted_data(uniq, parsed)

        total_input_tokens += token_counts["input_tokens"]
        total_output_tokens += token_counts["output_tokens"]
        total_cost += cost
        
        # Log extraction results
        try:
            if isinstance(parsed, str):
                parsed_json = json.loads(parsed)
            else:
                parsed_json = parsed
            
            if isinstance(parsed_json, dict) and "listings" in parsed_json:
                num_listings = len(parsed_json["listings"])
                GREEN = "\033[32m"
                RESET = "\033[0m"
                print(f"{GREEN}✅ Extracted {num_listings} opportunities from {uniq}{RESET}")
        except:
            pass
        
        parsed_results.append({"unique_name": uniq, "parsed_data": parsed})

    MAGENTA = "\033[35m"
    RESET = "\033[0m"
    print(f"{MAGENTA}📊 Total extraction complete. Cost: ${total_cost:.4f}{RESET}")
    
    return total_input_tokens, total_output_tokens, total_cost, parsed_results
