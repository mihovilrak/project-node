import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import ProjectMembersList from '../ProjectMembersList';
import { ProjectMember } from '../../../../types/project';

const mockMembers: ProjectMember[] = [
  {
    project_id: 1,
    user_id: 1,
    created_on: '2023-01-01',
    name: 'John',
    surname: 'Doe',
    role: 'Developer',
  },
  {
    project_id: 1,
    user_id: 2,
    created_on: '2023-01-02',
    name: 'Jane',
    surname: 'Smith',
    role: 'Project Manager',
  },
];

const defaultProps = {
  members: mockMembers,
  canManageMembers: true,
  onMemberRemove: jest.fn(),
};

const renderProjectMembersList = (props = {}) => {
  return render(
    <BrowserRouter>
      <ProjectMembersList {...defaultProps} {...props} />
    </BrowserRouter>,
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

    expect(defaultProps.onMemberRemove).toHaveBeenCalledWith(
      mockMembers[0].user_id,
    );
  });

  test('renders member links correctly', () => {
    renderProjectMembersList();

    const memberLinks = screen.getAllByRole('link');
    expect(memberLinks[0]).toHaveAttribute('href', '/users/1');
    expect(memberLinks[1]).toHaveAttribute('href', '/users/2');
  });
});
