import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CourseCard from '../components/CourseCard';
import { Box, IconButton, Typography, Avatar, Card, CardContent, Tooltip } from '@mui/material';
import { FaHeart, FaRegHeart, FaChevronUp, FaChevronDown, FaGraduationCap } from 'react-icons/fa';

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

const PostCard = ({ post }) => {
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes || 0);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
  };

  const handleCourseProfileClick = () => {
    navigate(`/course/${post.courseId}`);
  };

  return (
    <Card sx={{ 
      bgcolor: '#1e1e1e', 
      color: 'white', 
      borderRadius: 2,
      width: '100%',
      height: '100%',
      '&:hover': {
        boxShadow: '0 0 10px rgba(168, 85, 247, 0.2)'
      }
    }}>
      <CardContent sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        p: 3,
        gap: 3
      }}>
        {/* Header */}
        <Box 
          display="flex" 
          justifyContent="space-between" 
          alignItems="flex-start"
          mb={2}
        >
          <Box>
            <Typography variant="subtitle2" sx={{ 
              color: '#a855f7', 
              fontSize: '1rem'
            }}>
              {post.courseName}
            </Typography>
            <Typography variant="h6" sx={{ 
              fontSize: '1.5rem',
              fontWeight: 'bold',
              lineHeight: 1.2,
              mt: 0.5
            }}>
              {post.content}
            </Typography>
 
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <Tooltip title="Go to course profile">
              <Avatar 
                sx={{ 
                  bgcolor: '#333', 
                  cursor: 'pointer',
                  width: 40,
                  height: 40,
                  '&:hover': {
                    bgcolor: '#444'
                  }
                }} 
                onClick={handleCourseProfileClick}
              >
                <FaGraduationCap size={20} />
              </Avatar>
            </Tooltip>
            <Tooltip title={isLiked ? "Unlike" : "Like"}>
              <IconButton 
                onClick={handleLike}
                sx={{ 
                  color: isLiked ? '#a855f7' : 'white',
                  '&:hover': {
                    color: '#a855f7'
                  }
                }}
              >
                {isLiked ? <FaHeart size={18} /> : <FaRegHeart size={18} />}
                <Typography variant="caption" sx={{ ml: 1 }}>{likeCount}</Typography>
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Content */}
        <Box 
          sx={{ 
            flex: 1,
            width: '100%',
            borderRadius: 2,
            overflow: 'hidden',
            position: 'relative'
          }}
        >
          <img 
            src={post.thumbnail} 
            alt="Post content"
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover',
              borderRadius: 8
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );
};

const DiscoverPage = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [feed, setFeed] = useState(sampleFeed);
  const [isScrolling, setIsScrolling] = useState(false);

  const handleScroll = (e) => {
    if (isScrolling) return;

    setIsScrolling(true);
    setTimeout(() => setIsScrolling(false), 500);

    const scrollThreshold = 50;
    if (Math.abs(e.deltaY) < scrollThreshold) return;

    if (e.deltaY > 0 && currentIndex < feed.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else if (e.deltaY < 0 && currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleScrollClick = (direction) => {
    if (direction === 'up' && currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    } else if (direction === 'down' && currentIndex < feed.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handleLike = async (id) => {
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
        left: '240px',
      }}
      onWheel={handleScroll}
    >
      {/* Scroll Indicators */}
      <Box
        sx={{
          position: 'fixed',
          right: 32,
          top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          zIndex: 10
        }}
      >
        <IconButton
          onClick={() => handleScrollClick('up')}
          disabled={currentIndex === 0}
          sx={{
            color: currentIndex === 0 ? 'gray' : 'white',
            bgcolor: 'rgba(0,0,0,0.5)',
            '&:hover': {
              bgcolor: 'rgba(168, 85, 247, 0.2)',
              color: '#a855f7'
            }
          }}
        >
          <FaChevronUp />
        </IconButton>
        <Typography 
          variant="body2" 
          sx={{ 
            textAlign: 'center',
            color: 'gray'
          }}
        >
          {currentIndex + 1}/{feed.length}
        </Typography>
        <IconButton
          onClick={() => handleScrollClick('down')}
          disabled={currentIndex === feed.length - 1}
          sx={{
            color: currentIndex === feed.length - 1 ? 'gray' : 'white',
            bgcolor: 'rgba(0,0,0,0.5)',
            '&:hover': {
              bgcolor: 'rgba(168, 85, 247, 0.2)',
              color: '#a855f7'
            }
          }}
        >
          <FaChevronDown />
        </IconButton>
      </Box>

      <Box
        sx={{
          height: '100%',
          transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
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
            <Box sx={{ 
              width: '100%', 
              maxWidth: '600px',
              height: '90vh',
              display: 'flex',
              p: 3
            }}>
              {item.type === 'course' ? (
                <CourseCard 
                  course={item} 
                  showSaveButton={true}
                  onSave={handleSave}
                  layout="discover"
                />
              ) : (
                <PostCard post={item} />
              )}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default DiscoverPage;