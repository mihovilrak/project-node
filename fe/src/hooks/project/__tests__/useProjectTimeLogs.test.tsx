import { renderHook, act, waitFor } from '@testing-library/react';
import { useProjectTimeLogs } from '../useProjectTimeLogs';
import {
  getProjectTimeLogs,
  getTaskTimeLogs,
  createTimeLog,
  updateTimeLog,
  deleteTimeLog,
} from '../../../api/timeLogs';
import { getProjectTasks } from '../../../api/tasks';
import { TimeLog, TimeLogCreate } from '../../../types/timeLog';
import logger from '../../../utils/logger';

jest.mock('../../../api/timeLogs');
jest.mock('../../../api/tasks');
jest.mock('../../../utils/logger');

describe('useProjectTimeLogs', () => {
  const mockTimeLogs: TimeLog[] = [
    {
      id: 1,
      task_id: 1,
      user_id: 1,
      log_date: '2024-01-01',
      spent_time: 4,
      activity_type_id: 1,
      description: 'Work on feature',
      created_on: '2024-01-01',
      task_name: 'Task 1',
    },
    {
      id: 2,
      task_id: 2,
      user_id: 1,
      log_date: '2024-01-02',
      spent_time: 6,
      activity_type_id: 1,
      description: 'Bug fixing',
      created_on: '2024-01-02',
      task_name: 'Task 2',
    },
  ];

  const mockTimeLogCreate: TimeLogCreate = {
    task_id: 3,
    log_date: '2024-01-03',
    spent_time: 2,
    activity_type_id: 1,
    description: 'New work',
  };

  beforeEach(() => {
    jest.resetAllMocks();
    (getProjectTimeLogs as jest.Mock).mockResolvedValue(mockTimeLogs);
  });

  const renderLoaded = async () => {
    const hook = renderHook(() => useProjectTimeLogs('1'));
    await waitFor(() =>
      expect(hook.result.current.timeLogs).toEqual(mockTimeLogs),
    );
    return hook;
  };

  it('loads all project time logs with a single request', async () => {
    await renderLoaded();

    expect(getProjectTimeLogs).toHaveBeenCalledTimes(1);
    expect(getProjectTimeLogs).toHaveBeenCalledWith(
      1,
      undefined,
      expect.any(AbortSignal),
    );
    expect(getTaskTimeLogs).not.toHaveBeenCalled();
    expect(getProjectTasks).not.toHaveBeenCalled();
  });

  it('does not load without a project id', () => {
    renderHook(() => useProjectTimeLogs(''));
    expect(getProjectTimeLogs).not.toHaveBeenCalled();
  });

  it('exposes the load error', async () => {
    (getProjectTimeLogs as jest.Mock).mockRejectedValue(new Error('boom'));
    const { result } = renderHook(() => useProjectTimeLogs('1'));

    await waitFor(() => expect(result.current.timeLogsError).toBe('boom'));
    expect(logger.error).toHaveBeenCalledWith(
      'Failed to load time logs',
      expect.any(Error),
    );
  });

  it('creates a time log once and refetches', async () => {
    (createTimeLog as jest.Mock).mockResolvedValue({ id: 3 });
    const { result } = await renderLoaded();

    await act(async () => {
      await result.current.handleTimeLogSubmit(mockTimeLogCreate);
    });

    expect(createTimeLog).toHaveBeenCalledTimes(1);
    expect(createTimeLog).toHaveBeenCalledWith(3, mockTimeLogCreate);
    expect(updateTimeLog).not.toHaveBeenCalled();
    expect(getProjectTimeLogs).toHaveBeenCalledTimes(2);
  });

  it('updates the selected time log', async () => {
    (updateTimeLog as jest.Mock).mockResolvedValue(mockTimeLogs[0]);
    const { result } = await renderLoaded();

    act(() => {
      result.current.handleTimeLogEdit(mockTimeLogs[0]);
    });
    expect(result.current.timeLogDialogOpen).toBe(true);
    expect(result.current.selectedTimeLog).toEqual(mockTimeLogs[0]);
    expect(result.current.timeLogTaskId).toBe(1);

    await act(async () => {
      await result.current.handleTimeLogSubmit(mockTimeLogCreate);
    });

    expect(updateTimeLog).toHaveBeenCalledTimes(1);
    expect(updateTimeLog).toHaveBeenCalledWith(1, mockTimeLogCreate);
    expect(createTimeLog).not.toHaveBeenCalled();
  });

  it('rejects with the API message when saving fails', async () => {
    (createTimeLog as jest.Mock).mockRejectedValue({
      response: { data: { error: 'Invalid time' } },
    });
    const { result } = await renderLoaded();

    await expect(
      result.current.handleTimeLogSubmit(mockTimeLogCreate),
    ).rejects.toThrow('Invalid time');
    expect(logger.error).toHaveBeenCalledWith(
      'Failed to save time log:',
      expect.anything(),
    );
    expect(getProjectTimeLogs).toHaveBeenCalledTimes(1);
  });

  it('deletes a time log once and refetches', async () => {
    (deleteTimeLog as jest.Mock).mockResolvedValue(undefined);
    const { result } = await renderLoaded();
    (getProjectTimeLogs as jest.Mock).mockResolvedValue([mockTimeLogs[1]]);

    await act(async () => {
      await result.current.handleTimeLogDelete(1);
    });

    expect(deleteTimeLog).toHaveBeenCalledTimes(1);
    expect(deleteTimeLog).toHaveBeenCalledWith(1);
    expect(result.current.timeLogs).toEqual([mockTimeLogs[1]]);
  });

  it('rejects when deleting fails', async () => {
    (deleteTimeLog as jest.Mock).mockRejectedValue(new Error('Delete failed'));
    const { result } = await renderLoaded();

    await expect(result.current.handleTimeLogDelete(1)).rejects.toThrow(
      'Delete failed',
    );
    expect(logger.error).toHaveBeenCalledWith(
      'Failed to delete time log:',
      expect.any(Error),
    );
  });

  it('opens the dialog for a task and resets it on close', async () => {
    const { result } = await renderLoaded();

    act(() => {
      result.current.handleTimeLogEdit(mockTimeLogs[1]);
    });
    act(() => {
      result.current.openTimeLogDialog(2);
    });
    expect(result.current.timeLogDialogOpen).toBe(true);
    expect(result.current.selectedTimeLog).toBeNull();
    expect(result.current.timeLogTaskId).toBe(2);

    act(() => {
      result.current.closeTimeLogDialog();
    });
    expect(result.current.timeLogDialogOpen).toBe(false);
    expect(result.current.timeLogTaskId).toBeUndefined();
  });
});
