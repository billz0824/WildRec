import React, { useState, useEffect } from 'react';
import FeedPost from '../components/FeedPost';

const dummyPodcasts = [
  {
    id: 1,
    title: "Understanding Demand in Transportation Economics",
    description: "An introduction to the fundamental concepts of demand analysis in transportation economics.",
    videoUrl: "/videos/topic_1_understanding_demand_in_transportation_economics.mp4",
    thumbnail: "/thumbnails/topic_1.jpg",
    likes: 45,
    author: "Transportation Economics Team"
  },
  {
    id: 2,
    title: "Examining Cost Structures in Transportation Modes",
    description: "Deep dive into the various cost structures that affect different transportation modes.",
    videoUrl: "/videos/topic_2_examining_cost_structures_in_transportation_modes.mp4",
    thumbnail: "/thumbnails/topic_2.jpg",
    likes: 38,
    author: "Transportation Economics Team"
  },
  {
    id: 3,
    title: "Optimal Pricing Strategies for Transport Services",
    description: "Analysis of pricing strategies and their impact on transportation service providers.",
    videoUrl: "/videos/topic_3_optimal_pricing_strategies_for_transport_services.mp4",
    thumbnail: "/thumbnails/topic_3.jpg",
    likes: 52,
    author: "Transportation Economics Team"
  },
  {
    id: 4,
    title: "Introduction to Transportation Economics",
    description: "A comprehensive overview of transportation economics and its key concepts.",
    videoUrl: "/videos/topic_1_introduction_to__detailed_overview_of_course_content.mp4",
    thumbnail: "/thumbnails/topic_4.jpg",
    likes: 67,
    author: "Transportation Economics Team"
  }
];

const FeedPage = () => {
  const [podcasts, setPodcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Initialize with dummy data
  useEffect(() => {
    setPodcasts(dummyPodcasts);
    setLoading(false);
  }, []);

  // Handle navigation through videos
  const handleNext = () => {
    if (currentIndex < podcasts.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  if (loading) {
    return (
      <div className="bg-black min-h-screen flex justify-center items-center text-white">
        <div className="text-xl">Loading podcasts...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-black min-h-screen flex justify-center items-center text-white">
        <div className="text-xl text-red-400">{error}</div>
      </div>
    );
  }

  if (podcasts.length === 0) {
    return (
      <div className="bg-black min-h-screen flex justify-center items-center text-white">
        <div className="text-xl">No podcasts available</div>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen text-white overflow-hidden">
      <div className="flex flex-col w-full h-screen">
        {podcasts.map((podcast, index) => (
          <div 
            key={podcast.id}
            className={`w-full h-screen transition-all duration-500 ${index === currentIndex ? 'block' : 'hidden'}`}
          >
            <FeedPost post={podcast} />
          </div>
        ))}

        {/* Navigation buttons */}
        <div className="fixed right-6 top-1/2 transform -translate-y-1/2 flex flex-col gap-4 z-50">
          {currentIndex > 0 && (
            <button 
              onClick={handlePrev}
              className="bg-white/20 hover:bg-white/40 rounded-full w-12 h-12 flex justify-center items-center"
            >
              ↑
            </button>
          )}
          {currentIndex < podcasts.length - 1 && (
            <button 
              onClick={handleNext}
              className="bg-white/20 hover:bg-white/40 rounded-full w-12 h-12 flex justify-center items-center"
            >
              ↓
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedPage;