import { DependencyList, useCallback } from 'react';
import { useAsyncResource } from '../common/useAsyncResource';
import { TimeLog, TimeLogCreate } from '../../types/timeLog';
import {
  createTimeLog,
  updateTimeLog,
  deleteTimeLog as deleteTimeLogApi,
} from '../../api/timeLogs';
import logger from '../../utils/logger';
import getApiErrorMessage, {
  getApiErrorStatus,
} from '../../utils/getApiErrorMessage';

const EMPTY_TIME_LOGS: TimeLog[] = [];

/**
 * Load a list of time logs and create, update or delete entries, refetching the
 * list after every successful mutation.
 *
 * @param fetchLogs Loads the list; receives an AbortSignal.
 * @param deps Reloads the list when these change.
 * @param enabled Skips loading while false.
 */
export const useTimeLogCrud = (
  fetchLogs: (signal: AbortSignal) => Promise<TimeLog[]>,
  deps: DependencyList,
  enabled = true,
) => {
  const {
    data: timeLogs,
    setData: setTimeLogs,
    loading,
    error,
    setError,
    refetch,
  } = useAsyncResource<TimeLog[]>(
    async (signal) => (await fetchLogs(signal)) || [],
    deps,
    {
      initialData: EMPTY_TIME_LOGS,
      enabled,
      errorMessage: 'Failed to load time logs',
    },
  );

  const saveTimeLog = useCallback(
    async (data: TimeLogCreate, timeLogId?: number): Promise<TimeLog> => {
      try {
        if (!timeLogId && !data.task_id) {
          throw new Error('Task ID is required');
        }
        const result = timeLogId
          ? await updateTimeLog(timeLogId, data)
          : await createTimeLog(data.task_id, data);
        await refetch();
        return result;
      } catch (err: unknown) {
        logger.error('Failed to save time log:', err);
        throw new Error(getApiErrorMessage(err, 'Failed to save time log'));
      }
    },
    [refetch],
  );

  const deleteTimeLog = useCallback(
    async (timeLogId: number): Promise<void> => {
      try {
        await deleteTimeLogApi(timeLogId);
        await refetch();
      } catch (err: unknown) {
        // Already deleted elsewhere: resync instead of reporting a failure.
        if (getApiErrorStatus(err) === 404) {
          await refetch();
          return;
        }
        logger.error('Failed to delete time log:', err);
        throw new Error(getApiErrorMessage(err, 'Failed to delete time log'));
      }
    },
    [refetch],
  );

  return {
    timeLogs,
    setTimeLogs,
    loading,
    error,
    setError,
    refetch,
    saveTimeLog,
    deleteTimeLog,
  };
};

export default useTimeLogCrud;
