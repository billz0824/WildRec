import time
import google.generativeai as genai
from data.info import API_KEY
from backend.routes.courses import Course


class CFG:
    GENAI_API_KEY = API_KEY
    INPUT_DIR = "data/parsed_reports"
    OUTPUT_DIR = "data/final_reports"
    LIMIT = 5

genai.configure(api_key=CFG.GENAI_API_KEY)


###############################################################
# This function generates user preferences based on user info #
###############################################################

def generate_user_preference_summary(user_info, delay=5):

    # Reformat ratings into descriptive text
    preference_order = sorted(
        ["liked", "difficulty", "practicality", "collaborative", "rewarding", "instruction"],
        key=lambda x: -user_info[x]
    )
    preference_text = ", ".join(preference_order[:3])

    top_classes = user_info["top_classes"]
    top_classes_description = ", ".join([Course.query.filter_by(number=t).first()['content_summary'] for t in top_classes])

    # Create the prompt
    prompt = f"""
    Generate a friendly and professional paragraph summarizing this user's course preferences.

    Context:
    - Major: {user_info["major"]}
    - Goal Description: {user_info["goal_description"]}
    - Most important course qualities (ranked): {preference_text}
    - Descriptions of past favorite past classes: {top_classes_description}
    - Taken courses: {", ".join(user_info["past_classes"])}

    Please highlight the user's academic interests and what they're looking for in future classes.
    Avoid listing the rating numbers, and instead turn them into qualitative insights.

    Return only the paragraph. Keep the paragraph to within 5 sentences.
    """

    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(prompt)
        time.sleep(delay)
        return response.text.strip()
    except Exception as e:
        return f"Gemini Error: {e}"
