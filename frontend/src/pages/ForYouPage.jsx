import React, { useState } from 'react';
import { useSwipeable } from 'react-swipeable';
import CourseCard from '../components/CourseCard';

const dummyCourses = [
  {
    id: 'cs340',
    number: 'COMP_SCI 340',
    name: 'Introduction to Networking',
    professor: 'Alexander Kuzmanovic',
    radarData: { liked: 4, difficulty: 5, practicality: 4, collaborative: 3, rewarding: 5, instruction: 4 },
    quote: 'Super difficult, hard exams, learned a lot',
    location: 'Tech LR2',
    schedule: 'MW 2:00–3:20',
    prerequisites: 'CS211, CS213',
    requirements: 'Systems Breadth, technical elective, Distro theme',
    description: 'Explore Internet protocols, packet-level analysis, and simulations.',
    saved: false,
  },
  {
    id: 'cs330',
    number: 'COMP_SCI 330',
    name: 'HCI',
    professor: 'Jessica Hullman',
    radarData: { liked: 5, difficulty: 2, practicality: 5, collaborative: 5, rewarding: 4, instruction: 5 },
    quote: 'Creative and hands-on!',
    location: 'Annenberg G21',
    schedule: 'TT 3:00–4:20',
    prerequisites: 'None',
    requirements: 'Design Elective',
    description: 'Design UIs, run usability studies, build prototypes.',
    saved: false,
  },
];

const ForYouPage = () => {
  const [index, setIndex] = useState(0);
  const [courses, setCourses] = useState(dummyCourses);

  const goNext = () => {
    if (index < courses.length - 1) {
      setIndex(index + 1);
    }
  };

  const goPrev = () => {
    if (index > 0) {
      setIndex(index - 1);
    }
  };

  const handlers = useSwipeable({
    onSwipedUp: () => goNext(),
    onSwipedDown: () => goPrev(),
    preventScrollOnSwipe: true,
    trackMouse: true // enable desktop swipe with click-drag
  });

  const toggleSave = (id) => {
    setCourses(prev =>
      prev.map(c => (c.id === id ? { ...c, saved: !c.saved } : c))
    );
  };

  return (
    <div
      {...handlers}
      className="bg-black h-screen overflow-hidden text-white flex justify-center items-center relative"
    >
      {courses.length > 0 && (
        <div className="w-full h-full flex items-center justify-center">
          <div className="relative w-full max-w-lg h-full flex flex-col items-center justify-center p-6">
            <CourseCard course={courses[index]} />

            {/* Save button */}
            <button
              onClick={() => toggleSave(courses[index].id)}
              className="absolute right-6 top-6 bg-gray-800 px-4 py-2 rounded hover:bg-purple-600 text-sm"
            >
              {courses[index].saved ? 'Saved ✓' : 'Save'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ForYouPage;