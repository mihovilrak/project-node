import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userPermissions, setUserPermissions] = useState([]);
  const [permissionCache, setPermissionCache] = useState({});
  const [permissionsLoading, setPermissionsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Clear cache when permissions change
  useEffect(() => {
    setPermissionCache({});
  }, [userPermissions]);

  // Check session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        setPermissionsLoading(true);
        setError(null);
        
        const response = await api.get('/check-session');
        if (response.status === 200) {
          setCurrentUser(response.data.user);
          // Fetch user permissions
          const permissionsResponse = await api.get('/user/permissions');
          setUserPermissions(permissionsResponse.data);
        }
      } catch (error) {
        console.error('Session check failed:', error);
        setCurrentUser(null);
        setUserPermissions([]);
        setError('Failed to load user session');
      } finally {
        setPermissionsLoading(false);
      }
    };

    checkSession();
  }, []);

  const hasPermission = (requiredPermission) => {
    // Return false if permissions are still loading
    if (permissionsLoading) return false;

    // Check cache first
    if (permissionCache[requiredPermission] !== undefined) {
      return permissionCache[requiredPermission];
    }
    
    // Admin check
    if (currentUser?.role_id === 1) {
      setPermissionCache(prev => ({...prev, [requiredPermission]: true}));
      return true;
    }
    
    // Specific permission check
    const hasAccess = userPermissions.includes(requiredPermission);
    setPermissionCache(prev => ({...prev, [requiredPermission]: hasAccess}));
    return hasAccess;
  };

  const login = async (login, password) => {
    try {
      setPermissionsLoading(true);
      setError(null);
      
      const response = await api.post('/login', { login, password });
      if (response.data) {
        setCurrentUser(response.data.user);
        // Fetch permissions after login
        const permissionsResponse = await api.get('/user/permissions');
        setUserPermissions(permissionsResponse.data);
        setPermissionCache({}); // Clear cache on login
      } else {
        console.error('Login failed:', response.data);
      }
    } catch (error) {
      console.error('Login failed:', error);
      setCurrentUser(null);
      setUserPermissions([]);
      setError('Login failed. Please check your credentials.');
      throw error;
    } finally {
      setPermissionsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setPermissionsLoading(true);
      await api.post('/logout', {});
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setCurrentUser(null);
      setUserPermissions([]);
      setPermissionCache({});
      setPermissionsLoading(false);
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        currentUser, 
        login, 
        logout, 
        hasPermission,
        permissionsLoading,
        error,
        userPermissions 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;