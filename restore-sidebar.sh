#!/bin/bash

echo "Restoring Sidebar for Podcast Page"
echo "=================================="

# Restart the API server
echo "✅ Restarting API server..."
pkill -f "python content_gen/fixed_api_server.py" 2>/dev/null
pkill -f "python content_gen/api_server.py" 2>/dev/null
python content_gen/fixed_api_server.py &
API_PID=$!

# Wait for API to start
echo "  - Waiting for API server to initialize..."
sleep 2

echo "✅ Layout changes have been applied:"
echo "  - Restored sidebar on podcast page"
echo "  - Maintained navigation consistency across pages"

echo ""
echo "Please restart the frontend app to see the changes:"
echo "cd frontend && npm start"
echo ""
echo "Or view the podcast feed with sidebar at: http://localhost:3000/podcasts"
echo "" 