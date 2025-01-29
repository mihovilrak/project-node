import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProjectEditDialog from '../ProjectEditDialog';
import { updateProject, getProjectStatuses } from '../../../api/projects';
import { Project, ProjectStatus } from '../../../types/project';

// Mock the API modules
jest.mock('../../../api/projects');

// Mock data
const mockProject: Project = {
  id: 1,
  name: 'Test Project',
  description: 'Test Description',
  start_date: '2023-01-01T00:00:00',
  due_date: '2023-12-31T00:00:00',
  status_id: 1,
  status_name: 'Active',
  parent_id: null,
  parent_name: null,
  created_by: 1,
  created_by_name: 'Test User',
  created_on: '2023-01-01T00:00:00',
  estimated_time: 0,
  spent_time: 0,
  progress: 0
};

const mockStatuses: ProjectStatus[] = [
  { id: 1, name: 'Active' },
  { id: 2, name: 'On Hold' },
  { id: 3, name: 'Completed' }
];

// Default props
const defaultProps = {
  open: true,
  project: mockProject,
  onClose: jest.fn(),
  onSaved: jest.fn()
};

describe('ProjectEditDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getProjectStatuses as jest.Mock).mockResolvedValue(mockStatuses);
  });

  it('renders all form fields with project data', async () => {
    render(<ProjectEditDialog {...defaultProps} />);

    expect(screen.getByLabelText(/name/i)).toHaveValue(mockProject.name);
    expect(screen.getByLabelText(/description/i)).toHaveValue(mockProject.description);
    expect(screen.getByLabelText(/start date/i)).toHaveValue('2023-01-01');
    expect(screen.getByLabelText(/due date/i)).toHaveValue('2023-12-31');
    expect(screen.getByLabelText(/status/i)).toBeInTheDocument();
  });

  it('handles form submission correctly', async () => {
    const updatedProject = { ...mockProject, name: 'Updated Project' };
    (updateProject as jest.Mock).mockResolvedValueOnce(updatedProject);

    render(<ProjectEditDialog {...defaultProps} />);

    const nameInput = screen.getByLabelText(/name/i);
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'Updated Project');

    const saveButton = screen.getByText(/save changes/i);
    await userEvent.click(saveButton);

    await waitFor(() => {
      expect(updateProject).toHaveBeenCalledWith(mockProject.id, expect.objectContaining({
        name: 'Updated Project'
      }));
      expect(defaultProps.onSaved).toHaveBeenCalledWith(updatedProject);
      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });

  it('displays error message when update fails', async () => {
    const error = new Error('Update failed');
    (updateProject as jest.Mock).mockRejectedValueOnce(error);

    render(<ProjectEditDialog {...defaultProps} />);

    const saveButton = screen.getByText(/save changes/i);
    await userEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/failed to update project/i)).toBeInTheDocument();
    });
  });

  it('handles dialog close', () => {
    render(<ProjectEditDialog {...defaultProps} />);

    const cancelButton = screen.getByText(/cancel/i);
    fireEvent.click(cancelButton);

    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('disables buttons during loading state', async () => {
    (updateProject as jest.Mock).mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<ProjectEditDialog {...defaultProps} />);

    const saveButton = screen.getByText(/save changes/i);
    await userEvent.click(saveButton);

    expect(saveButton).toBeDisabled();
    expect(screen.getByText(/cancel/i)).toBeDisabled();
  });

  it('validates date inputs', async () => {
    render(<ProjectEditDialog {...defaultProps} />);

    const startDateInput = screen.getByLabelText(/start date/i);
    const dueDateInput = screen.getByLabelText(/due date/i);

    await userEvent.clear(startDateInput);
    await userEvent.type(startDateInput, '2023-12-31');
    await userEvent.clear(dueDateInput);
    await userEvent.type(dueDateInput, '2023-01-01');

    const saveButton = screen.getByText(/save changes/i);
    await userEvent.click(saveButton);

    // The form should prevent submission with invalid dates
    expect(updateProject).not.toHaveBeenCalled();
  });

  it('updates status correctly', async () => {
    render(<ProjectEditDialog {...defaultProps} />);

    const statusSelect = screen.getByLabelText(/status/i);
    await userEvent.click(statusSelect);

    const newStatus = screen.getByText('On Hold');
    await userEvent.click(newStatus);

    const saveButton = screen.getByText(/save changes/i);
    await userEvent.click(saveButton);

    await waitFor(() => {
      expect(updateProject).toHaveBeenCalledWith(mockProject.id, expect.objectContaining({
        status_id: 2
      }));
    });
  });
});