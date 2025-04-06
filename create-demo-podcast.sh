#!/bin/bash

echo "Creating Demo Podcast Entry"
echo "=========================="

cd "$(dirname "$0")"

# Create output directories if they don't exist
mkdir -p content_gen/output/videos
mkdir -p content_gen/output/audio
mkdir -p content_gen/output/scripts
mkdir -p content_gen/output/subtitles

# Check if any video files exist
if [ -z "$(ls -A content_gen/output/videos)" ]; then
  echo "No video files found. Creating a demo video..."
  
  # Create a simple video with text using ffmpeg
  echo "Generating a demo video with ffmpeg..."
  
  ffmpeg -y -f lavfi -i color=c=blue:s=1280x720:d=30 \
    -vf "drawtext=text='Demo Podcast - Interactive Feature':fontcolor=white:fontsize=48:x=(w-text_w)/2:y=(h-text_h)/2" \
    content_gen/output/videos/topic_1_demo_podcast.mp4
  
  if [ $? -ne 0 ]; then
    echo "Failed to create demo video with ffmpeg. Checking if you have ffmpeg installed..."
    if ! command -v ffmpeg &> /dev/null; then
      echo "ffmpeg is not installed. Please install it to create demo videos."
      echo "For macOS: brew install ffmpeg"
      echo "For Ubuntu: sudo apt-get install ffmpeg"
      echo "For Windows: download from https://ffmpeg.org/download.html"
    fi
    exit 1
  fi
  
  echo "Demo video created successfully."
fi

# Create or update podcast metadata file
echo "Creating podcast metadata file..."
cat > content_gen/output/podcasts_metadata.json << EOL
{
  "podcasts": [
    {
      "topic_id": "1",
      "topic_title": "Demo Podcast",
      "description": "This is a demo podcast to test the interactive feature",
      "duration": "30 seconds"
    }
  ]
}
EOL

echo "Demo podcast metadata created successfully."
echo ""
echo "Now run './start-podcast-page.sh' to start the interactive feature." 