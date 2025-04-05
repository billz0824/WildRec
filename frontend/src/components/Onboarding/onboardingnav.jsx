import React, { useState } from 'react';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import StepOneMajor from './interests';
import StepTwoPreferences from './preferences';
import StepThreePastCourses from './pastcourses';
import { useNavigate } from 'react-router-dom';

const OnboardingNav = () => {
  const [step, setStep] = useState(0);
  const [error, setError] = useState('');
  const navigate = useNavigate();

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

      setStep(1); // continue onboarding
    } catch (err) {
      console.error(err);
      setError('Google login failed: ' + err.message);
    }
  };

  const next = () => setStep((prev) => prev + 1);
  const back = () => setStep((prev) => prev - 1);

  const finish = () => {
    navigate('/home');
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      {step === 0 && (
        <div className="flex flex-col gap-4 bg-gray-900 p-6 rounded-xl shadow-lg w-full max-w-sm">
          <h2 className="text-xl font-semibold text-center">Login to WildRec</h2>
          <button
            onClick={handleGoogleLogin}
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded text-center"
          >
            Sign in with Google
          </button>
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
        </div>
      )}
      {step === 1 && <StepOneMajor next={next} />}
      {step === 2 && <StepTwoPreferences next={next} back={back} />}
      {step === 3 && <StepThreePastCourses next={finish} back={back} />}
    </div>
  );
};

export default OnboardingNav;
