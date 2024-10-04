import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div>
      <h1>Welcome to the Project Management App!</h1>
      {isAuthenticated ? (
        <p>You are logged in!</p>
      ) : (
        <p>Please <Link to="/login">log in</Link> to access your projects.</p>
      )}
    </div>
  );
};

export default Home;
