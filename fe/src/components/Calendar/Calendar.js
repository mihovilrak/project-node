// src/components/Calendar/Calendar.js
import React from 'react';
import Layout from '../Layout/Layout';

const Calendar = () => {
  return (
    <Layout>
      <div className="bg-white p-8 shadow-md rounded-md">
        <h2 className="text-2xl font-bold mb-6">Calendar</h2>
        <p>This is where your calendar would be integrated. You can use a library like `react-calendar`.</p>
        {/* Placeholder for calendar */}
        <div className="h-96 bg-gray-200 rounded-md flex items-center justify-center">
          <span className="text-gray-500">Calendar Placeholder</span>
        </div>
      </div>
    </Layout>
  );
};

export default Calendar;
