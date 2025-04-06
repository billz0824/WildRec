#!/bin/bash

# Function to check if videos are available
check_videos() {
  echo "Checking for video files..."
  VIDEO_DIR="content_gen/output/videos"
  if [ ! -d "$VIDEO_DIR" ] || [ -z "$(ls -A $VIDEO_DIR)" ]; then
    echo "⚠️  No videos found in $VIDEO_DIR."
    echo "You may need to generate videos first."
    return 1
  else
    echo "✅ Videos found in $VIDEO_DIR."
    return 0
  fi
}

# Start the Flask API server in the background
echo "Starting Flask API server..."
cd "$(dirname "$0")"

# Check for videos before starting
check_videos
VIDEO_CHECK=$?

python content_gen/api_server.py &
API_PID=$!

# Wait a moment for the API to start
sleep 2

# Test API endpoint
echo "Testing API endpoint..."
curl -s http://localhost:5000/api/podcasts > /dev/null
if [ $? -ne 0 ]; then
  echo "⚠️  API endpoint not responding. There might be an issue with the server."
else
  echo "✅ API endpoint is working."
fi

# Open the podcast page directly in a browser
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

# Start the React frontend
echo "Setting up React frontend..."
cd frontend

# Check if node_modules exists, if not install dependencies
if [ ! -d "node_modules" ]; then
  echo "Installing React dependencies (this may take a minute)..."
  npm install
fi

# Make sure Tailwind CSS is built
echo "Building Tailwind CSS..."
if [ ! -f "src/styles/tailwind-input.css" ]; then
  mkdir -p src/styles
  echo "@tailwind base;
@tailwind components;
@tailwind utilities;" > src/styles/tailwind-input.css
fi

# Build Tailwind CSS
npx tailwindcss -i src/styles/tailwind-input.css -o src/index.css

# Start the React development server, but suppress browser opening
echo "Starting React development server..."
BROWSER=none npm start

# When the frontend is closed, also kill the API server
kill $API_PID
echo "Shutdown complete." 