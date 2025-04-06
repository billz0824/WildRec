import React from 'react';

const VideoDebug = ({ videoData }) => {
  const fullUrl = videoData.videoUrl.startsWith('http') 
    ? videoData.videoUrl 
    : `http://localhost:8000${videoData.videoUrl}`;

  return (
    <div className="bg-black/90 text-white p-4 rounded-lg shadow-lg max-w-lg mx-auto mt-4">
      <h2 className="text-xl font-bold mb-2">Video Debug Info</h2>
      <div className="grid grid-cols-1 gap-2 text-sm">
        <div>
          <span className="font-semibold">Video ID:</span> {videoData.id || 'Not provided'}
        </div>
        <div>
          <span className="font-semibold">Title:</span> {videoData.title || 'No title'}
        </div>
        <div>
          <span className="font-semibold">Video URL (as provided):</span>
          <div className="bg-gray-800 p-1 rounded text-xs overflow-x-auto">
            {videoData.videoUrl || 'None'}
          </div>
        </div>
        <div>
          <span className="font-semibold">Full URL (for browser):</span>
          <div className="bg-gray-800 p-1 rounded text-xs overflow-x-auto">
            {fullUrl}
          </div>
        </div>
        <div className="mt-2">
          <span className="font-semibold">Test Loading:</span>
          <div className="flex space-x-2 mt-1">
            <a 
              href={fullUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs"
            >
              Open Video URL
            </a>
            <button
              onClick={() => fetch(fullUrl).then(r => {
                if (r.ok) {
                  alert(`Video loaded successfully! Status: ${r.status}`);
                } else {
                  alert(`Failed to load video. Status: ${r.status}`);
                }
              }).catch(err => alert(`Error: ${err.message}`))}
              className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs"
            >
              Test Fetch
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoDebug; 