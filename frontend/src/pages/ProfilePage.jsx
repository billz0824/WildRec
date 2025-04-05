import React from 'react';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-24 h-24 bg-gray-700 rounded-full"></div>
            <div>
              <h1 className="text-3xl font-bold text-white">User Profile</h1>
              <p className="text-gray-400">Student</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-700 p-4 rounded-lg">
              <h2 className="text-xl font-semibold text-white mb-4">Academic Info</h2>
              <div className="space-y-2">
                <p className="text-gray-300"><span className="font-medium">Major:</span> Computer Science</p>
                <p className="text-gray-300"><span className="font-medium">Year:</span> Junior</p>
                <p className="text-gray-300"><span className="font-medium">GPA:</span> 3.8</p>
              </div>
            </div>
            
            <div className="bg-gray-700 p-4 rounded-lg">
              <h2 className="text-xl font-semibold text-white mb-4">Interests</h2>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-blue-600 text-white rounded-full">Machine Learning</span>
                <span className="px-3 py-1 bg-blue-600 text-white rounded-full">Web Development</span>
                <span className="px-3 py-1 bg-blue-600 text-white rounded-full">Data Science</span>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <h2 className="text-xl font-semibold text-white mb-4">Recent Activity</h2>
            <div className="space-y-4">
              <div className="bg-gray-700 p-4 rounded-lg">
                <p className="text-gray-300">Viewed CS 101 - Introduction to Computer Science</p>
                <p className="text-gray-400 text-sm">2 hours ago</p>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg">
                <p className="text-gray-300">Saved MATH 201 - Linear Algebra</p>
                <p className="text-gray-400 text-sm">1 day ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 