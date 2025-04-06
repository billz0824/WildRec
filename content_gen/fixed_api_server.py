import os
import json
import logging
from pathlib import Path
from flask import Flask, request, jsonify, send_from_directory, make_response, send_file
from flask_cors import CORS
from openai import OpenAI
from dotenv import load_dotenv
import tempfile
from werkzeug.utils import secure_filename

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('podcast_api')

app = Flask(__name__, static_folder='output')

# Enable CORS for all routes with proper configuration
CORS(app)

# Explicitly handle OPTIONS requests for CORS preflight
@app.route('/', defaults={'path': ''}, methods=['OPTIONS'])
@app.route('/<path:path>', methods=['OPTIONS'])
def options_handler(path):
    response = make_response()
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
    return response

# Add CORS headers to all responses
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
    return response

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Helper function to get the output directory with absolute path
def get_output_dir():
    # First try content_gen/output (relative to current working directory)
    output_dir = Path("content_gen/output").resolve()
    if output_dir.exists():
        return output_dir
    else:
        # Try from the script directory
        script_dir = Path(__file__).parent.resolve()
        output_dir = script_dir / "output"
        if output_dir.exists():
            return output_dir
        else:
            # Create the directory if it doesn't exist
            output_dir.mkdir(parents=True, exist_ok=True)
            return output_dir

# Helper function to get the videos directory with absolute path
def get_videos_dir():
    output_dir = get_output_dir()
    videos_dir = output_dir / "videos"
    # Make sure the directory exists
    videos_dir.mkdir(parents=True, exist_ok=True)
    
    return videos_dir

@app.route('/api/ask', methods=['POST'])
def ask_question():
    """
    Endpoint to ask a question about a podcast and get an AI-generated response
    """
    try:
        # Get the query from the request
        data = request.get_json()
        if not data or 'query' not in data:
            return jsonify({'error': 'No query provided'}), 400
        
        query = data['query']
        podcast_id = data.get('podcastId', 'unknown')
        context = data.get('context', {})  # Get additional context if provided
        
        # Log the received question with context
        logger.info(f"Question about podcast {podcast_id}: '{query}'")
        if context:
            logger.info(f"Context: {context}")
            
        # Try to load podcast metadata and transcripts
        podcast_title = "Unknown"
        podcast_content = ""
        
        # Look for podcast metadata
        try:
            output_dir = get_output_dir()
            podcast_metadata_path = os.path.join(output_dir, 'podcasts_metadata.json')
            
            if os.path.exists(podcast_metadata_path):
                with open(podcast_metadata_path, 'r') as f:
                    podcasts_data = json.load(f)
                
                for podcast in podcasts_data.get('podcasts', []):
                    if podcast.get('topic_id') == str(podcast_id):
                        podcast_title = podcast.get('topic_title', 'Unknown Podcast')
                        logger.info(f"Found podcast metadata: {podcast_title}")
                        break
            
            # Try to find transcript or script for this podcast
            scripts_dir = os.path.join(output_dir, 'scripts')
            if os.path.exists(scripts_dir):
                script_path = os.path.join(scripts_dir, f'topic_{podcast_id}_script.txt')
                if os.path.exists(script_path):
                    with open(script_path, 'r') as f:
                        podcast_content = f.read()
                    logger.info(f"Found script content, length: {len(podcast_content)}")
        except Exception as e:
            logger.warning(f"Error loading podcast metadata or script: {e}")
        
        # Create prompt for OpenAI with context
        time_context = ""
        if context.get('timeInVideo'):
            minutes = int(context['timeInVideo']) // 60
            seconds = int(context['timeInVideo']) % 60
            time_context = f" (at {minutes}:{seconds:02d} in the video)"
        
        title_context = ""
        if context.get('title') and context['title'] != "Unknown":
            title_context = f" about {context['title']}"
            
        content_context = ""
        if podcast_content:
            # Use a snippet of the transcript, not too long
            content_context = f"\nHere's an excerpt from the podcast: '{podcast_content[:1000]}...'"
            
        system_message = f"""You are a helpful assistant answering questions about a podcast{title_context}.
You provide concise, accurate responses based on the content of the podcast. 
Keep answers short (under 100 words) but informative and engaging.
If you don't know the answer, simply acknowledge that and suggest what might be relevant."""

        user_message = f"Question{time_context}: {query}{content_context}"
        
        # Initialize OpenAI client
        client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        
        # Generate a response with OpenAI
        logger.info("Sending request to OpenAI")
        completion = client.chat.completions.create(
            model="gpt-4o", 
            messages=[
                {"role": "system", "content": system_message},
                {"role": "user", "content": user_message}
            ],
            temperature=0.7,  # Slightly creative but still factual
            max_tokens=150,   # Keep responses concise
        )
        
        # Extract the response from the OpenAI API
        response_text = completion.choices[0].message.content
        logger.info(f"OpenAI response: {response_text}")
        
        return jsonify({
            'query': query,
            'response': response_text,
            'podcast_title': podcast_title
        })
        
    except Exception as e:
        logger.error(f"Error in ask_question: {str(e)}", exc_info=True)
        return jsonify({'error': str(e)}), 500

