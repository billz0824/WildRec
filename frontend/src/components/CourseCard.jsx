import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RadarChart from './RadarChart';
import { Card, CardContent, Typography, Box, IconButton, Chip, Tooltip, Avatar } from '@mui/material';
import { FaBookmark, FaRegBookmark, FaUser } from 'react-icons/fa';

const CourseCard = ({ course, showSaveButton = false, onSave, isSaved = false }) => {
  const navigate = useNavigate();
  const [isCourseSaved, setIsSaved] = useState(isSaved);

  const handleProfileClick = () => {
    navigate(`/course/${course.id}`);
  };

  const handleSaveClick = async () => {
    try {
      if (onSave) {
        await onSave(course);
        setIsSaved(true);
      }
    } catch (error) {
      console.error('Error saving course:', error);
    }
  };

  // Split requirements into an array
  const requirementTags = course.requirements.split(', ');

  return (
    <Card sx={{ 
      bgcolor: '#1e1e1e', 
      color: 'white', 
      borderRadius: 2,
      position: 'relative',
      width: '100%',
      height: 600, // Adjusted fixed height
      '&:hover': {
        boxShadow: '0 0 10px rgba(168, 85, 247, 0.2)'
      }
    }}>
      <CardContent sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        p: 2,
        '&:last-child': { pb: 2 } // Override Material-UI's default padding
      }}>
        {/* Header - Fixed Height */}
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" height="80px">
          <Box>
            <Typography variant="subtitle2" sx={{ color: '#a855f7', fontSize: '0.8rem' }}>{course.number}</Typography>
            <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 'bold', lineHeight: 1.2 }}>{course.name}</Typography>
            <Typography variant="caption" color="gray" sx={{ fontSize: '0.75rem' }}>Instructor: {course.professor}</Typography>
          </Box>
          <Box textAlign="center">
            <Tooltip title="Go to course profile">
              <Avatar 
                sx={{ 
                  bgcolor: '#333', 
                  cursor: 'pointer',
                  width: 32,
                  height: 32,
                  mb: showSaveButton ? 0.5 : 0
                }} 
                onClick={handleProfileClick}
              >
                <FaUser size={16} />
              </Avatar>
            </Tooltip>
            {showSaveButton && (
              <Tooltip title={isCourseSaved ? "Saved" : "Save course"}>
                <IconButton 
                  onClick={handleSaveClick}
                  sx={{ 
                    color: isCourseSaved ? '#a855f7' : 'white',
                    padding: 0,
                    '&:hover': {
                      color: '#a855f7'
                    }
                  }}
                >
                  {isCourseSaved ? <FaBookmark size={14} /> : <FaRegBookmark size={14} />}
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>

        {/* Radar Chart - Fixed Height */}
        <Box height="220px" display="flex" alignItems="center" justifyContent="center">
          <Box sx={{ transform: 'scale(0.9)', transformOrigin: 'center', width: '100%' }}>
            <RadarChart data={course.radarData} />
          </Box>
        </Box>

        {/* Quote - Fixed Height */}
        <Box height="40px" display="flex" alignItems="center" justifyContent="center">
          <Typography 
            variant="body2" 
            fontStyle="italic" 
            textAlign="center" 
            color="gray"
            sx={{ fontSize: '0.75rem' }}
          >
            "{course.quote}"
          </Typography>
        </Box>

        {/* Requirement Tags - Fixed Height */}
        <Box height="60px" display="flex" flexDirection="column" justifyContent="center">
          <Box display="flex" flexWrap="wrap" justifyContent="center" gap={0.5}>
            {requirementTags.map((req, index) => (
              <Chip 
                key={index}
                label={req}
                sx={{ 
                  bgcolor: '#333', 
                  color: 'white',
                  height: '24px',
                  '& .MuiChip-label': {
                    fontSize: '0.7rem',
                    px: 1
                  }
                }} 
              />
            ))}
          </Box>
        </Box>

        {/* Prerequisites - Fixed Height */}
        <Box height="30px" display="flex" alignItems="center" justifyContent="center">
          <Typography color="gray" sx={{ fontSize: '0.7rem' }}>
            <strong style={{ color: '#bbb' }}>Pre-Requisites:</strong> {course.prerequisites}
          </Typography>
        </Box>

        {/* Description - Fixed Height */}
        <Box sx={{ 
          mt: 2,
          height: '120px', // Fixed height for description
          bgcolor: '#2c2c2c', 
          borderRadius: 1,
          display: 'flex',
          flexDirection: 'column',
        }}>
          <Typography 
            variant="caption" 
            color="purple" 
            sx={{ 
              fontSize: '0.7rem',
              px: 1.5,
              pt: 1.5,
              pb: 0.5,
              borderBottom: '1px solid #444'
            }}
          >
            Course Description:
          </Typography>
          <Box sx={{ 
            overflowY: 'auto',
            height: '100%',
            px: 1.5,
            py: 1,
            '&::-webkit-scrollbar': {
              width: '4px',
            },
            '&::-webkit-scrollbar-track': {
              background: '#1e1e1e',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#444',
              borderRadius: '4px',
              '&:hover': {
                background: '#555',
              },
            },
          }}>
            <Typography variant="body2" color="gray" sx={{ fontSize: '0.75rem' }}>
              {course.description}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CourseCard;
