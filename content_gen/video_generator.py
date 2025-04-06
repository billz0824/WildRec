import os
import json
import re
import tempfile
import subprocess
import logging
from pathlib import Path
from typing import Dict, List, Any
from datetime import datetime
import time
from pydub import AudioSegment
from openai import OpenAI
import shutil
import numpy as np

logger = logging.getLogger('video_generator')

class ImagePromptGenerator:
    """Generates image prompts for script segments"""
    
    def __init__(self, client):
        self.client = client
        logger.info("Initialized ImagePromptGenerator")
    
    def generate_prompts_for_script(self, script: str, topic_title: str) -> List[Dict[str, str]]:
        """Generate image prompts for each segment of the script"""
        logger.info(f"Generating image prompts for script on topic: {topic_title}")
        
        # Extract all dialogue parts from the script
        host_parts = re.findall(r"<HOST\d+>(.*?)</HOST\d+>", script, re.DOTALL)
        expert_parts = re.findall(r"<EXPERT\d+>(.*?)</EXPERT\d+>", script, re.DOTALL)
        
        # Combine all dialogue parts in order
        all_text = " ".join([part.strip() for part in host_parts + expert_parts])
        
        # Create a system prompt for generating image prompts
        system_prompt = """
        You are a director specializing in educational visual content. Create prompts for 
        DALL-E that will illustrate the given script segment. Follow these guidelines:
        
        1. Each prompt should create a simple line drawing with a solid color background
        2. Use visual metaphors that clearly represent the educational concept
        3. Keep it minimal - fewer elements with clear meaning works better than complex scenes
        4. Specify a single bold accent color for the background (e.g., "with bold blue background")
        5. Ensure the center of the image has space for text overlay
        
        Format each prompt to start with "line drawing of" and end with the background color specification.
        """
        
        # User prompt with the full text and topic
        user_prompt = f"""
        Create just ONE simple, educational illustration prompt for this topic: "{topic_title}"
        
        The full script is: 
        "{all_text}"
        
        Generate a single DALL-E prompt for a minimalist line drawing that represents 
        this educational concept with a bold color background. The image should have 
        empty space in the center for text overlay.
        
        Return ONLY the image prompt text, nothing else.
        """
        
        try:
            response = self.client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.7
            )
            
            prompt = response.choices[0].message.content.strip()
            logger.info(f"Generated image prompt: {prompt}")
            
            return [{"text": all_text, "prompt": prompt}]
            
        except Exception as e:
            logger.error(f"Error generating image prompts: {str(e)}")
            # Fallback prompt if generation fails
            return [{
                "text": all_text,
                "prompt": f"line drawing of educational concept about {topic_title} with bold blue background, minimalist style, center space for text"
            }]

class DALLEImageGenerator:
    """Generates images using DALL-E based on prompts"""
    
    def __init__(self, client, output_dir: str):
        self.client = client
        self.output_dir = Path(output_dir)
        self.images_dir = self.output_dir / "images"
        self.images_dir.mkdir(exist_ok=True)
        logger.info(f"Initialized DALLEImageGenerator, output to {self.images_dir}")
    
    def generate_image(self, prompt: str, filename_prefix: str) -> str:
        """Generate an image using DALL-E based on the prompt"""
        logger.info(f"Generating DALL-E image for prompt: {prompt[:50]}...")
        
        try:
            response = self.client.images.generate(
                model="dall-e-3",
                prompt=prompt,
                size="1024x1024",
                quality="standard",
                n=1,
            )
            
            image_url = response.data[0].url
            
            # Download the image
            import requests
            image_data = requests.get(image_url).content
            
            # Save the image
            clean_prefix = re.sub(r'[^\w\s-]', '', filename_prefix).strip().replace(' ', '_').lower()
            timestamp = int(time.time())
            image_path = self.images_dir / f"{clean_prefix}_{timestamp}.png"
            
            with open(image_path, 'wb') as f:
                f.write(image_data)
            
            logger.info(f"Image saved to {image_path}")
            return str(image_path)
            
        except Exception as e:
            logger.error(f"Error generating DALL-E image: {str(e)}")
            raise

