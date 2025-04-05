import google.generativeai as genai
from info import API_KEY
import json
import time
import os
import glob

##################################################################################################
# This is a summarizer tool to extract course content and student experience summaries from CTEC #
##################################################################################################

class CFG:
    GENAI_API_KEY = API_KEY
    INPUT_DIR = "data/parsed_reports"
    OUTPUT_DIR = "data/text_reports"
    LIMIT = 5

genai.configure(api_key=CFG.GENAI_API_KEY)

def gemini_call(prompt, delay=3):
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content(prompt)
        time.sleep(delay)
        return response.text.strip()
    except Exception as e:
        return f"Gemini Error: {e}"

def data_processing(report):

    def summarize_question(question, score):
        return f"On a scale of 1-6 (1 is worst, 6 is best), the students gave an average rating of {score} for {question}.\n"

    # Summarize quantitative responses
    question_summary = ""
    for entry in report["quantitative_raw"]:
        question_summary += summarize_question(entry["question"], entry["data"])

    # Create the full context for Gemini
    data_text = (
        f"This is the anonymous report of {report['responded']} students "
        f"on the course {report['course_name']} taught by Professor {report['professor']}.\n\n"
        f"{question_summary}\n"
        f"The students also left the following comments:\n"
    )

    for comment in report["student_comments"]:
        data_text += f"- {comment}\n"

    return report, data_text


def generate_content_summary(report):
    data, summary = data_processing(report)

    prompt = f"""
        You are given a course name Please produce the following qualitative summary:

        Course Content Summary – What the course is about and what it teaches. Use your knowledge about the course topic.
        Keep your summary focused on the content of the class, and keep your summary to within 5 sentences. 

        --- Begin Report ---
        {data["course_name"]}
        --- End Report ---

        Return only your summary with no additional marking or commentary.
    """
    
    response = gemini_call(prompt)
    return response

def generate_experience_summary(report):
    data, summary = data_processing(report)

    prompt = f"""
        You are given a course evaluation report. Please produce the following qualitative summary:

        Course Experience Summary – How do the students feel about the course? Focus on students comments that address their experiences. Was the course challenging or fun or both? Examine time spent per week and the student ratings for the course.
        DO NOT include any numbers; interpret numerical statistics into word descriptions. If needed, you may use words such as 'extremely positive, positive, poor, extremely poor".
        Keep your summary to within 5 sentences.

        --- Begin Report ---
        {summary}
        --- End Report ---

        Use only information from the report. Return only your summary with no additional marking or commentary.
    """
    
    response = gemini_call(prompt)
    return response

# Parse files
def run():
    os.makedirs(CFG.OUTPUT_DIR, exist_ok=True)
    files = glob.glob(os.path.join(CFG.INPUT_DIR, "*.json"))

    parsed = 0

    for file_path in files:
        if CFG.LIMIT:
            if parsed > CFG.LIMIT: break

        with open(file_path, 'r', encoding='utf-8') as f:
            report = json.load(f)

        content_summary = generate_content_summary(report)
        experience_summary = generate_experience_summary(report)

        output_data = {
            "course_name": report['course_name'],
            "professor": report['professor'],
            "term": report.get('term', 'Unknown'),
            "content_summary": content_summary,
            "experience_summary": experience_summary
        }

        filename = os.path.splitext(os.path.basename(file_path))[0]
        output_path = os.path.join(CFG.OUTPUT_DIR, f"{filename}.json")

        with open(output_path, 'w', encoding='utf-8') as out:
            json.dump(output_data, out, indent=2, ensure_ascii=False)

        print(f"✔ Summarized {filename}")
        parsed += 1

if __name__ == "__main__":
    run()




        