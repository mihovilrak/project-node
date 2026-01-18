import React from 'react';
import {
  Timeline,
  TimelineItem,
  TimelineOppositeContent,
  TimelineSeparator,
  TimelineDot,
  TimelineConnector,
  TimelineContent
} from '@mui/lab';
import { Activity } from '../../types/profile';
import { Box, Typography } from '@mui/material';
import { ActivityTimelineProps } from '../../types/profile';
import { useActivityTimeline } from '../../hooks/profile/useActivityTimeline';

const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ activities }) => {
  const { getActivityIcon, getActivityColor } = useActivityTimeline();

  const renderTimelineItem = (activity: Activity, index: number) => {
    const Icon = getActivityIcon(activity.type);

    return (
      <TimelineItem key={activity.id}>
        <TimelineOppositeContent sx={{ flex: 0.2 }}>
          <Typography variant="caption" color="text.secondary">
            {new Date(activity.timestamp).toLocaleString()}
          </Typography>
        </TimelineOppositeContent>
        <TimelineSeparator>
          <TimelineDot color={getActivityColor(activity.type)}>
            <Icon />
          </TimelineDot>
          {index < activities.length - 1 && <TimelineConnector />}
        </TimelineSeparator>
        <TimelineContent>
          <Box sx={{ pb: 2 }}>
            <Typography variant="body2">
              {activity.description}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {activity.description}
            </Typography>
          </Box>
        </TimelineContent>
      </TimelineItem>
    );
  };

  if (!activities?.length) {
    return (
      <Typography variant="body2" color="text.secondary" align="center">
        No recent activity
      </Typography>
    );
  }

  return (
    <Timeline>
      {activities.map((activity, index) => renderTimelineItem(activity, index))}
    </Timeline>
  );
};

export default ActivityTimeline;
