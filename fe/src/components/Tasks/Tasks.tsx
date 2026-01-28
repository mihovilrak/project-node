import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTasks, deleteTask, getTaskStatuses, getPriorities, getActiveTasks } from '../../api/tasks';
import { getProjects } from '../../api/projects';
import {
  Grid,
  Button,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Chip,
  Select,
  MenuItem,
  SelectChangeEvent
} from '@mui/material';
import FilterPanel from '../common/FilterPanel';
import DeleteConfirmDialog from '../common/DeleteConfirmDialog';
import { Task } from '../../types/task';
import { FilterValues } from '../../types/filterPanel';
import { getPriorityColor } from '../../utils/taskUtils';

const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterValues>({});
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [statuses, setStatuses] = useState<any[]>([]);
  const [priorities, setPriorities] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);
  const navigate = useNavigate();

  const fetchTasks = useCallback(async (currentFilters?: FilterValues): Promise<void> => {
    try {
      setError(null);

      // Default to active tasks when no filters are applied
      if (!currentFilters || Object.keys(currentFilters).length === 0) {
        const activeTasks = await getActiveTasks();
        setTasks(activeTasks);
        return;
      }

      const taskList = await getTasks({
        status: currentFilters.status_id ? Number(currentFilters.status_id) : undefined,
        priority: currentFilters.priority_id ? Number(currentFilters.priority_id) : undefined,
        assignee: currentFilters.assignee_id ? Number(currentFilters.assignee_id) : undefined,
        holder: currentFilters.holder_id ? Number(currentFilters.holder_id) : undefined,
        project: currentFilters.project_id ? Number(currentFilters.project_id) : undefined
      });
      setTasks(taskList);
    } catch (error) {
      console.error('Failed to fetch tasks', error);
      setError('Failed to load tasks. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
    // Fetch filter options
    const fetchFilterOptions = async () => {
      try {
        const [statusesData, prioritiesData, projectsData] = await Promise.all([
          getTaskStatuses().catch(() => []),
          getPriorities().catch(() => []),
          getProjects().catch(() => [])
        ]);
        setStatuses(statusesData);
        setPriorities(prioritiesData);
        setProjects(projectsData);
      } catch (error) {
        console.error('Failed to fetch filter options:', error);
      }
    };
    fetchFilterOptions();
  }, [fetchTasks]);

  const handleDeleteClick = useCallback((task: Task): void => {
    setTaskToDelete(task);
    setDeleteError(null);
    setDeleteDialogOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async (): Promise<void> => {
    if (!taskToDelete) return;

    try {
      setDeleting(true);
      setDeleteError(null);
      await deleteTask(taskToDelete.id);
      await fetchTasks();
      setDeleteDialogOpen(false);
      setTaskToDelete(null);
    } catch (error: any) {
      console.error('Failed to delete task:', error);
      const errorMessage = error?.response?.data?.error || 
                         error?.message || 
                         'Failed to delete task. Please try again.';
      setDeleteError(errorMessage);
    } finally {
      setDeleting(false);
    }
  }, [taskToDelete, fetchTasks]);

  const handleDeleteCancel = useCallback((): void => {
    setDeleteDialogOpen(false);
    setTaskToDelete(null);
    setDeleteError(null);
  }, []);

  const handleFilterChange = useCallback((newFilters: FilterValues) => {
    setFilters(newFilters);
    setLoading(true);
    fetchTasks(newFilters);
  }, [fetchTasks]);

  const handleSortChange = useCallback((event: SelectChangeEvent<'asc' | 'desc'>) => {
    setSortOrder(event.target.value as 'asc' | 'desc');
  }, []);

  const filterOptions = useMemo(() => ({
    search: true,
    showDateFilters: true,
    statuses: statuses,
    priorities: priorities,
    projects: projects
  }), [statuses, priorities, projects]);

  const filteredTasks = useMemo(() => {
    const list = tasks || [];

    return list
      .filter(task => {
        if (filters.search) {
          const searchTerm = filters.search.toLowerCase();
          const matchesSearch =
            task?.name?.toLowerCase().includes(searchTerm) ||
            task?.description?.toLowerCase().includes(searchTerm) ||
            task?.project_name?.toLowerCase().includes(searchTerm);
          if (!matchesSearch) return false;
        }

        if (filters.status_id && task.status_id !== Number(filters.status_id)) {
          return false;
        }
        if (filters.priority_id && task.priority_id !== Number(filters.priority_id)) {
          return false;
        }
        if (filters.project_id && task.project_id !== Number(filters.project_id)) {
          return false;
        }
        if (filters.assignee_id && task.assignee_id !== Number(filters.assignee_id)) {
          return false;
        }
        if (filters.holder_id && task.holder_id !== Number(filters.holder_id)) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        // Handle cases where name might be undefined or null
        const nameA = a?.name || '';
        const nameB = b?.name || '';
        return sortOrder === 'asc'
          ? nameA.localeCompare(nameB)
          : nameB.localeCompare(nameA);
      });
  }, [tasks, filters, sortOrder]);

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
        <Typography color="error" data-testid="task-error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>Tasks</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/tasks/new')}
          >
            Create New Task
          </Button>
          <Select
            value={sortOrder}
            onChange={handleSortChange}
            size="small"
            sx={{ minWidth: 120 }}
          >
            <MenuItem value="asc">A-Z</MenuItem>
            <MenuItem value="desc">Z-A</MenuItem>
          </Select>
        </Box>

        <FilterPanel
          type="tasks"
          filters={filters}
          options={filterOptions}
          onFilterChange={handleFilterChange}
        />
      </Box>

      <Grid container spacing={3}>
        {filteredTasks.length === 0 ? (
          <Grid size={{ xs: 12 }}>
            <Typography>No tasks found.</Typography>
          </Grid>
        ) : (
          filteredTasks.map((task) => (
            <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={task?.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{task?.name || 'Unnamed Task'}</Typography>
                <Typography variant="body2">Project: {task?.project_name || 'No Project'}</Typography>
                <Box sx={{ mt: 1 }}>
                  <Chip
                    label={task?.status_name || 'Unknown'}
                    size="small"
                    color={task?.status_name === 'Done' ? 'success' : 'default'}
                    sx={{ mr: 1 }}
                    data-testid="status-chip"
                  />
                  <Chip
                    label={task?.priority_name || 'Unknown'}
                    size="small"
                    color={getPriorityColor(task?.priority_name || '')}
                    data-testid="priority-chip"
                  />
                </Box>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Assignee: {task?.assignee_name || 'Unassigned'}
                </Typography>
                <Box marginTop={2}>
                  <Button onClick={() => navigate(`/tasks/${task?.id}`)}>
                    Details
                  </Button>
                  <Button
                    color="warning"
                    onClick={() => navigate(`/tasks/${task?.id}/edit`)}
                    sx={{ ml: 1 }}
                  >
                    Edit
                  </Button>
                  <Button
                    color="error"
                    onClick={() => handleDeleteClick(task)}
                    sx={{ ml: 1 }}
                  >
                    Delete
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))
        )}
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
    </Box>
  );
};

export default Tasks;
