import React, { useState, useRef, useEffect } from 'react';
import InteractiveVideoPlayer from './InteractiveVideoPlayer';
import './PodcastFeed.css';

function PodcastFeed() {
  const [podcasts, setPodcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const feedRef = useRef(null);
  const videoRefs = useRef([]);

  // Fetch podcasts from API on component mount
  useEffect(() => {
    const fetchPodcasts = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/podcasts');
        
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

  // Set up intersection observer to detect which video is in view
  useEffect(() => {
    if (podcasts.length === 0) return;
    
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.8, // 80% of the item needs to be visible
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const index = Number(entry.target.dataset.index);
          setCurrentIndex(index);
          
          // Pause all videos except the current one
          videoRefs.current.forEach((ref, i) => {
            if (i === index) {
              ref?.play();
            } else {
              ref?.pause();
            }
          });
        }
      });
    }, options);

    // Observe all video containers
    const videoContainers = document.querySelectorAll('.podcast-item');
    videoContainers.forEach(container => {
      observer.observe(container);
    });

    return () => {
      videoContainers.forEach(container => {
        observer.unobserve(container);
      });
    };
  }, [podcasts.length]);

  // Handle manual scrolling to next/previous
  const scrollToIndex = (index) => {
    if (index >= 0 && index < podcasts.length) {
      const element = document.querySelector(`[data-index="${index}"]`);
      element?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (loading) {
    return <div className="loading-screen">Loading podcasts...</div>;
  }

  if (error) {
    return <div className="error-screen">{error}</div>;
  }

  if (podcasts.length === 0) {
    return <div className="empty-screen">No podcasts available</div>;
  }

  return (
    <div className="podcast-feed-container">
      <div className="podcast-feed" ref={feedRef}>
        {podcasts.map((podcast, index) => (
          <div 
            key={podcast.id} 
            className="podcast-item" 
            data-index={index}
          >
            <InteractiveVideoPlayer 
              videoSrc={podcast.videoUrl} 
              podcastId={podcast.id}
              title={podcast.title}
              ref={el => videoRefs.current[index] = el}
              autoplay={index === 0}
            />
            
            <div className="podcast-info">
              <h3>{podcast.title}</h3>
              <p>{podcast.description}</p>
            </div>
            
            <div className="navigation-controls">
              {index > 0 && (
                <button 
                  className="nav-button prev-button" 
                  onClick={() => scrollToIndex(index - 1)}
                >
                  ↑
                </button>
              )}
              {index < podcasts.length - 1 && (
                <button 
                  className="nav-button next-button" 
                  onClick={() => scrollToIndex(index + 1)}
                >
                  ↓
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PodcastFeed;