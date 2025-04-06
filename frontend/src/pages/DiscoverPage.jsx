import React, { useState, useRef } from 'react';
import { Box, Typography, Avatar } from '@mui/material';
import { FaGraduationCap } from 'react-icons/fa';
import FeedPost from '../components/FeedPost';

const sampleFeed = [
  {
    id: 1,
    title: "Understanding Demand in Transportation Economics",
    description: "An introduction to the fundamental concepts of demand analysis in transportation economics.",
    videoUrl: "/videos/topic_1_understanding_demand_in_transportation_economics.mp4",
    thumbnail: "/thumbnails/topic_1.jpg",
    likes: 45,
    author: "Transportation Economics Team"
  },
  {
    id: 2,
    title: "Examining Cost Structures in Transportation Modes",
    description: "Deep dive into the various cost structures that affect different transportation modes.",
    videoUrl: "/videos/topic_2_examining_cost_structures_in_transportation_modes.mp4",
    thumbnail: "/thumbnails/topic_2.jpg",
    likes: 38,
    author: "Transportation Economics Team"
  },
  {
    id: 3,
    title: "Optimal Pricing Strategies for Transport Services",
    description: "Analysis of pricing strategies and their impact on transportation service providers.",
    videoUrl: "/videos/topic_3_optimal_pricing_strategies_for_transport_services.mp4",
    thumbnail: "/thumbnails/topic_3.jpg",
    likes: 52,
    author: "Transportation Economics Team"
  },
  {
    id: 4,
    title: "Introduction to Transportation Economics",
    description: "A comprehensive overview of transportation economics and its key concepts.",
    videoUrl: "/videos/topic_1_introduction_to__detailed_overview_of_course_content.mp4",
    thumbnail: "/thumbnails/topic_4.jpg",
    likes: 67,
    author: "Transportation Economics Team"
  }
];

const DiscoverPage = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [feed] = useState(sampleFeed);
  const containerRef = useRef(null);
  const touchStartY = useRef(0);
  const isScrollingRef = useRef(false);

  const handleScroll = (e) => {
    if (isScrollingRef.current) return;

    const delta = e.deltaY;
    let newIndex = currentIndex;

    if (delta > 20 && currentIndex < feed.length - 1) {
      newIndex = currentIndex + 1;
    } else if (delta < -20 && currentIndex > 0) {
      newIndex = currentIndex - 1;
    }

    if (newIndex !== currentIndex) {
      isScrollingRef.current = true;
      setCurrentIndex(newIndex);
      setTimeout(() => {
        isScrollingRef.current = false;
      }, 800);
    }
  };

  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e) => {
    if (isScrollingRef.current) return;

    const touchEndY = e.touches[0].clientY;
    const delta = touchStartY.current - touchEndY;

    if (Math.abs(delta) > 50) {
      let newIndex = currentIndex;

      if (delta > 0 && currentIndex < feed.length - 1) {
        newIndex = currentIndex + 1;
      } else if (delta < 0 && currentIndex > 0) {
        newIndex = currentIndex - 1;
      }

      if (newIndex !== currentIndex) {
        isScrollingRef.current = true;
        setCurrentIndex(newIndex);
        setTimeout(() => {
          isScrollingRef.current = false;
        }, 800);
      }
    }
  };

  return (
    <Box
      sx={{
        height: '100vh',
        bgcolor: '#1e1e1e',
        color: 'white',
        overflow: 'hidden',
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        left: '240px',
      }}
      ref={containerRef}
      onWheel={handleScroll}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
    >
      <Box
        sx={{
          height: '100%',
          width: '100%',
          position: 'relative',
        }}
      >
        {feed.map((post, index) => (
          <Box
            key={post.id}
            sx={{
              position: 'absolute',
              top: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              bottom: 0,
              opacity: index === currentIndex ? 1 : 0,
              visibility: index === currentIndex ? 'visible' : 'hidden',
              transition: 'opacity 0.5s ease',
              display: 'flex',
              flexDirection: 'column',
              p: 2,
              width: 'min(100%, 500px)',
              margin: '0 auto',
            }}
          >
            {/* Post Header */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                mb: 2,
              }}
            >
              <Avatar
                sx={{
                  bgcolor: '#333',
                  width: 40,
                  height: 40,
                  mr: 2,
                }}
              >
                <FaGraduationCap size={20} />
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 600, fontSize: '0.95rem' }}
                >
                  {post.author}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem' }}
                >
                  {post.title}
                </Typography>
              </Box>
            </Box>

            {/* Video Content */}
            <Box
              sx={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: '#000',
                borderRadius: 2,
                overflow: 'hidden',
              }}
            >
              <FeedPost
                post={post}
                autoPlay={index === currentIndex}
                key={`${post.id}-${index === currentIndex}`}
              />
            </Box>

            {/* Description */}
            <Typography
              variant="body2"
              sx={{
                color: 'rgba(255,255,255,0.9)',
                fontSize: '0.9rem',
                lineHeight: 1.5,
                mt: 1,
                mb: 0.5,
              }}
            >
              {post.description}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default DiscoverPage;
