// src/components/Layout/Layout.js
import React from 'react';
import { Link } from 'react-router-dom';

const Layout = ({ children }) => {
  return (
    <div className="flex">
      <nav className="w-1/4 bg-gray-200 p-4">
        <h1 className="text-xl font-bold mb-4">Project Management</h1>
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/projects">Projects</Link></li>
          <li><Link to="/tasks">Tasks</Link></li>
          <li><Link to="/calendar">Calendar</Link></li>
          <li><Link to="/users">Users</Link></li>
          <li><Link to="/settings">Settings</Link></li>
        </ul>
      </nav>
      <main className="w-3/4 p-4">{children}</main>
    </div>
  );
};

export default Layout;
