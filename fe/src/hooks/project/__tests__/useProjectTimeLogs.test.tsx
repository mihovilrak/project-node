import { renderHook, act } from '@testing-library/react';
import { useProjectTimeLogs } from '../useProjectTimeLogs';
import {
  getProjectTimeLogs,
  createTimeLog,
  updateTimeLog,
  deleteTimeLog
} from '../../../api/timeLogs';
import { TimeLog, TimeLogCreate } from '../../../types/timeLog';

// Mock dependencies
jest.mock('../../../api/timeLogs');

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
      task_name: 'Task 1'
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
      task_name: 'Task 2'
    }
  ];

  const mockTimeLogCreate: TimeLogCreate = {
    task_id: 3,
    log_date: '2024-01-03',
    spent_time: 2,
    activity_type_id: 1,
    description: 'New work'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getProjectTimeLogs as jest.Mock).mockResolvedValue(mockTimeLogs);
  });

  it('should fetch project time logs on mount', async () => {
    const { result } = renderHook(() => useProjectTimeLogs('1'));

    await act(async () => {
      await result.current.loadTimeLogs();
    });

    expect(getProjectTimeLogs).toHaveBeenCalledWith(1);
    expect(result.current.timeLogs).toEqual(mockTimeLogs);
  });

  it('should handle time log creation', async () => {
    const newTimeLog: TimeLog = {
      id: 3,
      user_id: 1,
      created_on: '2024-01-03',
      task_name: 'Task 3',
      ...mockTimeLogCreate
    };
    (createTimeLog as jest.Mock).mockResolvedValue(newTimeLog);

    const { result } = renderHook(() => useProjectTimeLogs('1'));

    await act(async () => {
      await result.current.loadTimeLogs();
    });

    await act(async () => {
      await result.current.handleTimeLogSubmit(mockTimeLogCreate);
    });

    expect(createTimeLog).toHaveBeenCalledWith(mockTimeLogCreate);
    expect(result.current.timeLogs).toContainEqual(newTimeLog);
  });

  it('should handle time log update', async () => {
    const updatedTimeLog = {
      ...mockTimeLogs[0],
      spent_time: 5,
      description: 'Updated work',
      activity_type_id: 2
    };
    (updateTimeLog as jest.Mock).mockResolvedValue(updatedTimeLog);

    const { result } = renderHook(() => useProjectTimeLogs('1'));

    await act(async () => {
      await result.current.loadTimeLogs();
    });

    await act(async () => {
      await result.current.handleTimeLogEdit(updatedTimeLog);
    });

    expect(updateTimeLog).toHaveBeenCalledWith(updatedTimeLog.id, updatedTimeLog);
    expect(result.current.timeLogs[0]).toEqual(updatedTimeLog);
  });

  it('should handle time log deletion', async () => {
    (deleteTimeLog as jest.Mock).mockResolvedValue(undefined);

    const { result } = renderHook(() => useProjectTimeLogs('1'));

    await act(async () => {
      await result.current.loadTimeLogs();
    });

    await act(async () => {
      await result.current.handleTimeLogDelete(1);
    });

    expect(deleteTimeLog).toHaveBeenCalledWith(1);
    expect(result.current.timeLogs).toEqual([mockTimeLogs[1]]);
  });

  it('should handle error during time log operations', async () => {
    const error = new Error('Failed to create time log');
    (createTimeLog as jest.Mock).mockRejectedValue(error);

    const { result } = renderHook(() => useProjectTimeLogs('1'));

    await expect(result.current.handleTimeLogSubmit(mockTimeLogCreate)).rejects.toThrow('Failed to create time log');
  });

  it('should manage time log dialog state', () => {
    const { result } = renderHook(() => useProjectTimeLogs('1'));

    act(() => {
      result.current.setTimeLogDialogOpen(true);
    });
    expect(result.current.timeLogDialogOpen).toBe(true);

    act(() => {
      result.current.setTimeLogDialogOpen(false);
    });
    expect(result.current.timeLogDialogOpen).toBe(false);
  });

  it('should manage selected time log', () => {
    const { result } = renderHook(() => useProjectTimeLogs('1'));

    act(() => {
      result.current.setSelectedTimeLog(mockTimeLogs[0]);
    });
    expect(result.current.selectedTimeLog).toEqual(mockTimeLogs[0]);

    act(() => {
      result.current.setSelectedTimeLog(null);
    });
    expect(result.current.selectedTimeLog).toBeNull();
  });
});
