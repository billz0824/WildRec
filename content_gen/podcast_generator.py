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
    
    def generate_podcast_script(self, course_info: str, num_topics: int = 5) -> Dict[str, str]:
        """Generate a podcast script with two speakers discussing course topics"""
        logger.info(f"Generating podcast script with {num_topics} topics")
        
        system_prompt = """
        Create a podcast script with two speakers: 
        - A host who guides the conversation
        - An expert who explains the concepts
        
        The script should introduce key concepts from a university course in an engaging, 
        conversational style. Each topic should involve both speakers, with the host asking 
        questions and the expert providing knowledgeable responses.
        
        Format the script using XML tags as follows:
        
        <HOST1>Host's first line...</HOST1>
        <EXPERT1>Expert's first response...</EXPERT1>
        <HOST2>Host's second line...</HOST2>
        <EXPERT2>Expert's second response...</EXPERT2>
        
        And so on.
        
        The numbers in the tags should indicate the sequence. Make the conversation natural
        and engaging, as if it were a real podcast episode.
        
        IMPORTANT: Base your script ONLY on the provided web search information. Do not
        add fictional information or make up details about the course. Strictly use the
        content that was found through the web search.
        """
        
        user_prompt = f"""
        Based on this Northwestern University course information that was retrieved through
        a web search using Perplexity Sonar, create a podcast script covering {num_topics} 
        key concepts or topics from the course:
        
        {course_info}
        
        Start with a brief introduction where the host welcomes listeners and introduces
        the expert and the course topic. Then have them discuss each key concept one by one, 
        with the host asking questions and the expert providing clear, informative responses.
        The expert should only discuss information that was found through the web search.
        
        End with a brief conclusion where they summarize what was covered and thank the listeners.
        """
        
        logger.info("Sending request to OpenAI for script generation")
        try:
            response = self.client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ]
            )
            
            script = response.choices[0].message.content
            logger.info(f"Script generated successfully, length: {len(script)} characters")
            
            # Count the number of speaker turns
            host_count = len(re.findall(r"<HOST\d+>", script))
            expert_count = len(re.findall(r"<EXPERT\d+>", script))
            logger.info(f"Script contains {host_count} host turns and {expert_count} expert turns")
            
            return {
                "script": script,
                "course_info": course_info
            }
        except Exception as e:
            logger.error(f"Error generating script: {str(e)}")
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
    
    def text_to_speech_file(self, text: str, voice_id: str) -> str:
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
    
    def generate_podcast_audio(self, script: str) -> Dict[str, Any]:
        """Generate audio for podcast script"""
        logger.info("Starting podcast audio generation")
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
            logger.info(f"Processing part {i+1}/{len(all_parts)}: {speaker} #{num} ({len(text)} chars)")
            
            try:
                audio_path = self.text_to_speech_file(text, voice_id)
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
            combined_path = os.path.join(self.audio_dir, "full_podcast.mp3")
            combined_audio.export(combined_path, format="mp3")
            
            end_time = datetime.now()
            processing_time = (end_time - start_time).total_seconds()
            
            logger.info(f"Audio generation complete. Total duration: {total_duration/1000:.2f}s")
            logger.info(f"Processing time: {processing_time:.2f}s")
            logger.info(f"Combined audio saved to: {combined_path}")
            
            return {
                "segments": segment_info,
                "combined_audio_path": combined_path,
                "total_duration_ms": total_duration,
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
        
        logger.info(f"Output directory: {self.output_dir}")
        self.audio_generator = PodcastAudioGenerator(elevenlabs_api_key, str(self.output_dir))
    
    def generate_podcast(self, course_name: str, num_topics: int = 5) -> Dict[str, Any]:
        """Generate a podcast about a Northwestern course"""
        logger.info(f"Starting podcast generation for course: '{course_name}' with {num_topics} topics")
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
        
        # Step 2: Generate podcast script
        logger.info("STEP 2: Generating podcast script using GPT-4o")
        script_data = self.gpt4o_api.generate_podcast_script(course_info, num_topics)
        
        # Save script
        script_path = self.output_dir / "podcast_script.txt"
        with open(script_path, "w") as f:
            f.write(script_data["script"])
        logger.info(f"Podcast script saved to {script_path}")
        
        # Step 3: Generate audio
        logger.info("STEP 3: Generating audio with ElevenLabs")
        audio_data = self.audio_generator.generate_podcast_audio(script_data["script"])
        
        # Save metadata
        metadata = {
            "course_name": course_name,
            "generation_timestamp": datetime.now().isoformat(),
            "num_topics": num_topics,
            "script": script_data["script"],
            "audio_path": audio_data["combined_audio_path"],
            "segments": audio_data["segments"],
            "total_duration_ms": audio_data["total_duration_ms"],
            "total_duration_formatted": f"{audio_data['total_duration_ms']/60000:.2f} minutes"
        }
        
        metadata_path = self.output_dir / "podcast_metadata.json"
        with open(metadata_path, "w") as f:
            # Convert Path objects to strings for JSON serialization
            json_metadata = {}
            for k, v in metadata.items():
                if isinstance(v, Path):
                    json_metadata[k] = str(v)
                elif isinstance(v, list) and all(isinstance(item.get('audio_path'), Path) for item in v if isinstance(item, dict)):
                    json_metadata[k] = [{**item, 'audio_path': str(item['audio_path'])} for item in v]
                else:
                    json_metadata[k] = v
            json.dump(json_metadata, f, indent=2)
        
        end_time = datetime.now()
        total_processing_time = (end_time - start_time).total_seconds()
        
        logger.info(f"Podcast generation complete! Total processing time: {total_processing_time:.2f}s")
        logger.info(f"Audio duration: {audio_data['total_duration_ms']/60000:.2f} minutes")
        logger.info(f"All files saved to: {self.output_dir}")
        
        return metadata
    
    def list_available_voices(self):
        """List all available ElevenLabs voices"""
        return self.audio_generator.list_available_voices()

# Example usage
if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Generate podcast for Northwestern courses")
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
        
        # Generate podcast
        print(f"Starting podcast generation for '{args.course_name}'")
        print(f"This may take several minutes. See logs for progress details.")
        
        result = workflow.generate_podcast(args.course_name, args.topics)
        
        print(f"\nPodcast generation complete!")
        print(f"Duration: {result['total_duration_formatted']}")
        print(f"Script saved to: {workflow.output_dir / 'podcast_script.txt'}")
        print(f"Audio saved to: {result['audio_path']}")
        print(f"All files saved to: {workflow.output_dir}")
    
    except Exception as e:
        logger.error(f"Error during podcast generation: {str(e)}", exc_info=True)
        print(f"Error: {str(e)}")
        sys.exit(1)