import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);

  // Check session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await api.get('/check-session');
        if (response.status === 200) {
          setCurrentUser(response.data.user);
        }
      } catch (error) {
        console.error('Session check failed:', error);
        setCurrentUser(null);
      }
    };

    checkSession();
  }, []);

  const login = async (login, password) => {
    const response = await api.post(
      '/login',
      { login, password }
    );
    if (response.data) {
      setCurrentUser(response.data.user);
    } else {
      setCurrentUser(null);
    }
  };

  const logout = async () => {
    await api.post('/logout', {});
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
