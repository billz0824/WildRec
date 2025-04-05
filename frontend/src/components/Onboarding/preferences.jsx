import React, { useState } from 'react';
import { useUser } from '../../context/UserContext';

const StepTwoPreferences = ({ next, back }) => {
  const { updatePreferences } = useUser();
  const [preferenceText, setPreferenceText] = useState('');

  const handleNext = () => {
    updatePreferences({ coursePreferenceDescription: preferenceText });
    next();
  };

  return (
    <div className="onboarding-step dark text-white p-8 max-w-lg mx-auto">
      <h2 className="text-2xl font-bold mb-6">What are you looking for in a course?</h2>

      <textarea
        className="w-full h-40 p-3 rounded bg-gray-800 border border-gray-600"
        placeholder="Write a short description. For example: 'I enjoy hands-on, project-based classes with collaborative work and real-world applications.'"
        value={preferenceText}
        onChange={(e) => setPreferenceText(e.target.value)}
      />

      <div className="flex justify-between mt-6">
        <button
          onClick={back}
          className="px-4 py-2 bg-gray-700 rounded text-white hover:bg-gray-600"
        >
          Back
        </button>

        <button
          onClick={handleNext}
          className="px-4 py-2 bg-purple-600 rounded text-white hover:bg-purple-700"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default StepTwoPreferences;