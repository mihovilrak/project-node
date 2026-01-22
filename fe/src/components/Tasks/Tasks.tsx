import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTasks, deleteTask } from '../../api/tasks';
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
import { Task } from '../../types/task';
import { FilterValues } from '../../types/filterPanel';
import { getPriorityColor } from '../../utils/taskUtils';

const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterValues>({});
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const navigate = useNavigate();

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = useCallback(async (): Promise<void> => {
    try {
      setError(null);
      const taskList = await getTasks();
      setTasks(taskList);
    } catch (error) {
      console.error('Failed to fetch tasks', error);
      setError('Failed to load tasks. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDelete = useCallback(async (taskId: number): Promise<void> => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(taskId);
        fetchTasks();
      } catch (error) {
        console.error('Failed to delete task', error);
        setError('Failed to delete task. Please try again.');
      }
    }
  }, [fetchTasks]);

  const handleFilterChange = useCallback((newFilters: FilterValues) => {
    setFilters(newFilters);
  }, []);

  const handleSortChange = useCallback((event: SelectChangeEvent<'asc' | 'desc'>) => {
    setSortOrder(event.target.value as 'asc' | 'desc');
  }, []);

  const filterOptions = useMemo(() => ({
    search: true,
    showDateFilters: true,
    statuses: [], // This should be populated with actual status options from your API
    priorities: [], // This should be populated with actual priority options from your API
    projects: [] // This should be populated with actual project options from your API
  }), []);

  const filteredTasks = useMemo(() => {
    return tasks
      .filter(task => {
        if (filters.search) {
          const searchTerm = filters.search.toLowerCase();
          return (
            task.name.toLowerCase().includes(searchTerm) ||
            task.description?.toLowerCase().includes(searchTerm) ||
            task.project_name?.toLowerCase().includes(searchTerm)
          );
        }
        if (filters.status_id) {
          return task.status_id === Number(filters.status_id);
        }
        if (filters.priority_id) {
          return task.priority_id === Number(filters.priority_id);
        }
        if (filters.project_id) {
          return task.project_id === Number(filters.project_id);
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
        {filteredTasks.map((task) => (
          <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={task.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{task.name}</Typography>
                <Typography variant="body2">Project: {task.project_name}</Typography>
                <Box sx={{ mt: 1 }}>
                  <Chip
                    label={task.status_name}
                    size="small"
                    color={task.status_name === 'Done' ? 'success' : 'default'}
                    sx={{ mr: 1 }}
                    data-testid="status-chip"
                  />
                  <Chip
                    label={task.priority_name}
                    size="small"
                    color={getPriorityColor(task.priority_name || '')}
                    data-testid="priority-chip"
                  />
                </Box>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Assignee: {task.assignee_name || 'Unassigned'}
                </Typography>
                <Box marginTop={2}>
                  <Button onClick={() => navigate(`/tasks/${task.id}`)}>
                    Details
                  </Button>
                  <Button
                    color="warning"
                    onClick={() => navigate(`/tasks/${task.id}/edit`)}
                    sx={{ ml: 1 }}
                  >
                    Edit
                  </Button>
                  <Button
                    color="error"
                    onClick={() => handleDelete(task.id)}
                    sx={{ ml: 1 }}
                  >
                    Delete
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Tasks;
