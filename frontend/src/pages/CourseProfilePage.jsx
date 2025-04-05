import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Typography, Avatar, Grid, IconButton } from '@mui/material';
import { FaGraduationCap, FaArrowLeft } from 'react-icons/fa';

const courseMock = {
  id: 'cs349',
  number: 'CS349',
  name: 'Machine Learning',
  professor: 'Zach Wood-Doughty',
  avatar: '/cs349.png',
  website: 'coursewikis.com',
  description: 'Intro to machine learning, covering supervised learning, decision trees, neural networks and more.',
  posts: [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4',
      caption: 'Deep learning project presentation day! 🧠',
      timestamp: '2 hours ago',
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1509228627152-72ae9ae6848d',
      caption: 'Neural networks in action 🚀',
      timestamp: 'Yesterday',
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1527474305487-b87b222841cc',
      caption: 'Group project collaboration',
      timestamp: '3 days ago',
    },
    {
      id: 4,
      image: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb',
      caption: 'Coding session for ML algorithms',
      timestamp: '1 week ago',
    },
    {
      id: 5,
      image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3',
      caption: 'Data visualization workshop',
      timestamp: '2 weeks ago',
    },
    {
      id: 6,
      image: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3',
      caption: 'Learning about decision trees',
      timestamp: '3 weeks ago',
    }
  ]
};

const CourseProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [posts] = useState(courseMock.posts);

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <Box sx={{ 
      ml: '240px', 
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      bgcolor: '#0f0f0f',
      color: 'white',
      overflow: 'hidden',
      position: 'fixed',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0
    }}>
      {/* Fixed Header Section */}
      <Box sx={{ 
        p: 4,
        bgcolor: '#0f0f0f',
        borderBottom: '1px solid #222'
      }}>
        {/* Back Button */}
        <IconButton 
          onClick={handleBack}
          sx={{ 
            color: 'white',
            mb: 2,
            '&:hover': {
              color: '#a855f7'
            }
          }}
        >
          <FaArrowLeft />
        </IconButton>

        {/* Profile Header */}
        <Box sx={{ display: 'flex', gap: 4, mb: 4 }}>
          {/* Avatar */}
          <Avatar 
            src={courseMock.avatar} 
            sx={{ 
              width: 150, 
              height: 150,
              border: '2px solid #333'
            }}
          />
          
          {/* Course Info */}
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Typography variant="h4" fontWeight="bold">
                {courseMock.number} {courseMock.name}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 3, mb: 2, color: 'gray' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FaGraduationCap />
                <Typography>{courseMock.professor}</Typography>
              </Box>
            </Box>

            <Typography variant="body1" color="gray" sx={{ mb: 1 }}>
              {courseMock.website}
            </Typography>

            <Typography variant="body1">
              {courseMock.description}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Scrollable Posts Grid */}
      <Box sx={{ 
        flex: 1,
        overflowY: 'auto',
        p: 2,
        borderTop: '1px solid #222'
      }}>
        <Grid container spacing={1}>
          {posts.map((post) => (
            <Grid item xs={4} key={post.id}>
              <Box 
                sx={{ 
                  position: 'relative',
                  paddingTop: '100%', // 1:1 Aspect ratio
                  '&:hover': {
                    '& .overlay': {
                      opacity: 1
                    }
                  }
                }}
              >
                <Box
                  component="img"
                  src={post.image}
                  alt={post.caption}
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
                <Box 
                  className="overlay"
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    bgcolor: 'rgba(0,0,0,0.7)',
                    opacity: 0,
                    transition: 'opacity 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 2,
                    textAlign: 'center'
                  }}
                >
                  <Typography variant="body2">
                    {post.caption}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default CourseProfilePage;