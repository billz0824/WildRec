import io
import json
import os
import re
import uuid
import sys
import logging
from typing import Dict, List, Any  # Add typing imports
from datetime import datetime
from pathlib import Path
import requests
from openai import OpenAI
from pydub import AudioSegment
from elevenlabs import VoiceSettings
from elevenlabs.client import ElevenLabs
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('podcast_generator.log')
    ]
)
logger = logging.getLogger('podcast_generator')

# Load environment variables from .env file
load_dotenv()
logger.info("Environment variables loaded")

# Perplexity API wrapper
class PerplexityAPI:
    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.getenv("PERPLEXITY_API_KEY")
        if not self.api_key:
            raise ValueError("Perplexity API key is required. Please provide it or set PERPLEXITY_API_KEY in .env file.")
        self.base_url = "https://api.perplexity.ai"
        logger.info("PerplexityAPI initialized")
    
    def query(self, prompt: str) -> Dict[str, Any]:
        """Send a query to Perplexity Sonar API and get results
        
        Sonar model performs web searches to provide up-to-date information.
        """
        logger.info(f"Sending query to Perplexity Sonar API: {prompt[:50]}...")
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        data = {
            "model": "sonar",  # This is the web search-enabled model
            "messages": [{"role": "user", "content": prompt}]
        }
        
        try:
            response = requests.post(
                f"{self.base_url}/chat/completions",
                headers=headers,
                json=data
            )
            
            if response.status_code == 200:
                logger.info("Successfully received response from Perplexity API")
                return response.json()
            else:
                logger.error(f"Error from Perplexity API: {response.status_code} - {response.text}")
                raise Exception(f"Error from Perplexity API: {response.status_code} - {response.text}")
        except Exception as e:
            logger.error(f"Exception during Perplexity API request: {str(e)}")
            raise

# OpenAI API wrapper for GPT-4o
class GPT4oAPI:
    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        if not self.api_key:
            raise ValueError("OpenAI API key is required. Please provide it or set OPENAI_API_KEY in .env file.")
        self.client = OpenAI(api_key=self.api_key)
        logger.info("GPT4oAPI initialized")
    
    def extract_key_topics(self, course_info: str, num_topics: int = 5) -> List[Dict[str, str]]:
        """Extract distinct key topics from the course information"""
        logger.info(f"Extracting {num_topics} key topics from course information")
        
        system_prompt = """
        You are an educational content analyst. Your task is to identify distinct key topics 
        from a university course and provide a concise title and brief description for each topic.
        
        Format your response as a JSON array where each object has:
        1. "topic_id": A unique number for the topic
        2. "title": A concise, descriptive title for the topic
        3. "description": A brief 2-3 sentence description of what this topic covers
        
        IMPORTANT: Base your analysis ONLY on the provided web search information. Do not
        make up topics that aren't covered in the search results.
        """
        
        user_prompt = f"""
        Based on this Northwestern University course information that was retrieved through
        a web search using Perplexity Sonar, identify {num_topics} distinct key knowledge 
        topics covered in the course:
        
        {course_info}
        
        Return your response in valid JSON format as described in the system instructions.
        Make sure each topic is truly distinct and focuses on an important concept or skill
        taught in the course.
        """
        
        logger.info("Sending request to OpenAI for topic extraction")
        try:
            response = self.client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                response_format={"type": "json_object"}
            )
            
            content = response.choices[0].message.content
            topics_data = json.loads(content)
            topics = topics_data.get("topics", []) if isinstance(topics_data, dict) and "topics" in topics_data else topics_data
            
            logger.info(f"Successfully extracted {len(topics)} topics")
            return topics
            
        except Exception as e:
            logger.error(f"Error extracting topics: {str(e)}")
            raise
    
    def generate_short_podcast_script(self, topic: Dict[str, Any], course_info: str) -> Dict[str, Any]:
        """Generate a short podcast script (1 minute) on a specific topic"""
        topic_id = topic.get("topic_id", "unknown")
        topic_title = topic.get("title", "Unknown Topic")
        logger.info(f"Generating short podcast script for Topic {topic_id}: {topic_title}")
        
        system_prompt = """
        Create a short podcast script (approximately 1 minute when read aloud) with two speakers: 
        - A host who introduces the topic and asks one key question
        - An expert who explains the concept clearly and concisely
        
        The script should focus on ONE specific topic from a university course.
        
        Format the script using XML tags as follows:
        
        <HOST1>Host's introduction (5-10 seconds when spoken)...</HOST1>
        <EXPERT1>Expert's first response (20-25 seconds when spoken)...</EXPERT1>
        <HOST2>Host's follow-up question (5 seconds when spoken)...</HOST2>
        <EXPERT2>Expert's conclusion (20-25 seconds when spoken)...</EXPERT2>
        
        Keep the entire script concise - it should take about 1 minute to read aloud.
        
        IMPORTANT: Base your script ONLY on the provided course information. Do not
        add fictional information or make up details about the topic.
        """
        
        user_prompt = f"""
        Create a short, focused podcast script about this specific topic from the course:
        
        TOPIC: {topic_title}
        DESCRIPTION: {topic.get('description', '')}
        
        Here is the full course information for context:
        {course_info}
        
        The script should be designed to create a ~1 minute podcast when read aloud.
        Start with the host introducing the topic briefly, then asking the expert one key 
        question about it. The expert should provide a clear, concise explanation. The host
        can ask one follow-up or clarifying question, and the expert should conclude with
        a final point or takeaway.
        
        Remember to keep the responses SHORT - this is meant to be a brief, focused mini-podcast.
        """
        
        logger.info(f"Sending request to OpenAI for short script generation on Topic {topic_id}")
        try:
            response = self.client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ]
            )
            
            script = response.choices[0].message.content
            logger.info(f"Script generated successfully for Topic {topic_id}, length: {len(script)} characters")
            
            # Count the number of speaker turns
            host_count = len(re.findall(r"<HOST\d+>", script))
            expert_count = len(re.findall(r"<EXPERT\d+>", script))
            logger.info(f"Script contains {host_count} host turns and {expert_count} expert turns")
            
            return {
                "topic_id": topic_id,
                "topic_title": topic_title,
                "script": script
            }
        except Exception as e:
            logger.error(f"Error generating script for Topic {topic_id}: {str(e)}")
            raise

