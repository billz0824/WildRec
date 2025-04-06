#!/bin/bash

echo "🎤 Fixing Ask a Question Functionality 🎙️"
echo "====================================="

# Make sure we're in the right directory
cd /Users/terry/Desktop/WildRec

# Step 1: Stop any running API server
echo "✅ Step 1: Stopping all API servers..."
pkill -f "python content_gen/fixed_api_server.py" 2>/dev/null
pkill -f "python content_gen/api_server.py" 2>/dev/null
lsof -ti:8000 | xargs kill -9 2>/dev/null
sleep 1

# Step 2: Start the improved API server
echo "✅ Step 2: Starting improved API server..."
python content_gen/fixed_api_server.py > fixed_api_server.log 2>&1 &
API_PID=$!
echo "  - API server started with PID: $API_PID"

# Wait for server to initialize
echo "  - Waiting for server to initialize..."
sleep 3

# Step 3: Test API endpoints
echo "✅ Step 3: Testing API endpoints..."
API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/api/podcasts)
if [ "$API_STATUS" == "200" ]; then
  echo "  - ✓ API is responding correctly (status 200)"
else
  echo "  - ⚠️ API responded with status $API_STATUS"
fi

# Check ask endpoint with a test question
echo "✅ Step 4: Testing question endpoint..."
TEST_RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -d '{"query":"What is this podcast about?","podcastId":"1"}' \
  http://localhost:8000/api/ask)

if [ $? -eq 0 ]; then
  echo "  - ✓ Question API endpoint is working"
  # Check if the response contains an error field
  if [[ "$TEST_RESPONSE" == *"error"* ]]; then
    echo "  - ⚠️ API returned an error: $TEST_RESPONSE"
  else
    echo "  - ✓ Question API returned a valid response"
  fi
else
  echo "  - ⚠️ Question API endpoint failed"
fi

echo "✅ Step 5: Summary of fixes applied:"
echo "  1. Fixed MediaSession API errors with 'enterpictureinpicture' action"
echo "  2. Blocked problematic autoPip.js functionality entirely"
echo "  3. Added comprehensive error handling for speech recognition"
echo "  4. Added user-friendly controls and error messages"
echo "  5. Fixed timing issues with the video playback"
echo ""
echo "To restart the frontend app:"
echo "cd frontend && npm start"
echo ""
echo "View the fixed podcast feed at: http://localhost:3000/podcasts"
echo "Try the 'Ask a question' button to test the fixed functionality"
echo ""
echo "API server is running at: http://localhost:8000"
echo "To see API logs: tail -f fixed_api_server.log" 