import React, { useRef, useState, useEffect, useCallback } from 'react';
import { FaHeart, FaComment, FaBookmark, FaVolumeMute, FaVolumeUp, FaMicrophone, FaStop } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import VideoDebug from './VideoDebug';

const FeedPost = ({ post }) => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [interactionState, setInteractionState] = useState('idle'); // idle, recording, processing, responding
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [videoError, setVideoError] = useState(false);
  const [speechError, setSpeechError] = useState(null);
  
  // Audio recording related refs and state
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);

  // Clean up function for audio recording
  const cleanupAudioRecording = useCallback(() => {
    if (mediaRecorderRef.current) {
      if (mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      mediaRecorderRef.current = null;
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    audioChunksRef.current = [];
  }, []);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      cleanupAudioRecording();
    };
  }, [cleanupAudioRecording]);

  // Start recording audio
  const startRecording = async () => {
    try {
      setTranscript('');
      setResponse('');
      setSpeechError(null);
      
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      // Create media recorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      // Set up event handlers
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        try {
          if (audioChunksRef.current.length === 0) {
            throw new Error("No audio recorded");
          }
          
          setInteractionState('processing');
          
          // Create audio blob from chunks
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          
          // Send to server for processing with Whisper API
          await processAudioWithWhisper(audioBlob);
        } catch (error) {
          console.error('Error processing audio:', error);
          setSpeechError("There was a problem processing your audio. Please try again.");
          setInteractionState('idle');
        } finally {
          cleanupAudioRecording();
        }
      };
      
      // Start recording
      mediaRecorder.start();
      setIsRecording(true);
      setInteractionState('recording');
      
      // Pause the video
      if (videoRef.current && !videoRef.current.paused) {
        videoRef.current.pause();
      }
      
      console.log('Started recording audio');
    } catch (error) {
      console.error('Error starting audio recording:', error);
      
      // Provide user-friendly error messages based on error type
      if (error.name === 'NotAllowedError') {
        setSpeechError('Microphone access was denied. Please allow microphone access in your browser settings.');
      } else if (error.name === 'NotFoundError') {
        setSpeechError('No microphone was found. Please check your device connections.');
      } else {
        setSpeechError(`Error: ${error.message || 'Could not access microphone'}`);
      }
      
      setInteractionState('idle');
    }
  };

  // Stop recording audio
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Process audio with OpenAI Whisper API via our backend
  const processAudioWithWhisper = async (audioBlob) => {
    try {
      // Create form data for file upload
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      
      // Add metadata
      formData.append('podcastId', post.id || 'unknown');
      if (videoRef.current) {
        formData.append('timeInVideo', Math.floor(videoRef.current.currentTime));
      }
      formData.append('title', post.title || 'Unknown');
      
      // Send to our backend API
      const response = await fetch('http://localhost:8000/api/transcribe', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`API returned status ${response.status}: ${errorData.error || 'Unknown error'}`);
      }
      
      const data = await response.json();
      
      // Set transcript and handle the response
      setTranscript(data.transcript || '');
      
      if (data.transcript && data.transcript.trim().length > 0) {
        // Process with OpenAI for a response
        await handleUserQuestion(data.transcript);
      } else {
        throw new Error('No speech detected');
      }
    } catch (error) {
      console.error('Whisper API error:', error);
      setSpeechError(`Speech recognition error: ${error.message}`);
      setInteractionState('idle');
    }
  };

  // Handle user questions via the API
  const handleUserQuestion = async (userTranscript) => {
    try {
      setTranscript(userTranscript);
      setInteractionState('processing');
      
      // Get AI response
      const aiResponse = await generateAIResponse(userTranscript);
      setResponse(aiResponse);
      setInteractionState('responding');
      
      // Read the response aloud
      await playAIResponse(aiResponse);
      
      // Reset the state after response and resume video playback
      setTimeout(() => {
        setInteractionState('idle');
        if (videoRef.current) {
          videoRef.current.play()
            .catch(e => console.error('Error playing video after interaction:', e));
        }
      }, 1000);
    } catch (error) {
      console.error('Error handling user interaction:', error);
      setResponse("I'm sorry, there was an error processing your question. Please try again.");
      setInteractionState('responding');
      
      // Wait a bit and then reset
      setTimeout(() => {
        setInteractionState('idle');
      }, 3000);
    }
  };

  const generateAIResponse = async (query) => {
    // Call our Flask API with improved error handling and logging
    try {
      const apiUrl = 'http://localhost:8000/api/ask';
      
      // Show a "thinking" animation or indicator here
      console.log('Sending request to OpenAI via backend...');
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query,
          podcastId: post.id,
          // Add context that helps the AI provide better responses
          context: {
            timeInVideo: videoRef.current ? Math.floor(videoRef.current.currentTime) : 0,
            title: post.title || "Unknown"
          }
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API error response:', errorData);
        throw new Error(`API returned status ${response.status}: ${errorData.error || 'Unknown error'}`);
      }
      
      const data = await response.json();
      
      // Log for debugging
      console.log('Received AI response:', data);
      
      return data.response || "I'm not sure how to respond to that.";
    } catch (error) {
      console.error('Error generating AI response:', error);
      return "Sorry, I couldn't process your question right now. Please try again.";
    }
  };

  const playAIResponse = async (responseText) => {
    return new Promise((resolve) => {
      try {
        // Instead of using browser TTS directly, we could call our API for 
        // OpenAI TTS, but for simplicity we'll use the browser's TTS for now
        const utterance = new SpeechSynthesisUtterance(responseText);
        
        // Select a better voice if available
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(voice => 
          voice.name.includes('Google') || voice.name.includes('Natural') || voice.lang === 'en-US'
        );
        
        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }
        
        // Adjust speech parameters for better quality
        utterance.rate = 1.0;  // Normal speed
        utterance.pitch = 1.0; // Normal pitch
        utterance.volume = 1.0; // Full volume
        
        // Event handlers
        utterance.onend = () => {
          console.log('Speech synthesis completed');
          resolve();
        };
        
        utterance.onerror = (e) => {
          console.error('Speech synthesis error:', e);
          resolve(); // Still resolve so the flow continues
        };
        
        // Add visual indicators while speaking
        console.log('Starting speech synthesis...');
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.error('Error with speech synthesis:', e);
        resolve(); // Still resolve so the flow continues
      }
    });
  };

  const handleVideoPlay = () => {
    setIsPlaying(true);
  };

  const handleVideoPause = () => {
    setIsPlaying(false);
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(!isMuted);
    }
  };

  const handleProfileClick = () => {
    navigate(`/course/${post.courseId}`);
  };

  // Handle video loading errors
  const handleVideoError = (e) => {
    console.error('Video loading error:', e);
    setVideoError(true);
  };

  // Try to load a fallback video if the main one fails
  useEffect(() => {
    if (videoError && videoRef.current) {
      // Try to load a generic fallback video if available
      const fallbackUrl = 'http://localhost:8000/api/videos/any_available_video';
      console.log('Attempting to load fallback video:', fallbackUrl);
      videoRef.current.src = fallbackUrl;
      videoRef.current.load();
    }
  }, [videoError]);

  // Cancel interaction if needed
  const cancelInteraction = () => {
    if (isRecording) {
      stopRecording();
    }
    cleanupAudioRecording();
    setInteractionState('idle');
    if (videoRef.current && videoRef.current.paused) {
      videoRef.current.play()
        .catch(e => console.error('Error resuming video after cancellation:', e));
    }
  };

  return (
    <div className="bg-black text-white w-full h-full relative overflow-hidden">
      {/* Video Player */}
      <video
        ref={videoRef}
        src={post.videoUrl.startsWith('http') ? post.videoUrl : `http://localhost:8000${post.videoUrl}`}
        className={`w-full h-full object-cover ${interactionState !== 'idle' ? 'brightness-50' : ''}`}
        controls={false}
        loop
        playsInline
        onPlay={handleVideoPlay}
        onPause={handleVideoPause}
        onError={handleVideoError}
        onClick={() => videoRef.current.paused ? videoRef.current.play() : videoRef.current.pause()}
      />
      
      {/* Debug Panel */}
      <div className="absolute top-4 left-4 right-4 z-30">
        <VideoDebug videoData={post} />
      </div>
      
      {/* Podcast Info */}
      <div className="absolute bottom-16 left-4 max-w-[75%] z-10">
        <h3 className="text-xl font-bold drop-shadow-lg">{post.title}</h3>
        <p className="text-sm opacity-90 drop-shadow-lg">{post.description}</p>
      </div>
      
      {/* Controls */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between z-10">
        <div className="flex gap-4 text-white">
          <FaHeart className="text-xl" />
          <FaComment className="text-xl" />
        </div>
        
        <button
          onClick={toggleMute}
          className="text-white p-2"
        >
          {isMuted ? <FaVolumeMute className="text-xl" /> : <FaVolumeUp className="text-xl" />}
        </button>
      </div>
      
      {/* Ask Question Button */}
      <button 
        className="absolute right-4 bottom-16 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-full z-10 flex items-center gap-2"
        onClick={() => {
          if (videoRef.current) {
            try {
              videoRef.current.pause();
              startRecording();
            } catch (e) {
              console.error('Error starting audio recording:', e);
              setSpeechError('Could not start audio recording');
            }
          }
        }}
      >
        {isRecording ? <FaStop /> : <FaMicrophone />}
        {isRecording ? 'Stop Recording' : 'Ask a question'}
      </button>
      
      {/* Interaction UI overlay */}
      {interactionState !== 'idle' && (
        <div className="absolute inset-0 flex justify-center items-center z-20">
          {interactionState === 'recording' && (
            <div className="bg-black/70 p-6 rounded-lg max-w-md text-center">
              <div className="w-20 h-20 bg-red-500/70 rounded-full mx-auto mb-4 animate-pulse flex items-center justify-center">
                <FaMicrophone size={32} />
              </div>
              <p className="text-lg mb-4">Recording... Speak now</p>
              {speechError && (
                <div className="text-red-400 mb-4">
                  <p>{speechError}</p>
                </div>
              )}
              <div className="flex gap-4 justify-center">
                <button 
                  className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg"
                  onClick={stopRecording}
                >
                  Done
                </button>
                <button 
                  className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg"
                  onClick={cancelInteraction}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          
          {interactionState === 'processing' && (
            <div className="bg-black/70 p-6 rounded-lg max-w-md text-center">
              <div className="w-16 h-16 border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full mx-auto mb-4 animate-spin"></div>
              <p className="text-lg">Processing with OpenAI...</p>
              {transcript && (
                <p className="italic mt-2">"{transcript}"</p>
              )}
            </div>
          )}
          
          {interactionState === 'responding' && (
            <div className="bg-black/70 p-6 rounded-lg max-w-md">
              <div className="h-8 w-full bg-gradient-to-r from-blue-500 to-purple-500 mb-4 rounded animate-pulse"></div>
              <p className="text-lg mb-4">{response}</p>
              <div className="flex justify-center">
                <button 
                  className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg"
                  onClick={() => {
                    setInteractionState('idle');
                    if (videoRef.current && videoRef.current.paused) {
                      videoRef.current.play()
                        .catch(e => console.error('Error resuming video:', e));
                    }
                  }}
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Error Message for Video */}
      {videoError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20">
          <div className="bg-red-900/50 p-6 rounded-lg max-w-md text-center">
            <h3 className="text-xl font-bold mb-2">Video Loading Error</h3>
            <p>There was a problem loading the video. Please try again later.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedPost;