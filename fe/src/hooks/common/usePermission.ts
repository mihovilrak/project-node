import { useAuth } from '../../context/AuthContext';
import { useEffect, useState } from 'react';
import { UsePermissionResult } from '../../types/common';

export const usePermission = (requiredPermission: string): UsePermissionResult => {
  const { hasPermission: checkPermission, permissionsLoading } = useAuth();
  const [hasPermission, setHasPermission] = useState<boolean>(false);

  useEffect(() => {
    setHasPermission(checkPermission(requiredPermission));
  }, [requiredPermission, checkPermission]);

  return {
    hasPermission,
    loading: permissionsLoading
  };
};
