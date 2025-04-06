import React, { useState } from 'react';
import { useUser } from '../../context/UserContext';
import { Box, Typography, TextField, Button } from '@mui/material';

const PastCourses = ({ next, back }) => {
  const { updatePreferences } = useUser();
  const [topCourses, setTopCourses] = useState(['', '', '']);
  const [otherCourses, setOtherCourses] = useState('');

  const handleTopCourseChange = (index, value) => {
    const newTopCourses = [...topCourses];
    newTopCourses[index] = value;
    setTopCourses(newTopCourses);
  };

  const handleNext = () => {
    updatePreferences({
      topCourses,
      otherCourses: otherCourses.split(',').map(course => course.trim()).filter(course => course)
    });
    next();
  };

  const isValid = topCourses.filter(course => course.trim()).length > 0;

  const commonTextFieldStyles = {
    '& .MuiOutlinedInput-root': {
      bgcolor: '#1e1e1e',
      color: 'white',
      '& fieldset': {
        borderColor: 'rgba(168, 85, 247, 0.2)',
      },
      '&:hover fieldset': {
        borderColor: 'rgba(168, 85, 247, 0.3)',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#a855f7',
      },
    },
    '& .MuiInputLabel-root': {
      color: 'rgba(255, 255, 255, 0.7)',
    },
    '& .MuiInputBase-input': {
      '&::placeholder': {
        color: 'rgba(255, 255, 255, 0.5)',
        opacity: 1,
      },
    },
    '& .MuiAutocomplete-paper': {
      bgcolor: '#1e1e1e',
      color: 'white',
      border: '1px solid rgba(168, 85, 247, 0.2)',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
    },
    '& .MuiAutocomplete-listbox': {
      bgcolor: '#1e1e1e',
      '& .MuiAutocomplete-option': {
        color: 'white',
        '&[data-focus="true"]': {
          bgcolor: 'rgba(168, 85, 247, 0.1)',
        },
        '&[aria-selected="true"]': {
          bgcolor: 'rgba(168, 85, 247, 0.2)',
        },
      },
    },
  };

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: '600px',
        mx: 'auto',
        p: 4,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4
      }}
    >
      <Typography 
        variant="h4" 
        sx={{ 
          fontWeight: 700,
          textAlign: 'center',
          mb: 1,
          background: 'linear-gradient(to right, #a855f7, #7c3aed)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          color: 'transparent',
        }}
      >
        Your Course History
      </Typography>

      <Typography 
        sx={{ 
          textAlign: 'center', 
          mb: 2,
          color: 'rgba(255, 255, 255, 0.7)',
          fontSize: '0.9rem'
        }}
      >
        Tell us about the courses you've enjoyed to help us make better recommendations
      </Typography>

      <Box sx={{ width: '100%', maxWidth: '400px' }}>
        <Typography 
          variant="h6" 
          sx={{ 
            mb: 2,
            color: 'white',
            fontSize: '1rem',
            fontWeight: 'bold'
          }}
        >
          Top 3 Courses You've Taken
        </Typography>
        
        {topCourses.map((course, index) => (
          <TextField
            key={index}
            fullWidth
            placeholder={`Course ${index + 1} (e.g., COMP_SCI 211)`}
            value={course}
            onChange={(e) => handleTopCourseChange(index, e.target.value)}
            sx={{
              mb: 2,
              ...commonTextFieldStyles
            }}
          />
        ))}

        <Typography 
          variant="h6" 
          sx={{ 
            mt: 4,
            mb: 2,
            color: 'white',
            fontSize: '1rem',
            fontWeight: 'bold'
          }}
        >
          Other Courses (Optional)
        </Typography>
        
        <TextField
          fullWidth
          multiline
          rows={3}
          placeholder="Enter other courses, separated by commas"
          value={otherCourses}
          onChange={(e) => setOtherCourses(e.target.value)}
          sx={commonTextFieldStyles}
        />
      </Box>

      <Box 
        sx={{ 
          display: 'flex', 
          gap: 2, 
          mt: 4,
          width: '100%',
          maxWidth: '400px',
          justifyContent: 'space-between'
        }}
      >
        <Button
          onClick={back}
          variant="contained"
          sx={{
            bgcolor: '#2a2a2a',
            color: 'white',
            borderRadius: '12px',
            padding: '12px 24px',
            fontSize: '1rem',
            textTransform: 'none',
            '&:hover': {
              bgcolor: '#3a3a3a',
            },
          }}
        >
          Back
        </Button>

        <Button
          onClick={handleNext}
          disabled={!isValid}
          variant="contained"
          sx={{
            bgcolor: isValid ? '#7c3aed' : '#2a2a2a',
            color: 'white',
            borderRadius: '12px',
            padding: '12px 24px',
            fontSize: '1rem',
            textTransform: 'none',
            boxShadow: isValid ? '0 4px 20px rgba(168, 85, 247, 0.2)' : 'none',
            border: `1px solid ${isValid ? 'rgba(168, 85, 247, 0.2)' : 'transparent'}`,
            '&:hover': {
              bgcolor: isValid ? '#6d28d9' : '#2a2a2a',
              boxShadow: isValid ? '0 4px 25px rgba(168, 85, 247, 0.3)' : 'none',
            },
            '&.Mui-disabled': {
              bgcolor: '#2a2a2a',
              color: 'rgba(255, 255, 255, 0.3)',
            }
          }}
        >
          Continue
        </Button>
      </Box>
    </Box>
  );
};

export default PastCourses;