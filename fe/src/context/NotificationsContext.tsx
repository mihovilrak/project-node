import React, { createContext, useContext } from 'react';
import { useAuth } from './AuthContext';
import {
  NotificationsData,
  useNotificationsData,
} from '../hooks/notification/useNotificationsData';

const NotificationsContext = createContext<NotificationsData | null>(null);

/**
 * Owns the single notifications poller shared by the bell and the page.
 */
export const NotificationsProvider: React.FC<{
  children: React.ReactNode;
  pollIntervalMs?: number;
}> = ({ children, pollIntervalMs = 60000 }) => {
  const { currentUser } = useAuth();
  const value = useNotificationsData(currentUser?.id, pollIntervalMs);
  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotificationsContext = () => useContext(NotificationsContext);
