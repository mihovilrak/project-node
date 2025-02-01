import { renderHook, act } from '@testing-library/react';
import { useProjectOverview } from '../useProjectOverview';
import { getSubprojects } from '../../../api/projects';
import { Project } from '../../../types/project';
import { useNavigate } from 'react-router-dom';

// Mock dependencies
jest.mock('../../../api/projects');
jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn()
}));

describe('useProjectOverview', () => {
  const mockSubprojects: Project[] = [
    {
      id: 2,
      name: 'Subproject 1',
      description: 'Description 1',
      parent_id: 1,
      parent_name: 'Parent Project',
      status_id: 1,
      status_name: 'Active',
      start_date: '2024-01-01',
      due_date: '2024-12-31',
      created_by: 1,
      created_by_name: 'Test User',
      created_on: '2024-01-01',
      estimated_time: 100,
      spent_time: 50,
      progress: 50
    },
    {
      id: 3,
      name: 'Subproject 2',
      description: 'Description 2',
      parent_id: 1,
      parent_name: 'Parent Project',
      status_id: 1,
      status_name: 'Active',
      start_date: '2024-02-01',
      due_date: '2024-12-31',
      created_by: 1,
      created_by_name: 'Test User',
      created_on: '2024-01-01',
      estimated_time: 200,
      spent_time: 100,
      progress: 50
    }
  ];

  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
    (getSubprojects as jest.Mock).mockResolvedValue(mockSubprojects);
  });

  it('should fetch subprojects when projectId is provided', async () => {
    const projectId = 1;
    const { result } = renderHook(() => useProjectOverview(projectId));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(getSubprojects).toHaveBeenCalledWith(projectId);
    expect(result.current.subprojects).toEqual(mockSubprojects);
  });

  it('should not fetch subprojects when projectId is undefined', async () => {
    const { result } = renderHook(() => useProjectOverview(undefined));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(getSubprojects).not.toHaveBeenCalled();
    expect(result.current.subprojects).toEqual([]);
  });

  it('should handle error during subprojects fetch', async () => {
    const error = new Error('Failed to fetch subprojects');
    (getSubprojects as jest.Mock).mockRejectedValue(error);
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() => useProjectOverview(1));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(consoleSpy).toHaveBeenCalledWith('Failed to fetch subprojects:', error);
    expect(result.current.subprojects).toEqual([]);

    consoleSpy.mockRestore();
  });

  it('should navigate to new project page with parent ID when adding subproject', () => {
    const projectId = 1;
    const { result } = renderHook(() => useProjectOverview(projectId));

    act(() => {
      result.current.handleAddSubproject();
    });

    expect(mockNavigate).toHaveBeenCalledWith('/projects/new?parentId=1');
  });

  it('should not navigate when projectId is undefined', () => {
    const { result } = renderHook(() => useProjectOverview(undefined));

    act(() => {
      result.current.handleAddSubproject();
    });

    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
