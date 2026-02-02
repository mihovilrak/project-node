import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FixedSizeList as List } from 'react-window';
import { getTasks, deleteTask, getTaskStatuses, getPriorities } from '../../api/tasks';
import logger from '../../utils/logger';
import { getProjects } from '../../api/projects';
import { getUsers } from '../../api/users';
import {
  Button,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Chip,
  Select,
  MenuItem,
  SelectChangeEvent,
  Grid,
  IconButton,
  Tooltip,
  LinearProgress
} from '@mui/material';
import ViewListIcon from '@mui/icons-material/ViewList';
import GridViewIcon from '@mui/icons-material/GridView';
import FilterPanel from '../common/FilterPanel';
import DeleteConfirmDialog from '../common/DeleteConfirmDialog';
import { Task } from '../../types/task';
import { FilterValues, FilterOption } from '../../types/filterPanel';
import { getPriorityColor } from '../../utils/taskUtils';
import getApiErrorMessage from '../../utils/getApiErrorMessage';

const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterValues>({ status_id: 0 });
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [statuses, setStatuses] = useState<FilterOption[]>([]);
  const [priorities, setPriorities] = useState<FilterOption[]>([]);
  const [projects, setProjects] = useState<FilterOption[]>([]);
  const [users, setUsers] = useState<FilterOption[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const navigate = useNavigate();

  const fetchTasks = useCallback(async (currentFilters?: FilterValues): Promise<void> => {
    try {
      setError(null);

      const f = currentFilters || {};
      const statusIdRaw = f.status_id;
      const statusId = statusIdRaw != null && String(statusIdRaw) !== '' ? Number(statusIdRaw) : undefined;
      const inactiveOnly = f.inactive_statuses_only === true || String(f.inactive_statuses_only) === 'true';
      const hasFilters = currentFilters && Object.keys(currentFilters).length > 0;
      const params: Record<string, string | number> = {};
      if (hasFilters && currentFilters) {
        if (statusId === -1) {
          params.inactive_statuses_only = 1;
        } else if (statusId !== undefined && statusId !== 0) {
          params.status_id = Number(statusId);
        }
        if (f.priority_id != null && f.priority_id !== '') params.priority_id = Number(f.priority_id);
        if (f.assignee_id != null && f.assignee_id !== '') params.assignee_id = Number(f.assignee_id);
        if (f.holder_id != null && f.holder_id !== '') params.holder_id = Number(f.holder_id);
        if (f.project_id != null && f.project_id !== '') params.project_id = Number(f.project_id);
        if (f.created_by != null && f.created_by !== '') params.created_by = Number(f.created_by);
        if (f.id != null && f.id !== '') params.id = Number(f.id);
        if (f.parent_id != null && f.parent_id !== '') params.parent_id = Number(f.parent_id);
        if (f.due_date_from) params.due_date_from = String(f.due_date_from);
        if (f.due_date_to) params.due_date_to = String(f.due_date_to);
        if (f.start_date_from) params.start_date_from = String(f.start_date_from);
        if (f.start_date_to) params.start_date_to = String(f.start_date_to);
        if (f.created_from) params.created_from = String(f.created_from);
        if (f.created_to) params.created_to = String(f.created_to);
        if (f.estimated_time_min != null && f.estimated_time_min !== '') params.estimated_time_min = Number(f.estimated_time_min);
        if (f.estimated_time_max != null && f.estimated_time_max !== '') params.estimated_time_max = Number(f.estimated_time_max);
      }
      const taskList = await getTasks(hasFilters ? params : {});
      setTasks(taskList);
    } catch (error) {
      logger.error('Failed to fetch tasks', error);
      setError('Failed to load tasks. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks(filters);
    // Fetch filter options
    const fetchFilterOptions = async () => {
      try {
        const [statusesData, prioritiesData, projectsData, usersData] = await Promise.all([
          getTaskStatuses().catch(() => []),
          getPriorities().catch(() => []),
          getProjects().catch(() => []),
          getUsers().catch(() => [])
        ]);
        const activeInactive = [
          { id: 0, name: 'Active' },
          { id: -1, name: 'Inactive' },
          ...statusesData
        ];
        setStatuses(activeInactive);
        setPriorities(prioritiesData);
        setProjects(projectsData);
        setUsers((usersData || []).map((u: { id: number; name?: string; login?: string }) => ({ id: u.id, name: u.name ? `${u.name} (${u.login || u.id})` : String(u.login || u.id) })));
      } catch (error) {
        logger.error('Failed to fetch filter options:', error);
      }
    };
    fetchFilterOptions();
  }, [fetchTasks, filters]);

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
    } catch (error: unknown) {
      logger.error('Failed to delete task:', error);
      setDeleteError(getApiErrorMessage(error, 'Failed to delete task. Please try again.'));
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
  }, []);

  const handleSortChange = useCallback((event: SelectChangeEvent<'asc' | 'desc'>) => {
    setSortOrder(event.target.value as 'asc' | 'desc');
  }, []);

  const filterOptions = useMemo(() => ({
    search: true,
    showDateFilters: true,
    statuses,
    priorities,
    projects,
    users,
    holders: users,
    createdBy: users,
    due_date_from: true,
    due_date_to: true,
    start_date_from: true,
    start_date_to: true,
    created_from: true,
    created_to: true
  }), [statuses, priorities, projects, users]);

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
            type="button"
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
          <Tooltip title={viewMode === 'grid' ? 'Switch to list view' : 'Switch to grid view'}>
            <IconButton
              onClick={() => setViewMode((m) => (m === 'grid' ? 'list' : 'grid'))}
              aria-label={viewMode === 'grid' ? 'List view' : 'Grid view'}
            >
              {viewMode === 'grid' ? <ViewListIcon /> : <GridViewIcon />}
            </IconButton>
          </Tooltip>
        </Box>

        <FilterPanel
          type="tasks"
          filters={filters}
          options={filterOptions}
          onFilterChange={handleFilterChange}
        />
      </Box>

      <Box sx={{ mt: 2, width: '100%', maxWidth: 1400 }}>
        {filteredTasks.length === 0 ? (
          <Typography>No tasks found.</Typography>
        ) : viewMode === 'grid' ? (
          <Grid container spacing={2}>
            {filteredTasks.map((task) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={task?.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">{task?.name || 'Unnamed Task'}</Typography>
                    <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      <Chip
                        label={task?.status_name || 'Unknown'}
                        size="small"
                        color={task?.status_name === 'Done' ? 'success' : 'default'}
                        data-testid="status-chip"
                      />
                      <Chip
                        label={task?.priority_name || 'Unknown'}
                        size="small"
                        color={getPriorityColor(task?.priority_name || '')}
                        data-testid="priority-chip"
                      />
                    </Box>
                    <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 2, fontSize: '0.875rem' }}>
                      <span>Assignee: {task?.assignee_id ? <Link to={`/users/${task.assignee_id}`}>{task?.assignee_name || 'User'}</Link> : 'Unassigned'}</span>
                      <span>Holder: {task?.holder_id ? <Link to={`/users/${task.holder_id}`}>{task?.holder_name || 'User'}</Link> : '—'}</span>
                      <span>Project: {task?.project_id ? <Link to={`/projects/${task.project_id}`}>{task?.project_name || 'Project'}</Link> : 'No Project'}</span>
                    </Box>
                    <Box sx={{ mt: 1, fontSize: '0.875rem' }}>
                      <Typography variant="body2">Start: {task?.start_date ? new Date(task.start_date).toLocaleDateString() : '—'}</Typography>
                      <Typography variant="body2">Due: {task?.due_date ? new Date(task.due_date).toLocaleDateString() : '—'}</Typography>
                      <Box sx={{ mt: 0.5 }}>
                        <Typography variant="caption">Progress</Typography>
                        <LinearProgress variant="determinate" value={task?.progress ?? 0} sx={{ mt: 0.25, height: 6, borderRadius: 1 }} />
                        <Typography variant="caption">{task?.progress ?? 0}%</Typography>
                      </Box>
                    </Box>
                    <Box marginTop={2}>
                      <Button type="button" onClick={() => navigate(`/tasks/${task?.id}`)}>Details</Button>
                      <Button type="button" color="warning" onClick={() => navigate(`/tasks/${task?.id}/edit`)} sx={{ ml: 1 }}>Edit</Button>
                      <Button type="button" color="error" onClick={() => handleDeleteClick(task)} sx={{ ml: 1 }}>Delete</Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box sx={{ height: 600 }}>
            <List
              height={600}
              itemCount={filteredTasks.length}
              itemSize={280}
              width="100%"
              itemData={filteredTasks}
            >
              {({ index, style, data }) => {
                const task = data[index];
                return (
                  <div style={style}>
                    <Box sx={{ py: 1, px: 0.5 }}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6">{task?.name || 'Unnamed Task'}</Typography>
                          <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            <Chip label={task?.status_name || 'Unknown'} size="small" color={task?.status_name === 'Done' ? 'success' : 'default'} data-testid="status-chip" />
                            <Chip label={task?.priority_name || 'Unknown'} size="small" color={getPriorityColor(task?.priority_name || '')} data-testid="priority-chip" />
                          </Box>
                          <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 2, fontSize: '0.875rem' }}>
                            <span>Assignee: {task?.assignee_id ? <Link to={`/users/${task.assignee_id}`}>{task?.assignee_name || 'User'}</Link> : 'Unassigned'}</span>
                            <span>Holder: {task?.holder_id ? <Link to={`/users/${task.holder_id}`}>{task?.holder_name || 'User'}</Link> : '—'}</span>
                            <span>Project: {task?.project_id ? <Link to={`/projects/${task.project_id}`}>{task?.project_name || 'Project'}</Link> : 'No Project'}</span>
                          </Box>
                          <Box sx={{ mt: 1, fontSize: '0.875rem' }}>
                            <Typography variant="body2">Start: {task?.start_date ? new Date(task.start_date).toLocaleDateString() : '—'}</Typography>
                            <Typography variant="body2">Due: {task?.due_date ? new Date(task.due_date).toLocaleDateString() : '—'}</Typography>
                            <Box sx={{ mt: 0.5 }}>
                              <Typography variant="caption">Progress</Typography>
                              <LinearProgress variant="determinate" value={task?.progress ?? 0} sx={{ mt: 0.25, height: 6, borderRadius: 1 }} />
                              <Typography variant="caption">{task?.progress ?? 0}%</Typography>
                            </Box>
                          </Box>
                          <Box marginTop={2}>
                            <Button type="button" onClick={() => navigate(`/tasks/${task?.id}`)}>Details</Button>
                            <Button type="button" color="warning" onClick={() => navigate(`/tasks/${task?.id}/edit`)} sx={{ ml: 1 }}>Edit</Button>
                            <Button type="button" color="error" onClick={() => handleDeleteClick(task)} sx={{ ml: 1 }}>Delete</Button>
                          </Box>
                        </CardContent>
                      </Card>
                    </Box>
                  </div>
                );
              }}
            </List>
          </Box>
        )}
      </Box>

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
