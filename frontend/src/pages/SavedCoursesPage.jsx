import React from 'react';
import CourseCard from '../components/CourseCard';

const SavedCoursesPage = () => {
  // This would typically come from your backend/state management
  const savedCourses = [
    {
      id: 1,
      number: 'CS 101',
      name: 'Introduction to Computer Science',
      professor: 'Dr. Smith',
      radarData: {
        liked: 4,
        difficulty: 3,
        practicality: 5,
        collaborative: 4,
        rewarding: 5,
        instruction: 4
      },
      quote: 'This course changed my perspective on programming',
      location: 'Tech Building Room 101',
      schedule: 'MWF 10:00-11:00',
      prerequisites: 'None',
      requirements: 'Laptop required',
      description: 'An introductory course to computer science concepts and programming',
      saves: 1.2,
      comments: 0.5,
      shares: 0.3
    },
    // Add more sample courses as needed
  ];

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Saved Courses</h1>
          <p className="text-gray-400 mt-2">Your collection of saved courses</p>
        </div>

        {savedCourses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No saved courses yet</p>
            <p className="text-gray-500 text-sm mt-2">Save courses to see them here</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedCourses.map(course => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedCoursesPage;
