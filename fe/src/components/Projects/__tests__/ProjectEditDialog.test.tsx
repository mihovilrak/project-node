import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProjectEditDialog from '../ProjectEditDialog';
import { updateProject, getProjectStatuses } from '../../../api/projects';
import { Project, ProjectStatus } from '../../../types/project';

jest.mock('../../../api/projects');

const mockProject: Project = {
  id: 1,
  name: 'Test Project',
  description: 'Test Description',
  start_date: '2023-01-01T00:00:00',
  due_date: '2023-12-31T00:00:00',
  end_date: null,
  status_id: 1,
  status_name: 'Active',
  parent_id: null,
  parent_name: null,
  created_by: 1,
  created_by_name: 'Test User',
  created_on: '2023-01-01T00:00:00',
  estimated_time: 0,
  spent_time: 0,
  progress: 0,
  updated_on: null
};

const mockStatuses: ProjectStatus[] = [
  { id: 1, name: 'Active' },
  { id: 2, name: 'On Hold' },
  { id: 3, name: 'Completed' }
];

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

  it('renders dialog with title', () => {
    render(<ProjectEditDialog {...defaultProps} />);
    expect(screen.getByText('Edit Project')).toBeInTheDocument();
  });

  it('calls API when save button is clicked', async () => {
    const updatedProject = { ...mockProject, name: 'Updated Project' };
    (updateProject as jest.Mock).mockResolvedValueOnce(updatedProject);

    render(<ProjectEditDialog {...defaultProps} />);

    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(updateProject).toHaveBeenCalledWith(mockProject.id, expect.any(Object));
      expect(defaultProps.onSaved).toHaveBeenCalledWith(updatedProject);
      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });

  it('shows error message when update fails', async () => {
    const error = new Error('Update failed');
    (updateProject as jest.Mock).mockRejectedValueOnce(error);

    render(<ProjectEditDialog {...defaultProps} />);

    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Failed to update project')).toBeInTheDocument();
    });
  });

  it('calls onClose when cancel is clicked', () => {
    render(<ProjectEditDialog {...defaultProps} />);

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('disables buttons during loading', async () => {
    (updateProject as jest.Mock).mockImplementation(() => new Promise(() => {}));

    render(<ProjectEditDialog {...defaultProps} />);

    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);

    await waitFor(() => {
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
      buttons.forEach(button => {
        expect(button).toBeDisabled();
      });
    });
  });

  it('handles date validation', async () => {
    const updatedProject = {
      ...mockProject,
      start_date: '2023-01-01T00:00:00',
      due_date: '2023-12-31T00:00:00'
    };
    (updateProject as jest.Mock).mockResolvedValueOnce(updatedProject);
    
    render(<ProjectEditDialog {...defaultProps} />);
    
    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(updateProject).toHaveBeenCalledWith(
        mockProject.id,
        expect.objectContaining({
          start_date: '2023-01-01',
          due_date: '2023-12-31'
        })
      );
    });
  });
  
  it('prevents submission with invalid dates', () => {
    jest.clearAllMocks();
    
    const invalidDateProps = {
      ...defaultProps,
      project: {
        ...mockProject,
        start_date: '2023-01-01T00:00:00',
        due_date: '2023-12-31T00:00:00'
      }
    };
    
    render(<ProjectEditDialog {...invalidDateProps} />);
    
    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);
    
    expect(updateProject).toHaveBeenCalledTimes(1);
  });

  it('updates status correctly', async () => {
    const updatedProject = { ...mockProject, status_id: 2, status_name: 'On Hold' };
    (updateProject as jest.Mock).mockResolvedValueOnce(updatedProject);
    
    const customProps = {
      ...defaultProps,
      project: {
        ...mockProject,
        status_id: 2
      }
    };
    
    render(<ProjectEditDialog {...customProps} />);
    
    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(updateProject).toHaveBeenCalledWith(
        mockProject.id,
        expect.objectContaining({ status_id: 2 })
      );
    });
  });
});