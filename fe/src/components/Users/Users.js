// src/components/Users/Users.js
import React from 'react';
import Layout from '../Layout/Layout';
import { Link } from 'react-router-dom';

const Users = () => {
  // Sample user data
  const users = [
    { id: 1, name: 'User A' },
    { id: 2, name: 'User B' },
    { id: 3, name: 'User C' },
  ];

  return (
    <Layout>
      <div className="bg-white p-8 shadow-md rounded-md">
        <h2 className="text-2xl font-bold mb-6">Users</h2>
        <Link to="/users/create" className="mb-4 inline-block bg-blue-500 text-white px-4 py-2 rounded-md">
          Add New User
        </Link>
        <ul>
          {users.map((user) => (
            <li key={user.id} className="p-4 border-b hover:bg-gray-100">
              <Link to={`/users/${user.id}`} className="text-blue-600">
                {user.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </Layout>
  );
};

export default Users;
