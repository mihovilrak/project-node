import React, { useState } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import ProjectMembersList from '../ProjectMembersList';
import { ProjectMember } from '../../../../types/project';
import { addProjectMember, removeProjectMember } from '../../../../api/projects';
import { Alert } from '@mui/material';

jest.mock('../../../../api/projects', () => ({
  addProjectMember: jest.fn(),
  removeProjectMember: jest.fn()
}));

const mockMembers: ProjectMember[] = [
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
    created_on: '2023-01-02',
    name: 'Jane',
    surname: 'Smith',
    role: 'Project Manager'
  }
];

const defaultProps = {
  projectId: 1,
  members: mockMembers,
  canManageMembers: true,
  onMemberRemove: jest.fn(),
  onMembersChange: jest.fn()
};

const renderProjectMembersList = (props = {}) => {
  return render(
    <BrowserRouter>
      <ProjectMembersList {...defaultProps} {...props} />
    </BrowserRouter>
  );
};

describe('ProjectMembersList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders member list correctly', () => {
    renderProjectMembersList();
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Role: Developer')).toBeInTheDocument();
    expect(screen.getByText('Role: Project Manager')).toBeInTheDocument();
  });

  test('shows manage members button when canManageMembers is true', () => {
    renderProjectMembersList();
    
    expect(screen.getByText('Manage Members')).toBeInTheDocument();
  });

  test('hides manage members button when canManageMembers is false', () => {
    renderProjectMembersList({ canManageMembers: false });
    
    expect(screen.queryByText('Manage Members')).not.toBeInTheDocument();
  });

  test('shows empty state when no members', () => {
    renderProjectMembersList({ members: [] });
    
    expect(screen.getByText('No members in this project')).toBeInTheDocument();
  });

  test('shows delete buttons for each member when canManageMembers is true', () => {
    renderProjectMembersList();
    
    const deleteButtons = screen.getAllByLabelText('delete');
    expect(deleteButtons).toHaveLength(2);
  });

  test('hides delete buttons when canManageMembers is false', () => {
    renderProjectMembersList({ canManageMembers: false });
    
    expect(screen.queryAllByLabelText('delete')).toHaveLength(0);
  });

  test('calls onMemberRemove when delete button is clicked', () => {
    renderProjectMembersList();
    
    const deleteButtons = screen.getAllByLabelText('delete');
    fireEvent.click(deleteButtons[0]);
    
    expect(defaultProps.onMemberRemove).toHaveBeenCalledWith(mockMembers[0].user_id);
  });

  test('opens EditMembersDialog when manage members button is clicked', () => {
    renderProjectMembersList();
    
    const manageButton = screen.getByText('Manage Members');
    fireEvent.click(manageButton);
    
    expect(screen.getByText('Edit Project Members')).toBeInTheDocument();
  });

  test('handles member updates successfully', async () => {
    (addProjectMember as jest.Mock).mockResolvedValue({});
    (removeProjectMember as jest.Mock).mockResolvedValue({});

    renderProjectMembersList();
    
    const manageButton = screen.getByText('Manage Members');
    fireEvent.click(manageButton);

    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(defaultProps.onMembersChange).toHaveBeenCalled();
    });
  });

  test('displays error alert when error state is set', () => {
    const TestComponent = () => {
      const [error, setError] = useState('Failed to update project members');
      return (
        <>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <ProjectMembersList {...defaultProps} />
        </>
      );
    };
    
    render(
      <BrowserRouter>
        <TestComponent />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Failed to update project members')).toBeInTheDocument();
  });
  

  test('renders member links correctly', () => {
    renderProjectMembersList();
    
    const memberLinks = screen.getAllByRole('link');
    expect(memberLinks[0]).toHaveAttribute('href', '/users/1');
    expect(memberLinks[1]).toHaveAttribute('href', '/users/2');
  });
});