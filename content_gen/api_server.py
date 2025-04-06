import os
import json
import logging
from pathlib import Path
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS, cross_origin
from openai import OpenAI
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('podcast_api')

app = Flask(__name__)
# Enable CORS for all routes and origins with explicit OPTIONS handling
CORS(app, 
     resources={r"/*": {"origins": "*"}}, 
     supports_credentials=True,
     allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])

# Add CORS headers to all responses 
@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
    return response

# Handle OPTIONS requests explicitly
@app.route('/', defaults={'path': ''}, methods=['OPTIONS'])
@app.route('/<path:path>', methods=['OPTIONS'])
def options_handler(path):
    return jsonify({}), 200

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Helper function to find the correct output directory
def get_output_dir():
    # Check for both possible locations
    if os.path.exists("output"):
        return Path("output")
    elif os.path.exists("content_gen/output"):
        return Path("content_gen/output")
    else:
        # Default fallback
        return Path("output")

# Helper function to get the correct videos directory
def get_videos_dir():
    output_dir = get_output_dir()
    videos_dir = output_dir / "videos"
    if videos_dir.exists():
        return videos_dir
    else:
        logger.warning(f"Videos directory not found at {videos_dir}")
        return output_dir / "videos"  # Return the path anyway as a fallback

@app.route('/api/ask', methods=['POST'])
def ask_question():
    """Handle user questions about podcast content"""
    try:
        data = request.json
        query = data.get('query')
        podcast_id = data.get('podcastId')
        
        if not query:
            return jsonify({"error": "No query provided"}), 400
            
        # Load podcast metadata and transcript for context
        output_dir = get_output_dir()
        metadata_path = output_dir / "podcast_metadata.json"
        if not metadata_path.exists():
            return jsonify({"error": "Podcast metadata not found"}), 404
            
        with open(metadata_path, 'r') as f:
            all_podcasts = json.load(f)
        
        # Find the specific podcast
        podcast_data = None
        if podcast_id:
            # Find by ID if provided
            for podcast in all_podcasts.get('podcasts', []):
                if podcast.get('topic_id') == podcast_id:
                    podcast_data = podcast
                    break
        
        # Get transcript and script if available
        transcript = ""
        if podcast_data:
            # Get the transcript file if it exists
            topic_id = podcast_data.get('topic_id')
            subtitle_path = output_dir / "subtitles" / f"topic_{topic_id}_subtitles.srt"
            script_path = output_dir / "scripts" / f"topic_{topic_id}_script.txt"
            
            # Extract text from subtitles (SRT file)
            if subtitle_path.exists():
                with open(subtitle_path, 'r') as f:
                    lines = f.readlines()
                    # Extract only the text lines (not timing or index)
                    transcript_lines = []
                    for i, line in enumerate(lines):
                        # Skip index and timing lines, and blank lines
                        if (i % 4 == 2) and line.strip():
                            transcript_lines.append(line.strip())
                    transcript = " ".join(transcript_lines)
            
            # Add script content if available
            script_content = ""
            if script_path.exists():
                with open(script_path, 'r') as f:
                    script_content = f.read()
        
        # Generate response using OpenAI
        prompt = f"""
        You are an assistant for a podcast called "{podcast_data.get('topic_title', 'Unknown')}" about "{podcast_data.get('topic_title', 'Unknown')}".
        
        Here is the transcript of the podcast:
        {transcript}
        
        Additional context from the script:
        {script_content}
        
        Answer the following question in a conversational tone, as if you're part of the podcast:
        {query}
        
        Keep your response brief (2-3 sentences) and friendly.
        """
        
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are a helpful assistant for a podcast."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=150  # Keep responses short for voice
        )
        
        ai_response = response.choices[0].message.content
        
        return jsonify({
            "response": ai_response,
            "podcast": {
                "id": podcast_data.get('topic_id') if podcast_data else None,
                "title": podcast_data.get('topic_title') if podcast_data else "Unknown"
            }
        })
        
    except Exception as e:
        logger.error(f"Error processing question: {str(e)}", exc_info=True)
        return jsonify({"error": "Failed to process your question"}), 500

