import json
import time
import google.generativeai as genai
from info import API_KEY
import os
import glob
from attribute_computer import *
from summarizer import *



############################################
# This file completes the parsing pipeline #
############################################


class CFG:
    GENAI_API_KEY = API_KEY
    INPUT_DIR = "data/parsed_reports"
    OUTPUT_DIR = "data/final_reports"
    LIMIT = 50

genai.configure(api_key=CFG.GENAI_API_KEY)

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

        output_data = compute_course_metrics(report)
        output_data["content_summary"] = content_summary
        output_data["experience_summary"] = experience_summary

        course_code, course_name = output_data["course_name"].split(": ", 1)

        # Extract the department and course number
        parts = course_code.split("_")  # ['MATH', '218-1', '71']
        department = parts[0]
        number = parts[1].split("-")[0]  # Extract '218' from '218-1'

        course_number = f"{department} {number}"

        output_data["course_number"] = course_number
        output_data["course_name"] = course_name

        filename = os.path.splitext(os.path.basename(file_path))[0]
        output_path = os.path.join(CFG.OUTPUT_DIR, f"{filename}.json")

        with open(output_path, 'w', encoding='utf-8') as out:
            json.dump(output_data, out, indent=2, ensure_ascii=False)

        print(f"✔ Parsed {filename}")
        parsed += 1

if __name__ == "__main__":
    run()