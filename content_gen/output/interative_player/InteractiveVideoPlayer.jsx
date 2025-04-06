import React, { useRef, useState, useEffect, forwardRef } from 'react';
import './InteractiveVideoPlayer.css';

const InteractiveVideoPlayer = forwardRef(({ videoSrc, podcastId, title, autoplay = false }, ref) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [interactionState, setInteractionState] = useState('idle'); // idle, listening, processing, responding
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const recognitionRef = useRef(null);

  // Expose video methods to parent component
  useEffect(() => {
    if (videoRef.current && ref) {
      // Expose play/pause methods to parent
      if (typeof ref === 'function') {
        ref(videoRef.current);
      } else {
        ref.current = videoRef.current;
      }
    }
  }, [ref]);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = false;
      
      recognitionRef.current.onresult = (event) => {
        const userTranscript = event.results[event.results.length - 1][0].transcript;
        if (userTranscript.trim().length > 3) {
          handleUserInterruption(userTranscript);
        }
      };
      
      recognitionRef.current.onend = () => {
        // Restart if we're still supposed to be listening
        if (isListening) {
          recognitionRef.current.start();
        }
      };
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isListening]);

  // Start/stop listening based on video playback
  useEffect(() => {
    if (isPlaying && interactionState === 'idle') {
      startListening();
    } else if (!isPlaying && interactionState === 'idle') {
      stopListening();
    }
  }, [isPlaying, interactionState]);

  // Autoplay if specified
  useEffect(() => {
    if (autoplay && videoRef.current) {
      // Most browsers require user interaction before autoplay with sound
      // So we mute it initially and let the user unmute
      videoRef.current.muted = true;
      const playPromise = videoRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch(error => {
            console.log('Autoplay prevented:', error);
          });
      }
    }
  }, [autoplay]);

  const startListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.log('Recognition already started');
      }
    }
  };
  
  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const handleUserInterruption = async (userTranscript) => {
    // Pause video
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
    
    setInteractionState('listening');
    setTranscript(userTranscript);
    
    // Process with AI
    setInteractionState('processing');
    const aiResponse = await generateAIResponse(userTranscript);
    setResponse(aiResponse);
    
    // Play AI response
    setInteractionState('responding');
    await playAIResponse(aiResponse);
    
    // Resume video
    if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
      setInteractionState('idle');
      setTranscript('');
      setResponse('');
    }
  };

  const generateAIResponse = async (query) => {
    // Call our Flask API
    try {
      const apiUrl = 'http://localhost:5000/api/ask';
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query,
          podcastId: podcastId
        })
      });
      
      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`);
      }
      
      const data = await response.json();
      return data.response || "I'm not sure how to respond to that.";
    } catch (error) {
      console.error('Error generating AI response:', error);
      return "Sorry, I couldn't process your question right now.";
    }
  };

  const playAIResponse = async (responseText) => {
    return new Promise((resolve) => {
      const utterance = new SpeechSynthesisUtterance(responseText);
      utterance.onend = resolve;
      window.speechSynthesis.speak(utterance);
    });
  };

  const handleVideoPlay = () => {
    setIsPlaying(true);
    // Unmute if it was muted for autoplay
    if (videoRef.current.muted) {
      videoRef.current.muted = false;
    }
  };

  const handleVideoPause = () => {
    setIsPlaying(false);
  };

  return (
    <div className="interactive-video-container tiktok-style">
      <video
        ref={videoRef}
        src={videoSrc}
        controls
        loop
        playsInline
        onPlay={handleVideoPlay}
        onPause={handleVideoPause}
        className={interactionState !== 'idle' ? 'video-dimmed' : ''}
      />
      
      {/* Interaction UI overlay */}
      {interactionState !== 'idle' && (
        <div className="interaction-overlay">
          {interactionState === 'listening' && (
            <div className="listening-indicator">
              <div className="pulse-animation"></div>
              <p>I heard: "{transcript}"</p>
            </div>
          )}
          
          {interactionState === 'processing' && (
            <div className="processing-indicator">
              <div className="spinner"></div>
              <p>Thinking...</p>
            </div>
          )}
          
          {interactionState === 'responding' && (
            <div className="response-container">
              <div className="waveform-animation"></div>
              <p>{response}</p>
            </div>
          )}
        </div>
      )}
      
      {/* Interaction button */}
      <button 
        className="interrupt-button"
        onClick={() => {
          if (interactionState === 'idle' && isPlaying) {
            videoRef.current.pause();
            setIsPlaying(false);
            setInteractionState('listening');
            startListening();
          }
        }}
      >
        Ask a question
      </button>
    </div>
  );
});

export default InteractiveVideoPlayer; 