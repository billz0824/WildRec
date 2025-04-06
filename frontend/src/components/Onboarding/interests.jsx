import React, { useState } from 'react';
import { useUser } from '../../context/UserContext';
import { Box, Typography, Select, MenuItem, Button } from '@mui/material';

const Interests = ({ next }) => {
  const { updatePreferences, getAvailableMajors } = useUser();
  const [major, setMajor] = useState('');
  
  const availableMajors = getAvailableMajors();

  const handleNext = () => {
    updatePreferences({ major });
    next();
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
        What's your major?
      </Typography>

      <Typography 
        sx={{ 
          textAlign: 'center', 
          mb: 2,
          color: 'rgba(255, 255, 255, 0.7)',
          fontSize: '0.9rem'
        }}
      >
        We'll use this to personalize your course recommendations
      </Typography>

      <Box sx={{ width: '100%', maxWidth: '400px' }}>
        <Select
          value={major}
          onChange={(e) => setMajor(e.target.value)}
          fullWidth
          displayEmpty
          MenuProps={{
            PaperProps: {
              sx: {
                bgcolor: '#1e1e1e',
                border: '1px solid rgba(168, 85, 247, 0.2)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
                '& .MuiMenuItem-root': {
                  color: 'white',
                  fontSize: '0.9rem',
                  padding: '12px 16px',
                  '&:hover': {
                    bgcolor: 'rgba(168, 85, 247, 0.1)',
                  },
                  '&.Mui-selected': {
                    bgcolor: 'rgba(168, 85, 247, 0.2)',
                    '&:hover': {
                      bgcolor: 'rgba(168, 85, 247, 0.3)',
                    }
                  }
                },
                '& .MuiList-root': {
                  padding: '8px 0',
                }
              }
            }
          }}
          sx={{
            bgcolor: '#1e1e1e',
            color: 'white',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(168, 85, 247, 0.2)',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(168, 85, 247, 0.3)',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#a855f7',
            },
            '& .MuiSelect-icon': {
              color: '#a855f7',
            }
          }}
        >
          <MenuItem value="" disabled>
            <Typography sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
              Choose your major
            </Typography>
          </MenuItem>
          {availableMajors.map((majorCode) => (
            <MenuItem 
              key={majorCode} 
              value={majorCode}
            >
              {majorCode}
            </MenuItem>
          ))}
        </Select>
      </Box>

      <Button
        onClick={handleNext}
        disabled={!major}
        variant="contained"
        sx={{
          mt: 4,
          bgcolor: major ? '#7c3aed' : '#2a2a2a',
          color: 'white',
          borderRadius: '12px',
          padding: '12px 32px',
          fontSize: '1rem',
          textTransform: 'none',
          boxShadow: major ? '0 4px 20px rgba(168, 85, 247, 0.2)' : 'none',
          border: `1px solid ${major ? 'rgba(168, 85, 247, 0.2)' : 'transparent'}`,
          '&:hover': {
            bgcolor: major ? '#6d28d9' : '#2a2a2a',
            boxShadow: major ? '0 4px 25px rgba(168, 85, 247, 0.3)' : 'none',
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
  );
};

export default Interests;