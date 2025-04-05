import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

const courseMock = {
  id: 'cs349',
  name: 'CS349 Machine Learning',
  instructor: 'Zach Wood-Doughty',
  avatar: '/cs349.png',
  description: 'Intro to machine learning, covering supervised learning, decision trees, neural networks and more.',
  posts: [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d',
      profileImage: '/cs349.png',
      caption: 'Loved this project!',
      timestamp: '2 hours ago',
      courseId: 'cs349',
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1481277542470-605612bd2d61',
      profileImage: '/cs349.png',
      caption: 'Cool final demo!',
      timestamp: 'Yesterday',
      courseId: 'cs349',
    }
  ]
};

const CourseProfilePage = () => {
  const { id } = useParams();
  const [posts, setPosts] = useState(courseMock.posts);

  const handleNewPost = () => {
    const newPost = {
      id: Date.now(),
      image: 'https://images.unsplash.com/photo-1581092334440-c9e1a6ccc591',
      caption: 'Just posted something new!',
      timestamp: 'Just now',
      profileImage: courseMock.avatar,
      courseId: id
    };
    setPosts([newPost, ...posts]);
  };

  return (
    <div className="bg-black min-h-screen px-6 py-10 text-white">
      {/* Profile Header */}
      <div className="flex items-center gap-6 mb-10">
        <img src={courseMock.avatar} alt="avatar" className="w-20 h-20 rounded-full" />
        <div>
          <h1 className="text-2xl font-bold">{courseMock.name}</h1>
          <p className="text-sm text-gray-400">{courseMock.instructor}</p>
          <p className="text-sm mt-2">{courseMock.description}</p>
        </div>
        <button
          onClick={handleNewPost}
          className="ml-auto px-4 py-2 bg-purple-600 rounded hover:bg-purple-700"
        >
          + New Post
        </button>
      </div>

      {/* Post Grid */}
      <div className="grid grid-cols-3 gap-4">
        {posts.map((post) => (
          <img
            key={post.id}
            src={post.image}
            alt="course post"
            className="w-full h-56 object-cover rounded-md"
          />
        ))}
      </div>
    </div>
  );
};

export default CourseProfilePage;