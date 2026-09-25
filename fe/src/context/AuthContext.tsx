import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { api } from '../api/api';
import { AUTH_UNAUTHORIZED_EVENT } from '../constants/auth';
import { User } from '../types/user';
import {
  AuthContextType,
  AuthProviderProps,
  UserPermission,
} from '../types/auth';
import logger from '../utils/logger';
import { getApiErrorStatus } from '../utils/getApiErrorMessage';

const LOGIN_FAILED = 'Login failed. Please check your credentials.';

/**
 * Message for a failed login, including the wait time when the account is
 * temporarily locked (429 with Retry-After in seconds).
 */
const getLoginErrorMessage = (error: unknown): string => {
  if (getApiErrorStatus(error) !== 429) return LOGIN_FAILED;
  const retryAfter = Number(
    (error as { response?: { headers?: Record<string, unknown> } }).response
      ?.headers?.['retry-after'],
  );
  if (!Number.isFinite(retryAfter) || retryAfter <= 0) {
    return 'Too many failed login attempts. Please try again later.';
  }
  const minutes = Math.ceil(retryAfter / 60);
  return `Too many failed login attempts. Please try again in ${minutes} minute${minutes === 1 ? '' : 's'}.`;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Return the current authentication context (current user, permissions, loading
 * state, and auth helpers) and throw if not used within an AuthProvider.
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

/**
 * The signed-in user, or null outside an AuthProvider.
 */
export const useCurrentUser = (): User | null =>
  useContext(AuthContext)?.currentUser ?? null;

/**
 * Provide authentication state and actions to descendant components, performing
 * an initial session check, exposing login/logout, permission checks, and
 * loading/error state.
 *
 * @param root0 React nodes to render inside the provider; typically the app
 *   subtree that needs access to authentication state and actions.
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userPermissions, setUserPermissions] = useState<UserPermission[]>([]);

  const [permissionsLoading, setPermissionsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const checkSession = async () => {
      try {
        setPermissionsLoading(true);
        setError(null);

        const response = await api.get('/check-session', {
          signal: controller.signal,
        });

        if (response.status === 200) {
          setCurrentUser(response.data.user);
          setUserPermissions(response.data.permissions ?? []);
        }
      } catch (error) {
        if (controller.signal.aborted) return;
        logger.error('Session check failed:', error);
        setCurrentUser(null);
        setUserPermissions([]);
        setError('Failed to load user session');
      } finally {
        if (!controller.signal.aborted) setPermissionsLoading(false);
      }
    };

    checkSession();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const resetUnauthorizedSession = () => {
      setCurrentUser(null);
      setUserPermissions([]);
      setPermissionsLoading(false);
      setError(null);
    };

    window.addEventListener(AUTH_UNAUTHORIZED_EVENT, resetUnauthorizedSession);
    return () => {
      window.removeEventListener(
        AUTH_UNAUTHORIZED_EVENT,
        resetUnauthorizedSession,
      );
    };
  }, []);

  const hasPermission = useCallback(
    (requiredPermission: string): boolean => {
      if (permissionsLoading) return false;
      return userPermissions.some((p) => p.permission === requiredPermission);
    },
    [permissionsLoading, userPermissions],
  );

  const login = useCallback(
    async (loginName: string, password: string): Promise<boolean> => {
      try {
        setPermissionsLoading(true);
        setError(null);

        const response = await api.post('/login', {
          login: loginName,
          password,
        });
        if (response && response.data && response.data.user) {
          setCurrentUser(response.data.user);
          setUserPermissions(response.data.permissions ?? []);
          setPermissionsLoading(false);
          return true;
        }
        setCurrentUser(null);
        setUserPermissions([]);
        setError(LOGIN_FAILED);
        setPermissionsLoading(false);
        return false;
      } catch (error) {
        logger.error('Login failed:', error);
        setCurrentUser(null);
        setUserPermissions([]);
        setError(getLoginErrorMessage(error));
        setPermissionsLoading(false);
        return false;
      }
    },
    [],
  );

  const logout = useCallback(async (): Promise<void> => {
    try {
      setPermissionsLoading(true);
      await api.post('/logout', {});
    } catch (error) {
      logger.error('Logout failed:', error);
    } finally {
      setCurrentUser(null);
      setUserPermissions([]);

      setPermissionsLoading(false);
    }
  }, []);

  const contextValue = useMemo<AuthContextType>(
    () => ({
      currentUser,
      login,
      logout,
      hasPermission,
      permissionsLoading,
      error,
      userPermissions,
    }),
    [
      currentUser,
      login,
      logout,
      hasPermission,
      permissionsLoading,
      error,
      userPermissions,
    ],
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export default AuthProvider;
