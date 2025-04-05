import React, { useState } from 'react';
import { useUser } from '../../context/UserContext';

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

  return (
    <div className="onboarding-step dark text-white p-8 max-w-lg mx-auto">
      <h2 className="text-2xl font-bold mb-6">Tell us about your past courses</h2>

      <div className="mb-6">
        <h3 className="text-lg font-medium mb-4">Top 3 Courses You've Taken</h3>
        {topCourses.map((course, index) => (
          <div key={index} className="mb-4">
            <label className="block">
              <span className="text-sm font-medium">Course {index + 1}</span>
              <input
                className="w-full mt-1 p-2 rounded bg-gray-800 border border-gray-600"
                placeholder={`Enter course ${index + 1}`}
                value={course}
                onChange={(e) => handleTopCourseChange(index, e.target.value)}
              />
            </label>
          </div>
        ))}
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-medium mb-4">Other Courses (Optional)</h3>
        <label className="block">
          <span className="text-sm font-medium">Additional Courses</span>
          <textarea
            className="w-full mt-1 p-2 rounded bg-gray-800 border border-gray-600"
            placeholder="Enter other courses, separated by commas"
            value={otherCourses}
            onChange={(e) => setOtherCourses(e.target.value)}
            rows={3}
          />
        </label>
      </div>

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
          Finish
        </button>
      </div>
    </div>
  );
};

export default PastCourses;