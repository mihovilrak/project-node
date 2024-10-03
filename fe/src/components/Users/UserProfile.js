import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserProfile = ({ match }) => {
  const [user, setUser] = useState(null);
  const userId = match.params.id;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`/api/users/${userId}`);
        setUser(response.data);
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

    fetchUser();
  }, [userId]);

  if (!user) return <p>Loading...</p>;

  return (
    <div>
      <h2>{user.name}'s Profile</h2>
      <p>Email: {user.email}</p>
      <p>Status: {user.status}</p>
    </div>
  );
};

export default UserProfile;
