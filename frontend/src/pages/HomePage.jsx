import React, { useState } from 'react';
import CourseCard from '../components/CourseCard';

const sampleCourses = [
  {
    number: "COMP_SCI 340",
    name: "Introduction to Networking",
    professor: "Alexander Kuzmanovic",
    radarData: { liked: 4, difficulty: 5, practicality: 4, collaborative: 3, rewarding: 5, instruction: 4 },
    quote: "Super difficult, hard exams, learned a lot",
    location: "Tech LR2",
    schedule: "MW 2:00–3:20",
    prerequisites: "CS211, CS213",
    requirements: "Systems Breadth, technical elective, Distro theme",
    description: "Explore Internet protocols, packet-level analysis, and simulations.",
    likes: 10,
    comments: 2,
    saves: 8,
    shares: 5,
  },
  {
    number: "COMP_SCI 330",
    name: "Human-Computer Interaction",
    professor: "Dr. Jessica Hullman",
    radarData: { liked: 5, difficulty: 2, practicality: 5, collaborative: 5, rewarding: 4, instruction: 5 },
    quote: "Creative projects, great for design lovers",
    location: "Annenberg G21",
    schedule: "TT 3:00–4:20",
    prerequisites: "None",
    requirements: "Design Breadth, CS Elective",
    description: "Design user interfaces, run usability tests, and build prototypes.",
    likes: 14,
    comments: 3,
    saves: 11,
    shares: 6,
  },
  // Add more courses as needed
];

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCourses = sampleCourses.filter(course => {
    const searchLower = searchQuery.toLowerCase();
    return (
      course.name.toLowerCase().includes(searchLower) ||
      course.number.toLowerCase().includes(searchLower) ||
      course.professor.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="bg-black min-h-screen p-10 text-white">
      <h1 className="text-3xl font-bold mb-8">All Courses</h1>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search by course name, number, or professor..."
        className="w-full max-w-xl mb-8 px-4 py-2 rounded bg-gray-800 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-600"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
        {filteredCourses.map((course, idx) => (
          <CourseCard key={idx} course={course} />
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <p className="mt-10 text-gray-400 text-center">No courses found.</p>
      )}
    </div>
  );
};

export default HomePage;