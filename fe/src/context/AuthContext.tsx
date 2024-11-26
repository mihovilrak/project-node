import React, {
  createContext, 
  useContext, 
  useState, 
  useEffect 
} from 'react';
import { api } from '../api/api';
import { User } from '../types/user';

interface AuthContextType {
  currentUser: User | null;
  userPermissions: string[];
  permissionsLoading: boolean;
  error: string | null;
  login: (login: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [permissionCache, setPermissionCache] = useState<Record<string, boolean>>({});
  const [permissionsLoading, setPermissionsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPermissionCache({});
  }, [userPermissions]);

  useEffect(() => {
    const checkSession = async () => {
      try {
        setPermissionsLoading(true);
        setError(null);
        
        const response = await api.get('/check-session');
        if (response.status === 200) {
          setCurrentUser(response.data.user);
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

  const hasPermission = (requiredPermission: string): boolean => {
    if (permissionsLoading) return false;

    if (permissionCache[requiredPermission] !== undefined) {
      return permissionCache[requiredPermission];
    }
    
    if (currentUser?.role_id === 1) {
      setPermissionCache(prev => ({...prev, [requiredPermission]: true}));
      return true;
    }
    
    const hasAccess = userPermissions.includes(requiredPermission);
    setPermissionCache(prev => ({...prev, [requiredPermission]: hasAccess}));
    return hasAccess;
  };

  const login = async (login: string, password: string): Promise<void> => {
    try {
      setPermissionsLoading(true);
      setError(null);
      
      const response = await api.post('/login', { login, password });
      if (response.data) {
        setCurrentUser(response.data.user);
        const permissionsResponse = await api.get('/users/permissions');
        setUserPermissions(permissionsResponse.data);
        setPermissionCache({});
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

  const logout = async (): Promise<void> => {
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