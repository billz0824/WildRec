#!/bin/bash

echo "Applying Background Color Fixes"
echo "=============================="

# Restart the API server
echo "✅ Restarting API server..."
pkill -f "python content_gen/fixed_api_server.py" 2>/dev/null
pkill -f "python content_gen/api_server.py" 2>/dev/null
python content_gen/fixed_api_server.py &
API_PID=$!

# Wait for API to start
echo "  - Waiting for API server to initialize..."
sleep 2

echo "✅ Background color changes have been applied:"
echo "  - Changed FeedPost background from zinc-900 to black"
echo "  - Updated FeedPage to use consistent full-width black background"
echo "  - Applied consistent background styles throughout the layout"
echo "  - Added CSS fixes to ensure all cards maintain the same background"

echo ""
echo "Please restart the frontend app to see the changes:"
echo "cd frontend && npm start"
echo ""
echo "Or view the podcast feed with consistent background at: http://localhost:3000/podcasts"
echo "" 