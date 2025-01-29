import React from 'react';
import { render } from '@testing-library/react';
import { Profiler } from 'react';
import CommentList from '../../../components/Comments/CommentList';
import CommentForm from '../../../components/Comments/CommentForm';
import CommentEditDialog from '../../../components/Comments/CommentEditDialog';
import { TestWrapper } from '../../TestWrapper';
import { Comment } from '../../../types/comment';

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
      <TestWrapper>
        <Profiler id={Component.name} onRender={onRenderCallback}>
          <Component {...props} />
        </Profiler>
      </TestWrapper>
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
    expect(renderTime).toBeLessThan(100); // Should render under 100ms
  });

  test('CommentForm component initial render performance', () => {
    const renderTime = measurePerformance(CommentForm, {
      taskId: 1,
      onCommentAdded: () => {}
    });
    expect(renderTime).toBeLessThan(50); // Should render under 50ms
  });

  test('CommentEditDialog component initial render performance', () => {
    const renderTime = measurePerformance(CommentEditDialog, {
      open: true,
      comment: mockComments[0],
      onClose: () => {},
      onSave: mockUpdateComment
    });
    expect(renderTime).toBeLessThan(50); // Should render under 50ms
  });

  // Test re-render performance with data updates
  test('CommentList re-render performance with new comments', () => {
    const { rerender } = render(
      <TestWrapper>
        <Profiler id="CommentList" onRender={onRenderCallback}>
          <CommentList
            comments={mockComments}
            onCommentUpdated={mockUpdateComment}
            onCommentDeleted={mockDeleteComment}
          />
        </Profiler>
      </TestWrapper>
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
      <TestWrapper>
        <Profiler id="CommentList" onRender={onRenderCallback}>
          <CommentList
            comments={newComments}
            onCommentUpdated={mockUpdateComment}
            onCommentDeleted={mockDeleteComment}
          />
        </Profiler>
      </TestWrapper>
    );

    const rerenderTime = performance.now() - start;
    expect(rerenderTime).toBeLessThan(50); // Re-render should be faster than initial render
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
    expect(renderTime).toBeLessThan(200); // Should handle large datasets reasonably well
  });
});
