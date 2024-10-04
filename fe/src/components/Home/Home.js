// src/components/Home/Home.js
import React from 'react';
import Layout from '../Layout/Layout';

const Home = () => {
  return (
    <Layout>
      <div className="bg-white p-8 shadow-md rounded-md">
        <h1 className="text-3xl font-bold mb-6">Welcome to the Project Management App!</h1>
        <p>This is a simple project management tool to help you manage your tasks and projects efficiently.</p>
      </div>
    </Layout>
  );
};

export default Home;
