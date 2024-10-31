import React from 'react';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent
} from '@mui/lab';
import { Typography, Box } from '@mui/material';
import {
  Task as TaskIcon,
  Comment as CommentIcon,
  AttachFile as FileIcon,
  Create as EditIcon
} from '@mui/icons-material';

const ActivityTimeline = ({ activities }) => {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'task': return <TaskIcon />;
      case 'comment': return <CommentIcon />;
      case 'file': return <FileIcon />;
      case 'edit': return <EditIcon />;
      default: return <TaskIcon />;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'task': return 'primary';
      case 'comment': return 'success';
      case 'file': return 'info';
      case 'edit': return 'warning';
      default: return 'primary';
    }
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
      {activities.map((activity, index) => (
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
                {activity.details}
              </Typography>
            </Box>
          </TimelineContent>
        </TimelineItem>
      ))}
    </Timeline>
  );
};

export default ActivityTimeline; 