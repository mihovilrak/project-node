// src/components/Navbar/Navbar.js
import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-gray-800 p-4">
      <div className="flex items-center justify-between">
        <Link to="/" className="text-white text-lg font-semibold">
          Project Management App
        </Link>
        <div className="flex items-center space-x-4">
          <input
            type="text"
            placeholder="Search..."
            className="px-4 py-2 rounded bg-gray-700 text-white placeholder-gray-400"
          />
          <Link to="/profile" className="text-gray-300 hover:text-white">
            Profile
          </Link>
          <Link to="/notifications" className="text-gray-300 hover:text-white">
            Notifications
          </Link>
          <Link to="/login" className="text-gray-300 hover:text-white">
            Login
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
