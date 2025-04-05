import os
import re
import json
import glob
from bs4 import BeautifulSoup
import google.generativeai as genai
from info import *
import time

#######################################################################################################
# Configurations for advanced processor, this processor summarizes questions and extracts mean values #
#######################################################################################################

class CFG:
    USE_GEMINI = True
    GENAI_API_KEY = API_KEY
    INPUT_FOLDER = "data/html_reports"
    OUTPUT_FOLDER = "data/parsed_reports"
    FACTORS = {
        "Table for 1. Provide an overall rating of the instruction.-1. Provide an overall rating of the instruction.-Statistics.": "Instruction Rating",
        "Table for 2. Provide an overall rating of the course.-1. Provide an overall rating of the course.-Statistics.": "Course Rating",
        "Table for 3. Estimate how much you learned in the course.-1. Estimate how much you learned in the course.-Statistics." : "Rewarding Rating",
        "Table for 4. Rate the effectiveness of the course in challenging you intellectually.-1. Rate the effectiveness of the course in challenging you intellectually.-Statistics." : "Challenging Rating",
        "Table for 5. Rate the effectiveness of the instructor in stimulating your interest in the subject.-1. Rate the effectiveness of the instructor in stimulating your interest in the subject.-Statistics." : "Interest Stimulation",
        "Table for 6. Estimate the average number of hours per week you spent on this course outside of class and lab time.-1. Estimate the average number of hours per week you spent on this course outside of class and lab time.." : "Time Spent",
        "Table for What was your Interest in this subject before taking the course?-1. What was your interest in this subject before taking the course?." : "Prior Interest"
    }

if CFG.USE_GEMINI:
    genai.configure(api_key=CFG.GENAI_API_KEY)


# Parse HTML report
def parse_report(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        soup = BeautifulSoup(f, 'lxml')

    report = {}

    # Course metadata
    title_tag = soup.find('title')
    title = ' '.join(title_tag.text.split()) if title_tag else "Unknown Title"
    match = re.search(r'Northwestern - (?:Student Report for )?(.*?)(?:\s+\(([^)]+)\))?$', title)

    if match:
        course = match.group(1).strip()
        professor = match.group(2).strip() if match.group(2) else "Unknown Professor"
        report["course_name"] = course
        report["professor"] = professor
    else:
        report["course_name"] = "Unknown Course"
        report["professor"] = "Unknown Professor"
    
    project_title_tag = soup.find("span", id=re.compile(".*_ProjectTitle"))
    term = None
    if project_title_tag:
        match = re.search(r"CTEC\s+([A-Za-z]+\s+\d{4})", project_title_tag.text)
        if match:
            term = match.group(1)
            report["term"] = term
    else:
        report["term"] = "None"

    # Student response info
    responded = soup.find(id=re.compile("lblResponded"))
    report["responded"] = responded.text.strip() if responded else ""

    # Quantitative tables
    tables = soup.find_all("table", class_="block-table")
    table_summaries = []

    for table in tables:
        caption_raw = table.caption.text.strip() if table.caption else "No caption"

        rows = []
        for tr in table.find_all("tr")[1:]:  # Skip header
            cells = [td.get_text(strip=True) for td in tr.find_all(['td', 'th'])]
            if cells:
                rows.append(cells)
                
        mean = next((row[1] for row in rows if row[0] == "Mean"), None)

        factor = CFG.FACTORS.get(caption_raw, None)

        if factor:
            table_summaries.append({
                "question": factor,
                "data": mean
            })

    report["quantitative_raw"] = table_summaries

    # Student comments
    comments = []
    for comment_table in soup.find_all("table", id=re.compile("CommentBox.*")):
        for td in comment_table.find_all("td"):
            comment = td.get_text(strip=True)
            if comment:
                comments.append(comment)

    report["student_comments"] = comments

    return report

# Parse files
def run():
    os.makedirs(CFG.OUTPUT_FOLDER, exist_ok=True)
    files = glob.glob(os.path.join(CFG.INPUT_FOLDER, "*.html"))

    for file_path in files:
        report = parse_report(file_path)
        file_name = report["course_name"]+"_"+report["professor"] + "_" + report["term"]
        if report["quantitative_raw"] == []:
            print(f"removed {file_name}")
            continue
        else:
            output_path = os.path.join(CFG.OUTPUT_FOLDER, f"{file_name}.json")

            with open(output_path, "w", encoding="utf-8") as out:
                json.dump(report, out, indent=2, ensure_ascii=False)
            print(f"✔ Parsed {file_name}")

if __name__ == "__main__":
    run()