@app.route('/api/transcribe', methods=['POST'])
def transcribe_audio():
    """
    Endpoint to transcribe audio using OpenAI's Whisper model
    Accepts audio file uploads and returns the transcription
    """
    logger.info("Transcribe endpoint called")
    
    try:
        # Check if audio file was uploaded
        if 'audio' not in request.files:
            logger.error("No audio file in request")
            return jsonify({"error": "No audio file provided"}), 400
            
        audio_file = request.files['audio']
        
        # Get additional context if available
        podcast_id = request.form.get('podcastId', 'unknown')
        time_in_video = request.form.get('timeInVideo', '0')
        title = request.form.get('title', 'Unknown')
        
        logger.info(f"Processing audio for podcast: {title} (ID: {podcast_id}) at time: {time_in_video}s")
        
        # Create a temporary file to store the uploaded audio
        with tempfile.NamedTemporaryFile(delete=False, suffix='.webm') as temp_audio:
            audio_file.save(temp_audio.name)
            temp_audio_path = temp_audio.name
            
        logger.info(f"Audio saved to temporary file: {temp_audio_path}")
        
        # Initialize OpenAI client
        client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        
        # Open the audio file and transcribe with Whisper
        with open(temp_audio_path, "rb") as audio_file:
            logger.info("Sending audio to OpenAI Whisper API")
            transcript_response = client.audio.transcriptions.create(
                file=audio_file,
                model="whisper-1",
                language="en",
                response_format="text"
            )
        
        # Clean up the temporary file
        try:
            os.unlink(temp_audio_path)
        except Exception as e:
            logger.warning(f"Failed to delete temporary file: {e}")
        
        transcript = transcript_response
        logger.info(f"Transcription result: {transcript}")
        
        return jsonify({
            "transcript": transcript,
            "podcast_id": podcast_id,
            "time_in_video": time_in_video,
            "title": title
        })
    
    except Exception as e:
        logger.error(f"Error in transcribe_audio: {str(e)}", exc_info=True)
        return jsonify({"error": f"Transcription failed: {str(e)}"}), 500

@app.route('/api/podcasts', methods=['GET'])
def get_podcasts():
    """Return list of available podcasts"""
    try:
        output_dir = get_output_dir()
        videos_dir = get_videos_dir()
        
        # Try both metadata file variations
        metadata_path = output_dir / "podcast_metadata.json"
        if not metadata_path.exists():
            metadata_path = output_dir / "podcasts_metadata.json"
            
        if not metadata_path.exists():
            logger.warning("No metadata file found, creating a basic one from video files")
            
            # Create a basic metadata file from video files if they exist
            if videos_dir.exists():
                video_files = list(videos_dir.glob("*.mp4"))
                if video_files:
                    podcasts = []
                    for i, video_file in enumerate(video_files, 1):
                        topic_id = video_file.stem.split('_')[1] if '_' in video_file.stem else str(i)
                        podcasts.append({
                            "topic_id": topic_id,
                            "topic_title": f"Podcast {topic_id}",
                            "description": "Auto-generated podcast entry",
                            "videoUrl": f"/api/videos/{video_file.name}"
                        })
                    
                    # Create and return podcasts list
                    if podcasts:
                        return jsonify({"podcasts": podcasts})
            
            return jsonify({"error": "No podcasts found"}), 404
            
        with open(metadata_path, 'r') as f:
            metadata = json.load(f)
        
        # Process metadata into standard format for frontend
        podcasts = []
        
        # If it has a 'podcasts' key, use that directly
        if 'podcasts' in metadata:
            raw_podcasts = metadata.get('podcasts', [])
        else:
            # Treat the whole object as a single podcast
            raw_podcasts = [metadata]
        
        # Process each podcast
        for podcast in raw_podcasts:
            topic_id = podcast.get('topic_id', '')
            
            # Check for video file
            video_filename = f"topic_{topic_id}_podcast.mp4"
            video_path = videos_dir / video_filename
            
            if not video_path.exists():
                # Try alternate filenames - fix the glob pattern
                try:
                    alt_video_files = list(videos_dir.glob(f"*{topic_id}*.mp4"))
                    if alt_video_files:
                        video_path = alt_video_files[0]
                        video_filename = video_path.name
                    else:
                        # Just use any available video if we can't find a match
                        video_files = list(videos_dir.glob("*.mp4"))
                        if video_files:
                            video_path = video_files[0]
                            video_filename = video_path.name
                except ValueError:
                    # Fallback for invalid glob pattern
                    logger.warning(f"Invalid glob pattern for topic_id: {topic_id}")
                    # Try basic video file search instead
                    video_files = []
                    for file in videos_dir.iterdir():
                        if file.is_file() and file.suffix.lower() == '.mp4':
                            if str(topic_id) in file.name:
                                video_files.append(file)
                    
                    if video_files:
                        video_path = video_files[0]
                        video_filename = video_path.name
                    else:
                        # Try to find any MP4 file
                        for file in videos_dir.iterdir():
                            if file.is_file() and file.suffix.lower() == '.mp4':
                                video_files.append(file)
                        
                        if video_files:
                            video_path = video_files[0]
                            video_filename = video_path.name

            # If we found a video file, add this podcast to the list
            if video_path.exists():
                podcasts.append({
                    "id": topic_id,
                    "title": podcast.get('topic_title', f'Podcast {topic_id}'),
                    "description": podcast.get('description', 'Interactive podcast'),
                    "videoUrl": f"/api/videos/{video_filename}",
                    "courseId": podcast.get('course_id', 'unknown')
                })
        
        return jsonify({"podcasts": podcasts})
        
    except Exception as e:
        logger.error(f"Error getting podcasts: {str(e)}", exc_info=True)
        return jsonify({"error": "Failed to get podcasts"}), 500

