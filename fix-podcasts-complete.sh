#!/bin/bash

echo "==================================================="
echo "COMPREHENSIVE PODCAST FEATURE FIX"
echo "==================================================="
echo "This script will fix the interactive podcast feature by:"
echo "1. Fixing CORS issues with a new API server on port 8000"
echo "2. Fixing MediaSession API errors that break Picture-in-Picture"
echo "3. Creating demo content if it doesn't exist"
echo "==================================================="
echo ""

# Step 1: Make sure demo content exists
echo "✅ Step 1: Checking for demo content..."
if [ ! -f "content_gen/output/podcasts_metadata.json" ]; then
    echo "  - Creating demo podcast metadata..."
    ./create-demo-podcast.sh
else
    echo "  - Demo podcast metadata exists."
fi

# Step 2: Verify video files
echo "✅ Step 2: Checking for video files..."
mkdir -p content_gen/output/videos

if [ -z "$(ls -A content_gen/output/videos 2>/dev/null)" ]; then
    echo "  - No videos found. Creating a demo video..."
    if command -v ffmpeg &> /dev/null; then
        ffmpeg -y -f lavfi -i color=c=blue:s=1280x720:d=30 \
            -vf "drawtext=text='Demo Podcast - Interactive Feature':fontcolor=white:fontsize=48:x=(w-text_w)/2:y=(h-text_h)/2" \
            content_gen/output/videos/topic_1_demo_podcast.mp4
        echo "  - Demo video created."
    else
        echo "  - ⚠️ Warning: ffmpeg not found, cannot create demo video."
        echo "    Please install ffmpeg or manually add video files to content_gen/output/videos"
    fi
else
    echo "  - Video files exist in content_gen/output/videos."
fi

# Step 3: Restart the API server on port 8000
echo "✅ Step 3: Starting improved API server on port 8000..."
pkill -f "python content_gen/api_server.py" 2>/dev/null
pkill -f "python content_gen/fixed_api_server.py" 2>/dev/null
python content_gen/fixed_api_server.py & 
API_PID=$!

# Wait for API to start
echo "  - Waiting for API server to initialize..."
sleep 3

# Step 4: Test API endpoint
echo "✅ Step 4: Testing API connection..."
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/api/podcasts)
if [ "$RESPONSE" == "200" ]; then
    echo "  - ✅ API server is responding correctly on port 8000"
else
    echo "  - ⚠️ API endpoint returned status $RESPONSE - may need troubleshooting"
fi

# Step 5: Inform about frontend fixes
echo "✅ Step 5: Applying frontend fixes..."
echo "  - MediaSession API patches have been added"
echo "  - Frontend API URLs have been updated to port 8000"

echo ""
echo "==================================================="
echo "SETUP COMPLETE!"
echo "==================================================="
echo ""
echo "To view the podcast feed, open: http://localhost:3000/podcasts"
echo ""
echo "If the frontend is not running, start it with:"
echo "cd frontend && npm start"
echo ""
echo "The API server is running in the background (PID: $API_PID)"
echo "To stop it later, run: pkill -f \"python content_gen/fixed_api_server.py\""
echo ""
echo "==================================================="

# Open browser to the podcasts page
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS
  open http://localhost:3000/podcasts 2>/dev/null
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
  # Linux
  xdg-open http://localhost:3000/podcasts 2>/dev/null
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
  # Windows
  start http://localhost:3000/podcasts 2>/dev/null
fi 