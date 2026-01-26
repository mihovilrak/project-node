import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { TimeLog, TimeLogCreate } from '../../types/timeLog';
import {
  getTaskTimeLogs,
  deleteTimeLog as deleteTimeLogApi,
  createTimeLog,
  updateTimeLog
} from '../../api/timeLogs';

export const useTaskTimeLogs = (taskId: string) => {
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const { currentUser } = useAuth();

  const fetchTimeLogs = useCallback(async () => {
    if (!taskId) return;
    try {
      const timeLogsData = await getTaskTimeLogs(Number(taskId));
      console.log('Fetched time logs:', timeLogsData);
      setTimeLogs(timeLogsData || []);
    } catch (error: any) {
      console.error('Failed to fetch time logs:', error);
      setTimeLogs([]);
    }
  }, [taskId]);

  // Automatically fetch time logs on mount and when taskId changes
  useEffect(() => {
    fetchTimeLogs();
  }, [fetchTimeLogs]);

  const handleTimeLogSubmit = async (timeLogData: TimeLogCreate, timeLogId?: number) => {
    try {
      if (!currentUser?.id) {
        throw new Error('User not authenticated');
      }
      if (!taskId) {
        throw new Error('Task ID is required');
      }

      console.log('Submitting time log:', timeLogData, 'timeLogId:', timeLogId);
      let result: TimeLog;
      
      // Check if we're updating an existing time log
      if (timeLogId) {
        result = await updateTimeLog(timeLogId, timeLogData);
        console.log('Updated time log:', result);
      } else {
        result = await createTimeLog(Number(taskId), timeLogData);
        console.log('Created time log:', result);
      }
      
      await fetchTimeLogs(); // Refresh time logs after submission
      return result;
    } catch (error: any) {
      console.error('Failed to submit time log:', error);
      const errorMessage = error?.response?.data?.error || 
                          error?.message || 
                          'Failed to submit time log';
      throw new Error(errorMessage);
    }
  };

  const deleteTimeLog = async (timeLogId: number): Promise<void> => {
    try {
      await deleteTimeLogApi(timeLogId);
      await fetchTimeLogs(); // Refresh time logs after deletion
    } catch (error: any) {
      console.error('Failed to delete time log:', error);
      const errorMessage = error?.response?.data?.error || 
                          error?.message || 
                          'Failed to delete time log';
      throw new Error(errorMessage);
    }
  };

  return {
    timeLogs,
    handleTimeLogSubmit,
    deleteTimeLog,
    fetchTimeLogs
  };
};
