import React from 'react';
import FeedPost from '../components/FeedPost';

const dummyPosts = [
    {
        id: 1,
        image: 'https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d',
        profileImage: '/cs349.png', // Course-specific avatar
        caption: 'Loved this project!',
        timestamp: '2 hours ago',
        courseId: 'cs349'
    },
   {
    id: 2,
    image: 'https://images.unsplash.com/photo-1593642634443-44adaa06623a',
    caption: 'Final presentation went well! 💻 #CS349',
    timestamp: '4 hours ago',
    courseId: 'cs330'
   },
   {
    id: 3,
    image: 'https://images.unsplash.com/photo-1481277542470-605612bd2d61',
    caption: 'This class was brutal but rewarding. Would recommend!',
    timestamp: 'Yesterday',
    courseId: 'cs310'
   },
];

const FeedPage = () => {
  return (
    <div className="bg-black min-h-screen px-6 py-10 text-white flex justify-center">
      <div className="flex flex-col items-center w-full max-w-3xl">
        {dummyPosts.map(post => (
          <FeedPost key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
};

export default FeedPage;