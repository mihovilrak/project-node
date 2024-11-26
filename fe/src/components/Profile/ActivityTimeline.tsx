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
import { Box, Typography } from '@mui/material';
import {
  Task as TaskIcon,
  Comment as CommentIcon,
  InsertDriveFile as FileIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { ActivityTimelineProps, Activity } from '../../types/profile';

const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ activities }) => {
  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'task': return <TaskIcon />;
      case 'comment': return <CommentIcon />;
      case 'file': return <FileIcon />;
      case 'edit': return <EditIcon />;
      default: return <TaskIcon />;
    }
  };

  const getActivityColor = (type: Activity['type']): 'primary' | 'success' | 'info' | 'warning' => {
    switch (type) {
      case 'task': return 'primary';
      case 'comment': return 'success';
      case 'file': return 'info';
      case 'edit': return 'warning';
      default: return 'primary';
    }
  };

  const renderTimelineItem = (activity: Activity, index: number) => {
    return (
      <TimelineItem key={activity.id}>
        <TimelineOppositeContent sx={{ flex: 0.2 }}>
          <Typography variant="caption" color="text.secondary">
            {new Date(activity.timestamp).toLocaleString()}
          </Typography>
        </TimelineOppositeContent>
        <TimelineSeparator>
          <TimelineDot color={getActivityColor(activity.type)}>
            {getActivityIcon(activity.type)}
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