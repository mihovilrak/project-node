import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import ProjectTaskList from '../ProjectTaskList';
import { Task } from '../../../../types/task';

const baseTask = {
  project_id: 1,
  project_name: 'Test Project',
  holder_id: 101,
  holder_name: 'John Holder',
  assignee_id: 201,
  assignee_name: 'Jane Assignee',
  description: '',
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
};

const mockTasks: Task[] = [
  {
    ...baseTask,
    id: 1,
    name: 'Test Task 1',
    parent_id: null,
    parent_name: null
  },
  {
    ...baseTask,
    id: 2,
    name: 'Test Task 2',
    parent_id: null,
    parent_name: null
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

  it('shows expand arrow and subtasks when task has children', () => {
    const tasksWithChild: Task[] = [
      ...mockTasks,
      {
        ...baseTask,
        id: 3,
        name: 'Subtask 1',
        parent_id: 1,
        parent_name: 'Test Task 1'
      }
    ];
    render(
      <MemoryRouter>
        <ProjectTaskList tasks={tasksWithChild} />
      </MemoryRouter>
    );

    expect(screen.queryByText('Subtask 1')).not.toBeInTheDocument();
    const expandButton = screen.getByRole('button', { name: /expand subtasks/i });
    fireEvent.click(expandButton);
    expect(screen.getByText('Subtask 1')).toBeInTheDocument();
  });

  it('displays task ID, type chip, progress and short labels', () => {
    render(
      <MemoryRouter>
        <ProjectTaskList tasks={mockTasks} />
      </MemoryRouter>
    );
    expect(screen.getByText('#1')).toBeInTheDocument();
    expect(screen.getByText('#2')).toBeInTheDocument();
    expect(screen.getAllByText('Bug').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Estimated: 10h/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Spent: 5h/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('50%').length).toBeGreaterThanOrEqual(1);
  });

  it('shows nested subtasks when expanding parent then child', () => {
    const tasksNested: Task[] = [
      { ...baseTask, id: 1, name: 'Task A', parent_id: null, parent_name: null },
      { ...baseTask, id: 2, name: 'Task B', parent_id: 1, parent_name: 'Task A' },
      { ...baseTask, id: 3, name: 'Task C', parent_id: 2, parent_name: 'Task B' }
    ];
    render(
      <MemoryRouter>
        <ProjectTaskList tasks={tasksNested} />
      </MemoryRouter>
    );
    expect(screen.queryByText('Task B')).not.toBeInTheDocument();
    expect(screen.queryByText('Task C')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /expand subtasks/i }));
    expect(screen.getByText('Task B')).toBeInTheDocument();
    expect(screen.queryByText('Task C')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /expand subtasks/i }));
    expect(screen.getByText('Task C')).toBeInTheDocument();
  });
});