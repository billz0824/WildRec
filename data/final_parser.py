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
    LIMIT = 5

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

        filename = os.path.splitext(os.path.basename(file_path))[0]
        output_path = os.path.join(CFG.OUTPUT_DIR, f"{filename}.json")

        with open(output_path, 'w', encoding='utf-8') as out:
            json.dump(output_data, out, indent=2, ensure_ascii=False)

        print(f"✔ Parsed {filename}")
        parsed += 1

if __name__ == "__main__":
    run()