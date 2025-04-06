// CourseCard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import RadarChart from './RadarChart';
import { Card, CardContent, Typography, Box, IconButton, Chip, Tooltip, Avatar } from '@mui/material';
import { FaBookmark, FaRegBookmark, FaGraduationCap } from 'react-icons/fa';

const CourseCard = ({ course, showSaveButton = false, onToggleSave, layout = 'grid' }) => {
  const navigate = useNavigate();

  const handleProfileClick = () => {
    navigate(`/courseprofile/${course.id}`);
  };

  const handleSaveClick = async () => {
    if (onToggleSave) {
      onToggleSave(course);
    }
  };

  const roundToHalf = (val) => Math.round(val * 2) / 2;

  // Split requirements into an array
  const requirementTags = Array.isArray(course.requirements)
    ? course.requirements
    : [];

  const { 
    liked = 2.5, 
    difficulty = 2.5, 
    practicality = 2.5, 
    collaborative = 2.5, 
    rewarding = 2.5, 
    instruction = 2.5 
  } = course.radarData || {};

  // Create a new object with each value rounded
  const roundedRadarData = {
    liked: roundToHalf(liked),
    difficulty: roundToHalf(difficulty),
    practicality: roundToHalf(practicality),
    collaborative: roundToHalf(collaborative),
    rewarding: roundToHalf(rewarding),
    instruction: roundToHalf(instruction)
  };

  return (
    <Card
  sx={{
    bgcolor: '#1e1e1e',
    color: 'white',
    borderRadius: 2,
    position: 'relative',
    width: '100%',
    '&:hover': {
      boxShadow: '0 0 10px rgba(168, 85, 247, 0.2)',
    },
    mb: 2, // bottom margin between cards
  }}
>
  <CardContent
    sx={{
      display: 'flex',
      flexDirection: 'column',
      p: layout === 'discover' ? 3 : 2,
      gap: 2,
    }}
  >
    {/* Header */}
    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
      <Box>
        <Typography
          variant="subtitle2"
          sx={{ color: '#a855f7', fontSize: layout === 'discover' ? '1rem' : '0.8rem' }}
        >
          {course.number}
        </Typography>
        <Typography
          variant="h6"
          sx={{
            fontSize: layout === 'discover' ? '1.5rem' : '1rem',
            fontWeight: 'bold',
            lineHeight: 1.2,
            mt: 0.5,
          }}
        >
          {course.name}
        </Typography>
        <Typography
          variant="caption"
          color="gray"
          sx={{ fontSize: layout === 'discover' ? '0.9rem' : '0.75rem', display: 'block', mt: 1 }}
        >
          Instructor: {course.professor}
        </Typography>
      </Box>
      <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
        <Tooltip title="Go to course profile">
          <Avatar
            sx={{
              bgcolor: '#333',
              cursor: 'pointer',
              width: layout === 'discover' ? 40 : 32,
              height: layout === 'discover' ? 40 : 32,
              '&:hover': {
                bgcolor: '#444',
              },
            }}
            onClick={handleProfileClick}
          >
            <FaGraduationCap size={layout === 'discover' ? 20 : 16} />
          </Avatar>
        </Tooltip>
        {showSaveButton && (
          <Tooltip title={course.isSaved ? 'Unsave' : 'Save course'}>
            <IconButton
              onClick={handleSaveClick}
              sx={{
                color: course.isSaved ? '#a855f7' : 'white',
                padding: 0,
                '&:hover': {
                  color: '#a855f7',
                },
              }}
            >
              {course.isSaved ? (
                <FaBookmark size={layout === 'discover' ? 18 : 14} />
              ) : (
                <FaRegBookmark size={layout === 'discover' ? 18 : 14} />
              )}
            </IconButton>
          </Tooltip>
        )}
      </Box>
    </Box>

    {/* Radar Chart */}
    <Box display="flex" justifyContent="center">
      <Box sx={{ transform: 'scale(0.9)', transformOrigin: 'center', width: '100%' }}>
        <RadarChart data={roundedRadarData} />
      </Box>
    </Box>

    {/* Quote */}
    <Typography
      variant="body2"
      fontStyle="italic"
      textAlign="center"
      color="gray"
      sx={{ fontSize: '0.75rem', px: 2 }}
    >
      "{course.quote}"
    </Typography>

    {/* Requirement Tags */}
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
              px: 1,
            },
          }}
        />
      ))}
    </Box>

    {/* Prerequisites */}
    <Typography
      color="gray"
      textAlign="center"
      sx={{ fontSize: '0.7rem' }}
    >
      <strong style={{ color: '#bbb' }}>Pre-Requisites:</strong> {course.prerequisites}
    </Typography>

    {/* Description */}
    <Box
      sx={{
        bgcolor: '#2c2c2c',
        borderRadius: 1,
        display: 'flex',
        flexDirection: 'column',
        px: 1.5,
        pt: 1.5,
        pb: 1,
        maxHeight: 120,
        overflowY: 'auto',
      }}
    >
      <Typography
        variant="caption"
        color="white"
        sx={{
          fontSize: '0.7rem',
          pb: 0.5,
          borderBottom: '1px solid #444',
        }}
      >
        Course Description:
      </Typography>
      <Typography
        variant="body2"
        color="gray"
        sx={{ fontSize: '0.75rem', mt: 1 }}
      >
        {course.description}
      </Typography>
    </Box>
  </CardContent>
</Card>

  );
};

export default CourseCard;
