import React, { useState } from 'react';
import { useSwipeable } from 'react-swipeable';
import CourseCard from '../components/CourseCard';


const mixedFeed = [
  {
    type: 'course',
    id: 'cs340',
    number: 'COMP_SCI 340',
    name: 'Networking',
    professor: 'Alexander Kuzmanovic',
    radarData: { liked: 4, difficulty: 5, practicality: 4, collaborative: 3, rewarding: 5, instruction: 4 },
    quote: 'Hard exams, learned a lot!',
    location: 'Tech LR2',
    schedule: 'MW 2:00–3:20',
    prerequisites: 'CS211, CS213',
    requirements: 'Systems Breadth, Elective',
    description: 'Covers Internet protocols and simulations.',
    saved: false,
    profileImage: '/cs340.png',
  },
  {
    type: 'post',
    id: 'post1',
    profileImage: '/cs349.png',
    caption: 'Here’s a great resource on decision trees!',
    timestamp: '1 hour ago',
    media: 'https://samplelib.com/lib/preview/mp4/sample-5s.mp4',
    liked: false,
    courseId: 'cs349',
  },
  {
    type: 'course',
    id: 'cs330',
    number: 'COMP_SCI 330',
    name: 'HCI',
    professor: 'Jessica Hullman',
    radarData: { liked: 5, difficulty: 2, practicality: 5, collaborative: 5, rewarding: 4, instruction: 5 },
    quote: 'Fun and project-based!',
    location: 'Annenberg G21',
    schedule: 'TT 3:00–4:20',
    prerequisites: 'None',
    requirements: 'Design Elective',
    description: 'Design user interfaces and usability studies.',
    saved: false,
    profileImage: '/cs330.png',
  },
  {
    type: 'post',
    id: 'post2',
    profileImage: '/cs330.png',
    caption: 'Quick breakdown of Fitts’s Law (HCI concept)! 🎯',
    timestamp: '3 hours ago',
    media: 'https://samplelib.com/lib/preview/mp4/sample-5s.mp4',
    liked: false,
    courseId: 'cs330',
  },
];

const DiscoverPage = () => {
  const [index, setIndex] = useState(0);
  const [feed, setFeed] = useState(mixedFeed);

  const goNext = () => {
    if (index < feed.length - 1) setIndex(index + 1);
  };

  const goPrev = () => {
    if (index > 0) setIndex(index - 1);
  };

  const handlers = useSwipeable({
    onSwipedUp: goNext,
    onSwipedDown: goPrev,
    trackMouse: true,
    preventScrollOnSwipe: true,
  });

  const toggleSave = (id) => {
    setFeed((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, saved: !item.saved } : item
      )
    );
  };

  const toggleLike = (id) => {
    setFeed((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, liked: !item.liked } : item
      )
    );
  };

  const currentItem = feed[index];

  return (
    <div
      {...handlers}
      className="bg-black text-white h-screen w-full flex justify-center items-center overflow-hidden relative"
    >
      <div className="w-full max-w-lg h-full flex flex-col items-center justify-center p-6 relative">
        {currentItem.type === 'course' && (
          <>
            <CourseCard course={currentItem} />
            <button
              onClick={() => toggleSave(currentItem.id)}
              className="absolute top-6 right-6 px-4 py-2 bg-gray-800 rounded hover:bg-purple-600 text-sm"
            >
              {currentItem.saved ? 'Saved ✓' : 'Save'}
            </button>
          </>
        )}

        {currentItem.type === 'post' && (
          <div className="bg-zinc-900 w-full max-w-xl rounded-lg overflow-hidden shadow-md">
            <div className="flex items-center gap-3 p-4">
              <img
                src={currentItem.profileImage}
                alt="course avatar"
                className="h-10 w-10 rounded-full cursor-pointer"
                onClick={() => window.location.href = `/course/${currentItem.courseId}`}
              />
              <span className="font-semibold text-sm">Anonymous</span>
            </div>

            <video
              className="w-full"
              controls
              src={currentItem.media}
              style={{ maxHeight: '400px', backgroundColor: '#000' }}
            />

            <div className="p-4">
              <p className="text-sm text-gray-300 mb-2">
                <span className="font-bold">Anonymous</span> {currentItem.caption}
              </p>
              <p className="text-xs text-gray-500 mb-3">{currentItem.timestamp}</p>
              <button
                onClick={() => toggleLike(currentItem.id)}
                className={`text-sm px-3 py-1 rounded ${currentItem.liked ? 'bg-purple-600' : 'bg-gray-800'} hover:bg-purple-500`}
              >
                {currentItem.liked ? 'Liked ♥' : 'Like'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiscoverPage;