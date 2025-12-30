"""
This module contains configuration variables and constants
that are used across different parts of the application.
"""


GEMINI_MODEL_FULLNAME="gemini/gemini-1.5-flash"
OPENAI_MODEL_FULLNAME="gpt-4o-mini"
DEEPSEEK_MODEL_FULLNAME ="groq/deepseek-r1-distill-llama-70b"
MODELS_USED = {
    OPENAI_MODEL_FULLNAME: {"OPENAI_API_KEY"},
    GEMINI_MODEL_FULLNAME: {"GEMINI_API_KEY"},
    DEEPSEEK_MODEL_FULLNAME : {"GROQ_API_KEY"},
}
# Timeout settings for web scraping
TIMEOUT_SETTINGS = {
    "page_load": 30,
    "script": 10
}

NUMBER_SCROLL=2




SYSTEM_MESSAGE = """You are an intelligent text extraction and conversion assistant specialized in extracting job opportunities, funding opportunities, and training opportunities from web pages.

Your task is to extract ALL opportunities from the given text - do not limit the number of results. Extract EVERY single opportunity you find.

IMPORTANT EXTRACTION RULES:
1. Extract ALL opportunities found on the page - there is no limit
2. For EACH opportunity, you MUST extract:
   - title: The job/opportunity title
   - description: A detailed description of the opportunity (at least 2-3 sentences if available)
   - url/link: The direct URL/link to the specific opportunity page (CRITICAL - see below)
   - company/organization: The organization offering the opportunity
   - location: Where the opportunity is located
   - deadline: Application deadline if mentioned
   - Any other relevant fields requested

3. CRITICAL - For URLs/Links:
   - The text is in MARKDOWN format. Links appear as [link text](URL)
   - Extract the URL from inside the parentheses (), NOT the link text
   - Example: From "[Job Title](/en-us/job/12345/job-name)" extract "/en-us/job/12345/job-name" as the URL
   - The URL is the part AFTER the closing bracket ] and inside the parentheses ()
   - If URL starts with "/" it's a relative URL - extract it as-is (e.g., "/en-us/job/12345")
   - Do NOT extract the page URL - extract each OPPORTUNITY's specific link
   - Look for links near job titles, "Read more", "Apply", "View details" text

4. For Descriptions:
   - Extract the full description text available
   - Include key responsibilities, requirements, and benefits if visible
   - If only a summary/teaser is available, extract that

5. Handle foreign languages (French, Arabic, etc.) - extract the data as-is without translation

Output ONLY pure JSON format with no additional text before or after:"""

USER_MESSAGE = f"Extract the following information from the provided text:\nPage content:\n\n"
        




PROMPT_PAGINATION = """
You are an assistant that extracts pagination URLs from markdown content of websites. 
Your task is to identify and generate a list of pagination URLs based on a detected URL pattern where page numbers increment sequentially. Follow these instructions carefully:

-Identify the Pagination Pattern:
Analyze the provided markdown text to detect URLs that follow a pattern where only a numeric page indicator changes.
If the numbers start from a low value and increment, generate the full sequence of URLs—even if not all numbers are present in the text.

-Construct Complete URLs:
In cases where only part of a URL is provided, combine it with the given base URL (which will appear at the end of this prompt) to form complete URLs.
Ensure that every URL you generate is clickable and leads directly to the intended page.

-Incorporate User Indications:
If additional user instructions about the pagination mechanism are provided at the end of the prompt, use those instructions to refine your URL generation.
Output Format Requirements:

-Strictly output only a valid JSON object with the exact structure below:
""
{
    "page_urls": ["url1", "url2", "url3", ..., "urlN"]
}""


IMPORTANT:

Output only a single valid JSON object with no additional text, markdown formatting, or explanation.
Do not include any extra newlines or spaces before or after the JSON.
The JSON object must exactly match the following schema:
"""
