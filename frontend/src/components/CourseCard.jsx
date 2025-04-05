import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RadarChart from './RadarChart';
import { Card, CardContent, Typography, Box, IconButton, Chip, Tooltip, Avatar } from '@mui/material';
import { FaMapMarkerAlt, FaClock, FaBookmark, FaRegBookmark, FaUser } from 'react-icons/fa';

const CourseCard = ({ course, showSaveButton = false, onSave }) => {
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);

  const handleProfileClick = () => {
    navigate(`/course/${course.id}`);
  };

  const handleSaveClick = async () => {
    try {
      // Call the onSave callback with the course data
      if (onSave) {
        await onSave(course);
        setIsSaved(true);
      }
    } catch (error) {
      console.error('Error saving course:', error);
    }
  };

  return (
    <Card sx={{ 
      bgcolor: '#1e1e1e', 
      color: 'white', 
      borderRadius: 2,
      position: 'relative',
      height: '100%',
      '&:hover': {
        boxShadow: '0 0 10px rgba(168, 85, 247, 0.2)'
      }
    }}>
      <CardContent sx={{ p: 2 }}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={0.5}>
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
              <Tooltip title={isSaved ? "Saved" : "Save course"}>
                <IconButton 
                  onClick={handleSaveClick}
                  sx={{ 
                    color: isSaved ? '#a855f7' : 'white',
                    padding: 0,
                    '&:hover': {
                      color: '#a855f7'
                    }
                  }}
                >
                  {isSaved ? <FaBookmark size={14} /> : <FaRegBookmark size={14} />}
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>

        {/* Radar Chart */}
        <Box mb={1} sx={{ transform: 'scale(0.9)', transformOrigin: 'center' }}>
          <RadarChart data={course.radarData} />
        </Box>

        {/* Quote */}
        <Typography 
          variant="body2" 
          fontStyle="italic" 
          textAlign="center" 
          color="gray" 
          mb={1.2}
          sx={{ fontSize: '0.75rem' }}
        >
          "{course.quote}"
        </Typography>

        {/* Info chips */}
        <Box display="flex" justifyContent="center" gap={1} mb={1.5}>
          <Chip 
            icon={<FaMapMarkerAlt size={12} />} 
            label={course.location} 
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
          <Chip 
            icon={<FaClock size={12} />} 
            label={course.schedule} 
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
        </Box>

        {/* Prereqs and Requirements */}
        <Box textAlign="center" color="gray" sx={{ fontSize: '0.7rem' }} mb={1.5}>
          <div><strong style={{ color: '#bbb' }}>Pre-Requisites:</strong> {course.prerequisites}</div>
          <div>{course.requirements}</div>
        </Box>

        {/* Description */}
        <Box sx={{ bgcolor: '#2c2c2c', p: 1.5, borderRadius: 1 }}>
          <Typography variant="caption" color="purple" display="block" gutterBottom sx={{ fontSize: '0.7rem' }}>
            Course Description:
          </Typography>
          <Typography variant="body2" color="gray" sx={{ fontSize: '0.75rem' }}>
            {course.description}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CourseCard;
