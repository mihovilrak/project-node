import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import TaskTable from '../TaskTable';
import { Task, TaskPriority, TaskStatus, TaskType } from '../../../types/task';
import { ProjectMember } from '../../../types/project';

// Mock the useNavigate hook
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

const mockTasks: Task[] = [
  {
    id: 1,
    name: 'Test Task 1',
    description: 'Description 1',
    project_id: 1,
    project_name: 'Project 1',
    holder_id: 1,
    holder_name: 'John Doe',
    assignee_id: 1,
    assignee_name: 'John Doe',
    parent_id: null,
    parent_name: null,
    type_id: 1,
    type_name: 'Bug',
    type_color: '#f44336',
    status_id: 1,
    status_name: 'In Progress',
    priority_id: 1,
    priority_name: 'High/Should',
    start_date: '2023-01-01',
    due_date: '2023-12-31',
    end_date: null,
    spent_time: 0,
    progress: 0,
    created_by: 1,
    created_by_name: 'John Doe',
    created_on: '2023-01-01',
    estimated_time: 8
  },
  {
    id: 2,
    name: 'Test Task 2',
    description: 'Description 2',
    project_id: 1,
    project_name: 'Project 1',
    holder_id: 2,
    holder_name: 'Jane Smith',
    assignee_id: 2,
    assignee_name: 'Jane Smith',
    parent_id: null,
    parent_name: null,
    type_id: 2,
    type_name: 'Feature',
    type_color: '#4caf50',
    status_id: 5,
    status_name: 'Done',
    priority_id: 2,
    priority_name: 'Normal/Could',
    start_date: null,
    due_date: null,
    end_date: null,
    spent_time: 0,
    progress: 0,
    created_by: 1,
    created_by_name: 'John Doe',
    created_on: '2023-01-01',
    estimated_time: 16
  }
];

const mockPriorities: TaskPriority[] = [
  {
    id: 1,
    name: 'High/Should',
    color: '#ff0000',
    description: null,
    active: true,
    created_on: '2023-01-01',
    updated_on: null
  },
  {
    id: 2,
    name: 'Normal/Could',
    color: '#00ff00',
    description: null,
    active: true,
    created_on: '2023-01-01',
    updated_on: null
  }
];

const mockStatuses: TaskStatus[] = [
  {
    id: 1,
    name: 'In Progress',
    color: '#ffff00',
    description: null,
    active: true,
    created_on: '2023-01-01',
    updated_on: null
  },
  {
    id: 5,
    name: 'Done',
    color: '#00ff00',
    description: null,
    active: true,
    created_on: '2023-01-01',
    updated_on: null
  }
];

// Update mock users to be ProjectMembers
const mockUsers: ProjectMember[] = [
  {
    project_id: 1,
    user_id: 1,
    created_on: '2023-01-01',
    name: 'John',
    surname: 'Doe',
    role: 'Developer'
  },
  {
    project_id: 1,
    user_id: 2,
    created_on: '2023-01-01',
    name: 'Jane',
    surname: 'Smith',
    role: 'Developer'
  }
];

const mockTaskTypes: TaskType[] = [
  { id: 1, name: 'Bug', color: '#f44336', icon: 'bug' },
  { id: 2, name: 'Feature', color: '#4caf50', icon: 'feature' }
];

// Update the interface for renderTaskTable props
const renderTaskTable = (props: {
  tasks: Task[];
  loading: boolean;
  priorities?: TaskPriority[];
  statuses?: TaskStatus[];
  users?: ProjectMember[];
  taskTypes?: TaskType[];
}) => {
  const defaultProps = {
    priorities: mockPriorities,
    statuses: mockStatuses,
    users: mockUsers,
    taskTypes: mockTaskTypes,
    ...props
  };

  return render(
    <MemoryRouter>
      <TaskTable {...defaultProps} />
    </MemoryRouter>
  );
};

describe('TaskTable', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('displays loading spinner when loading', () => {
    renderTaskTable({ tasks: [], loading: true });
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('renders table with correct headers', () => {
    renderTaskTable({ tasks: mockTasks, loading: false });
    
    const headers = [
      'Name',
      'Type',
      'Status',
      'Priority',
      'Assignee',
      'Due Date',
      'Actions'
    ];
    headers.forEach(header => {
      expect(screen.getByText(header)).toBeInTheDocument();
    });
  });

  test('renders tasks with correct data', () => {
    renderTaskTable({ tasks: mockTasks, loading: false });

    expect(screen.getByText('Test Task 1')).toBeInTheDocument();
    expect(screen.getByText('Test Task 2')).toBeInTheDocument();
    expect(screen.getByText('Bug')).toBeInTheDocument();
    expect(screen.getByText('Feature')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  test('formats due date correctly', () => {
    renderTaskTable({ tasks: mockTasks, loading: false });
    
    // Accepts dates like 31.12.2023, 31. 12. 2023., 12/31/2023, etc.
    expect(
      screen.getByText((content) =>
        /\b(31\s*[\./-]\s*12\s*[\./-]\s*2023\.?)+\b|\b(12\s*[\./-]\s*31\s*[\./-]\s*2023\.?)+\b|\b(2023\s*[\./-]\s*12\s*[\./-]\s*31\.?)+\b/.test(content)
      )
    ).toBeInTheDocument();
    expect(screen.getByText('-')).toBeInTheDocument();
  });

  test('navigates to task details when edit button is clicked', () => {
    renderTaskTable({ tasks: mockTasks, loading: false });
    
    const editButtons = screen.getAllByRole('button');
    fireEvent.click(editButtons[0]);

    expect(mockNavigate).toHaveBeenCalledWith('/tasks/1');
  });

  test('applies correct status colors', () => {
    renderTaskTable({ tasks: mockTasks, loading: false });
    
    const statusChips = screen.getAllByText(/In Progress|Done/);
    const doneChip = statusChips.find(chip => chip.textContent === 'Done');
    expect(doneChip?.closest('[class*="MuiChip-colorSuccess"]')).toBeInTheDocument();
  });

  test('applies correct priority colors', () => {
    renderTaskTable({ tasks: mockTasks, loading: false });
    
    const priorityChips = screen.getAllByText(/High\/Should|Normal\/Could/);
    expect(priorityChips).toHaveLength(2);
    
    const highPriorityChip = priorityChips.find(chip => chip.textContent === 'High/Should');
    expect(highPriorityChip?.closest('[class*="MuiChip-colorWarning"]')).toBeInTheDocument();
  });

  test('renders empty table when no tasks provided', () => {
    renderTaskTable({ tasks: [], loading: false });
    
    const headers = ['Name', 'Type', 'Status', 'Priority', 'Assignee', 'Due Date', 'Actions'];
    headers.forEach(header => {
      expect(screen.getByText(header)).toBeInTheDocument();
    });
    
    expect(screen.queryByRole('row')).toBeTruthy();
    expect(screen.queryAllByRole('row')).toHaveLength(1); // Only header row
  });
});