@app.route('/api/videos/<path:filename>')
def serve_video(filename):
    """Serve video files"""
    videos_dir = get_videos_dir()
    logger.info(f"Serving video: {filename} from directory: {videos_dir}")
    
    try:
        # Make sure the path is correct and absolute
        videos_path = Path(videos_dir).resolve()
        logger.info(f"Resolved absolute path: {videos_path}")
        
        # Fix for truncated filenames
        original_filename = filename
        file_path = videos_path / filename
        
        # If file doesn't exist directly, try different approaches
        if not file_path.exists():
            logger.info(f"File not found directly: {file_path}")
            
            # 1. Try to match by topic ID prefix (e.g., topic_1_)
            topic_prefix = None
            if filename.startswith('topic_'):
                parts = filename.split('_')
                if len(parts) > 2:
                    topic_prefix = f"topic_{parts[1]}_"
            
            # 2. Find the best match based on available files
            best_match = None
            all_video_files = []
            for file in videos_path.iterdir():
                if file.is_file() and file.suffix.lower() == '.mp4':
                    all_video_files.append(file)
                    logger.info(f"Found video file: {file}")
            
            # Try to find by topic ID first
            if topic_prefix:
                for video_file in all_video_files:
                    if video_file.name.startswith(topic_prefix):
                        best_match = video_file
                        break
            
            # If no match by topic ID, try any file
            if not best_match and all_video_files:
                best_match = all_video_files[0]
            
            if best_match:
                logger.info(f"Found best match: {best_match} for requested: {filename}")
                return send_file(
                    best_match, 
                    mimetype='video/mp4',
                    as_attachment=False,
                    download_name=best_match.name
                )
            else:
                logger.error(f"No video files found in {videos_path}")
                return "No video files available", 404
        
        # Direct file match found
        logger.info(f"Serving exact file match: {file_path}")
        return send_file(
            file_path, 
            mimetype='video/mp4',
            as_attachment=False,
            download_name=file_path.name
        )
        
    except Exception as e:
        logger.error(f"Error serving video {filename}: {str(e)}")
        return f"Error serving video: {str(e)}", 500

# Add a special route to serve any available video
@app.route('/api/videos/any_available_video')
def serve_any_video():
    """Serve any available video file as a fallback"""
    videos_dir = get_videos_dir()
    logger.info(f"Attempting to serve any available video from: {videos_dir}")
    
    try:
        # Make sure the path is correct and absolute
        videos_path = Path(videos_dir).resolve()
        logger.info(f"Resolved absolute path: {videos_path}")
        
        # Find any .mp4 files
        video_files = []
        for file in videos_path.iterdir():
            if file.is_file() and file.suffix.lower() == '.mp4':
                video_files.append(file)
                logger.info(f"Found video file: {file}")
        
        if video_files:
            # Get the first video file
            random_video = video_files[0]
            logger.info(f"Serving random video file: {random_video}")
            
            # Return the file directly with the appropriate MIME type
            return send_file(
                random_video, 
                mimetype='video/mp4',
                as_attachment=False,
                download_name=random_video.name
            )
        else:
            logger.error(f"No video files found in {videos_path}")
            return "No video files available", 404
    except Exception as e:
        logger.error(f"Error serving random video: {str(e)}")
        return f"Error serving video: {str(e)}", 500

# Handle the root path for health checks
@app.route('/')
def index():
    return jsonify({
        "status": "ok",
        "service": "Podcast API Server",
        "endpoints": [
            "/api/podcasts",
            "/api/ask",
            "/api/videos/{filename}"
        ]
    })

if __name__ == '__main__':
    # Get output directory and log it
    output_dir = get_output_dir()
    videos_dir = get_videos_dir()
    logger.info(f"Output directory: {output_dir}")
    logger.info(f"Videos directory: {videos_dir}")
    
    # Use port 8000 to avoid conflicts
    app.run(host='0.0.0.0', port=8000, debug=True) 