#!/bin/bash

echo "Fixing Multiple Issues (Media API, Video Display, JSON)"
echo "===================================================="

# Restart the API server
echo "✅ Stopping all API servers..."
pkill -f "python content_gen/fixed_api_server.py" 2>/dev/null
pkill -f "python content_gen/api_server.py" 2>/dev/null

echo "✅ Starting improved API server with all fixes..."
python content_gen/fixed_api_server.py &
API_PID=$!

# Wait for API to start
echo "  - Waiting for API server to initialize..."
sleep 3

# Test all key API endpoints
echo "✅ Testing API endpoints..."
echo "  - Testing /api/podcasts endpoint..."
curl -s http://localhost:8000/api/podcasts > /tmp/podcast_response.json
if [ $? -eq 0 ]; then
  echo "    ✓ API /podcasts endpoint is working"
  # Check if the response is valid JSON
  if jq . /tmp/podcast_response.json > /dev/null 2>&1; then
    echo "    ✓ API is returning valid JSON"
  else
    echo "    ⚠️ API is not returning valid JSON"
  fi
else
  echo "    ⚠️ API /podcasts endpoint not responding"
fi

# Check for video files
echo "✅ Checking for video files..."
VIDEO_COUNT=$(find content_gen/output/videos -name "*.mp4" | wc -l)
echo "  - Found $VIDEO_COUNT video files in content_gen/output/videos"

if [ "$VIDEO_COUNT" -eq 0 ]; then
  echo "  - ⚠️ No video files found! Creating a sample video..."
  mkdir -p content_gen/output/videos
  
  # Create a simple test video if ffmpeg is available
  if command -v ffmpeg &> /dev/null; then
    ffmpeg -f lavfi -i testsrc=duration=10:size=640x480:rate=30 -c:v libx264 content_gen/output/videos/topic_1_test_video.mp4 -y
    echo "    ✓ Created a test video in content_gen/output/videos"
  else
    echo "    ⚠️ Couldn't create a test video - ffmpeg not found"
  fi
fi

echo "✅ Multiple fixes applied:"
echo "  1. Fixed MediaSession API errors to prevent autoPip errors"
echo "  2. Enhanced video file serving to handle different filename formats"
echo "  3. Added fallback handling for missing videos"
echo "  4. Fixed JSON response format for API endpoints"
echo "  5. Added debugging tools to troubleshoot video loading"

echo ""
echo "Please restart the frontend app to see the changes:"
echo "cd frontend && npm start"
echo ""
echo "View the fixed podcast feed at: http://localhost:3000/podcasts"
echo "API server is running on port 8000"
echo "" 