// src/components/Tabs.js
import React, { useState } from 'react';

const Tabs = ({ tabs }) => {
  const [activeTab, setActiveTab] = useState(tabs[0].name);

  return (
    <div>
      <div className="border-b border-gray-300 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.name}
            className={`p-2 ${activeTab === tab.name ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
            onClick={() => setActiveTab(tab.name)}
          >
            {tab.name}
          </button>
        ))}
      </div>
      <div>
        {tabs.map((tab) => activeTab === tab.name && <div key={tab.name}>{tab.content}</div>)}
      </div>
    </div>
  );
};

export default Tabs;
