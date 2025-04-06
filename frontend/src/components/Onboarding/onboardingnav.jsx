import React, { useState } from 'react';
import { Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import StepOneMajor from './interests';
import StepTwoPastCourses from './pastcourses';
import StepThreePreferencesRanking from './PreferencesRanking';
import StepFourPreferencesDescription from './PreferencesDescription';

const OnboardingNav = () => {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const next = () => setStep((prev) => prev + 1);
  const back = () => setStep((prev) => prev - 1);
  const finish = () => navigate('/home');

  return (
    <Box sx={{ 
      width: '100%',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      bgcolor: '#0f0f0f',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background gradients */}
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
      
      {step === 1 && <StepOneMajor next={next} />}
      {step === 2 && <StepTwoPastCourses next={next} back={back} />}
      {step === 3 && <StepThreePreferencesRanking next={next} back={back} />}
      {step === 4 && <StepFourPreferencesDescription next={finish} back={back} />}
    </Box>
  );
};

export default OnboardingNav;