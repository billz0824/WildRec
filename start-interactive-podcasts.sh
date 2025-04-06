#!/bin/bash

# Start the Flask API server in the background
echo "Starting Flask API server..."
cd "$(dirname "$0")"
python content_gen/api_server.py &
API_PID=$!

# Wait a moment for the API to start
sleep 2

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

# Start the React development server
echo "Starting React development server..."
npm start

# When the frontend is closed, also kill the API server
kill $API_PID
echo "Shutdown complete." 