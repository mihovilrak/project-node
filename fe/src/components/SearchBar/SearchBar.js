// src/components/SearchBar.js
import React, { useState } from 'react';

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form onSubmit={handleSearch} className="flex items-center bg-gray-100 p-2 rounded-md w-full">
      <input
        type="text"
        placeholder="Search for tasks, users, or projects..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="flex-grow bg-transparent px-2 text-gray-700 outline-none"
      />
      <button type="submit" className="bg-gray-700 text-white px-4 py-1 rounded-md">
        Search
      </button>
    </form>
  );
};

export default SearchBar;
