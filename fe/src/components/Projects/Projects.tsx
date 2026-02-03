import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FixedSizeList as List } from 'react-window';
import { getProjects, getProjectStatuses } from '../../api/projects';
import { getUsers } from '../../api/users';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
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
import { Project } from '../../types/project';
import { ProjectStatus } from '../../types/project';
import logger from '../../utils/logger';
import getApiErrorMessage from '../../utils/getApiErrorMessage';
import FilterPanel from '../common/FilterPanel';
import { FilterValues, FilterOption } from '../../types/filterPanel';

const Projects: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [filters, setFilters] = useState<FilterValues>({ status_id: 1 });
  const [statuses, setStatuses] = useState<ProjectStatus[]>([]);
  const [users, setUsers] = useState<FilterOption[]>([]);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const fetchProjects = useCallback(async (currentFilters?: FilterValues): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const f = currentFilters || {};
      const params: Parameters<typeof getProjects>[0] = {
        status_id: f.status_id != null && f.status_id !== '' ? Number(f.status_id) : 1
      };
      if (f.created_by != null && f.created_by !== '') params.created_by = Number(f.created_by);
      if (f.parent_id != null && f.parent_id !== '') params.parent_id = Number(f.parent_id);
      if (f.start_date_from) params.start_date_from = String(f.start_date_from);
      if (f.start_date_to) params.start_date_to = String(f.start_date_to);
      if (f.due_date_from) params.due_date_from = String(f.due_date_from);
      if (f.due_date_to) params.due_date_to = String(f.due_date_to);
      const projectList = await getProjects(params);
      setProjects(projectList || []);
    } catch (error: unknown) {
      logger.error('Failed to fetch projects', error);
      setError(getApiErrorMessage(error, 'Failed to load projects'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects(filters);
    const loadOptions = async () => {
      try {
        const [statusesData, usersData] = await Promise.all([
          getProjectStatuses().catch(() => []),
          getUsers().catch(() => [])
        ]);
        setStatuses(statusesData);
        setUsers((usersData || []).map((u: { id: number; name?: string; login?: string }) => ({ id: u.id, name: u.name ? `${u.name} (${u.login || u.id})` : String(u.login || u.id) })));
      } catch {
        setStatuses([]);
        setUsers([]);
      }
    };
    loadOptions();
  }, [fetchProjects, filters]);

  const handleCreateProject = (): void => {
    navigate('/projects/new');
  };

  const handleSortChange = (event: SelectChangeEvent<'asc' | 'desc'>): void => {
    setSortOrder(event.target.value as 'asc' | 'desc');
  };

  const handleFilterChange = (newFilters: FilterValues): void => {
    setFilters(newFilters);
  };

  const filterOptions = useMemo(
    () => ({
      search: true,
      statuses: statuses.map((s) => ({ id: s.id, name: s.name })),
      createdBy: users,
      parent_id: projects.map((p) => ({ id: p.id, name: p.name })),
      start_date_from: true,
      start_date_to: true,
      due_date_from: true,
      due_date_to: true
    }),
    [statuses, users, projects]
  );

  const filteredProjects = projects
    .filter((project) => {
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const name = project?.name?.toLowerCase() || '';
        const description = project?.description?.toLowerCase() || '';
        if (!name.includes(searchTerm) && !description.includes(searchTerm)) {
          return false;
        }
      }
      return true;
    })
    .sort((a, b) => {
      const nameA = a?.name || '';
      const nameB = b?.name || '';
      return sortOrder === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
    });

  const formatHours = (hours: number | undefined): string => {
    const h = hours ?? 0;
    return `${Number(h).toFixed(1)} h`;
  };

  const projectCardContentGrid = (project: Project) => (
    <>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>{project?.name || 'Unnamed Project'}</Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          columnGap: 1.5,
          rowGap: 0.5,
          mb: 0.5
        }}
      >
        <Box>
          <Typography component="span" variant="body2" sx={{ fontWeight: 700 }}>Start </Typography>
          <Typography component="span" variant="body2" color="text.secondary">
            {project?.start_date ? new Date(project.start_date).toLocaleDateString() : '—'}
          </Typography>
        </Box>
        <Box>
          <Typography component="span" variant="body2" sx={{ fontWeight: 700 }}>Created by </Typography>
          <Typography component="span" variant="body2" color="text.secondary">
            {project?.created_by_name ?? '—'}
          </Typography>
        </Box>
        <Box>
          <Typography component="span" variant="body2" sx={{ fontWeight: 700 }}>Estimated time </Typography>
          <Typography component="span" variant="body2" color="text.secondary">
            {formatHours(project?.estimated_time)}
          </Typography>
        </Box>
        <Box>
          <Typography component="span" variant="body2" sx={{ fontWeight: 700 }}>Due </Typography>
          <Typography component="span" variant="body2" color="text.secondary">
            {project?.due_date ? new Date(project.due_date).toLocaleDateString() : '—'}
          </Typography>
        </Box>
        <Box>
          <Typography component="span" variant="body2" sx={{ fontWeight: 700 }}>Status </Typography>
          <Typography component="span" variant="body2" color="text.secondary">
            {project?.status_name ?? '—'}
          </Typography>
        </Box>
        <Box>
          <Typography component="span" variant="body2" sx={{ fontWeight: 700 }}>Spent time </Typography>
          <Typography component="span" variant="body2" color="text.secondary">
            {formatHours(project?.spent_time)}
          </Typography>
        </Box>
      </Box>
      <Box sx={{ mt: 1 }}>
        <Typography variant="body2" sx={{ fontWeight: 700 }}>Progress</Typography>
        <LinearProgress
          variant="determinate"
          value={Math.min(100, Math.max(0, project?.progress ?? 0))}
          sx={{ mt: 0.5, height: 8, borderRadius: 1 }}
        />
        <Typography variant="caption" color="text.secondary">
          {project?.progress ?? 0}%
        </Typography>
      </Box>
    </>
  );

  const projectCardContentList = (project: Project) => (
    <>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>{project?.name || 'Unnamed Project'}</Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          columnGap: 1.5,
          rowGap: 0.5
        }}
      >
        <Box>
          <Typography component="span" variant="body2" sx={{ fontWeight: 700 }}>Start </Typography>
          <Typography component="span" variant="body2" color="text.secondary">
            {project?.start_date ? new Date(project.start_date).toLocaleDateString() : '—'}
          </Typography>
        </Box>
        <Box>
          <Typography component="span" variant="body2" sx={{ fontWeight: 700 }}>Created by </Typography>
          <Typography component="span" variant="body2" color="text.secondary">
            {project?.created_by_name ?? '—'}
          </Typography>
        </Box>
        <Box>
          <Typography component="span" variant="body2" sx={{ fontWeight: 700 }}>Estimated time </Typography>
          <Typography component="span" variant="body2" color="text.secondary">
            {formatHours(project?.estimated_time)}
          </Typography>
        </Box>
        <Box>
          <Typography component="span" variant="body2" sx={{ fontWeight: 700 }}>Due </Typography>
          <Typography component="span" variant="body2" color="text.secondary">
            {project?.due_date ? new Date(project.due_date).toLocaleDateString() : '—'}
          </Typography>
        </Box>
        <Box>
          <Typography component="span" variant="body2" sx={{ fontWeight: 700 }}>Status </Typography>
          <Typography component="span" variant="body2" color="text.secondary">
            {project?.status_name ?? '—'}
          </Typography>
        </Box>
        <Box>
          <Typography component="span" variant="body2" sx={{ fontWeight: 700 }}>Spent time </Typography>
          <Typography component="span" variant="body2" color="text.secondary">
            {formatHours(project?.spent_time)}
          </Typography>
        </Box>
      </Box>
    </>
  );

  return (
    <Box sx={{ width: '100%', p: 3 }} data-testid="projects-container">
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>Projects</Typography>
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <Select
            value={sortOrder}
            onChange={handleSortChange}
            size="small"
            data-testid="project-sort"
            aria-label="Sort Order"
          >
            <MenuItem value="asc">Ascending</MenuItem>
            <MenuItem value="desc">Descending</MenuItem>
          </Select>
          <Tooltip title={viewMode === 'grid' ? 'Switch to list view' : 'Switch to grid view'}>
            <IconButton
              onClick={() => setViewMode((m) => (m === 'grid' ? 'list' : 'grid'))}
              aria-label={viewMode === 'grid' ? 'List view' : 'Grid view'}
            >
              {viewMode === 'grid' ? <ViewListIcon /> : <GridViewIcon />}
            </IconButton>
          </Tooltip>
          <Box sx={{ flexGrow: 1 }} />
          <Button
            type="button"
            variant="contained"
            color="primary"
            onClick={handleCreateProject}
            data-testid="create-project-button"
          >
            Create New Project
          </Button>
        </Box>

        <FilterPanel
          type="projects"
          filters={filters}
          options={filterOptions}
          onFilterChange={handleFilterChange}
        />
      </Box>

      {error ? (
        <Typography color="error" data-testid="projects-error">{error}</Typography>
      ) : loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <Typography>Loading projects...</Typography>
        </Box>
      ) : filteredProjects.length === 0 ? (
        <Typography>No projects yet.</Typography>
      ) : viewMode === 'grid' ? (
        <Grid container spacing={2} sx={{ mt: 2, width: '100%', maxWidth: 1400 }}>
          {filteredProjects.map((project) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={project?.id}>
              <Card
                onClick={() => navigate(`/projects/${project?.id}`)}
                data-testid={`project-card-${project?.id}`}
                role="button"
                aria-label={`View project ${project?.name || 'Unnamed'}`}
                sx={{ cursor: 'pointer' }}
              >
                <CardContent>
                  {projectCardContentGrid(project)}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box sx={{ height: 600, mt: 2, width: '100%', maxWidth: 1400 }}>
          <List
            height={600}
            itemCount={filteredProjects.length}
            itemSize={140}
            width="100%"
            itemData={filteredProjects}
          >
            {({ index, style, data }) => {
              const project = data[index];
              return (
                <div style={style}>
                  <Box sx={{ py: 1, px: 0.5 }}>
                    <Card
                      onClick={() => navigate(`/projects/${project?.id}`)}
                      data-testid={`project-card-${project?.id}`}
                      role="button"
                      aria-label={`View project ${project?.name || 'Unnamed'}`}
                      sx={{ cursor: 'pointer' }}
                    >
                      <CardContent>
                        {projectCardContentList(project)}
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
  );
};

export default Projects;
