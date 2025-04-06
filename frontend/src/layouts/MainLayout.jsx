import React from 'react';
import Sidebar from '../components/Sidebar';
import { useLocation } from 'react-router-dom';

const MainLayout = ({ children }) => {
  const location = useLocation();

  return (
    <div className="flex">
      <Sidebar />
      <div className="ml-64 w-full min-h-screen bg-black text-white">
        {children}
      </div>
    </div>
  );
};

export default MainLayout;