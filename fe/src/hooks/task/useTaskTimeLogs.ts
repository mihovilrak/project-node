import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { TimeLog, TimeLogCreate } from '../../types/timeLog';
import { getTaskTimeLogs } from '../../api/timeLogs';

export const useTaskTimeLogs = (taskId: string) => {
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const { currentUser } = useAuth();

  const fetchTimeLogs = async () => {
    try {
      const timeLogsData = await getTaskTimeLogs(Number(taskId));
      setTimeLogs(timeLogsData);
    } catch (error) {
      console.error('Failed to fetch time logs:', error);
    }
  };

  const handleTimeLogSubmit = async (timeLogData: TimeLogCreate) => {
    try {
      if (!currentUser?.id) {
        throw new Error('User not authenticated');
      }

      const newTimeLog: TimeLog = {
        id: Date.now(),
        user_id: currentUser.id,
        created_on: new Date().toISOString(),
        updated_on: new Date().toISOString(),
        description: timeLogData.description || null,
        ...timeLogData
      };
      
      setTimeLogs(prev => [...prev, newTimeLog]);
      return newTimeLog;
    } catch (error) {
      console.error('Failed to add time log:', error);
      throw error;
    }
  };

  return {
    timeLogs,
    setTimeLogs,
    handleTimeLogSubmit,
    fetchTimeLogs
  };
};
