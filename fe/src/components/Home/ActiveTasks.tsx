import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getActiveTasks, getTasks } from '../../api/tasks';
import { useAuth } from '../../context/AuthContext';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Chip,
  IconButton,
  Tooltip,
  LinearProgress,
  Alert,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Task } from '../../types/task';
import {
  chipPropsForPriority,
  chipPropsForStatus,
} from '../../utils/taskUtils';
import { usePermission } from '../../hooks/common/usePermission';
import { formatDate } from '../../utils/dateUtils';
import { useAsyncResource } from '../../hooks/common/useAsyncResource';

const TaskCard: React.FC<{
  task: Task;
  onEdit: (id: number) => void;
  onDelete?: (task: Task) => void;
}> = ({ task, onEdit, onDelete }) => {
  const canEdit = usePermission('Edit tasks').hasPermission;
  const canDelete = usePermission('Delete tasks').hasPermission;

  return (
    <Card>
      <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'flex-start',
            gap: 0.5,
            mb: 0.5,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            #{task?.id}
          </Typography>
          <Typography
            component={Link}
            to={`/tasks/${task?.id}`}
            variant="h6"
            sx={{
              fontWeight: 600,
              textDecoration: 'none',
              color: 'inherit',
              '&:hover': { textDecoration: 'underline' },
              flex: '1 1 auto',
            }}
          >
            {task?.name || 'Unnamed Task'}
          </Typography>
          {(canEdit || canDelete) && (
            <Box sx={{ display: 'flex', gap: 0 }}>
              {canEdit && (
                <Tooltip title="Edit">
                  <IconButton
                    size="small"
                    onClick={() => onEdit(task?.id)}
                    aria-label="Edit task"
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              {canDelete && onDelete && (
                <Tooltip title="Delete">
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => onDelete(task)}
                    aria-label="Delete task"
                    data-testid="delete-icon"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          )}
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 0.5 }}>
          <Chip
            label={task?.status_name || 'Unknown'}
            size="small"
            data-testid="status-chip"
            {...chipPropsForStatus(task?.status_name, task?.status_color)}
          />
          <Chip
            label={task?.priority_name || 'Unknown'}
            size="small"
            data-testid="priority-chip"
            {...chipPropsForPriority(task?.priority_name, task?.priority_color)}
          />
        </Box>
        <Box sx={{ mt: 0.5, fontSize: '0.875rem' }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: '2px 16px',
              alignItems: 'start',
            }}
          >
            <Box>
              <strong>Holder</strong>{' '}
              {task?.holder_id ? (
                <Link to={`/users/${task.holder_id}`}>
                  {task?.holder_name || 'User'}
                </Link>
              ) : (
                '—'
              )}
            </Box>
            <Box>
              <strong>Start</strong>{' '}
              {task?.start_date ? formatDate(task.start_date) : '—'}
            </Box>
            <Box>
              <strong>Project</strong>{' '}
              {task?.project_id ? (
                <Link to={`/projects/${task.project_id}`}>
                  {task?.project_name || 'Project'}
                </Link>
              ) : (
                'No Project'
              )}
            </Box>
            <Box>
              <strong>Assignee</strong>{' '}
              {task?.assignee_id ? (
                <Link to={`/users/${task.assignee_id}`}>
                  {task?.assignee_name || 'User'}
                </Link>
              ) : (
                'Unassigned'
              )}
            </Box>
            <Box>
              <strong>Due</strong>{' '}
              {task?.due_date ? formatDate(task.due_date) : '—'}
            </Box>
            <Box />
          </Box>
          <Box sx={{ mt: 0.5 }}>
            <Typography variant="caption">
              <strong>Progress</strong>
            </Typography>
            <LinearProgress
              variant="determinate"
              value={task?.progress ?? 0}
              sx={{ mt: 0.25, height: 6, borderRadius: 1 }}
            />
            <Typography variant="caption">{task?.progress ?? 0}%</Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

interface ActiveTaskLists {
  holderTasks: Task[];
  assigneeTasks: Task[];
}

const EMPTY_LISTS: ActiveTaskLists = { holderTasks: [], assigneeTasks: [] };

const ActiveTasks: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const userId = currentUser?.id;

  const {
    data: { holderTasks, assigneeTasks },
    loading,
    error,
  } = useAsyncResource<ActiveTaskLists>(
    async (signal) => {
      const [holderList, assigneeList] = await Promise.all([
        userId
          ? getTasks({ holder_id: userId, active_statuses_only: 1 }, signal)
          : Promise.resolve([]),
        getActiveTasks(signal),
      ]);
      return {
        holderTasks: holderList || [],
        assigneeTasks: assigneeList || [],
      };
    },
    [userId],
    { initialData: EMPTY_LISTS, errorMessage: 'Failed to fetch active tasks' },
  );

  if (loading) return <CircularProgress />;

  return (
    <Box
      data-testid="active-tasks"
      sx={{ width: '100%', maxWidth: 1400, margin: '0 auto', p: 3 }}
    >
      <Typography variant="h4" gutterBottom>
        My Active Tasks
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Tasks I hold
          </Typography>
          {holderTasks.length === 0 ? (
            <Typography color="text.secondary">
              No active tasks where you are the holder.
            </Typography>
          ) : (
            <Grid container spacing={2}>
              {holderTasks.map((task) => (
                <Grid size={{ xs: 12 }} key={task?.id}>
                  <TaskCard
                    task={task}
                    onEdit={(id) => navigate(`/tasks/${id}/edit`)}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Tasks assigned to me
          </Typography>
          {assigneeTasks.length === 0 ? (
            <Typography color="text.secondary">
              No active tasks assigned to you.
            </Typography>
          ) : (
            <Grid container spacing={2}>
              {assigneeTasks.map((task) => (
                <Grid size={{ xs: 12 }} key={task?.id}>
                  <TaskCard
                    task={task}
                    onEdit={(id) => navigate(`/tasks/${id}/edit`)}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default ActiveTasks;
