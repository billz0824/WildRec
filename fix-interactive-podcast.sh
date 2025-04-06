#!/bin/bash

echo "Fixing Interactive Podcast Feature"
echo "=================================="

# Kill any existing API server instances
echo "Stopping existing API servers..."
pkill -f "python content_gen/api_server.py"

# Check if demo podcast exists
echo "Checking for demo podcast data..."
if [ ! -f "content_gen/output/podcasts_metadata.json" ]; then
    echo "Creating demo podcast..."
    ./create-demo-podcast.sh
else
    echo "Demo podcast already exists."
fi

# Restart the API server with our fixed code
echo "Starting API server with CORS fixes..."
python content_gen/api_server.py &
API_PID=$!

# Wait for API server to start
echo "Waiting for API server to initialize..."
sleep 2

# Test API endpoint
echo "Testing API endpoint..."
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/api/podcasts)
if [ "$RESPONSE" == "200" ]; then
    echo "✅ API server is running correctly with CORS fixes"
else
    echo "⚠️ API endpoint returned status $RESPONSE - there may still be issues"
fi

# Open browser to podcast page
echo "Opening podcast page in browser..."
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS
  open http://localhost:3000/podcasts
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
  # Linux
  xdg-open http://localhost:3000/podcasts
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
  # Windows
  start http://localhost:3000/podcasts
else
  echo "Please open http://localhost:3000/podcasts in your browser manually"
fi

# Show instructions for frontend
echo "Now let's restart the frontend to apply our fixes..."
echo ""
echo "1. If React is already running, you can wait for it to automatically reload"
echo "2. Or stop the current React process and run:"
echo "   cd frontend && npm start"
echo ""
echo "API server will continue running in the background with PID: $API_PID" 