// src/components/Settings/Settings.js
import React from 'react';
import Layout from '../Layout/Layout';

const Settings = () => {
  return (
    <Layout>
      <div className="bg-white p-8 shadow-md rounded-md">
        <h2 className="text-2xl font-bold mb-6">Settings</h2>
        <div className="mb-4">
          <label className="block text-gray-700">Email Notifications</label>
          <input type="checkbox" className="mr-2" /> Enable email notifications
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Profile Visibility</label>
          <input type="checkbox" className="mr-2" /> Make profile public
        </div>
        <button className="bg-blue-500 text-white px-4 py-2 rounded-lg">Save Changes</button>
      </div>
    </Layout>
  );
};

export default Settings;
