import google.generativeai as genai
from app.core.config import settings
from app.models.schemas.dashboard import StoryStep, StoryWeaverResponse
import re # Import the regular expression module

# Configure the Gemini client with our API key
genai.configure(api_key=settings.GEMINI_API_KEY)
# Use the model name you found works
model = genai.GenerativeModel('gemini-2.5-pro') # Or whatever model name you are using

def generate_story_from_gemini(situation: str) -> StoryWeaverResponse:
    """
    Calls the Gemini API to generate a social story and parses the response.
    """
    prompt = f"""
    You are an expert in creating social stories for children with autism. 
    Your goal is to generate a simple, reassuring, and positive story based on a user's request. 
    The story must be 4-6 steps long. Each step must have a short, simple sentence and a description for an illustration in the format `[ILLUSTRATION: description]`. 
    Use a calm and predictable tone. Avoid complex vocabulary.
    
    User's situation: "{situation}"
    """

    try:
        response = model.generate_content(prompt)
        raw_text = response.text

        # --- NEW, MORE ROBUST PARSING LOGIC ---
        parsed_steps = []
        # Split the text by the illustration tag to separate text and illustration parts
        # This regex looks for the illustration tag and keeps it in the results
        parts = re.split(r'(\[ILLUSTRATION:.*?\])', raw_text)

        # The result will be like: ['text1', '[ILLUSTRATION: desc1]', 'text2', '[ILLUSTRATION: desc2]', ...]
        # We iterate through the list in pairs.
        for i in range(0, len(parts) - 1, 2):
            text_part = parts[i].strip()
            illustration_full = parts[i+1].strip()

            # Clean up the text part (remove numbering like "1. ")
            if text_part and text_part[0].isdigit() and text_part[1:3] in ['. ', '.)']:
                text_part = text_part[2:].strip()

            # Extract just the description from the full illustration tag
            illustration_part = illustration_full[len('[ILLUSTRATION:'):-1].strip()

            if text_part and illustration_part:
                parsed_steps.append(StoryStep(text=text_part, illustration=illustration_part))
        # --- END OF NEW LOGIC ---

        if not parsed_steps:
            raise ValueError("Failed to parse AI response into steps.")

        return StoryWeaverResponse(situation=situation, steps=parsed_steps)

    except Exception as e:
        print(f"Error processing Gemini response: {e}")
        return StoryWeaverResponse(
            situation=situation, 
            steps=[StoryStep(text="There was an error generating the story.", illustration="A sad computer icon")]
        )