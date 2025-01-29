import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import TimeLogList from '../TimeLogList';
import { TimeLog } from '../../../types/timeLog';
import * as permissionHook from '../../../hooks/common/usePermission';

// Mock usePermission hook
jest.mock('../../../hooks/common/usePermission', () => ({
  usePermission: jest.fn()
}));

const mockTimeLogs: TimeLog[] = [
  {
    id: 1,
    task_id: 101,
    user_id: 201,
    activity_type_id: 301,
    log_date: '2023-01-01',
    spent_time: 2.5,
    description: 'Test description',
    created_on: '2023-01-01',
    updated_on: null,
    task_name: 'Test Task',
    project_name: 'Test Project',
    user: 'John Doe',
    activity_type_name: 'Development',
    activity_type_color: '#FF0000',
    activity_type_icon: 'code'
  }
];

const defaultProps = {
  timeLogs: mockTimeLogs,
  onEdit: jest.fn(),
  onDelete: jest.fn()
};

describe('TimeLogList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default permission mock
    (permissionHook.usePermission as jest.Mock).mockReturnValue({
      hasPermission: true,
      loading: false
    });
  });

  const renderComponent = (props = defaultProps) => {
    return render(
      <MemoryRouter>
        <TimeLogList {...props} />
      </MemoryRouter>
    );
  };

  it('displays empty state message when no time logs', () => {
    renderComponent({ ...defaultProps, timeLogs: [] });
    expect(screen.getByText('No time logs found')).toBeInTheDocument();
  });

  it('renders time logs correctly', () => {
    renderComponent();
    expect(screen.getByText('2:30 hours')).toBeInTheDocument();
    expect(screen.getByText('Development')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('formats time correctly', () => {
    renderComponent({
      ...defaultProps,
      timeLogs: [{
        ...mockTimeLogs[0],
        spent_time: 2.75
      }]
    });
    expect(screen.getByText('2:45 hours')).toBeInTheDocument();
  });

  it('shows edit button when user has permission', () => {
    renderComponent();
    const editButton = screen.getByRole('button', { name: /edit time log/i });
    expect(editButton).toBeInTheDocument();
    
    fireEvent.click(editButton);
    expect(defaultProps.onEdit).toHaveBeenCalledWith(mockTimeLogs[0]);
  });

  it('shows delete button when user has permission', () => {
    renderComponent();
    const deleteButton = screen.getByRole('button', { name: /delete time log/i });
    expect(deleteButton).toBeInTheDocument();
    
    fireEvent.click(deleteButton);
    expect(defaultProps.onDelete).toHaveBeenCalledWith(mockTimeLogs[0].id);
  });

  it('hides edit/delete buttons when user lacks permission', () => {
    (permissionHook.usePermission as jest.Mock).mockReturnValue({
      hasPermission: false,
      loading: false
    });
    
    renderComponent();
    expect(screen.queryByRole('button', { name: /edit time log/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /delete time log/i })).toBeInTheDocument();
  });

  it('renders activity type chip with correct color', () => {
    renderComponent();
    const chip = screen.getByText('Development');
    expect(chip.parentElement).toHaveStyle({ backgroundColor: '#FF0000' });
  });

  it('formats date correctly', () => {
    renderComponent();
    expect(screen.getByText(new Date('2023-01-01').toLocaleDateString())).toBeInTheDocument();
  });

  it('renders user and task links correctly', () => {
    renderComponent();
    expect(screen.getByRole('link', { name: 'John Doe' })).toHaveAttribute('href', '/users/201');
    expect(screen.getByRole('link', { name: 'Test Task' })).toHaveAttribute('href', '/tasks/101');
  });

  it('handles invalid time values gracefully', () => {
    renderComponent({
      ...defaultProps,
      timeLogs: [{
        ...mockTimeLogs[0],
        spent_time: 'invalid'
      }]
    });
    expect(screen.getByText('0:00 hours')).toBeInTheDocument();
  });
});