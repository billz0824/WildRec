import React, { useState } from 'react';
import { useUser } from '../../context/UserContext';
import { Box, Typography, TextField, Button } from '@mui/material';

const PreferencesDescription = ({ next, back }) => {
  const { updatePreferences } = useUser();
  const [description, setDescription] = useState('');

  const handleNext = () => {
    updatePreferences({ coursePreferencesDescription: description });
    next();
  };

  const isValid = description.trim().length > 0;

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
        Tell us more about your preferences
      </Typography>

      <Typography 
        sx={{ 
          textAlign: 'center', 
          mb: 2,
          color: 'rgba(255, 255, 255, 0.7)',
          fontSize: '0.9rem',
          maxWidth: '400px'
        }}
      >
        Help us understand what you're looking for in your courses. This will help us provide more personalized recommendations.
      </Typography>

      <Box sx={{ width: '100%', maxWidth: '400px' }}>
        <TextField
          fullWidth
          multiline
          rows={6}
          placeholder="Describe what you're looking for in your courses. "
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          sx={{
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
                whiteSpace: 'pre-line',
              },
            },
          }}
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
          Finish
        </Button>
      </Box>
    </Box>
  );
};

export default PreferencesDescription; 