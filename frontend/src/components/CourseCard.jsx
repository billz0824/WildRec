import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RadarChart from './RadarChart';
import { Card, CardContent, Typography, Box, IconButton, Chip, Tooltip, Avatar } from '@mui/material';
import { FaBookmark, FaRegBookmark, FaGraduationCap } from 'react-icons/fa';

const CourseCard = ({ course, showSaveButton = false, onSave, isSaved = false, layout = 'grid' }) => {
  const navigate = useNavigate();
  const [isCourseSaved, setIsSaved] = useState(isSaved);

  const handleProfileClick = () => {
    navigate(`/courseprofile/${course.id}`);
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

  const cardStyles = {
    grid: {
      height: 600,
      width: '100%'
    },
    discover: {
      width: '100%',
      height: '100%' // Allow it to fill container height
    }
  };

  const selectedStyle = cardStyles[layout] || cardStyles.grid;

  return (
    <Card sx={{ 
      bgcolor: '#1e1e1e', 
      color: 'white', 
      borderRadius: 2,
      position: 'relative',
      width: '100%',
      height: layout === 'discover' ? '100%' : 600,
      '&:hover': {
        boxShadow: '0 0 10px rgba(168, 85, 247, 0.2)'
      }
    }}>
      <CardContent sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        p: layout === 'discover' ? 3 : 2,
        gap: layout === 'discover' ? 3 : 1,
        '&:last-child': { pb: layout === 'discover' ? 3 : 2 }
      }}>
        {/* Header */}
        <Box 
          display="flex" 
          justifyContent="space-between" 
          alignItems="flex-start" 
          height={layout === 'discover' ? "auto" : "80px"}
          mb={layout === 'discover' ? 2 : 0}
        >
          <Box>
            <Typography variant="subtitle2" sx={{ 
              color: '#a855f7', 
              fontSize: layout === 'discover' ? '1rem' : '0.8rem' 
            }}>
              {course.number}
            </Typography>
            <Typography variant="h6" sx={{ 
              fontSize: layout === 'discover' ? '1.5rem' : '1rem',
              fontWeight: 'bold',
              lineHeight: 1.2,
              mt: 0.5
            }}>
              {course.name}
            </Typography>
            <Typography variant="caption" color="gray" sx={{ 
              fontSize: layout === 'discover' ? '0.9rem' : '0.75rem',
              display: 'block',
              mt: 1
            }}>
              Instructor: {course.professor}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Go to course profile">
              <Avatar 
                sx={{ 
                  bgcolor: '#333', 
                  cursor: 'pointer',
                  width: layout === 'discover' ? 40 : 32,
                  height: layout === 'discover' ? 40 : 32,
                  '&:hover': {
                    bgcolor: '#444'
                  }
                }} 
                onClick={handleProfileClick}
              >
                <FaGraduationCap size={layout === 'discover' ? 20 : 16} />
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
                  {isCourseSaved ? 
                    <FaBookmark size={layout === 'discover' ? 18 : 14} /> : 
                    <FaRegBookmark size={layout === 'discover' ? 18 : 14} />
                  }
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
            color="white" 
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
