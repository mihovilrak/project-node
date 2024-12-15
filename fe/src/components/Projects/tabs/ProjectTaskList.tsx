// fe/src/components/Projects/tabs/ProjectTaskList.tsx
import React from 'react';
import {
    List,
    ListItem,
    Grid,
    Typography,
    Link,
    Button,
    Box
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Task } from '../../../types/task';

interface ProjectTaskListProps {
  tasks: Task[];
  onCreateTask?: () => void;
  onTimeLogCreate?: (taskId: number) => void;
}

const ProjectTaskList: React.FC<ProjectTaskListProps> = ({ tasks, onCreateTask }) => {
  const navigate = useNavigate();

  return (
    <>
      {onCreateTask && (
        <Button 
          onClick={() => navigate('/tasks/new')} 
          variant="contained" 
          color="primary" 
          sx={{ mb: 2 }}
        >
          Create Task
        </Button>
      )}
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
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Status
                  </Typography>
                  <Typography variant="body1">
                    {task.status_name || 'Not set'}
                  </Typography>
                </Box>
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Priority
                  </Typography>
                  <Typography variant="body1">
                    {task.priority_name || 'Not set'}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={3}>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Holder
                </Typography>
                <Typography variant="body1">
                  <Link component={RouterLink} to={`/users/${task.holder_id}`}>
                    {task.holder_name}
                  </Link>
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }} gutterBottom>
                  Assignee
                </Typography>
                <Typography variant="body1">
                  {task.assignee_id ? (
                    <Link component={RouterLink} to={`/users/${task.assignee_id}`}>
                      {task.assignee_name}
                    </Link>
                  ) : 'Unassigned'}
                </Typography>
              </Grid>
              <Grid item xs={12} md={3}>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Dates
                </Typography>
                <Typography variant="body1">
                  Start: {format(new Date(task.start_date), 'dd/MM/yyyy')}
                </Typography>
                <Typography variant="body1">
                  Due: {format(new Date(task.due_date), 'dd/MM/yyyy')}
                </Typography>
              </Grid>
              <Grid item xs={12} md={3}>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Time
                </Typography>
                <Typography variant="body1">
                  Estimated: {task.estimated_time || 0} hours
                </Typography>
                <Typography variant="body1">
                  Spent: {task.spent_time || 0} hours
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