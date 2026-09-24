import { useCallback, useState } from 'react';
import { TimeLog, TimeLogCreate } from '../../types/timeLog';
import { ProjectTimeLogsHook } from '../../types/project';
import { getProjectTimeLogs } from '../../api/timeLogs';
import { useTimeLogCrud } from '../timeLog/useTimeLogCrud';

/**
 * Load a project's time logs in one request and manage the time-log dialog.
 *
 * @param projectId The project identifier to load time logs for
 */
export const useProjectTimeLogs = (projectId: string): ProjectTimeLogsHook => {
  const { timeLogs, error, refetch, saveTimeLog, deleteTimeLog } =
    useTimeLogCrud(
      (signal) => getProjectTimeLogs(Number(projectId), undefined, signal),
      [projectId],
      Boolean(projectId),
    );
  const [timeLogDialogOpen, setTimeLogDialogOpen] = useState(false);
  const [selectedTimeLog, setSelectedTimeLog] = useState<TimeLog | null>(null);
  const [timeLogTaskId, setTimeLogTaskId] = useState<number | undefined>();

  const openTimeLogDialog = useCallback((taskId?: number) => {
    setSelectedTimeLog(null);
    setTimeLogTaskId(taskId || undefined);
    setTimeLogDialogOpen(true);
  }, []);

  const closeTimeLogDialog = useCallback(() => {
    setTimeLogDialogOpen(false);
    setSelectedTimeLog(null);
    setTimeLogTaskId(undefined);
  }, []);

  const handleTimeLogEdit = useCallback((timeLog: TimeLog) => {
    setSelectedTimeLog(timeLog);
    setTimeLogTaskId(timeLog.task_id);
    setTimeLogDialogOpen(true);
  }, []);

  // The dialog closes itself on success and shows the error otherwise.
  const handleTimeLogSubmit = useCallback(
    async (timeLogData: TimeLogCreate) => {
      await saveTimeLog(timeLogData, selectedTimeLog?.id);
    },
    [saveTimeLog, selectedTimeLog?.id],
  );

  return {
    timeLogs,
    timeLogsError: error,
    timeLogDialogOpen,
    selectedTimeLog,
    timeLogTaskId,
    openTimeLogDialog,
    closeTimeLogDialog,
    handleTimeLogSubmit,
    handleTimeLogEdit,
    handleTimeLogDelete: deleteTimeLog,
    loadTimeLogs: refetch,
  };
};
