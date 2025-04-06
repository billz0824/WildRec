import React from 'react';
import OnboardingNav from '../components/Onboarding/onboardingnav';
import { Box } from '@mui/material';

const OnboardingPage = () => {
  return (
    <Box 
      sx={{ 
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
      }}
    >
      {/* Background gradient */}
      <Box 
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at top right, rgba(168, 85, 247, 0.15), rgba(15, 15, 15, 0) 50%)',
          pointerEvents: 'none'
        }}
      />
      <Box 
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at bottom left, rgba(124, 58, 237, 0.1), rgba(15, 15, 15, 0) 50%)',
          pointerEvents: 'none'
        }}
      />

      {/* Content */}
      <Box 
        sx={{ 
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          zIndex: 1,
          p: 4
        }}
      >
        <OnboardingNav />
      </Box>
    </Box>
  );
};

export default OnboardingPage;