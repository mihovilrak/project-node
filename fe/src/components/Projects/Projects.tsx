import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
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
  const [expandedProjectIds, setExpandedProjectIds] = useState<Set<number>>(new Set());

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

  const roots = useMemo(
    () => projects.filter((p) => p?.parent_id == null),
    [projects]
  );

  const childrenByParentId = useMemo(() => {
    const rootIds = new Set(roots.map((r) => r?.id).filter((id): id is number => id != null));
    const map = new Map<number, Project[]>();
    projects.forEach((p) => {
      if (p?.parent_id != null && rootIds.has(p.parent_id)) {
        const list = map.get(p.parent_id) ?? [];
        list.push(p);
        map.set(p.parent_id, list);
      }
    });
    map.forEach((list) => list.sort((a, b) => (a?.name ?? '').localeCompare(b?.name ?? '')));
    return map;
  }, [projects, roots]);

  const filteredRoots = useMemo(
    () =>
      roots
        .filter((project) => {
          if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            const name = project?.name?.toLowerCase() ?? '';
            const description = project?.description?.toLowerCase() ?? '';
            if (!name.includes(searchTerm) && !description.includes(searchTerm)) return false;
          }
          return true;
        })
        .sort((a, b) => {
          const nameA = a?.name ?? '';
          const nameB = b?.name ?? '';
          return sortOrder === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
        }),
    [roots, filters.search, sortOrder]
  );

  const toggleExpanded = useCallback((projectId: number) => {
    setExpandedProjectIds((prev) => {
      const next = new Set(prev);
      if (next.has(projectId)) next.delete(projectId);
      else next.add(projectId);
      return next;
    });
  }, []);

  const projectCardContent = (project: Project, hasSubprojects: boolean, isExpanded: boolean, indent = 0) => (
    <Box sx={{ pl: indent * 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
        {hasSubprojects && (
          <IconButton
            size="small"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleExpanded(project.id); }}
            aria-label={isExpanded ? 'Collapse subprojects' : 'Expand subprojects'}
            sx={{ p: 0.25 }}
          >
            {isExpanded ? <KeyboardArrowDownIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
          </IconButton>
        )}
        <Typography variant="body2" color="text.secondary">#{project?.id}</Typography>
        <Typography
          component={Link}
          to={`/projects/${project?.id}`}
          variant="h6"
          sx={{ fontWeight: 600, textDecoration: 'none', color: 'inherit', '&:hover': { textDecoration: 'underline' } }}
          onClick={(e) => e.stopPropagation()}
        >
          {project?.name ?? 'Unnamed Project'}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', width: 200, mt: 0.5 }}>
        <Typography variant="caption" color="text.secondary">
          {project?.progress ?? 0}%
        </Typography>
        <LinearProgress
          variant="determinate"
          value={Math.min(100, Math.max(0, project?.progress ?? 0))}
          sx={{ height: 8, borderRadius: 1, width: '100%' }}
        />
      </Box>
    </Box>
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
      ) : filteredRoots.length === 0 ? (
        <Typography>No projects yet.</Typography>
      ) : viewMode === 'grid' ? (
        <Grid container spacing={2} sx={{ mt: 2, width: '100%', maxWidth: 1400 }}>
          {filteredRoots.map((project) => {
            const subprojects = childrenByParentId.get(project?.id ?? 0) ?? [];
            const hasSubprojects = subprojects.length > 0;
            const isExpanded = expandedProjectIds.has(project?.id ?? 0);
            return (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={project?.id} sx={{ minWidth: 0 }}>
                <Card data-testid={`project-card-${project?.id}`} sx={{ minWidth: 262 }}>
                  <CardContent>
                    {projectCardContent(project, hasSubprojects, isExpanded)}
                    {hasSubprojects && isExpanded && (
                      <Box sx={{ mt: 1.5, pt: 1, borderTop: 1, borderColor: 'divider' }}>
                        {subprojects.map((sub) => (
                          <Box key={sub?.id} sx={{ mb: 0.5, pl: 1 }} data-testid={`project-card-${sub?.id}`}>
                            {projectCardContent(sub, false, false, 1)}
                          </Box>
                        ))}
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      ) : (
        <Box sx={{ mt: 2, width: '100%', maxWidth: 1400, maxHeight: 600, overflow: 'auto' }}>
          {filteredRoots.map((project) => {
            const subprojects = childrenByParentId.get(project?.id ?? 0) ?? [];
            const hasSubprojects = subprojects.length > 0;
            const isExpanded = expandedProjectIds.has(project?.id ?? 0);
            return (
              <Card key={project?.id} data-testid={`project-card-${project?.id}`} sx={{ mb: 1 }}>
                <CardContent sx={{ py: 1 }}>
                  {projectCardContent(project, hasSubprojects, isExpanded)}
                  {hasSubprojects && isExpanded && (
                    <Box sx={{ mt: 1, pt: 1, borderTop: 1, borderColor: 'divider', pl: 1 }}>
                      {subprojects.map((sub) => (
                        <Box key={sub?.id} sx={{ mb: 0.5, pl: 1 }} data-testid={`project-card-${sub?.id}`}>
                          {projectCardContent(sub, false, false, 1)}
                        </Box>
                      ))}
                    </Box>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </Box>
      )}
    </Box>
  );
};

export default Projects;
