#!/bin/bash

echo "Setting up WildRec Interactive Podcast Feature"
echo "=============================================="

# Determine if we're in a virtual environment
if [[ -z "$VIRTUAL_ENV" ]]; then
  echo "No virtual environment detected. It's recommended to run this in a Python virtual environment."
  read -p "Continue anyway? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Exiting. Please create and activate a virtual environment first."
    exit 1
  fi
fi

# Install Python dependencies
echo "Installing Python dependencies..."
cd "$(dirname "$0")"
pip install -r content_gen/requirements.txt

# Install frontend dependencies
echo "Installing React dependencies..."
cd frontend
npm install

# Generate Tailwind CSS
echo "Setting up Tailwind CSS..."
# If tailwindcss isn't installed globally, use npx
if ! command -v tailwindcss &> /dev/null; then
  echo "Using npx to run tailwindcss..."
  npx tailwindcss init -p
else
  tailwindcss init -p
fi

echo "Creating input.css for Tailwind..."
mkdir -p src/styles
cat > src/styles/tailwind-input.css << EOF
@tailwind base;
@tailwind components;
@tailwind utilities;
EOF

echo "Building Tailwind CSS..."
npx tailwindcss -i src/styles/tailwind-input.css -o src/index.css

cd ..

echo "Setup complete! Starting application..."
echo

# Run the application
./start-interactive-podcasts.sh 