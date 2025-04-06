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
        "Table for 3. Estimate how much you learned in the course.-1. Estimate how much you learned in the course.-Statistics.": "Rewarding Rating",
        "Table for 4. Rate the effectiveness of the course in challenging you intellectually.-1. Rate the effectiveness of the course in challenging you intellectually.-Statistics.": "Challenging Rating",
        "Table for 5. Rate the effectiveness of the instructor in stimulating your interest in the subject.-1. Rate the effectiveness of the instructor in stimulating your interest in the subject.-Statistics.": "Interest Stimulation",
        "Table for 6. Estimate the average number of hours per week you spent on this course outside of class and lab time.-1. Estimate the average number of hours per week you spent on this course outside of class and lab time..": "Time Spent",
        "Table for What was your Interest in this subject before taking the course?-1. What was your interest in this subject before taking the course?.": "Prior Interest"
    }
    LIMIT = None

if CFG.USE_GEMINI:
    genai.configure(api_key=CFG.GENAI_API_KEY)

def normalize_caption(text):
    return re.sub(r"\s+", " ", text.strip().lower())

normalized_factors = {normalize_caption(k): v for k, v in CFG.FACTORS.items()}

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
        caption_norm = normalize_caption(caption_raw)
        factor = normalized_factors.get(caption_norm, None)

        rows = []
        for tr in table.find_all("tr")[1:]:  # Skip header
            cells = [td.get_text(strip=True) for td in tr.find_all(['td', 'th'])]
            if cells:
                rows.append(cells)

        # Find mean more robustly
        mean = None
        for row in rows:
            if len(row) >= 2 and "mean" in row[0].lower():
                mean = row[1]
                break

        # Custom handling for special tables
        if factor == "Time Spent":
            def get_midpoint(label):
                if label == "3 or fewer": return 2
                elif label == "20 or more": return 21
                else:
                    low, high = map(int, label.split(" - "))
                    return (low + high) / 2

            total = 0
            count = 0
            for row in rows:
                label, freq_str, *_ = row
                freq = int(freq_str)
                midpoint = get_midpoint(label)
                total += midpoint * freq
                count += freq

            mean = total / count if count != 0 else 0
            mean = round(mean, 3)

        elif factor == "Prior Interest":
            def extract_numeric(label):
                return int(label.split("-")[0])

            total_score = 0
            total_count = 0
            for row in rows:
                value = extract_numeric(row[0])
                count = int(row[1])
                total_score += value * count
                total_count += count

            mean = total_score / total_count if total_count != 0 else 0
            mean = round(mean, 3)

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

    parsed = 0
    for file_path in files:
        if CFG.LIMIT and parsed >= CFG.LIMIT:
            break

        report = parse_report(file_path)
        file_name = str(parsed)

        if not report["quantitative_raw"]:
            print(f"removed {file_name}")
            continue

        output_path = os.path.join(CFG.OUTPUT_FOLDER, f"{file_name}.json")
        with open(output_path, "w", encoding="utf-8") as out:
            json.dump(report, out, indent=2, ensure_ascii=False)

        print(f"✔ Parsed {file_name}")
        parsed += 1

if __name__ == "__main__":
    run()