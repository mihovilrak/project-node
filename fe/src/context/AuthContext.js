// src/context/AuthContext.js
import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null); // Simulate user authentication

  // Add login, logout functions as needed
  const login = (user) => setCurrentUser(user);
  const logout = () => setCurrentUser(null);

  const value = { currentUser, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
