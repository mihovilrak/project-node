import { useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { TimeLog, TimeLogCreate } from '../../types/timeLog';
import {
  getTaskTimeLogs,
  deleteTimeLog as deleteTimeLogApi,
  createTimeLog
} from '../../api/timeLogs';

export const useTaskTimeLogs = (taskId: string) => {
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const { currentUser } = useAuth();

  const fetchTimeLogs = useCallback(async () => {
    try {
      const timeLogsData = await getTaskTimeLogs(Number(taskId));
      console.log('Fetched time logs:', timeLogsData);
      setTimeLogs(timeLogsData);
    } catch (error) {
      console.error('Failed to fetch time logs:', error);
    }
  }, [taskId]);

  const handleTimeLogSubmit = async (timeLogData: TimeLogCreate) => {
    try {
      if (!currentUser?.id) {
        throw new Error('User not authenticated');
      }

      console.log('Submitting time log:', timeLogData);
      const newTimeLog = await createTimeLog(Number(taskId), timeLogData);
      console.log('Created time log:', newTimeLog);
      await fetchTimeLogs(); // Refresh time logs after submission
      return newTimeLog;
    } catch (error) {
      console.error('Failed to add time log:', error);
      throw error;
    }
  };

  const deleteTimeLog = async (timeLogId: number): Promise<void> => {
    try {
      await deleteTimeLogApi(timeLogId);
      await fetchTimeLogs(); // Refresh time logs after deletion
    } catch (error) {
      console.error('Failed to delete time log:', error);
      throw error;
    }
  };

  return {
    timeLogs,
    handleTimeLogSubmit,
    deleteTimeLog,
    fetchTimeLogs
  };
};
