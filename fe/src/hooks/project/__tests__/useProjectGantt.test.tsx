import { renderHook, act } from '@testing-library/react';
import { useProjectGantt } from '../useProjectGantt';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { ReactNode } from 'react';

// Create a wrapper component that provides the theme
const wrapper = ({ children }: { children: ReactNode }) => (
  <ThemeProvider theme={createTheme()}>{children}</ThemeProvider>
);

describe('useProjectGantt', () => {
  const mockTasks = [
    {
      id: 1,
      name: 'Task 1',
      start_date: '2024-01-01T00:00:00Z',
      due_date: '2024-01-31T00:00:00Z',
      assignee_id: 1,
      type_name: 'Feature',
      priority_name: 'High',
      status_name: 'In Progress',
      description: 'Test description'
    },
    {
      id: 2,
      name: 'Task 2',
      start_date: '2024-02-01T00:00:00Z',
      due_date: '2024-02-28T00:00:00Z',
      assignee_id: 2,
      type_name: 'Bug',
      priority_name: 'Normal',
      status_name: 'New',
      description: 'Another test description'
    }
  ];

  it('should format tasks correctly on initialization', () => {
    const { result } = renderHook(() => useProjectGantt(mockTasks), { wrapper });

    expect(result.current.tasks).toEqual([
      {
        id: 1,
        title: 'Task 1',
        startDate: new Date('2024-01-01T00:00:00Z'),
        endDate: new Date('2024-01-31T00:00:00Z'),
        assigneeId: 1,
        type_name: 'Feature',
        priority: 'High',
        status: 'In Progress',
        description: 'Test description'
      },
      {
        id: 2,
        title: 'Task 2',
        startDate: new Date('2024-02-01T00:00:00Z'),
        endDate: new Date('2024-02-28T00:00:00Z'),
        assigneeId: 2,
        type_name: 'Bug',
        priority: 'Normal',
        status: 'New',
        description: 'Another test description'
      }
    ]);
    expect(result.current.loading).toBe(false);
  });

  it('should handle empty task list', () => {
    const { result } = renderHook(() => useProjectGantt([]), { wrapper });

    expect(result.current.tasks).toEqual([]);
    expect(result.current.loading).toBe(false);
  });

  it('should get correct status colors', () => {
    const { result } = renderHook(() => useProjectGantt([]), { wrapper });

    const theme = createTheme();
    expect(result.current.getStatusColor('in progress')).toBe(theme.palette.primary.main);
    expect(result.current.getStatusColor('done')).toBe(theme.palette.success.main);
    expect(result.current.getStatusColor('cancelled')).toBe(theme.palette.error.main);
    expect(result.current.getStatusColor('unknown')).toBe(theme.palette.grey[300]);
  });

  it('should get correct priority colors', () => {
    const { result } = renderHook(() => useProjectGantt([]), { wrapper });

    const theme = createTheme();
    expect(result.current.getPriorityColor('very high/must')).toBe(theme.palette.error.main);
    expect(result.current.getPriorityColor('high/should')).toBe(theme.palette.warning.main);
    expect(result.current.getPriorityColor('normal/could')).toBe(theme.palette.info.main);
    expect(result.current.getPriorityColor('unknown')).toBe(theme.palette.grey[400]);
  });

  it('should handle current view name changes', () => {
    const { result } = renderHook(() => useProjectGantt([]), { wrapper });

    act(() => {
      result.current.setCurrentViewName('Week');
    });
    expect(result.current.currentViewName).toBe('Week');

    act(() => {
      result.current.setCurrentViewName('Month');
    });
    expect(result.current.currentViewName).toBe('Month');
  });

  it('should handle current date changes', () => {
    const { result } = renderHook(() => useProjectGantt([]), { wrapper });
    const newDate = new Date('2024-02-01');

    act(() => {
      result.current.setCurrentDate(newDate);
    });
    expect(result.current.currentDate).toEqual(newDate);
  });

  it('should handle task updates', () => {
    const { result } = renderHook(() => useProjectGantt(mockTasks), { wrapper });
    const updatedTask = {
      id: 1,
      name: 'Updated Task 1',
      start_date: '2024-03-01T00:00:00Z',
      due_date: '2024-03-31T00:00:00Z',
      assignee_id: 1,
      type_name: 'Feature',
      priority_name: 'High',
      status_name: 'Done',
      description: 'Updated description'
    };

    // Since we can't directly update tasks, we need to re-initialize with new tasks
    const { rerender } = renderHook((props) => useProjectGantt(props), {
      wrapper,
      initialProps: [updatedTask]
    });

    rerender([updatedTask]);

    expect(result.current.tasks[0].title).toBe('Updated Task 1');
    expect(result.current.tasks[0].status).toBe('Done');
  });

  it('should handle resource rendering', () => {
    const { result } = renderHook(() => useProjectGantt(mockTasks), { wrapper });
    const mockResources = [
      { id: 1, name: 'John Doe' },
      { id: 2, name: 'Jane Smith' }
    ];

    const renderedAppointment = result.current.renderAppointment({
      data: {
        status: 'in progress',
        priority: 'high/should'
      },
      style: {},
      children: null
    });

    expect(renderedAppointment.style.backgroundColor).toBe(createTheme().palette.primary.main);
    expect(renderedAppointment.style.borderLeft).toBe(`4px solid ${createTheme().palette.warning.main}`);
  });
});
