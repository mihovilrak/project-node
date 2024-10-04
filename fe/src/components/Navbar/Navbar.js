// src/components/Navbar.js
import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-gray-800 p-4">
      <div className="flex items-center justify-between">
        <Link to="/" className="text-white text-lg font-semibold">
          Project Management App
        </Link>
        <div className="flex space-x-4">
          <Link to="/tasks" className="text-gray-300 hover:text-white">Tasks</Link>
          <Link to="/projects" className="text-gray-300 hover:text-white">Projects</Link>
          <Link to="/calendar" className="text-gray-300 hover:text-white">Calendar</Link>
          <Link to="/users" className="text-gray-300 hover:text-white">Users</Link>
          <Link to="/settings" className="text-gray-300 hover:text-white">Settings</Link>
          <Link to="/login" className="text-gray-300 hover:text-white">Login</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