# ElevenLabs Audio Generator for Podcast
class PodcastAudioGenerator:
    def __init__(self, api_key: str = None, output_dir: str = None):
        self.api_key = api_key or os.getenv("ELEVENLABS_API_KEY")
        if not self.api_key:
            raise ValueError("ElevenLabs API key is required. Please provide it or set ELEVENLABS_API_KEY in .env file.")
        
        # Initialize ElevenLabs client
        self.client = ElevenLabs(api_key=self.api_key)
        
        # Set output directory
        base_output_dir = output_dir or os.getenv("OUTPUT_DIR", "./output")
        self.audio_dir = os.path.join(base_output_dir, "audio")
        os.makedirs(self.audio_dir, exist_ok=True)
        
        # Initialize voices
        logger.info("Fetching available voices from ElevenLabs")
        self.voices = self._get_available_voices()
        
        # Set speaker voices (from .env or defaults)
        host_voice_name = os.getenv("HOST_VOICE_NAME", "Aria")
        expert_voice_name = os.getenv("EXPERT_VOICE_NAME", "Roger")
        
        self.speaker_voices = {
            "host": os.getenv("HOST_VOICE_ID") or self._get_voice_id(host_voice_name),
            "expert": os.getenv("EXPERT_VOICE_ID") or self._get_voice_id(expert_voice_name)
        }
        
        logger.info(f"Audio generator initialized with host voice: {host_voice_name}, expert voice: {expert_voice_name}")
        logger.info(f"Audio output directory: {self.audio_dir}")
    
    def _get_available_voices(self) -> Dict[str, str]:
        """Get available voices from ElevenLabs"""
        voice_dict = {}
        try:
            voices = self.client.voices.get_all()
            for voice in voices.voices:
                voice_dict[voice.name.lower()] = voice.voice_id
            logger.info(f"Retrieved {len(voice_dict)} voices from ElevenLabs")
        except Exception as e:
            logger.error(f"Error fetching voices: {str(e)}")
        return voice_dict
    
    def _get_voice_id(self, voice_name: str) -> str:
        """Get voice ID from voice name"""
        if not voice_name:
            # Return default voice if available, otherwise first voice
            default_id = self.voices.get("aria") or next(iter(self.voices.values()), None)
            logger.info(f"No voice name provided, using default: {default_id}")
            return default_id
        
        # Try exact match first
        voice_id = self.voices.get(voice_name.lower())
        if voice_id:
            logger.info(f"Found exact match for voice '{voice_name}': {voice_id}")
            return voice_id
        
        # Try partial match
        for name, id in self.voices.items():
            if voice_name.lower() in name:
                logger.info(f"Found partial match for voice '{voice_name}' in '{name}': {id}")
                return id
        
        # Return first voice as fallback
        fallback_id = next(iter(self.voices.values()), None)
        logger.warning(f"No match found for voice '{voice_name}', using fallback: {fallback_id}")
        return fallback_id
    
    def text_to_speech_file(self, text: str, voice_id: str, filename: str = None) -> str:
        """Generate speech file using ElevenLabs"""
        logger.info(f"Generating speech for text of length {len(text)} with voice {voice_id}")
        
        try:
            response = self.client.text_to_speech.convert(
                voice_id=voice_id,
                output_format="mp3_22050_32",
                text=text,
                model_id="eleven_flash_v2_5",  # Low latency model
                voice_settings=VoiceSettings(
                    stability=0.5,
                    similarity_boost=0.5,
                    style=0.0,
                    use_speaker_boost=True,
                ),
            )
            
            # Save to file
            if filename:
                file_path = os.path.join(self.audio_dir, f"{filename}.mp3")
            else:
                file_path = os.path.join(self.audio_dir, f"{uuid.uuid4()}.mp3")
                
            total_bytes = 0
            
            with open(file_path, "wb") as f:
                for chunk in response:
                    if chunk:
                        total_bytes += len(chunk)
                        f.write(chunk)
            
            logger.info(f"Saved {total_bytes} bytes of audio to {file_path}")
            return file_path
        except Exception as e:
            logger.error(f"Error generating speech: {str(e)}")
            raise
    
    def generate_podcast_audio(self, script: str, topic_id: str, topic_title: str) -> Dict[str, Any]:
        """Generate audio for podcast script"""
        logger.info(f"Starting podcast audio generation for Topic {topic_id}: {topic_title}")
        start_time = datetime.now()
        
        # Parse script to extract speaker parts
        host_pattern = r"<HOST(\d+)>(.*?)</HOST\1>"
        expert_pattern = r"<EXPERT(\d+)>(.*?)</EXPERT\1>"
        
        host_parts = re.findall(host_pattern, script, re.DOTALL)
        expert_parts = re.findall(expert_pattern, script, re.DOTALL)
        
        logger.info(f"Parsed script: found {len(host_parts)} host parts and {len(expert_parts)} expert parts")
        
        # Sort all parts by their number to maintain order
        all_parts = []
        for num, text in host_parts:
            all_parts.append(("host", int(num), text.strip()))
        for num, text in expert_parts:
            all_parts.append(("expert", int(num), text.strip()))
        
        all_parts.sort(key=lambda x: x[1])
        logger.info(f"Total script parts in order: {len(all_parts)}")
        
        # Generate audio for each part
        audio_segments = []
        segment_info = []
        
        for i, (speaker, num, text) in enumerate(all_parts):
            voice_id = self.speaker_voices[speaker]
            segment_filename = f"topic_{topic_id}_{speaker}_{num}"
            logger.info(f"Processing part {i+1}/{len(all_parts)}: {speaker} #{num} ({len(text)} chars)")
            
            try:
                audio_path = self.text_to_speech_file(text, voice_id, segment_filename)
                audio_segment = AudioSegment.from_mp3(audio_path)
                audio_segments.append(audio_segment)
                
                # Store segment info
                segment_info.append({
                    "speaker": speaker,
                    "number": num,
                    "text": text,
                    "audio_path": audio_path,
                    "duration_ms": len(audio_segment)
                })
                
                logger.info(f"Generated {len(audio_segment)/1000:.2f}s audio for {speaker} part {num}")
            except Exception as e:
                logger.error(f"Error generating audio for {speaker} part {num}: {str(e)}")
                logger.error(f"Text content: {text[:100]}...")
                raise
        
        # Combine all segments
        if audio_segments:
            logger.info("Combining all audio segments")
            combined_audio = audio_segments[0]
            total_duration = len(combined_audio)
            
            for segment in audio_segments[1:]:
                combined_audio += segment
                total_duration += len(segment)
            
            # Save combined audio
            combined_filename = f"topic_{topic_id}_podcast"
            combined_path = os.path.join(self.audio_dir, f"{combined_filename}.mp3")
            combined_audio.export(combined_path, format="mp3")
            
            end_time = datetime.now()
            processing_time = (end_time - start_time).total_seconds()
            
            logger.info(f"Audio generation complete. Total duration: {total_duration/1000:.2f}s")
            logger.info(f"Processing time: {processing_time:.2f}s")
            logger.info(f"Combined audio saved to: {combined_path}")
            
            return {
                "topic_id": topic_id,
                "topic_title": topic_title,
                "segments": segment_info,
                "combined_audio_path": combined_path,
                "total_duration_ms": total_duration,
                "total_duration_formatted": f"{total_duration/1000:.2f} seconds",
                "processing_time_s": processing_time
            }
        else:
            logger.error("No audio segments were generated")
            raise ValueError("No audio segments were generated")
    
    def list_available_voices(self) -> List[Dict[str, str]]:
        """List all available voices"""
        return [{"name": name, "id": id} for name, id in self.voices.items()]

