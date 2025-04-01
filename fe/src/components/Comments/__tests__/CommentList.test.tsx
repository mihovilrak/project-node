import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import CommentList from '../CommentList';
import { Comment } from '../../../types/comment';

// Mock useCommentMenu hook
jest.mock('../../../hooks/comment/useCommentMenu', () => {
  const React = require('react');
  
  return {
    useCommentMenu: () => {
      const [anchorEl, setAnchorEl] = React.useState(null);
      const [selectedComment, setSelectedComment] = React.useState(null);
      
      const handleMenuOpen = jest.fn((event, comment) => {
        setAnchorEl(event.currentTarget);
        setSelectedComment(comment);
      });
      
      const handleMenuClose = jest.fn(() => {
        setAnchorEl(null);
        setSelectedComment(null);
      });
      
      return {
        anchorEl,
        selectedComment,
        editDialogOpen: false,
        handleMenuOpen,
        handleMenuClose,
        handleEditClick: jest.fn(),
        handleEditClose: jest.fn(),
        handleEditSave: jest.fn(),
        handleDeleteClick: jest.fn()
      };
    }
  };
});

const mockComments: Array<Comment> = [
  {
    id: 1,
    task_id: 1,
    comment: 'Test comment 1',
    user_id: 1,
    user_name: 'John Doe',
    user_avatar: 'avatar1.jpg',
    created_on: '2023-01-01T10:00:00Z',
    updated_on: '2023-01-01T11:00:00Z',
    active: true
  },
  {
    id: 2,
    task_id: 1,
    comment: 'Test comment 2',
    user_id: 2,
    user_name: 'Jane Smith',
    user_avatar: undefined,
    created_on: '2023-01-02T10:00:00Z',
    updated_on: null,
    active: true
  }
];

const renderCommentList = (props = {}) => {
  return render(
    <BrowserRouter>
      <CommentList
        comments={mockComments}
        onCommentUpdated={jest.fn()}
        onCommentDeleted={jest.fn()}
        {...props}
      />
    </BrowserRouter>
  );
};

describe('CommentList Component', () => {
  test('renders all comments', () => {
    renderCommentList();
    
    expect(screen.getByText('Test comment 1')).toBeInTheDocument();
    expect(screen.getByText('Test comment 2')).toBeInTheDocument();
  });

  test('displays user names as links', () => {
    renderCommentList();
    
    const userLinks = screen.getAllByRole('link');
    expect(userLinks[0]).toHaveTextContent('John Doe');
    expect(userLinks[1]).toHaveTextContent('Jane Smith');
  });

  test('shows edit indicator for updated comments', () => {
    renderCommentList();
    
    const editedText = screen.getByText(/Edited/);
    expect(editedText).toBeInTheDocument();
    expect(screen.queryAllByText(/Edited/).length).toBe(1);
  });

  test('renders avatars for users', () => {
    renderCommentList();
    
    // Find all Avatar components instead of just img elements
    const avatars = screen.getAllByTestId('avatar-test');
    expect(avatars).toHaveLength(2);
    
    // Check that first avatar has image
    const firstAvatarImg = avatars[0].querySelector('img');
    expect(firstAvatarImg).toHaveAttribute('src', 'avatar1.jpg');
    expect(firstAvatarImg).toHaveAttribute('alt', 'John Doe');
    
    // Check that second avatar has fallback icon
    const secondAvatarIcon = avatars[1].querySelector('svg');
    expect(secondAvatarIcon).toBeInTheDocument();
  });

  test('renders menu buttons for each comment', () => {
    renderCommentList();
    
    const menuButtons = screen.getAllByRole('button');
    expect(menuButtons.length).toBe(mockComments.length);
  });

  test('renders empty list when no comments', () => {
    renderCommentList({ comments: [] });
    
    const list = screen.getByRole('list');
    expect(list.children).toHaveLength(0);
  });

  test('formats dates correctly', () => {
    renderCommentList();
    
    const date1 = new Date('2023-01-01T10:00:00Z').toLocaleString();
    const date2 = new Date('2023-01-02T10:00:00Z').toLocaleString();
    
    expect(screen.getByText(date1)).toBeInTheDocument();
    expect(screen.getByText(date2)).toBeInTheDocument();
  });

  test('handles menu click', async () => {
    renderCommentList();
    
    // Initially menu should not be open
    expect(screen.queryByRole('menuitem')).not.toBeInTheDocument();
    
    // Find and click the menu button for the first comment
    const menuButtons = screen.getAllByTestId('MoreVertIcon');
    fireEvent.click(menuButtons[0]);
    
    // Menu should now be open with Edit and Delete options
    await waitFor(() => {
      const menuItems = screen.getAllByRole('menuitem');
      expect(menuItems).toHaveLength(2);
      expect(menuItems[0]).toHaveTextContent('Edit');
      expect(menuItems[1]).toHaveTextContent('Delete');
    });
  });
});