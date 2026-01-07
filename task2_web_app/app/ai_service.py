import os
import json
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    # Use a placeholder if not set, or raise error. 
    # For now, print warning.
    print("Warning: GEMINI_API_KEY not found.")

client = genai.Client(api_key=api_key)
MODEL_ID = "gemini-2.5-flash" # Stick to Flash for backend speed/stability

def analyze_review(review_text: str, star_rating: int, business_name: str = "Unknown"):
    """
    Analyzes the review using Gemini to provide:
    1. A concise summary (max 15 words)
    2. A recommended action for the business
    """
    prompt = f"""
    You are an AI assistant for a business dashboard reviews for '{business_name}'.
    Analyze the following customer review.
    
    Review Star Rating: {star_rating}/5
    Review Text: "{review_text}"
    
    Your Task:
    1. Generate a very short summary (max 15 words).
    2. Suggest a concrete Recommended Action for the business owner.
    
    Output Format: ONLY valid JSON.
    {{
        "summary": "...",
        "recommended_action": "..."
    }}
    """
    
    try:
        config = types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema={
                "type": "OBJECT",
                "properties": {
                    "summary": {"type": "STRING"},
                    "recommended_action": {"type": "STRING"}
                },
                "required": ["summary", "recommended_action"]
            }
        )
        
        response = client.models.generate_content(
            model=MODEL_ID,
            contents=prompt,
            config=config
        )
        
        return json.loads(response.text)
    
    except Exception as e:
        print(f"AI Analysis Failed: {e}")
        return {
            "summary": "AI analysis unavailable",
            "recommended_action": "Review manually"
        }