@app.route('/api/podcasts', methods=['GET'])
def get_podcasts():
    """Return list of available podcasts"""
    try:
        output_dir = get_output_dir()
        metadata_path = output_dir / "podcast_metadata.json"
        
        if not metadata_path.exists():
            # Try alternative metadata file
            metadata_path = output_dir / "podcasts_metadata.json"
            
            if not metadata_path.exists():
                return jsonify({"error": "Podcast metadata not found"}), 404
            
        with open(metadata_path, 'r') as f:
            metadata = json.load(f)
        
        # Check metadata format and transform if needed
        podcasts = []
        
        # If it has a 'podcasts' key, use that directly
        if 'podcasts' in metadata:
            all_podcasts = metadata.get('podcasts', [])
        # Otherwise, transform from the segments format
        elif 'segments' in metadata:
            # Create a single podcast entry from the metadata
            course_name = metadata.get('course_name', 'Unknown Course')
            
            # Get topic info if available
            topic_id = "1"  # Default
            topic_title = course_name
            
            # Check if we have topics.json for better info
            topics_path = output_dir / "topics.json"
            if topics_path.exists():
                try:
                    with open(topics_path, 'r') as f:
                        topics_data = json.load(f)
                        if len(topics_data) > 0:
                            topic = topics_data[0]
                            topic_id = topic.get('topic_id', topic_id)
                            topic_title = topic.get('title', topic_title)
                except Exception as e:
                    logger.error(f"Error reading topics.json: {str(e)}")
            
            # Build single podcast with segments data
            all_podcasts = [{
                'topic_id': topic_id,
                'topic_title': topic_title,
                'description': f"Listen to this podcast about {topic_title}",
                'duration': metadata.get('total_duration_formatted', '~1 minute')
            }]
        else:
            all_podcasts = []
            logger.warning("Metadata format not recognized")
        
        # Format for frontend with correct video paths
        for podcast in all_podcasts:
            clean_title = podcast.get('topic_title', '').replace(' ', '_').lower()
            topic_id = podcast.get('topic_id')
            
            # Build a proper URL that will work with the frontend
            video_filename = f"topic_{topic_id}_{clean_title}.mp4"
            video_url = f"/api/videos/{video_filename}"
            
            podcasts.append({
                "id": topic_id,
                "title": podcast.get('topic_title'),
                "description": podcast.get('description', 'Listen to this interesting podcast!'),
                "videoUrl": video_url,
                "duration": podcast.get('duration', '~1 minute')
            })
        
        logger.info(f"Returning {len(podcasts)} podcasts")
        return jsonify({"podcasts": podcasts})
        
    except Exception as e:
        logger.error(f"Error getting podcasts: {str(e)}", exc_info=True)
        return jsonify({"error": "Failed to retrieve podcasts"}), 500

@app.route('/', methods=['GET'])
def index():
    """Root route that provides information about the API"""
    return jsonify({
        "name": "Podcast Interactive API",
        "version": "1.0.0",
        "description": "API for interactive podcast features",
        "endpoints": [
            {
                "path": "/api/podcasts",
                "method": "GET",
                "description": "Get list of available podcasts"
            },
            {
                "path": "/api/ask",
                "method": "POST",
                "description": "Ask a question about a podcast",
                "body": {
                    "query": "Your question here",
                    "podcastId": "ID of the podcast (optional)"
                }
            }
        ]
    })

# Set up a route to serve the React frontend
@app.route('/app', defaults={'path': ''})
@app.route('/app/<path:path>')
def serve_react_app(path):
    """Serve React frontend files"""
    output_dir = get_output_dir()
    interactive_player_dir = output_dir / "interative_player"
    
    if path != "" and os.path.exists(os.path.join(interactive_player_dir, path)):
        return send_from_directory(str(interactive_player_dir), path)
    else:
        return send_from_directory(str(interactive_player_dir), 'index.html')

# Add a route to serve video files
@app.route('/api/videos/<path:filename>')
def serve_video(filename):
    """Serve video files"""
    videos_dir = get_videos_dir()
    return send_from_directory(str(videos_dir), filename)

if __name__ == '__main__':
    # Log the paths that will be used
    logger.info(f"Output directory: {get_output_dir()}")
    logger.info(f"Videos directory: {get_videos_dir()}")
    app.run(debug=True, port=5000) 