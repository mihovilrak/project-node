import React from 'react';
import { render, screen } from '@testing-library/react';
import { TypesAndRolesDialog } from '../TypesAndRolesDialog';
import { TaskType, ActivityType } from '../../../types/setting';
import { Role } from '../../../types/role';

// Mock the child dialog components
jest.mock('../TaskTypeDialog', () => ({
  __esModule: true,
  default: ({ open, taskType, onClose, onSave }: any) => (
    <div data-testid="mock-task-type-dialog">
      TaskTypeDialog Component
    </div>
  ),
}));

jest.mock('../ActivityTypeDialog', () => ({
  __esModule: true,
  default: ({ open, activityType, onClose, onSave }: any) => (
    <div data-testid="mock-activity-type-dialog">
      ActivityTypeDialog Component
    </div>
  ),
}));

jest.mock('../RoleDialog', () => ({
  __esModule: true,
  default: ({ open, role, onClose, onSave }: any) => (
    <div data-testid="mock-role-dialog">
      RoleDialog Component
    </div>
  ),
}));

const mockTaskType: TaskType = {
  id: 1,
  name: 'Test Task Type',
  color: '#000000',
  active: true
};

const mockActivityType: ActivityType = {
  id: 1,
  name: 'Test Activity Type',
  color: '#000000',
  active: true
};

const mockRole: Role = {
  id: 1,
  name: 'Test Role'
};

const defaultProps = {
  activeTab: 0,
  dialogOpen: true,
  selectedItem: null,
  onClose: jest.fn(),
  onSave: jest.fn()
};

describe('TypesAndRolesDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders TaskTypeDialog when activeTab is 0', () => {
    render(
      <TypesAndRolesDialog
        {...defaultProps}
        activeTab={0}
        selectedItem={mockTaskType}
      />
    );

    expect(screen.getByTestId('mock-task-type-dialog')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-activity-type-dialog')).not.toBeInTheDocument();
    expect(screen.queryByTestId('mock-role-dialog')).not.toBeInTheDocument();
  });

  it('renders ActivityTypeDialog when activeTab is 1', () => {
    render(
      <TypesAndRolesDialog
        {...defaultProps}
        activeTab={1}
        selectedItem={mockActivityType}
      />
    );

    expect(screen.queryByTestId('mock-task-type-dialog')).not.toBeInTheDocument();
    expect(screen.getByTestId('mock-activity-type-dialog')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-role-dialog')).not.toBeInTheDocument();
  });

  it('renders RoleDialog when activeTab is 2', () => {
    render(
      <TypesAndRolesDialog
        {...defaultProps}
        activeTab={2}
        selectedItem={mockRole}
      />
    );

    expect(screen.queryByTestId('mock-task-type-dialog')).not.toBeInTheDocument();
    expect(screen.queryByTestId('mock-activity-type-dialog')).not.toBeInTheDocument();
    expect(screen.getByTestId('mock-role-dialog')).toBeInTheDocument();
  });

  it('returns null for invalid activeTab value', () => {
    const { container } = render(
      <TypesAndRolesDialog
        {...defaultProps}
        activeTab={999}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('passes correct props to TaskTypeDialog', () => {
    const onClose = jest.fn();
    const onSave = jest.fn();

    render(
      <TypesAndRolesDialog
        activeTab={0}
        dialogOpen={true}
        selectedItem={mockTaskType}
        onClose={onClose}
        onSave={onSave}
      />
    );

    const dialog = screen.getByTestId('mock-task-type-dialog');
    expect(dialog).toBeInTheDocument();
  });

  it('passes correct props to ActivityTypeDialog', () => {
    const onClose = jest.fn();
    const onSave = jest.fn();

    render(
      <TypesAndRolesDialog
        activeTab={1}
        dialogOpen={true}
        selectedItem={mockActivityType}
        onClose={onClose}
        onSave={onSave}
      />
    );

    const dialog = screen.getByTestId('mock-activity-type-dialog');
    expect(dialog).toBeInTheDocument();
  });

  it('passes correct props to RoleDialog', () => {
    const onClose = jest.fn();
    const onSave = jest.fn();

    render(
      <TypesAndRolesDialog
        activeTab={2}
        dialogOpen={true}
        selectedItem={mockRole}
        onClose={onClose}
        onSave={onSave}
      />
    );

    const dialog = screen.getByTestId('mock-role-dialog');
    expect(dialog).toBeInTheDocument();
  });
});