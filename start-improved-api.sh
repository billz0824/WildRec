#!/bin/bash

echo "Starting Improved Interactive Podcast API"
echo "========================================"

# Kill any existing API server instances
echo "Stopping existing API servers..."
pkill -f "python content_gen/api_server.py"
pkill -f "python content_gen/fixed_api_server.py"

# Check if demo podcast exists
echo "Checking for demo podcast data..."
if [ ! -f "content_gen/output/podcasts_metadata.json" ]; then
    echo "Creating demo podcast..."
    ./create-demo-podcast.sh
else
    echo "Demo podcast already exists."
fi

# Create videos directory if it doesn't exist
mkdir -p content_gen/output/videos

# Check if we have videos
if [ -z "$(ls -A content_gen/output/videos 2>/dev/null)" ]; then
    echo "Warning: No videos found in content_gen/output/videos"
    echo "Creating sample blue screen video..."
    
    # Create a simple demo video if ffmpeg is available
    if command -v ffmpeg &> /dev/null; then
        ffmpeg -y -f lavfi -i color=c=blue:s=1280x720:d=30 \
            -vf "drawtext=text='Demo Podcast - Interactive Feature':fontcolor=white:fontsize=48:x=(w-text_w)/2:y=(h-text_h)/2" \
            content_gen/output/videos/topic_1_demo_podcast.mp4
        
        echo "Sample video created."
    else
        echo "Warning: ffmpeg not found, cannot create sample video."
        echo "You may need to install ffmpeg or manually add video files to content_gen/output/videos"
    fi
fi

# Start the improved API server
echo "Starting improved API server on port 8000..."
python content_gen/fixed_api_server.py &
API_PID=$!

# Wait for API server to start
echo "Waiting for API server to initialize..."
sleep 2

# Test API endpoint
echo "Testing API endpoint..."
RESPONSE=$(curl -s -I -o /dev/null -w "%{http_code}" http://localhost:8000/api/podcasts)
if [ "$RESPONSE" == "200" ]; then
    echo "✅ API server is running correctly on port 8000"
else
    echo "⚠️ API endpoint returned status $RESPONSE - there may still be issues"
fi

echo ""
echo "API server is running at: http://localhost:8000"
echo "API endpoints:"
echo "  - GET /api/podcasts"
echo "  - POST /api/ask"
echo "  - GET /api/videos/{filename}"
echo ""
echo "To stop the server, run: pkill -f \"python content_gen/fixed_api_server.py\""
echo "" 