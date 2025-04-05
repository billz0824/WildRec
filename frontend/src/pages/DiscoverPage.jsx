import React, { useState } from 'react';
import CourseCard from '../components/CourseCard';
import { Box, IconButton, Typography, Avatar } from '@mui/material';
import { FaHeart } from 'react-icons/fa';

const sampleFeed = [
  {
    type: 'course',
    id: 1,
    number: "COMP_SCI 340",
    name: "Introduction to Networking",
    professor: "Alexander Kuzmanovic",
    radarData: { liked: 4, difficulty: 5, practicality: 4, collaborative: 3, rewarding: 5, instruction: 4 },
    quote: "Super difficult, hard exams, learned a lot",
    location: "Tech LR2",
    schedule: "MW 2:00–3:20",
    prerequisites: "CS211, CS213",
    requirements: "Systems Breadth, technical elective, Distro theme",
    description: "Explore Internet protocols, packet-level analysis, and simulations.",
    likes: 10,
    saves: 8,
  },
  {
    type: 'post',
    id: 2,
    courseId: 1,
    courseName: "COMP_SCI 340",
    content: "Check out this amazing networking visualization!",
    videoUrl: "https://example.com/video1.mp4",
    thumbnail: "/thumbnail1.jpg",
    likes: 45,
    author: "Student A",
  },
  {
    type: 'course',
    id: 3,
    number: "COMP_SCI 330",
    name: "Human-Computer Interaction",
    professor: "Dr. Jessica Hullman",
    radarData: { liked: 5, difficulty: 1, practicality: 4, collaborative: 5, rewarding: 4, instruction: 5 },
    quote: "Creative projects, great for design lovers",
    location: "Annenberg G21",
    schedule: "TT 3:00–4:20",
    prerequisites: "None",
    requirements: "Design Breadth, CS Elective",
    description: "Design user interfaces, run usability tests, and build prototypes.",
    likes: 14,
    saves: 11,
  }
];

const DiscoverPage = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [feed, setFeed] = useState(sampleFeed);

  const handleScroll = (e) => {
    if (e.deltaY > 0 && currentIndex < feed.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else if (e.deltaY < 0 && currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleLike = (id) => {
    setFeed(prev => prev.map(item => 
      item.id === id ? { ...item, likes: (item.likes || 0) + 1 } : item
    ));
  };

  const handleSave = async (course) => {
    try {
      const response = await fetch('/api/courses/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(course),
      });

      if (!response.ok) {
        throw new Error('Failed to save course');
      }
    } catch (error) {
      console.error('Error saving course:', error);
    }
  };

  const currentItem = feed[currentIndex];

  return (
    <Box 
      sx={{ 
        height: '100vh',
        bgcolor: '#000',
        color: 'white',
        overflow: 'hidden',
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        left: '240px', // Account for sidebar
      }}
      onWheel={handleScroll}
    >
      <Box
        sx={{
          height: '100%',
          transition: 'transform 0.3s ease',
          transform: `translateY(-${currentIndex * 100}%)`,
        }}
      >
        {feed.map((item, index) => (
          <Box
            key={item.id}
            sx={{
              height: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              position: 'relative',
            }}
          >
            {item.type === 'course' ? (
              <Box sx={{ width: '100%', maxWidth: '600px', p: 2 }}>
                <CourseCard 
                  course={item} 
                  showSaveButton={true}
                  onSave={handleSave}
                />
              </Box>
            ) : (
              <Box 
                sx={{ 
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                }}
              >
                {/* Video or Image Content */}
                <Box 
                  sx={{ 
                    width: '100%',
                    maxWidth: '400px',
                    height: '80vh',
                    bgcolor: '#1e1e1e',
                    borderRadius: 2,
                    overflow: 'hidden',
                  }}
                >
                  <img 
                    src={item.thumbnail} 
                    alt="Post content"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </Box>

                {/* Post Info */}
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: '10%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '100%',
                    maxWidth: '400px',
                    p: 2,
                  }}
                >
                  <Typography variant="h6">{item.courseName}</Typography>
                  <Typography variant="body1">{item.content}</Typography>
                  <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar>{item.author[0]}</Avatar>
                    <Typography variant="subtitle1">{item.author}</Typography>
                  </Box>
                </Box>

                {/* Interaction Buttons */}
                <Box
                  sx={{
                    position: 'absolute',
                    right: '10%',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                  }}
                >
                  <IconButton onClick={() => handleLike(item.id)} sx={{ color: 'white' }}>
                    <FaHeart />
                    <Typography variant="caption" sx={{ ml: 1 }}>{item.likes}</Typography>
                  </IconButton>
                </Box>
              </Box>
            )}
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default DiscoverPage;