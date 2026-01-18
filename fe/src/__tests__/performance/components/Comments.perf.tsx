import React from 'react';
import { render } from '@testing-library/react';
import { Profiler } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CommentList from '../../../components/Comments/CommentList';
import CommentForm from '../../../components/Comments/CommentForm';
import CommentEditDialog from '../../../components/Comments/CommentEditDialog';
import { Comment } from '../../../types/comment';
import { createAppTheme } from '../../../theme/theme';

// Mock the API module to prevent real HTTP calls
jest.mock('../../../api/api');

// Mock AuthContext to prevent session checks
jest.mock('../../../context/AuthContext', () => ({
  ...jest.requireActual('../../../context/AuthContext'),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useAuth: () => ({
    currentUser: { id: 1, name: 'Test User' },
    hasPermission: () => true,
    permissionsLoading: false,
    userPermissions: [{ permission: 'Admin' }]
  })
}));

// Mock comments API
jest.mock('../../../api/comments', () => ({
  getTaskComments: jest.fn().mockResolvedValue([]),
  createComment: jest.fn().mockResolvedValue({}),
  updateComment: jest.fn().mockResolvedValue({}),
  deleteComment: jest.fn().mockResolvedValue({})
}));

// Custom test wrapper
const PerfTestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme = createAppTheme('light');
  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        {children}
      </ThemeProvider>
    </BrowserRouter>
  );
};

// Performance measurement callback
const onRenderCallback = (
  id: string,
  phase: 'mount' | 'update' | 'nested-update',
  actualDuration: number,
  baseDuration: number,
  startTime: number,
  commitTime: number
) => {
  console.log(`Component: ${id}`);
  console.log(`Phase: ${phase}`);
  console.log(`Actual Duration: ${actualDuration.toFixed(2)}ms`);
  console.log(`Base Duration: ${baseDuration.toFixed(2)}ms`);
  console.log(`Commit Time: ${commitTime}ms`);
  console.log('-------------------');
};

describe('Comments Components Performance Tests', () => {
  // Helper function to measure render performance
  const measurePerformance = (Component: React.ComponentType<any>, props = {}) => {
    const start = performance.now();
    render(
      <PerfTestWrapper>
        <Profiler id={Component.name} onRender={onRenderCallback}>
          <Component {...props} />
        </Profiler>
      </PerfTestWrapper>
    );
    return performance.now() - start;
  };

  // Mock data for testing
  const mockComments: Comment[] = Array.from({ length: 10 }, (_, index) => ({
    id: index,
    task_id: 1,
    user_id: 1,
    comment: `Test comment ${index}`,
    active: true,
    created_on: new Date().toISOString(),
    updated_on: new Date().toISOString(),
    user_name: 'testuser',
    user_avatar: 'test-avatar.jpg'
  }));

  // Mock async callbacks
  const mockUpdateComment = async (commentId: number, newText: string): Promise<void> => {
    return Promise.resolve();
  };

  const mockDeleteComment = async (commentId: number): Promise<void> => {
    return Promise.resolve();
  };

  // Test initial render performance
  test('CommentList component initial render performance', () => {
    const renderTime = measurePerformance(CommentList, {
      comments: mockComments,
      onCommentUpdated: mockUpdateComment,
      onCommentDeleted: mockDeleteComment
    });
    expect(renderTime).toBeLessThan(1000); // Should render under 1000ms
  });

  test('CommentForm component initial render performance', () => {
    const renderTime = measurePerformance(CommentForm, {
      taskId: 1,
      onCommentAdded: () => {}
    });
    expect(renderTime).toBeLessThan(1000); // Should render under 1000ms
  });

  test('CommentEditDialog component initial render performance', () => {
    const renderTime = measurePerformance(CommentEditDialog, {
      open: true,
      comment: mockComments[0],
      onClose: () => {},
      onSave: mockUpdateComment
    });
    expect(renderTime).toBeLessThan(1000); // Should render under 1000ms
  });

  // Test re-render performance with data updates
  test('CommentList re-render performance with new comments', () => {
    const { rerender } = render(
      <PerfTestWrapper>
        <Profiler id="CommentList" onRender={onRenderCallback}>
          <CommentList
            comments={mockComments}
            onCommentUpdated={mockUpdateComment}
            onCommentDeleted={mockDeleteComment}
          />
        </Profiler>
      </PerfTestWrapper>
    );

    const start = performance.now();
    const newComments: Comment[] = [...mockComments, {
      id: mockComments.length,
      task_id: 1,
      user_id: 1,
      comment: 'New comment',
      active: true,
      created_on: new Date().toISOString(),
      updated_on: new Date().toISOString(),
      user_name: 'testuser',
      user_avatar: 'test-avatar.jpg'
    }];

    rerender(
      <PerfTestWrapper>
        <Profiler id="CommentList" onRender={onRenderCallback}>
          <CommentList
            comments={newComments}
            onCommentUpdated={mockUpdateComment}
            onCommentDeleted={mockDeleteComment}
          />
        </Profiler>
      </PerfTestWrapper>
    );

    const rerenderTime = performance.now() - start;
    expect(rerenderTime).toBeLessThan(1000); // Re-render should complete under 1000ms (accounting for parallel test runs)
  });

  // Test performance with large datasets
  test('CommentList performance with large dataset', () => {
    const largeCommentSet: Comment[] = Array.from({ length: 100 }, (_, index) => ({
      id: index,
      task_id: 1,
      user_id: 1,
      comment: `Test comment ${index}`,
      active: true,
      created_on: new Date().toISOString(),
      updated_on: new Date().toISOString(),
      user_name: 'testuser',
      user_avatar: 'test-avatar.jpg'
    }));

    const renderTime = measurePerformance(CommentList, {
      comments: largeCommentSet,
      onCommentUpdated: mockUpdateComment,
      onCommentDeleted: mockDeleteComment
    });
    expect(renderTime).toBeLessThan(3000); // Should handle large datasets reasonably well
  });
});