# Main workflow class
class PodcastGenerationWorkflow:
    def __init__(
        self, 
        perplexity_api_key: str = None, 
        openai_api_key: str = None, 
        elevenlabs_api_key: str = None, 
        output_dir: str = None
    ):
        logger.info("Initializing PodcastGenerationWorkflow")
        self.perplexity_api = PerplexityAPI(perplexity_api_key)
        self.gpt4o_api = GPT4oAPI(openai_api_key)
        
        # Get output dir from args, env, or default
        self.output_dir = Path(output_dir or os.getenv("OUTPUT_DIR", "./output"))
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        # Create subdirectories for organization
        self.scripts_dir = self.output_dir / "scripts"
        self.scripts_dir.mkdir(exist_ok=True)
        
        logger.info(f"Output directory: {self.output_dir}")
        self.audio_generator = PodcastAudioGenerator(elevenlabs_api_key, str(self.output_dir))
    
    def generate_topic_podcasts(self, course_name: str, num_topics: int = 5) -> Dict[str, Any]:
        """Generate multiple short podcasts about different topics from a course"""
        logger.info(f"Starting multi-topic podcast generation for course: '{course_name}' with {num_topics} topics")
        start_time = datetime.now()
        
        # Step 1: Research the course using Perplexity Sonar (web search)
        logger.info("STEP 1: Researching course using Perplexity Sonar web search")
        research_prompt = f"""
        Search for the most up-to-date information about the Northwestern University course '{course_name}'.
        
        Please provide:
        1. A detailed overview of the course content
        2. Key topics and concepts covered
        3. Learning objectives
        4. Typical assignments or projects
        5. Required textbooks if available
        6. Syllabus information if available
        
        Include citations to your sources.
        """
        
        # Use Perplexity Sonar model which performs real-time web searches
        logger.info("Sending research query to Perplexity")
        research_results = self.perplexity_api.query(research_prompt)
        course_info = research_results["choices"][0]["message"]["content"]
        logger.info(f"Received research results: {len(course_info)} characters")
        
        # Save research results with web search information
        research_path = self.output_dir / "research.txt"
        with open(research_path, "w") as f:
            f.write(f"Web Search Results for '{course_name}':\n\n")
            f.write(course_info)
        logger.info(f"Research results saved to {research_path}")
        
        # Step 2: Extract distinct topics from the course
        logger.info("STEP 2: Extracting distinct topics from course information")
        topics = self.gpt4o_api.extract_key_topics(course_info, num_topics)
        
        # Save topics list
        topics_path = self.output_dir / "topics.json"
        with open(topics_path, "w") as f:
            json.dump(topics, f, indent=2)
        logger.info(f"Extracted {len(topics)} topics and saved to {topics_path}")
        
        # Step 3: Generate a script for each topic
        logger.info("STEP 3: Generating scripts for each topic")
        scripts = []
        
        for topic in topics:
            topic_id = topic.get("topic_id", "unknown")
            topic_title = topic.get("title", "Unknown Topic")
            
            # Generate script for this topic
            script_data = self.gpt4o_api.generate_short_podcast_script(topic, course_info)
            scripts.append(script_data)
            
            # Save individual script
            script_path = self.scripts_dir / f"topic_{topic_id}_script.txt"
            with open(script_path, "w") as f:
                f.write(f"TOPIC: {topic_title}\n\n")
                f.write(script_data["script"])
            logger.info(f"Script for Topic {topic_id} saved to {script_path}")
        
        # Step 4: Generate audio for each script
        logger.info("STEP 4: Generating audio for each topic script")
        audio_results = []
        
        for script_data in scripts:
            topic_id = script_data["topic_id"]
            topic_title = script_data["topic_title"]
            script = script_data["script"]
            
            # Generate audio for this script
            audio_data = self.audio_generator.generate_podcast_audio(script, topic_id, topic_title)
            audio_results.append(audio_data)
            logger.info(f"Generated audio for Topic {topic_id}: {audio_data['total_duration_formatted']}")
        
        # Save comprehensive metadata
        metadata = {
            "course_name": course_name,
            "generation_timestamp": datetime.now().isoformat(),
            "num_topics": len(topics),
            "topics": topics,
            "podcasts": audio_results
        }
        
        metadata_path = self.output_dir / "podcasts_metadata.json"
        with open(metadata_path, "w") as f:
            # Convert Path objects to strings for JSON serialization
            json_metadata = self._prepare_json_metadata(metadata)
            json.dump(json_metadata, f, indent=2)
        
        end_time = datetime.now()
        total_processing_time = (end_time - start_time).total_seconds()
        
        logger.info(f"Multi-topic podcast generation complete! Total processing time: {total_processing_time:.2f}s")
        logger.info(f"Generated {len(audio_results)} topic podcasts")
        logger.info(f"All files saved to: {self.output_dir}")
        
        # Create a summary of results for return
        summary = {
            "course_name": course_name,
            "total_topics": len(topics),
            "total_processing_time_s": total_processing_time,
            "output_directory": str(self.output_dir),
            "topic_podcasts": [
                {
                    "topic_id": result["topic_id"],
                    "topic_title": result["topic_title"],
                    "audio_path": str(result["combined_audio_path"]),
                    "duration": result["total_duration_formatted"]
                }
                for result in audio_results
            ]
        }
        
        return summary
    
    def _prepare_json_metadata(self, data: Any) -> Any:
        """Recursively convert Path objects to strings for JSON serialization"""
        if isinstance(data, Path):
            return str(data)
        elif isinstance(data, dict):
            return {k: self._prepare_json_metadata(v) for k, v in data.items()}
        elif isinstance(data, list):
            return [self._prepare_json_metadata(item) for item in data]
        else:
            return data
    
    def list_available_voices(self):
        """List all available ElevenLabs voices"""
        return self.audio_generator.list_available_voices()

