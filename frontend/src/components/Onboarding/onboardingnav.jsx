import React, { useState } from 'react';
import { Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import StepOneMajor from './interests';
import StepTwoPastCourses from './pastcourses';
import StepThreePreferencesRanking from './PreferencesRanking';
import StepFourPreferencesDescription from './PreferencesDescription';
import { useAuth } from '../../AuthContext';

const OnboardingNav = () => {
  const { user } = useAuth();
  const { setUserId, userPreferences } = useUser();
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const next = () => setStep((prev) => prev + 1);
  const back = () => setStep((prev) => prev - 1);
  const finish = async () => {
    setError('');
    
    try {
      if (!user?.email) throw new Error("Missing logged-in user info.");
      console.log('User email:', user.email);
      const res = await fetch('http://127.0.0.1:5000/api/users/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          major: userPreferences.major,
          goal_description: userPreferences.courseQuote,
          past_classes: userPreferences.otherCourses,
          top_classes: userPreferences.topCourses,
          liked: userPreferences.liked || 2.5,
          difficulty: userPreferences.difficulty || 2.5,
          practicality: userPreferences.practicality || 2.5,
          collaborative: userPreferences.collaborative || 2.5,
          rewarding: userPreferences.rewarding || 2.5,
          instruction: userPreferences.instruction || 2.5
        })
      });

      const json = await res.json();
      if (json.user_id) {
        console.log('User ID:', json.user_id);
        setUserId(json.user_id);
        navigate('/home');
      } else {
        setError('User creation failed.');
        console.error(json);
      }

    } catch (err) {
      console.error('User creation error:', err);
      setError(err.message || 'Unexpected error');
    }
  };

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