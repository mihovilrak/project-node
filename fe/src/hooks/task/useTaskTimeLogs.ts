import { useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTimeLogCrud } from '../timeLog/useTimeLogCrud';
import { TimeLogCreate } from '../../types/timeLog';
import { getTaskTimeLogs } from '../../api/timeLogs';

/**
 * Fetch, create, update, and delete time logs for a task.
 *
 * @param taskId The task identifier to load and manage time logs for.
 */
export const useTaskTimeLogs = (taskId: string) => {
  const { currentUser } = useAuth();
  const { timeLogs, loading, error, refetch, saveTimeLog, deleteTimeLog } =
    useTimeLogCrud(
      (signal) => getTaskTimeLogs(Number(taskId), signal),
      [taskId],
      Boolean(taskId),
    );

  const handleTimeLogSubmit = useCallback(
    async (timeLogData: TimeLogCreate, timeLogId?: number) => {
      if (!currentUser?.id) {
        throw new Error('User not authenticated');
      }
      return saveTimeLog(timeLogData, timeLogId);
    },
    [currentUser?.id, saveTimeLog],
  );

  return {
    timeLogs,
    loading,
    error,
    handleTimeLogSubmit,
    deleteTimeLog,
    fetchTimeLogs: refetch,
  };
};
