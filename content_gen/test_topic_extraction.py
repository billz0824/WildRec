import json
import logging
import sys
from pathlib import Path
from dotenv import load_dotenv
from podcast_generator import GPT4oAPI

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger('test_topic_extraction')

load_dotenv()

def test_topic_extraction():
    # Initialize the API
    gpt4o_api = GPT4oAPI()
    
    # Read sample course info
    output_dir = Path("./output")
    research_file = output_dir / "research.txt"
    
    if not research_file.exists():
        logger.error(f"Research file not found: {research_file}")
        test_course_info = "Economics 310-1 is a course on microeconomic theory covering consumer theory, producer theory, choice under uncertainty, and competitive markets."
    else:
        with open(research_file, "r") as f:
            test_course_info = f.read()
    
    # Extract topics with different counts
    try:
        topics_1 = gpt4o_api.extract_key_topics(test_course_info, 1)
        print("\nTopics (count=1):")
        print(f"Type: {type(topics_1)}")
        print(f"Content: {topics_1}")
        
        topics_3 = gpt4o_api.extract_key_topics(test_course_info, 3)
        print("\nTopics (count=3):")
        print(f"Type: {type(topics_3)}")
        print(f"Content: {topics_3}")
        
        # Test if we can access topic_id on each topic
        print("\nAccessing topic_id for topics_1:")
        if isinstance(topics_1, list):
            for t in topics_1:
                print(f"  - Topic ID: {t.get('topic_id', 'missing')}")
        else:
            print(f"  - Cannot access topic_id, topics_1 is not a list: {type(topics_1)}")
        
        print("\nAccessing topic_id for topics_3:")
        if isinstance(topics_3, list):
            for t in topics_3:
                print(f"  - Topic ID: {t.get('topic_id', 'missing')}")
        else:
            print(f"  - Cannot access topic_id, topics_3 is not a list: {type(topics_3)}")
    
    except Exception as e:
        logger.error(f"Error during testing: {str(e)}")

if __name__ == "__main__":
    test_topic_extraction() 