# Example usage
if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Generate short topic podcasts for Northwestern courses")
    parser.add_argument("course_name", nargs="?", help="Name of the Northwestern course")
    parser.add_argument("--topics", type=int, default=5, help="Number of topics to cover")
    parser.add_argument("--perplexity-key", help="Perplexity API key (overrides .env)")
    parser.add_argument("--openai-key", help="OpenAI API key (overrides .env)")
    parser.add_argument("--elevenlabs-key", help="ElevenLabs API key (overrides .env)")
    parser.add_argument("--host-voice", help="Host voice name or ID (overrides .env)")
    parser.add_argument("--expert-voice", help="Expert voice name or ID (overrides .env)")
    parser.add_argument("--output-dir", help="Output directory (overrides .env)")
    parser.add_argument("--list-voices", action="store_true", help="List available ElevenLabs voices")
    parser.add_argument("--verbose", "-v", action="store_true", help="Enable verbose logging")
    
    args = parser.parse_args()
    
    # Set logging level based on verbose flag
    if args.verbose:
        logger.setLevel(logging.DEBUG)
        logger.debug("Verbose logging enabled")
    
    try:
        workflow = PodcastGenerationWorkflow(
            perplexity_api_key=args.perplexity_key,
            openai_api_key=args.openai_key,
            elevenlabs_api_key=args.elevenlabs_key,
            output_dir=args.output_dir
        )
        
        if args.list_voices:
            voices = workflow.list_available_voices()
            print("Available ElevenLabs voices:")
            for voice in voices:
                print(f"  - {voice['name']} (ID: {voice['id']})")
            sys.exit(0)
        
        if not args.course_name:
            parser.print_help()
            print("\nError: course_name is required unless --list-voices is specified")
            sys.exit(1)
        
        # Update voice settings if provided
        if args.host_voice:
            os.environ["HOST_VOICE_NAME"] = args.host_voice
            logger.info(f"Using custom host voice: {args.host_voice}")
        if args.expert_voice:
            os.environ["EXPERT_VOICE_NAME"] = args.expert_voice
            logger.info(f"Using custom expert voice: {args.expert_voice}")
        
        # Generate topic podcasts
        print(f"Starting multi-topic podcast generation for '{args.course_name}'")
        print(f"This will generate {args.topics} short (1-minute) topic podcasts")
        print(f"This may take several minutes. See logs for progress details.")
        
        result = workflow.generate_topic_podcasts(args.course_name, args.topics)
        
        print(f"\nMulti-topic podcast generation complete!")
        print(f"Generated {result['total_topics']} topic podcasts:")
        
        for i, podcast in enumerate(result['topic_podcasts']):
            print(f"  {i+1}. {podcast['topic_title']} ({podcast['duration']})")
            print(f"     Audio: {podcast['audio_path']}")
        
        print(f"\nAll files saved to: {result['output_directory']}")
    
    except Exception as e:
        logger.error(f"Error during podcast generation: {str(e)}", exc_info=True)
        print(f"Error: {str(e)}")
        sys.exit(1)