import React, { useState, useEffect } from 'react';
import FeedPost from '../components/FeedPost';

const FeedPage = () => {
  const [podcasts, setPodcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Fetch podcasts from API on component mount
  useEffect(() => {
    const fetchPodcasts = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:8000/api/podcasts');
        
        if (!response.ok) {
          throw new Error(`API returned status ${response.status}`);
        }
        
        const data = await response.json();
        setPodcasts(data.podcasts || []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching podcasts:', err);
        setError('Failed to load podcasts. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchPodcasts();
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