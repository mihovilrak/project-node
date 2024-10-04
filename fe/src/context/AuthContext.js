import React, { createContext, useContext, useState } from 'react';

// Create Auth Context
const AuthContext = createContext();

// Custom hook to use the Auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = () => setIsAuthenticated(true);
  const logout = () => setIsAuthenticated(false);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
