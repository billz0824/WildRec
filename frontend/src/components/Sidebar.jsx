import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaHome, FaBookmark, FaCompass } from 'react-icons/fa';

const Sidebar = () => {
  return (
    <div className="bg-zinc-950 text-white w-64 h-screen p-6 fixed top-0 left-0 flex flex-col border-r border-gray-800">
      {/* Logo */}
      <div className="text-purple-500 font-bold text-2xl mb-10">WildRec</div>

      {/* Nav Links */}
      <nav className="flex flex-col gap-6 text-sm">
        <NavLink
          to="/home"
          className={({ isActive }) =>
            `flex items-center gap-3 hover:text-purple-400 transition ${isActive ? 'text-purple-400' : 'text-white'}`
          }
        >
          <FaHome /> Home
        </NavLink>

        <NavLink
          to="/discover"
          className={({ isActive }) =>
            `flex items-center gap-3 hover:text-purple-400 transition ${isActive ? 'text-purple-400' : 'text-white'}`
          }
        >
          <FaCompass /> Discover Page
        </NavLink>

        <NavLink
          to="/saved"
          className={({ isActive }) =>
            `flex items-center gap-3 hover:text-purple-400 transition ${isActive ? 'text-purple-400' : 'text-white'}`
          }
        >
          <FaBookmark /> Saved Courses
        </NavLink>

      </nav>
    </div>
  );
};

export default Sidebar;