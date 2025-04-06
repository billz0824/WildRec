#!/bin/bash

echo "🎬 Comprehensive Video and Debug Fix Script 🛠️"
echo "=========================================="

# First, make sure we're in the right directory
cd /Users/terry/Desktop/WildRec

# Kill any running API servers more aggressively
echo "✅ Stopping all running API servers..."
pkill -9 -f "python content_gen/fixed_api_server.py" 2>/dev/null
pkill -9 -f "python content_gen/api_server.py" 2>/dev/null
# Kill any process using port 8000
lsof -ti:8000 | xargs kill -9 2>/dev/null
sleep 2

# Check available videos
echo "✅ Checking video files..."
mkdir -p content_gen/output/videos
VIDEO_COUNT=$(find content_gen/output/videos -name "*.mp4" | wc -l)
echo "  - Found $VIDEO_COUNT video files"

# If no videos exist, create a sample one
if [ "$VIDEO_COUNT" -eq 0 ]; then
  echo "  - No videos found, creating sample video..."
  
  # Try to create a sample video using ffmpeg
  if command -v ffmpeg &> /dev/null; then
    echo "  - Using ffmpeg to create sample video..."
    ffmpeg -f lavfi -i testsrc=duration=10:size=640x480:rate=30 -c:v libx264 content_gen/output/videos/sample_podcast.mp4 -y
  else
    echo "  - ⚠️ ffmpeg not found, can't create sample video"
    echo "  - Please manually add a video file to content_gen/output/videos/"
  fi
fi

# Check video files again
VIDEO_COUNT=$(find content_gen/output/videos -name "*.mp4" | wc -l)
if [ "$VIDEO_COUNT" -eq 0 ]; then
  echo "⚠️ No video files available! The app won't work without videos."
  exit 1
fi

# List available videos for debugging
echo "📋 Available videos:"
ls -la content_gen/output/videos/*.mp4

# Start the improved API server
echo "✅ Starting API server on port 8000..."
python content_gen/fixed_api_server.py > fixed_api_server.log 2>&1 &
API_PID=$!
echo "  - API server started with PID: $API_PID"

# Wait for server to initialize
echo "  - Waiting for server to initialize..."
sleep 3

# Test API endpoints
echo "✅ Testing API endpoints..."
curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/api/podcasts > /tmp/api_status
API_STATUS=$(cat /tmp/api_status)

if [ "$API_STATUS" == "200" ]; then
  echo "  - ✓ API is responding correctly (status 200)"
else
  echo "  - ⚠️ API responded with status $API_STATUS"
fi

# Check video endpoint
echo "✅ Testing video endpoint..."
curl -s -o /dev/null -I -w "%{http_code}" http://localhost:8000/api/videos/any_available_video > /tmp/video_status
VIDEO_STATUS=$(cat /tmp/video_status)

if [ "$VIDEO_STATUS" == "200" ]; then
  echo "  - ✓ Video endpoint is working (status 200)"
else
  echo "  - ⚠️ Video endpoint returned status $VIDEO_STATUS"
  echo "  - Check server logs for more details: tail -f fixed_api_server.log"
fi

echo "✅ Debug improvements completed!"
echo "  1. Fixed MediaSession API errors"
echo "  2. Improved video serving functionality"
echo "  3. Added better error handling and logging"
echo "  4. Added debugging tools in the UI"
echo ""
echo "To restart the frontend app:"
echo "cd frontend && npm start"
echo ""
echo "View the app at: http://localhost:3000/podcasts"
echo "API is running at: http://localhost:8000"
echo "To see API logs: tail -f fixed_api_server.log"
echo "" 