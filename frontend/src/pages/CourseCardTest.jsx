import React from 'react';
import CourseCard from '../components/CourseCard';

const CourseCardTest = () => {
  // Sample course data
  const sampleCourse = {
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
    quote: 'This course changed my perspective on programming. The instructor was amazing and the projects were challenging but rewarding.',
    location: 'Tech Building Room 101',
    schedule: 'MWF 10:00-11:00',
    prerequisites: 'None',
    requirements: 'Laptop required',
    description: 'An introductory course to computer science concepts and programming. Students will learn fundamental programming concepts, data structures, and algorithms. The course includes hands-on programming assignments and a final project.',
    likes: 1.2,
    comments: 0.5,
    saves: 0.8,
    shares: 0.3
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <h1 className="text-3xl font-bold text-white mb-8 text-center">CourseCard Component Test</h1>
      <CourseCard course={sampleCourse} />
    </div>
  );
};

export default CourseCardTest; 