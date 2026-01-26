import React from 'react';
import {
  List,
  ListItem,
  Grid,
  Typography,
  Link,
  Box
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import dayjs from 'dayjs';
import { ProjectTaskListProps } from '../../../types/project';

const ProjectTaskList: React.FC<ProjectTaskListProps> = ({ tasks, onCreateTask }) => {

  return (
    <>
      <List>
        {tasks.length === 0 ? (
          <Typography>No tasks found.</Typography>
        ) : (
          tasks.map((task) => (
            <ListItem
              key={task?.id}
              sx={{
                border: 1,
                borderColor: 'divider',
                borderRadius: 1,
                mb: 1,
                p: 2
              }}
              component={RouterLink}
              to={`/tasks/${task?.id}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <Typography variant="h6" gutterBottom>
                    {task?.name || 'Unnamed Task'}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <Box>
                    <Typography variant="body1">
                      Status: {task?.status_name || 'Not set'}
                    </Typography>
                  </Box>
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body1">
                      Priority: {task?.priority_name || 'Not set'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <Typography variant="body1">
                    Holder: {task?.holder_id ? (
                      <Link component={RouterLink} to={`/users/${task.holder_id}`}>
                        {task?.holder_name || 'Unknown'}
                      </Link>
                    ) : 'Not assigned'}
                  </Typography>
                  <Typography variant="body1">
                    Assignee: {task?.assignee_id ? (
                      <Link component={RouterLink} to={`/users/${task.assignee_id}`}>
                        {task?.assignee_name || 'Unknown'}
                      </Link>
                    ) : 'Unassigned'}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    Start: {task?.start_date ? dayjs(task.start_date).format('MMM D, YYYY') : 'Not started'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Due: {task?.due_date ? dayjs(task.due_date).format('MMM D, YYYY') : 'No due date'}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <Typography variant="body1">
                    Estimated time: {task?.estimated_time || 0} hours
                  </Typography>
                  <Typography variant="body1">
                    Spent time: {task?.spent_time || 0} hours
                  </Typography>
                </Grid>
              </Grid>
            </ListItem>
          ))
        )}
      </List>
    </>
  );
};

export default ProjectTaskList;
