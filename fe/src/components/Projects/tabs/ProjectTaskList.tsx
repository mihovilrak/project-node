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
import { format } from 'date-fns';
import { ProjectTaskListProps } from '../../../types/project';

const ProjectTaskList: React.FC<ProjectTaskListProps> = ({ tasks, onCreateTask }) => {

  return (
    <>
      <List>
        {tasks.map((task) => (
          <ListItem
            key={task.id}
            sx={{
              border: 1,
              borderColor: 'divider',
              borderRadius: 1,
              mb: 1,
              p: 2
            }}
            component={RouterLink}
            to={`/tasks/${task.id}`}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  {task.name}
                </Typography>
              </Grid>
              <Grid item xs={12} md={3}>
                <Box>
                  <Typography variant="body1">
                    Status: {task.status_name || 'Not set'}
                  </Typography>
                </Box>
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body1">
                    Priority: {task.priority_name || 'Not set'}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={3}>
                <Typography variant="body1">
                  Holder: <Link component={RouterLink} to={`/users/${task.holder_id}`}>
                    {task.holder_name}
                  </Link>
                </Typography>
                <Typography variant="body1">
                  Assignee: {task.assignee_id ? (
                    <Link component={RouterLink} to={`/users/${task.assignee_id}`}>
                      {task.assignee_name}
                    </Link>
                  ) : 'Unassigned'}
                </Typography>
              </Grid>
              <Grid item xs={12} md={3}>
                <Typography variant="body1">
                  Start date: {format(new Date(task.start_date), 'dd/MM/yyyy')}
                </Typography>
                <Typography variant="body1">
                  Due date: {format(new Date(task.due_date), 'dd/MM/yyyy')}
                </Typography>
              </Grid>
              <Grid item xs={12} md={3}>
                <Typography variant="body1">
                  Estimated time: {task.estimated_time || 0} hours
                </Typography>
                <Typography variant="body1">
                  Spent time: {task.spent_time || 0} hours
                </Typography>
              </Grid>
            </Grid>
          </ListItem>
        ))}
      </List>
    </>
  );
};

export default ProjectTaskList;
