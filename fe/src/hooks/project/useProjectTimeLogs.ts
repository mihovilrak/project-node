import { useState } from 'react';
import { TimeLog, TimeLogCreate } from '../../types/timeLog';
import { ProjectTimeLogsHook } from '../../types/project';
import { getTaskTimeLogs, createTimeLog, deleteTimeLog } from '../../api/timeLogs';
import { getProjectTasks } from '../../api/tasks';

export const useProjectTimeLogs = (projectId: string): ProjectTimeLogsHook => {
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const [timeLogDialogOpen, setTimeLogDialogOpen] = useState(false);
  const [selectedTimeLog, setSelectedTimeLog] = useState<TimeLog | null>(null);

  const loadTimeLogs = async () => {
    try {
      const tasks = await getProjectTasks(Number(projectId));
      let allLogs: TimeLog[] = [];
      for (const task of tasks) {
        const taskLogs = await getTaskTimeLogs(task.id);
        allLogs = [...allLogs, ...taskLogs];
      }
      setTimeLogs(allLogs);
    } catch (error) {
      console.error('Failed to load time logs:', error);
    }
  };

  const handleTimeLogSubmit = async (timeLogData: TimeLogCreate) => {
    try {
      await createTimeLog(timeLogData.task_id, timeLogData);
      await loadTimeLogs();
      setTimeLogDialogOpen(false);
      setSelectedTimeLog(null);
    } catch (error) {
      console.error('Failed to submit time log:', error);
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
    } catch (error) {
      console.error('Failed to delete time log:', error);
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
