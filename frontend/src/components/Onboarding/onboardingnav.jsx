import React, { useState, useEffect } from 'react';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { Box, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import GlitchText from './GlitchText';
import SplashCursor from './SplashCursor';
import StepOneMajor from './interests';
import StepTwoPastCourses from './pastcourses';
import StepThreePreferencesRanking from './PreferencesRanking';
import StepFourPreferencesDescription from './PreferencesDescription';

const OnboardingNav = () => {
  const [step, setStep] = useState(0);
  const [error, setError] = useState('');
  const [showLoginButton, setShowLoginButton] = useState(false);
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoginButton(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleGoogleLogin = async () => {
    setError('');
    const provider = new GoogleAuthProvider();
    const auth = getAuth();

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      if (!user.email.endsWith('@u.northwestern.edu')) {
        setError('Only @u.northwestern.edu emails are allowed.');
        await auth.signOut();
        return;
      }
      
      setStep(1);
    } catch (err) {
      console.error(err);
      setError('Google login failed: ' + err.message);
    }
  };

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
      
      <SplashCursor 
        color="#a855f7"
        size={30}
        blur={25}
        trail={true}
        trailLength={8}
      />
      
      {step === 0 && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
            position: 'relative',
            zIndex: 1,
            maxWidth: '600px',
            width: '100%',
            p: 4
          }}
        >
          <Box 
            sx={{ 
              transform: 'scale(1.5)',
              mb: 6,
              textAlign: 'center'
            }}
          >
            <GlitchText
              speed={1}
              enableShadows={true}
              enableOnHover={false}
              className='custom-class'
              style={{
                color: '#a855f7',
                fontSize: '3.5rem',
                fontWeight: 'bold',
                letterSpacing: '0.05em',
                textShadow: '0 0 20px rgba(168, 85, 247, 0.3)'
              }}
            >
              WildRec
            </GlitchText>
            <Typography 
              variant="h6" 
              sx={{ 
                color: 'rgba(255, 255, 255, 0.7)',
                mt: 2,
                fontSize: '1rem',
                fontWeight: 'normal',
                letterSpacing: '0.05em',
                textAlign: 'center',
                maxWidth: '400px',
                mx: 'auto'
              }}
            >
              Your personalized course discovery platform for Northwestern
            </Typography>
          </Box>

          {showLoginButton && (
            <Box sx={{ textAlign: 'center' }}>
              <Button
                variant="contained"
                onClick={handleGoogleLogin}
                sx={{
                  backgroundColor: '#1e1e1e',
                  color: 'white',
                  borderRadius: '12px',
                  padding: '16px 32px',
                  fontSize: '1.1rem',
                  textTransform: 'none',
                  boxShadow: '0 4px 20px rgba(168, 85, 247, 0.2)',
                  border: '1px solid rgba(168, 85, 247, 0.2)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 2,
                  animation: 'buttonAppear 0.5s ease forwards',
                  '@keyframes buttonAppear': {
                    from: {
                      opacity: 0,
                      transform: 'translateY(20px)'
                    },
                    to: {
                      opacity: 1,
                      transform: 'translateY(0)'
                    }
                  },
                  '&:hover': {
                    backgroundColor: '#2d2d2d',
                    boxShadow: '0 4px 25px rgba(168, 85, 247, 0.3)',
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                Sign in with Northwestern
              </Button>
              <Typography 
                variant="caption" 
                sx={{ 
                  display: 'block',
                  color: 'rgba(255, 255, 255, 0.5)',
                  mt: 2,
                  fontSize: '0.8rem'
                }}
              >
                Only @u.northwestern.edu emails are allowed
              </Typography>
            </Box>
          )}

          {error && (
            <Box
              sx={{
                mt: 2,
                color: '#ef4444',
                fontSize: '0.9rem',
                textAlign: 'center',
                p: 2,
                borderRadius: '8px',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)'
              }}
            >
              {error}
            </Box>
          )}
        </Box>
      )}

      {step === 1 && <StepOneMajor next={next} />}
      {step === 2 && <StepTwoPastCourses next={next} back={back} />}
      {step === 3 && <StepThreePreferencesRanking next={next} back={back} />}
      {step === 4 && <StepFourPreferencesDescription next={finish} back={back} />}
    </Box>
  );
};

export default OnboardingNav;