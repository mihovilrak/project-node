// src/components/NotFound/NotFound.js
import React from 'react';
import Layout from '../Layout/Layout';

const NotFound = () => {
  return (
    <Layout>
      <div className="bg-white p-8 shadow-md rounded-md text-center">
        <h1 className="text-3xl font-bold mb-4">404 - Page Not Found</h1>
        <p>The page you are looking for does not exist.</p>
      </div>
    </Layout>
  );
};

export default NotFound;
