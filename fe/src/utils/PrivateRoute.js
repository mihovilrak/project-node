import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ element: Component }) => {
  const { currentUser } = useAuth();

  return currentUser ? Component : <Navigate to="/login" />;
};

export default PrivateRoute;
