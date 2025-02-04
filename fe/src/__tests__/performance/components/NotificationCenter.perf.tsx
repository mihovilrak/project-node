import React from 'react';
import { render } from '@testing-library/react';
import { Profiler } from 'react';
import { TestWrapper } from '../../TestWrapper';
import NotificationCenter from '../../../components/Notifications/NotificationCenter';
import { Notification } from '../../../types/notification';
import { User } from '../../../types/user';

// Mock data
const mockUser: User = {
  id: 1,
  login: 'testuser',
  email: 'test@example.com',
  name: 'Test',
  surname: 'User',
  role_id: 1,
  status_id: 1,
  avatar_url: null,
  created_on: new Date().toISOString(),
  updated_on: null,
  last_login: null
};

const mockNotifications: Notification[] = [
  {
    id: 1,
    user_id: 1,
    type_id: 1,
    title: 'Task Assigned',
    message: 'You have been assigned a new task',
    link: '/tasks/1',
    active: true,
    read_on: null,
    is_read: false,
    created_on: new Date().toISOString(),
    type_name: 'task',
    type_color: '#1976d2',
    type_icon: 'task'
  },
  {
    id: 2,
    user_id: 1,
    type_id: 2,
    title: 'Project Update',
    message: 'Project status has been updated',
    link: '/projects/1',
    active: true,
    read_on: new Date().toISOString(),
    is_read: true,
    created_on: new Date().toISOString(),
    type_name: 'project',
    type_color: '#2e7d32',
    type_icon: 'project'
  }
];

// Mock hooks
jest.mock('../../../hooks/notification/useNotificationCenter', () => ({
  useNotificationCenter: () => ({
    anchorEl: null,
    notifications: mockNotifications,
    loading: false,
    unreadCount: 1,
    handleClick: jest.fn(),
    handleClose: jest.fn(),
    handleNotificationClick: jest.fn(),
    handleDeleteNotification: jest.fn()
  })
}));

// Performance measurement callback
const onRenderCallback = (
  id: string,
  phase: 'mount' | 'update' | 'nested-update',
  actualDuration: number,
  baseDuration: number,
  startTime: number,
  commitTime: number
) => {
  // Log performance metrics
  console.log(`${id} - ${phase}`);
  console.log(`Actual duration: ${actualDuration.toFixed(2)}ms`);
  console.log(`Base duration: ${baseDuration.toFixed(2)}ms`);
  console.log(`Commit time: ${commitTime}ms`);
};

// Helper function to measure render performance
const measurePerformance = (Component: React.ComponentType<any>, props = {}) => (
  <TestWrapper>
    <Profiler id={Component.name} onRender={onRenderCallback}>
      <Component {...props} />
    </Profiler>
  </TestWrapper>
);

describe('NotificationCenter Performance', () => {
  it('renders efficiently with default state', () => {
    render(
      measurePerformance(NotificationCenter, {
        userId: mockUser.id
      })
    );
  });

  it('renders efficiently with loading state', () => {
    jest.mock('../../../hooks/notification/useNotificationCenter', () => ({
      useNotificationCenter: () => ({
        anchorEl: null,
        notifications: [],
        loading: true,
        unreadCount: 0,
        handleClick: jest.fn(),
        handleClose: jest.fn(),
        handleNotificationClick: jest.fn(),
        handleDeleteNotification: jest.fn()
      })
    }));

    render(
      measurePerformance(NotificationCenter, {
        userId: mockUser.id
      })
    );
  });

  it('renders efficiently with many notifications', () => {
    const manyNotifications = Array.from({ length: 50 }, (_, index) => ({
      ...mockNotifications[0],
      id: index + 1,
      title: `Notification ${index + 1}`,
      message: `Test message ${index + 1}`
    }));

    jest.mock('../../../hooks/notification/useNotificationCenter', () => ({
      useNotificationCenter: () => ({
        anchorEl: null,
        notifications: manyNotifications,
        loading: false,
        unreadCount: 25,
        handleClick: jest.fn(),
        handleClose: jest.fn(),
        handleNotificationClick: jest.fn(),
        handleDeleteNotification: jest.fn()
      })
    }));

    render(
      measurePerformance(NotificationCenter, {
        userId: mockUser.id
      })
    );
  });
});
