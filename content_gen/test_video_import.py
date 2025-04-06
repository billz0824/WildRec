import logging
import sys

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler(sys.stdout)]
)

try:
    from video_generator import PodcastVideoGenerator, enhance_podcast_workflow_with_video
    print("Successfully imported video_generator module!")
    
    # Check OpenAI API key is available
    import os
    from dotenv import load_dotenv
    load_dotenv()
    
    api_key = os.getenv("OPENAI_API_KEY")
    if api_key:
        print("OpenAI API key is available in environment")
    else:
        print("Warning: OpenAI API key not found in environment")
        
    # Check for ffmpeg
    import subprocess
    try:
        result = subprocess.run(["ffmpeg", "-version"], capture_output=True, text=True)
        if result.returncode == 0:
            print(f"ffmpeg is installed: {result.stdout.splitlines()[0]}")
        else:
            print("ffmpeg command failed")
    except FileNotFoundError:
        print("Warning: ffmpeg is not installed or not in PATH")
        
except ImportError as e:
    print(f"Error importing video_generator: {e}")
    
    # Check if the video_generator.py file exists
    import os
    if os.path.exists("video_generator.py"):
        print("video_generator.py file exists")
    else:
        print("video_generator.py file does not exist") 