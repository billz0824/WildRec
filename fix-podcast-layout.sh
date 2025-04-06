#!/bin/bash

echo "Fixing Podcast Layout - Removing White Space"
echo "==========================================="

# Restart the API server on port 8000
echo "✅ Restarting API server..."
pkill -f "python content_gen/fixed_api_server.py" 2>/dev/null
pkill -f "python content_gen/api_server.py" 2>/dev/null
python content_gen/fixed_api_server.py &
API_PID=$!

# Wait for API to start
echo "  - Waiting for API server to initialize..."
sleep 2

echo "✅ Layout fixes have been applied:"
echo "  - Removed sidebar from podcast page"
echo "  - Fixed full-screen layout for video player"
echo "  - Eliminated white space on the left side"

echo ""
echo "Please restart the frontend app to see the changes:"
echo "cd frontend && npm start"
echo ""
echo "Or view the podcast feed directly at: http://localhost:3000/podcasts"
echo "" 