class SubtitleGenerator:
    """Generates subtitles for audio files"""
    
    def __init__(self, client, output_dir: str):
        self.client = client
        self.output_dir = Path(output_dir)
        self.subtitles_dir = self.output_dir / "subtitles"
        self.subtitles_dir.mkdir(exist_ok=True)
        logger.info(f"Initialized SubtitleGenerator, output to {self.subtitles_dir}")
    
    def generate_subtitles(self, audio_path: str, script: str, topic_id: str) -> str:
        """Generate subtitles for an audio file using Whisper transcription"""
        logger.info(f"Generating subtitles for audio: {audio_path}")
        
        # Create subtitle file path
        subtitle_path = self.subtitles_dir / f"topic_{topic_id}_subtitles.srt"
        
        try:
            # Get accurate transcript from the audio using Whisper
            logger.info("Transcribing audio with Whisper...")
            with open(audio_path, "rb") as audio_file:
                transcript = self.client.audio.transcriptions.create(
                    model="whisper-1",
                    file=audio_file,
                    response_format="verbose_json"  # Get detailed timing info
                )
            
            # Use Whisper's segments directly since they match the actual audio
            segments = transcript.segments
            logger.info(f"Whisper found {len(segments)} segments in the audio")
            
            # Save the full transcript text for the interactive API
            transcript_text = transcript.text
            transcript_path = self.output_dir / "transcripts"
            transcript_path.mkdir(exist_ok=True)
            with open(transcript_path / f"topic_{topic_id}_transcript.txt", "w", encoding="utf-8") as f:
                f.write(transcript_text)
            
            # Generate SRT file using Whisper segments
            with open(subtitle_path, "w", encoding="utf-8") as srt_file:
                for i, segment in enumerate(segments):
                    # Index
                    srt_file.write(f"{i+1}\n")
                    
                    # Timestamp in SRT format
                    start_time = self._format_timestamp(segment.start)
                    end_time = self._format_timestamp(segment.end)
                    srt_file.write(f"{start_time} --> {end_time}\n")
                    
                    # Use Whisper's transcribed text and format it nicely for display
                    formatted_text = self._format_text_for_display(segment.text)
                    srt_file.write(f"{formatted_text}\n\n")
            
            logger.info(f"Generated subtitles saved to {subtitle_path}")
            return str(subtitle_path)
            
        except Exception as e:
            logger.error(f"Error generating subtitles: {str(e)}", exc_info=True)
            # Create fallback subtitles
            self._create_fallback_subtitles(subtitle_path, script)
            return str(subtitle_path)
    
    def _format_text_for_display(self, text: str) -> str:
        """Format text for better subtitle display"""
        words = text.split()
        if len(words) <= 10:
            return text
        
        # For longer text, break into chunks of ~40 chars
        chunks = []
        current_chunk = []
        current_length = 0
        
        for word in words:
            word_len = len(word) + 1  # +1 for the space
            if current_length + word_len > 40:
                chunks.append(" ".join(current_chunk))
                current_chunk = [word]
                current_length = word_len
            else:
                current_chunk.append(word)
                current_length += word_len
        
        if current_chunk:
            chunks.append(" ".join(current_chunk))
        
        return "\n".join(chunks)
    
    def _create_fallback_subtitles(self, subtitle_path: str, script: str) -> None:
        """Create simple fallback subtitles if the main generation fails"""
        try:
            with open(subtitle_path, "w", encoding="utf-8") as srt_file:
                host_parts = re.findall(r"<HOST\d+>(.*?)</HOST\d+>", script, re.DOTALL)
                expert_parts = re.findall(r"<EXPERT\d+>(.*?)</EXPERT\d+>", script, re.DOTALL)
                
                all_lines = []
                for i, (h, e) in enumerate(zip(host_parts, expert_parts)):
                    all_lines.append(h.strip())
                    all_lines.append(e.strip())
                
                # Create simple subtitles with estimated timing
                duration_per_line = 15  # seconds per line
                for i, line in enumerate(all_lines):
                    start_time = i * duration_per_line
                    end_time = (i + 1) * duration_per_line
                    
                    # Index
                    srt_file.write(f"{i+1}\n")
                    
                    # Timestamp
                    srt_time_start = self._format_timestamp(start_time)
                    srt_time_end = self._format_timestamp(end_time)
                    srt_file.write(f"{srt_time_start} --> {srt_time_end}\n")
                    
                    # Format text
                    formatted_text = self._format_text_for_display(line)
                    srt_file.write(f"{formatted_text}\n\n")
            
            logger.info(f"Generated fallback subtitles saved to {subtitle_path}")
        except Exception as e:
            logger.error(f"Error creating fallback subtitles: {str(e)}")
    
    def _format_timestamp(self, seconds: float) -> str:
        """Convert seconds to SRT timestamp format (HH:MM:SS,mmm)"""
        hours = int(seconds // 3600)
        minutes = int((seconds % 3600) // 60)
        seconds = seconds % 60
        milliseconds = int((seconds - int(seconds)) * 1000)
        
        return f"{hours:02d}:{minutes:02d}:{int(seconds):02d},{milliseconds:03d}"

class VideoCombiner:
    """Combines audio, image, and subtitles into a video"""
    
    def __init__(self, output_dir: str):
        self.output_dir = Path(output_dir)
        self.videos_dir = self.output_dir / "videos"
        self.videos_dir.mkdir(exist_ok=True)
        logger.info(f"Initialized VideoCombiner, output to {self.videos_dir}")
    
    def create_video(self, audio_path: str, image_path: str, subtitles_path: str, topic_id: str, topic_title: str) -> str:
        """Create a video with an image background, audio, and subtitles"""
        logger.info(f"Creating video for Topic {topic_id} with audio, image, and subtitles")
        
        # Clean the title for filename
        clean_title = re.sub(r'[^\w\s-]', '', topic_title).strip().replace(' ', '_').lower()
        video_path = self.videos_dir / f"topic_{topic_id}_{clean_title}.mp4"
        
        try:
            # Create a properly escaped subtitle file path for ffmpeg
            # This helps with path issues on different operating systems
            abs_subtitle_path = Path(subtitles_path).absolute()
            
            # Enhanced subtitle styling for better visibility and readability
            subtitle_style = (
                "FontName=Arial,FontSize=28,PrimaryColour=&HFFFFFF,OutlineColour=&H000000,"
                "BackColour=&H80000000,BorderStyle=4,Outline=2,Shadow=0,MarginV=20,Alignment=2"
            )
            
            # Use ffmpeg to create the video
            cmd = [
                "ffmpeg",
                "-y",  # Overwrite output file if it exists
                "-loop", "1",  # Loop the image
                "-i", image_path,  # Input image
                "-i", audio_path,  # Input audio
                "-vf", f"subtitles='{abs_subtitle_path}':force_style='{subtitle_style}'",  # Add subtitles with better formatting
                "-c:v", "libx264",  # Video codec
                "-preset", "medium",  # Encoding speed/quality tradeoff
                "-tune", "stillimage",  # Optimize for still image
                "-c:a", "aac",  # Audio codec
                "-strict", "experimental",
                "-b:a", "192k",  # Audio bitrate
                "-pix_fmt", "yuv420p",  # Pixel format
                "-shortest",  # Finish encoding when the shortest input stream ends
                str(video_path)
            ]
            
            # Convert any Path objects to strings
            cmd = [str(item) for item in cmd]
            
            # Log the command for debugging
            logger.debug(f"ffmpeg command: {' '.join(cmd)}")
            
            # Run the ffmpeg command
            process = subprocess.run(cmd, capture_output=True, text=True)
            
            if process.returncode != 0:
                logger.error(f"ffmpeg error: {process.stderr}")
                # Try an alternative subtitle integration approach if the first fails
                return self._create_video_alternative(audio_path, image_path, subtitles_path, video_path)
            
            logger.info(f"Video created successfully at {video_path}")
            return str(video_path)
            
        except Exception as e:
            logger.error(f"Error creating video: {str(e)}")
            raise
    
    def _create_video_alternative(self, audio_path, image_path, subtitles_path, video_path):
        """Alternative approach to create a video if the primary method fails"""
        logger.info("Trying alternative video creation approach")
        
        try:
            # Step 1: Convert SRT to ASS format (more compatible with ffmpeg)
            ass_path = str(Path(subtitles_path).with_suffix('.ass'))
            
            # Simple conversion command (basic but should work)
            convert_cmd = [
                "ffmpeg",
                "-y",
                "-i", subtitles_path,
                ass_path
            ]
            
            subprocess.run(convert_cmd, capture_output=True, text=True)
            
            # Step 2: Use ASS subtitles instead
            cmd = [
                "ffmpeg",
                "-y",
                "-loop", "1",
                "-i", image_path,
                "-i", audio_path,
                "-vf", f"ass='{ass_path}'",
                "-c:v", "libx264",
                "-preset", "medium", 
                "-tune", "stillimage",
                "-c:a", "aac",
                "-strict", "experimental",
                "-b:a", "192k",
                "-pix_fmt", "yuv420p",
                "-shortest",
                str(video_path)
            ]
            
            process = subprocess.run(cmd, capture_output=True, text=True)
            
            if process.returncode != 0:
                logger.error(f"Alternative ffmpeg approach also failed: {process.stderr}")
                raise Exception("Both video creation approaches failed")
                
            logger.info(f"Video created successfully with alternative method at {video_path}")
            return str(video_path)
            
        except Exception as e:
            logger.error(f"Error in alternative video creation: {str(e)}")
            raise

class PodcastVideoGenerator:
    """Main class to coordinate video generation from podcast audio"""
    
    def __init__(self, openai_api_key: str = None, output_dir: str = None):
        self.openai_api_key = openai_api_key or os.getenv("OPENAI_API_KEY")
        if not self.openai_api_key:
            raise ValueError("OpenAI API key is required for video generation")
        
        self.client = OpenAI(api_key=self.openai_api_key)
        
        # Get output directory
        self.output_dir = Path(output_dir or os.getenv("OUTPUT_DIR", "./output"))
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        # Initialize components
        self.image_prompt_generator = ImagePromptGenerator(self.client)
        self.image_generator = DALLEImageGenerator(self.client, str(self.output_dir))
        self.subtitle_generator = SubtitleGenerator(self.client, str(self.output_dir))
        self.video_combiner = VideoCombiner(str(self.output_dir))
        
        logger.info(f"Initialized PodcastVideoGenerator with output to {self.output_dir}")
    
    def generate_videos(self, podcast_metadata: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate videos for all podcasts in the metadata"""
        logger.info("Starting video generation for all podcasts")
        
        videos = []
        
        for podcast in podcast_metadata["podcasts"]:
            try:
                topic_id = podcast["topic_id"]
                topic_title = podcast["topic_title"]
                audio_path = podcast["combined_audio_path"]
                script = self._get_script_for_topic(topic_id, podcast_metadata["course_name"])
                
                logger.info(f"Generating video for Topic {topic_id}: {topic_title}")
                
                # 1. Generate image prompt
                prompts = self.image_prompt_generator.generate_prompts_for_script(script, topic_title)
                
                # 2. Generate image with DALL-E
                image_path = self.image_generator.generate_image(prompts[0]["prompt"], f"topic_{topic_id}")
                
                # 3. Generate subtitles
                subtitles_path = self.subtitle_generator.generate_subtitles(audio_path, script, topic_id)
                
                # 4. Combine into video
                video_path = self.video_combiner.create_video(audio_path, image_path, subtitles_path, topic_id, topic_title)
                
                videos.append({
                    "topic_id": topic_id,
                    "topic_title": topic_title,
                    "audio_path": audio_path,
                    "image_path": image_path,
                    "subtitles_path": subtitles_path,
                    "video_path": video_path
                })
                
                logger.info(f"Completed video generation for Topic {topic_id}")
                
            except Exception as e:
                logger.error(f"Error generating video for topic {podcast.get('topic_id', 'unknown')}: {str(e)}")
        
        return videos
    
    def _get_script_for_topic(self, topic_id: str, course_name: str) -> str:
        """Get the script for a specific topic from the scripts directory"""
        script_path = self.output_dir / "scripts" / f"topic_{topic_id}_script.txt"
        
        if script_path.exists():
            with open(script_path, "r", encoding="utf-8") as f:
                return f.read()
        else:
            logger.warning(f"Script file not found: {script_path}")
            return f"Script about {course_name} topic {topic_id}"

def enhance_podcast_workflow_with_video(podcast_metadata_path: str, openai_api_key: str = None) -> Dict[str, Any]:
    """Enhance existing podcast metadata with videos"""
    
    # Load podcast metadata
    with open(podcast_metadata_path, "r", encoding="utf-8") as f:
        metadata = json.load(f)
    
    # Initialize video generator
    video_generator = PodcastVideoGenerator(
        openai_api_key=openai_api_key,
        output_dir=str(Path(podcast_metadata_path).parent)
    )
    
    # Generate videos
    videos = video_generator.generate_videos(metadata)
    
    # Add videos to metadata
    metadata["videos"] = videos
    
    # Save updated metadata
    updated_metadata_path = Path(podcast_metadata_path).parent / "podcasts_video_metadata.json"
    with open(updated_metadata_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)
    
    logger.info(f"Updated metadata saved to {updated_metadata_path}")
    
    return {
        "course_name": metadata["course_name"],
        "total_topics": len(metadata["topics"]),
        "total_videos": len(videos),
        "videos": [
            {
                "topic_id": video["topic_id"],
                "topic_title": video["topic_title"],
                "video_path": video["video_path"]
            }
            for video in videos
        ]
    } 