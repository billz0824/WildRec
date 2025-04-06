import React from 'react';
import { FaHeart, FaComment, FaBookmark } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const FeedPost = ({ post }) => {
  const navigate = useNavigate();

  const handleProfileClick = () => {
    navigate(`/course/${post.courseId}`);
  };

  return (
    <div className="bg-zinc-900 text-white max-w-xl w-full rounded-lg overflow-hidden shadow-md mb-8">
      {/* Profile Header */}


      {/* Post Image */}
      <img
        src={post.image}
        alt="Post"
        className="w-full object-cover"
        style={{ height: '400px' }}
      />

      {/* Caption & Icons */}
      <div className="p-4">
        <div className="flex gap-4 text-white mb-2">
          <FaHeart />
          <FaComment />
          <FaBookmark className="ml-auto" />
        </div>

        <p className="text-sm text-gray-300 mb-2">
          <span className="font-bold">Anonymous</span> {post.caption}
        </p>
        <p className="text-xs text-gray-500">{post.timestamp}</p>
      </div>
    </div>
  );
};

export default FeedPost;