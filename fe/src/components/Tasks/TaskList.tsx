import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Chip,
  Grid
} from '@mui/material';
import { getTasks, deleteTask } from '../../api/tasks';
import { Task } from '../../types/task';
import PermissionButton from '../common/PermissionButton';
import DeleteConfirmDialog from '../common/DeleteConfirmDialog';
import logger from '../../utils/logger';
import getApiErrorMessage from '../../utils/getApiErrorMessage';
import { chipPropsForPriority, chipPropsForStatus } from '../../utils/taskUtils';

const TaskList: React.FC = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const tasksData = await getTasks();
      setTasks(tasksData || []);
    } catch (error: unknown) {
      logger.error('Failed to fetch tasks:', error);
      setError(getApiErrorMessage(error, 'Failed to load tasks'));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (task: Task) => {
    setTaskToDelete(task);
    setDeleteError(null);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!taskToDelete) return;

    try {
      setDeleting(true);
      setDeleteError(null);
      await deleteTask(taskToDelete.id);
      setTasks(tasks.filter(task => task?.id !== taskToDelete.id));
      setDeleteDialogOpen(false);
      setTaskToDelete(null);
    } catch (error: unknown) {
      logger.error('Failed to delete task:', error);
      setDeleteError(getApiErrorMessage(error, 'Failed to delete task. Please try again.'));
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setTaskToDelete(null);
    setDeleteError(null);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <>
      <Grid container spacing={3}>
        {tasks.map((task) => (
        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={task.id}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="div">
                {task?.name || 'Unnamed Task'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {task?.description || 'No description'}
              </Typography>
              <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip
                  label={task?.status_name || 'Unknown'}
                  {...chipPropsForStatus(task?.status_name, task?.status_color)}
                />
                <Chip
                  label={task?.priority_name || 'Unknown'}
                  {...chipPropsForPriority(task?.priority_name, task?.priority_color)}
                />
              </Box>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Due: {task?.due_date ? new Date(task.due_date).toLocaleDateString() : '-'}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Assignee: {task?.assignee_name || 'Unassigned'}
              </Typography>
              <Box marginTop={2}>
                <Button onClick={() => navigate(`/tasks/${task?.id}`)}>
                  Details
                </Button>
                <PermissionButton
                  requiredPermission="Edit tasks"
                  color="warning"
                  onClick={() => navigate(`/tasks/${task?.id}/edit`)}>
                  Edit
                </PermissionButton>
                <PermissionButton
                  requiredPermission="Delete tasks"
                  color="error"
                  onClick={() => handleDeleteClick(task)}>
                  Delete
                </PermissionButton>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
      </Grid>

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        title="Delete Task"
        content={`Are you sure you want to delete task "${taskToDelete?.name}"? This action cannot be undone.`}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        loading={deleting}
        error={deleteError || undefined}
      />
    </>
  );
};

export default TaskList;
