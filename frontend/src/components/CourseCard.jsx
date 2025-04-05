import React from 'react';
import RadarChart from './RadarChart';
import { FaMapMarkerAlt, FaClock, FaHeart, FaCommentDots, FaBookmark, FaShare } from 'react-icons/fa';

const CourseCard = ({ course }) => {
  return (
    <div className="relative bg-zinc-900 text-white rounded-xl shadow-lg p-6 w-full max-w-lg mx-auto mb-8">
      {/* Header */}
      <div className="mb-3">
        <h2 className="text-lg font-semibold uppercase">{course.number}</h2>
        <h3 className="text-xl font-bold">{course.name}</h3>
        <p className="text-sm text-gray-400">Instructor: {course.professor}</p>
      </div>

      {/* Radar Chart */}
      <div className="my-4">
        <RadarChart data={course.radarData} />
      </div>

      {/* Quote */}
      <p className="italic text-center text-sm text-gray-300 mb-4">“{course.quote}”</p>

      {/* Location & Time */}
      <div className="flex gap-4 justify-center text-sm mb-4">
        <div className="bg-gray-800 text-white px-4 py-2 rounded-md flex items-center gap-2">
          <FaMapMarkerAlt size={14} /> {course.location}
        </div>
        <div className="bg-gray-800 text-white px-4 py-2 rounded-md flex items-center gap-2">
          <FaClock size={14} /> {course.schedule}
        </div>
      </div>

      {/* Prereqs and Requirements */}
      <div className="text-xs text-gray-400 text-center mb-4">
        <p><span className="font-semibold text-gray-300">Pre-Requisites:</span> {course.prerequisites}</p>
        <p>{course.requirements}</p>
      </div>

      {/* Description */}
      <div className="bg-gray-800 rounded-md p-3 text-sm text-gray-200">
        <strong className="text-purple-400 block mb-1">Course Description:</strong>
        {course.description}
      </div>

      {/* Social Icons (Right side bar style) */}
      <div className="absolute top-6 right-6 flex flex-col items-center space-y-4 text-xs text-gray-400">
        <div className="flex flex-col items-center">
          <FaHeart className="text-white" />
          <span>{course.likes}K</span>
        </div>
        <div className="flex flex-col items-center">
          <FaCommentDots className="text-white" />
          <span>{course.comments}K</span>
        </div>
        <div className="flex flex-col items-center">
          <FaBookmark className="text-white" />
          <span>{course.saves}K</span>
        </div>
        <div className="flex flex-col items-center">
          <FaShare className="text-white" />
          <span>{course.shares}K</span>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;