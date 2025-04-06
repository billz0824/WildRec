import React, { useState, useRef, useEffect } from 'react';
import { Box, IconButton, Typography, CircularProgress } from '@mui/material';
import { FaHeart, FaVolumeMute, FaVolumeUp } from 'react-icons/fa';

const FeedPost = ({ post, autoPlay }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = isMuted;

    const handleCanPlay = () => {
      setIsLoading(false);

      if (autoPlay) {
        video
          .play()
          .then(() => {
            if (!isMuted) {
              video.muted = false;
            }
          })
          .catch((err) => {
            console.warn('Autoplay failed:', err);
          });
      }
    };

    const timeout = setTimeout(() => {
      if (autoPlay) {
        if (video.readyState >= 3) {
          setIsLoading(false);
          video
            .play()
            .then(() => {
              if (!isMuted) {
                video.muted = false;
              }
            })
            .catch(console.error);
        } else {
          video.addEventListener('canplay', handleCanPlay, { once: true });
        }
      } else {
        video.pause();
      }
    }, 150);

    return () => {
      clearTimeout(timeout);
      video.removeEventListener('canplay', handleCanPlay);
      if (!video.paused) {
        video.pause();
      }
    };
  }, [autoPlay, isMuted]);

  const handleLikeClick = () => {
    setIsLiked(!isLiked);
  };

  const handleVideoClick = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().catch(console.error);
    } else {
      video.pause();
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    const newMute = !isMuted;
    setIsMuted(newMute);
    video.muted = newMute;
  };

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: 'auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#000',
      }}
    >
      {isLoading && (
        <Box
          sx={{
            position: 'absolute',
            zIndex: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CircularProgress color="inherit" />
        </Box>
      )}

      <video
        ref={videoRef}
        src={post.videoUrl}
        style={{
          width: '100%',
          height: 'auto',
          objectFit: 'contain',
        }}
        muted={isMuted}
        playsInline
        loop
        onClick={handleVideoClick}
      />

      
      {/* Caption and Controls */}
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          bgcolor: 'rgba(0, 0, 0, 0.6)',
          p: 0.5,
          mb: 0.5,
        }}
      >
        {/* Like + Mute Buttons */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            onClick={handleLikeClick}
            sx={{
              color: isLiked ? '#ff3040' : 'white',
              bgcolor: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(4px)',
              '&:hover': {
                bgcolor: 'rgba(0, 0, 0, 0.7)',
              },
            }}
          >
            <FaHeart size={24} />
          </IconButton>

          <IconButton
            onClick={toggleMute}
            sx={{
              color: 'white',
              bgcolor: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(4px)',
              '&:hover': {
                bgcolor: 'rgba(0, 0, 0, 0.7)',
              },
            }}
          >
            {isMuted ? <FaVolumeMute size={22} /> : <FaVolumeUp size={22} />}
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};

export default FeedPost;
