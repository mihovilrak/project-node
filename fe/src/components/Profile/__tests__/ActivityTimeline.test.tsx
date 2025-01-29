import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ActivityTimeline from '../ActivityTimeline';
import { Activity } from '../../../types/profile';
import FlagIcon from '@mui/icons-material/Flag';

// Mock the useActivityTimeline hook
jest.mock('../../../hooks/profile/useActivityTimeline', () => ({
  useActivityTimeline: () => ({
    getActivityIcon: () => FlagIcon,
    getActivityColor: () => 'primary'
  })
}));

describe('ActivityTimeline', () => {
  const mockActivities: Activity[] = [
    {
      id: 1,
      type: 'update',
      title: 'Profile Update',
      description: 'Updated profile',
      timestamp: '2023-01-01T12:00:00Z'
    },
    {
      id: 2,
      type: 'create',
      title: 'Project Creation',
      description: 'Created new project',
      timestamp: '2023-01-01T13:00:00Z',
      project: {
        id: 1,
        name: 'Test Project'
      }
    }
  ];

  test('renders timeline with activities', () => {
    render(<ActivityTimeline activities={mockActivities} />);

    // Check if activities are rendered
    mockActivities.forEach(activity => {
      expect(screen.getByText(activity.description)).toBeInTheDocument();
      expect(screen.getByText(new Date(activity.timestamp).toLocaleString())).toBeInTheDocument();
    });
  });

  test('renders empty state message when activities array is empty', () => {
    render(<ActivityTimeline activities={[]} />);
    expect(screen.getByText('No recent activity')).toBeInTheDocument();
  });

  test('renders empty state message when activities is undefined', () => {
    render(<ActivityTimeline activities={[]} />);
    expect(screen.getByText('No recent activity')).toBeInTheDocument();
  });

  test('renders timeline connectors correctly', () => {
    render(<ActivityTimeline activities={mockActivities} />);
    
    const timelineConnectors = document.querySelectorAll('.MuiTimelineConnector-root');
    // Should have one connector (between two items)
    expect(timelineConnectors.length).toBe(1);
  });

  test('renders timeline items with correct structure', () => {
    render(<ActivityTimeline activities={mockActivities} />);

    // Check for Timeline component
    expect(document.querySelector('.MuiTimeline-root')).toBeInTheDocument();

    // Check for TimelineItems
    const timelineItems = document.querySelectorAll('.MuiTimelineItem-root');
    expect(timelineItems.length).toBe(mockActivities.length);

    // Check for TimelineDots
    const timelineDots = document.querySelectorAll('.MuiTimelineDot-root');
    expect(timelineDots.length).toBe(mockActivities.length);
  });
});