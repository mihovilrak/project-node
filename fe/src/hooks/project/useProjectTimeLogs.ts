import { useState } from 'react';
import { TimeLog, TimeLogCreate } from '../../types/timeLog';
import { ProjectTimeLogsHook } from '../../types/project';
import { getTaskTimeLogs, createTimeLog, updateTimeLog, deleteTimeLog } from '../../api/timeLogs';
import { getProjectTasks } from '../../api/tasks';

export const useProjectTimeLogs = (projectId: string): ProjectTimeLogsHook => {
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const [timeLogDialogOpen, setTimeLogDialogOpen] = useState(false);
  const [selectedTimeLog, setSelectedTimeLog] = useState<TimeLog | null>(null);

  const loadTimeLogs = async () => {
    if (!projectId) return;
    try {
      const tasks = await getProjectTasks(Number(projectId));
      let allLogs: TimeLog[] = [];
      if (tasks && Array.isArray(tasks)) {
        for (const task of tasks) {
          if (task?.id) {
            try {
              const taskLogs = await getTaskTimeLogs(task.id);
              if (taskLogs && Array.isArray(taskLogs)) {
                allLogs = [...allLogs, ...taskLogs];
              }
            } catch (taskError) {
              console.error(`Failed to load time logs for task ${task.id}:`, taskError);
              // Continue with other tasks even if one fails
            }
          }
        }
      }
      setTimeLogs(allLogs);
    } catch (error: any) {
      console.error('Failed to load time logs:', error);
      setTimeLogs([]);
      const errorMessage = error?.response?.data?.error || 
                          error?.message || 
                          'Failed to load time logs';
      throw new Error(errorMessage);
    }
  };

  const handleTimeLogSubmit = async (timeLogData: TimeLogCreate) => {
    try {
      // Check if we're editing an existing time log
      if (selectedTimeLog && selectedTimeLog.id) {
        await updateTimeLog(selectedTimeLog.id, timeLogData);
      } else {
        if (!timeLogData.task_id) {
          throw new Error('Task ID is required');
        }
        await createTimeLog(timeLogData.task_id, timeLogData);
      }
      await loadTimeLogs();
      setTimeLogDialogOpen(false);
      setSelectedTimeLog(null);
    } catch (error: any) {
      console.error('Failed to submit time log:', error);
      const errorMessage = error?.response?.data?.error || 
                          error?.message || 
                          'Failed to submit time log';
      throw new Error(errorMessage);
    }
  };

  const handleTimeLogEdit = async (timeLog: TimeLog) => {
    setSelectedTimeLog(timeLog);
    setTimeLogDialogOpen(true);
  };

  const handleTimeLogDelete = async (timeLogId: number) => {
    try {
      await deleteTimeLog(timeLogId);
      await loadTimeLogs();
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
    setTimeLogs,
    timeLogDialogOpen,
    setTimeLogDialogOpen,
    selectedTimeLog,
    setSelectedTimeLog,
    handleTimeLogSubmit,
    handleTimeLogEdit,
    handleTimeLogDelete,
    loadTimeLogs
  };
};
