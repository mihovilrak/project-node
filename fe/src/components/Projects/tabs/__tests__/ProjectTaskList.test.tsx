import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import ProjectTaskList from '../ProjectTaskList';
import { Task } from '../../../../types/task';

const mockTasks: Task[] = [
  {
    id: 1,
    name: 'Test Task 1',
    project_id: 1,
    project_name: 'Test Project',
    holder_id: 101,
    holder_name: 'John Holder',
    assignee_id: 201,
    assignee_name: 'Jane Assignee',
    parent_id: null,
    parent_name: null,
    description: 'Test description',
    type_id: 1,
    type_name: 'Bug',
    type_color: '#ff0000',
    type_icon: 'bug',
    status_id: 1,
    status_name: 'In Progress',
    priority_id: 1,
    priority_name: 'High',
    priority_color: '#ff0000',
    start_date: '2024-01-01',
    due_date: '2024-12-31',
    end_date: null,
    spent_time: 5,
    progress: 50,
    created_by: 1,
    created_by_name: 'Creator',
    created_on: '2024-01-01',
    estimated_time: 10
  },
  {
    id: 2,
    name: 'Test Task 2',
    project_id: 1,
    project_name: 'Test Project',
    holder_id: 102,
    holder_name: 'Jane Holder',
    assignee_id: 202,
    assignee_name: 'John Assignee',
    parent_id: null,
    parent_name: null,
    description: 'Another test description',
    type_id: 2,
    type_name: 'Feature',
    type_color: '#00ff00',
    type_icon: 'feature',
    status_id: 2,
    status_name: 'Done',
    priority_id: 2,
    priority_name: 'Medium',
    priority_color: '#00ff00',
    start_date: '2024-02-01',
    due_date: '2024-11-30',
    end_date: null,
    spent_time: 8,
    progress: 75,
    created_by: 2,
    created_by_name: 'Another Creator',
    created_on: '2024-01-15',
    estimated_time: 15
  }
];

describe('ProjectTaskList', () => {
  it('renders task list correctly', () => {
    render(
      <MemoryRouter>
        <ProjectTaskList tasks={mockTasks} />
      </MemoryRouter>
    );

    expect(screen.getByText('Test Task 1')).toBeInTheDocument();
    expect(screen.getByText('Test Task 2')).toBeInTheDocument();
  });
});