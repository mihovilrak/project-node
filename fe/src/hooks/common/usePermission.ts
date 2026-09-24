import { useAuth } from '../../context/AuthContext';
import { UsePermissionResult } from '../../types/common';

/**
 * Check whether the current user has a specific permission and retrieve its loading state.
 * @param requiredPermission The permission string to validate against the authenticated user's permissions.
 */
export const usePermission = (
  requiredPermission: string,
): UsePermissionResult => {
  const { hasPermission: checkPermission, permissionsLoading } = useAuth();

  return {
    hasPermission: checkPermission(requiredPermission),
    loading: permissionsLoading,
  };
};
