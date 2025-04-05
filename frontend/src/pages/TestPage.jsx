// src/pages/TestPage.jsx
import React from 'react';
import CourseCard from '../components/CourseCard';

const TestPage = () => {
  const course = {
    number: "COMP_SCI 340",
    name: "Introduction to Networking",
    professor: "Alexander Kuzmanovic",
    radarData: {
      liked: 4,
      difficulty: 5,
      practicality: 4,
      collaborative: 3,
      rewarding: 5,
      instruction: 4,
    },
    quote: "Super difficult, hard exams, learned a lot",
    location: "Tech LR2",
    schedule: "MW 2:00–3:20",
    prerequisites: "CS211, CS213",
    requirements: "Satisfies Systems Breadth, technical elective, Distro theme",
    description: "Covers Internet architecture, protocols, and network analysis. Strong emphasis on packet-level operations and simulations.",
    likes: 10,
    comments: 2,
    saves: 8,
    shares: 5,
  };

  return (
    <div className="bg-black min-h-screen flex items-center justify-center p-8">
      <CourseCard course={course} />
    </div>
  );
};

export default TestPage;