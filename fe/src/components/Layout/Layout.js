// src/components/Layout/Layout.js
import React from 'react';
import Sidebar from '../Sidebar/Sidebar';

const Layout = ({ children }) => {
  return (
    <div className="flex">
      <Sidebar />
      <main className="ml-64 p-6 bg-gray-100 min-h-screen w-full">
        {children}
      </main>
    </div>
  );
};

export default Layout;
