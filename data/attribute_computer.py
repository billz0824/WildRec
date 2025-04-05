import json
import time
import google.generativeai as genai
from info import API_KEY
import os
import glob



##################################################################
# This is a tool to compute numerical features of a given course #
##################################################################

class CFG:
    GENAI_API_KEY = API_KEY
    INPUT_DIR = "data/parsed_reports"
    OUTPUT_DIR = "data/numerical_reports"
    LIMIT = 5

genai.configure(api_key=CFG.GENAI_API_KEY)

def gemini_sentiment_analysis(comment, aspect="overall", delay=5):
    prompt = f"""
    You are a school administrator. Analyze the a class of students' comments from a course evaluation and assess their satisfaction with how {aspect} the course is.

    A score of:
    5 = Very Positive
    4 = Positive
    3 = Neutral
    2 = Negative
    1 = Very Negative

    Only return the number score (1 to 5), nothing else.

    Comment: "{comment}"
    """

    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content(prompt)
        time.sleep(delay)  # Delay to avoid hitting rate limits
        score = float(response.text.strip())

        # Clamp score to [1, 5] range
        return min(max(round(score, 2), 1), 5)

    except Exception as e:
        return 3
    
def one_sentece_slogan(comment, delay=5):
    prompt = f"""
    You are a school administrator. Analyze the a class of students' comments from a course evaluation and condense their comments into a single line slogan. 
    Try your best to be positive, but do not be overly positive and follow the students' sentiment closely.
    Only return the slogan, nothing else.

    Comment: "{comment}"
    """

    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content(prompt)
        time.sleep(delay)  # Delay to avoid hitting rate limits
        slogan = response.text
        return slogan

    except Exception as e:
        return 3

def compute_course_metrics(report):
    def get_value(question_name):
        for q in report["quantitative_raw"]:
            if question_name.lower() in q["question"].lower():
                try:
                    return float(q["data"])
                except ValueError:
                    return None
        return None

    def normalize(value, max_val=6):
        return round(value * 5 / 6)

    # Extract values
    instruction = get_value("Instruction Rating") or 0
    course = get_value("Course Rating") or 0
    rewarding = get_value("Rewarding Rating") or 0
    challenging = get_value("Challenging Rating") or 0
    interest = get_value("Interest Stimulation") or 0
    prior_interest = get_value("Prior Interest") or 0
    time_spent = get_value("Time Spent") or 0
    comments = " ".join(report["student_comments"])
    
    # Compute change in interest
    delta_interest = max(0, interest - prior_interest)

    # Count collaboration-related keywords
    def keyword_score(keywords):
        return sum(any(k in c.lower() for k in keywords) for c in comments) / len(comments) * 5 if comments else 1

    collaborative_keywords = ["discussion", "group", "worked together", "section", "collaborative"]
    practicality_keywords = ["real world", "useful", "practical", "healthcare", "insurance", "deductibles"]

    # Compute ratings (CAN BE CHANGED!!!)
    liked_by_students = round(0.5 * normalize(course) + 0.5 * gemini_sentiment_analysis(comments, "enjoyable"), 2)
    difficulty = round(0.3 * (time_spent / 20 * 5) + 0.4 * normalize(challenging) + 0.3 * gemini_sentiment_analysis(comments, "challenging"), 2)
    rewarding_score = round(0.4 * normalize(rewarding) + 0.2 * delta_interest + 0.4 * gemini_sentiment_analysis(comments, "rewarding"), 2)
    collaborative = round(0.3 * keyword_score(collaborative_keywords) + 0.7 * gemini_sentiment_analysis(comments, "collaborative"), 2)
    practicality_score = round(0.3 * keyword_score(practicality_keywords) + 0.7 * gemini_sentiment_analysis(comments, "useful"), 2)
    instruction_quality = round(0.6 * normalize(instruction) + 0.2 * delta_interest + 0.2 * gemini_sentiment_analysis(comments, "well taught"), 2)

    slogan = one_sentece_slogan(comments)

    return {
        "course_name": report["course_name"],
        "professor": report["professor"],
        "term": report["term"],
        "Liked by Students": liked_by_students,
        "Difficulty": difficulty,
        "Practicality": practicality_score,
        "Collaborative": collaborative,
        "Rewarding": rewarding_score,
        "Instruction Quality": instruction_quality,
        "Slogan" : slogan
    }

def run():
    os.makedirs(CFG.OUTPUT_DIR, exist_ok=True)
    files = glob.glob(os.path.join(CFG.INPUT_DIR, "*.json"))

    processed = 0
    for file_path in files:
        if CFG.LIMIT:
            if processed > CFG.LIMIT:
                break

        with open(file_path, 'r', encoding='utf-8') as f:
            report = json.load(f)

        output_data = compute_course_metrics(report)

        filename = os.path.splitext(os.path.basename(file_path))[0]
        output_path = os.path.join(CFG.OUTPUT_DIR, f"{filename}.json")

        with open(output_path, 'w', encoding='utf-8') as out:
            json.dump(output_data, out, indent=2, ensure_ascii=False)

        print(f"✔ Processed {filename}")
        processed += 1

if __name__ == "__main__":
    run()
    
