import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import TimeLogForm from '../TimeLogForm';
import { TimeLogFormProps } from '../../../types/timeLog';
import { Project } from '../../../types/project';

const mockProps: TimeLogFormProps = {
  projects: [
    {
        id: 1, 
        name: 'Project 1',
        description: '',
        parent_id: null,
        parent_name: null,
        status_id: 1,
        status_name: '',
        start_date: '',
        due_date: '',
        end_date: null,
        created_by: 1,
        created_by_name: '',
        created_on: '',
        updated_on: null,
        estimated_time: 0,
        spent_time: 0,
        progress: 0

    },
    {
        id: 2, 
        name: 'Project 2',
        description: '',
        parent_id: null,
        parent_name: null,
        status_id: 1,
        status_name: '',
        start_date: '',
        due_date: '',
        end_date: null,
        created_by: 1,
        created_by_name: '',
        created_on: '',
        updated_on: null,
        estimated_time: 0,
        spent_time: 0,
        progress: 0

    }
  ],
  tasks: [
    {
        id: 1,
        name: 'Task 1',
        project_id: 1,
        project_name: '',
        holder_id: 1,
        holder_name: '',
        assignee_id: 1,
        assignee_name: '',
        parent_id: null,
        parent_name: null,
        description: '',
        type_id: 1,
        type_name: '',
        status_id: 1,
        status_name: '',
        priority_id: 1,
        priority_name: '',
        start_date: null,
        due_date: null,
        end_date: null,
        spent_time: 0,
        progress: 0,
        created_by: 1,
        created_by_name: '',
        created_on: '',
        estimated_time: null

    },
    {
        id: 2,
        name: 'Task 2',
        project_id: 1,
        project_name: '',
        holder_id: 1,
        holder_name: '',
        assignee_id: 1,
        assignee_name: '',
        parent_id: null,
        parent_name: null,
        description: '',
        type_id: 1,
        type_name: '',
        status_id: 1,
        status_name: '',
        priority_id: 1,
        priority_name: '',
        start_date: null,
        due_date: null,
        end_date: null,
        spent_time: 0,
        progress: 0,
        created_by: 1,
        created_by_name: '',
        created_on: '',
        estimated_time: null

    }
  ],
  activityTypes: [
    {
        id: 1,
        name: 'Development',
        color: '#000',
        icon: null,
        active: true,
        description: null,
        created_on: '',
        updated_on: null
    },
    {
        id: 2,
        name: 'Testing',
        color: '#000',
        icon: null,
        active: true,
        description: null,
        created_on: '',
        updated_on: null
    }
  ],
  users: [
    {
        id: 1,
        name: 'User 1',
        email: 'user1@test.com',
        login: '',
        surname: '',
        role_id: 1,
        status_id: 1,
        created_on: '',
        updated_on: null,
        last_login: null

    },
    {
        id: 2,
        name: 'User 2',
        email: 'user2@test.com',
        login: '',
        surname: '',
        role_id: 1,
        status_id: 1,
        created_on: '',
        updated_on: null,
        last_login: null

    }
  ],
  selectedProjectId: 1,
  selectedTaskId: 1,
  selectedUserId: 1,
  selectedActivityTypeId: 1,
  spentTime: '2',
  description: 'Test description',
  logDate: dayjs(),
  timeError: null,
  showUserSelect: false,
  onProjectChange: jest.fn(),
  onTaskChange: jest.fn(),
  onUserChange: jest.fn(),
  onActivityTypeChange: jest.fn(),
  onSpentTimeChange: jest.fn(),
  onDescriptionChange: jest.fn(),
  onDateChange: jest.fn()
};

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LocalizationProvider dateAdapter={AdapterDayjs}>
    {children}
  </LocalizationProvider>
);

describe('TimeLogForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all form elements correctly', () => {
    render(<TimeLogForm {...mockProps} />, { wrapper });
    
    expect(screen.getByLabelText(/Project/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Task/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Activity Type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Time Spent/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Log Date/i)).toBeInTheDocument();
  });

  it('shows user select when showUserSelect is true', () => {
    render(<TimeLogForm {...mockProps} showUserSelect={true} />, { wrapper });
    expect(screen.getByLabelText(/User/i)).toBeInTheDocument();
  });

  it('handles project selection', () => {
    render(<TimeLogForm {...mockProps} />, { wrapper });
    const projectSelect = screen.getByLabelText(/Project/i);
    fireEvent.change(projectSelect, { target: { value: '2' } });
    expect(mockProps.onProjectChange).toHaveBeenCalledWith(2, mockProps.tasks);
  });

  it('handles task selection', () => {
    render(<TimeLogForm {...mockProps} />, { wrapper });
    const taskSelect = screen.getByLabelText(/Task/i);
    fireEvent.change(taskSelect, { target: { value: '2' } });
    expect(mockProps.onTaskChange).toHaveBeenCalledWith(2, mockProps.tasks);
  });

  it('validates time spent input', () => {
    render(<TimeLogForm {...mockProps} />, { wrapper });
    const timeInput = screen.getByLabelText(/Time Spent/i);
    
    // Valid input (divisible by 0.25)
    fireEvent.change(timeInput, { target: { value: '1.75' } });
    expect(mockProps.onSpentTimeChange).toHaveBeenCalled();

    // Invalid input (not divisible by 0.25)
    fireEvent.change(timeInput, { target: { value: '1.77' } });
    expect(mockProps.onSpentTimeChange).not.toHaveBeenCalledWith('1.77');
  });

  it('displays time error when provided', () => {
    render(<TimeLogForm {...mockProps} timeError="Invalid time" />, { wrapper });
    expect(screen.getByText('Invalid time')).toBeInTheDocument();
  });

  it('handles description changes', () => {
    render(<TimeLogForm {...mockProps} />, { wrapper });
    const descriptionInput = screen.getByLabelText(/Description/i);
    fireEvent.change(descriptionInput, { target: { value: 'New description' } });
    expect(mockProps.onDescriptionChange).toHaveBeenCalledWith('New description');
  });

  it('respects read-only states', () => {
    render(
      <TimeLogForm 
        {...mockProps} 
        isProjectReadOnly={true} 
        isTaskReadOnly={true} 
      />, 
      { wrapper }
    );
    
    expect(screen.getByLabelText(/Project/i)).toBeDisabled();
    expect(screen.getByLabelText(/Task/i)).toBeDisabled();
  });

  it('handles activity type changes', () => {
    render(<TimeLogForm {...mockProps} />, { wrapper });
    const activityTypeSelect = screen.getByLabelText(/Activity Type/i);
    fireEvent.change(activityTypeSelect, { target: { value: '2' } });
    expect(mockProps.onActivityTypeChange).toHaveBeenCalledWith(2);
  });

  it('handles user changes when user select is shown', () => {
    render(<TimeLogForm {...mockProps} showUserSelect={true} />, { wrapper });
    const userSelect = screen.getByLabelText(/User/i);
    fireEvent.change(userSelect, { target: { value: '2' } });
    expect(mockProps.onUserChange).toHaveBeenCalledWith(2);
  });
});