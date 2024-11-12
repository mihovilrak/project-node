import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';

export const usePermission = (requiredPermission) => {
  const { hasPermission, permissionsLoading } = useAuth();
  const [canAccess, setCanAccess] = useState(false);

  useEffect(() => {
    setCanAccess(hasPermission(requiredPermission));
  }, [requiredPermission, hasPermission]);

  return {
    canAccess,
    isLoading: permissionsLoading
  };
}; 