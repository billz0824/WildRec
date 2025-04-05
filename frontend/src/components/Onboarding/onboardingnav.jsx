import React, { useState } from 'react';
import StepOneMajor from './interests';
import StepTwoPreferences from './preferences';
import StepThreePastCourses from './pastcourses';
import { useNavigate } from 'react-router-dom';

const OnboardingNav = () => {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const next = () => setStep((prev) => prev + 1);
  const back = () => setStep((prev) => prev - 1);

  const finish = () => {
    // Navigate to home after onboarding
    navigate('/home');
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      {step === 1 && <StepOneMajor next={next} />}
      {step === 2 && <StepTwoPreferences next={next} back={back} />}
      {step === 3 && <StepThreePastCourses next={finish} back={back} />}
    </div>
  );
};

export default OnboardingNav;