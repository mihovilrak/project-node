// src/components/Sidebar.js
import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = () => {
  return (
    <aside className="w-64 bg-gray-800 text-white h-screen p-4 fixed">
      <ul className="space-y-4">
        <li>
          <Link to="/tasks" className="block py-2 px-4 rounded hover:bg-gray-700">
            Tasks
          </Link>
        </li>
        <li>
          <Link to="/projects" className="block py-2 px-4 rounded hover:bg-gray-700">
            Projects
          </Link>
        </li>
        <li>
          <Link to="/calendar" className="block py-2 px-4 rounded hover:bg-gray-700">
            Calendar
          </Link>
        </li>
        <li>
          <Link to="/users" className="block py-2 px-4 rounded hover:bg-gray-700">
            Users
          </Link>
        </li>
        <li>
          <Link to="/settings" className="block py-2 px-4 rounded hover:bg-gray-700">
            Settings
          </Link>
        </li>
      </ul>
    </aside>
  );
};

export default Sidebar;
