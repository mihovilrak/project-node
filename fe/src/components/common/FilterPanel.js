import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Collapse,
  Grid,
  Button,
  Tooltip
} from '@mui/material';
import {
  FilterList,
  Clear,
  ExpandMore,
  ExpandLess
} from '@mui/icons-material';

const FilterPanel = ({ 
  type, // 'tasks' or 'projects'
  filters,
  onFilterChange,
  users,
  taskTypes,
  priorities,
  statuses
}) => {
  const [expanded, setExpanded] = useState(false);
  const [activeFilters, setActiveFilters] = useState([]);

  const handleFilterChange = (field, value) => {
    const newFilters = {
      ...filters,
      [field]: value
    };
    
    // Remove empty filters
    if (!value) {
      delete newFilters[field];
    }
    
    // Update active filters list
    setActiveFilters(Object.keys(newFilters));
    
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    setActiveFilters([]);
    onFilterChange({});
  };

  const renderFilterChips = () => {
    return activeFilters.map(field => (
      <Chip
        key={field}
        label={`${field.replace('_', ' ')}: ${filters[field]}`}
        onDelete={() => handleFilterChange(field, '')}
        sx={{ m: 0.5 }}
      />
    ));
  };

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <FilterList sx={{ mr: 1 }} />
          <Typography variant="h6">Filters</Typography>
        </Box>
        <Box>
          {activeFilters.length > 0 && (
            <Tooltip title="Clear all filters">
              <IconButton onClick={clearFilters} size="small">
                <Clear />
              </IconButton>
            </Tooltip>
          )}
          <IconButton 
            onClick={() => setExpanded(!expanded)}
            size="small"
          >
            {expanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </Box>
      </Box>

      {activeFilters.length > 0 && (
        <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap' }}>
          {renderFilterChips()}
        </Box>
      )}

      <Collapse in={expanded}>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Search"
              value={filters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              fullWidth
              size="small"
              placeholder="Name or description..."
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                label="Status"
              >
                <MenuItem value="">All</MenuItem>
                {statuses.map(status => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {type === 'tasks' && (
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Priority</InputLabel>
                <Select
                  value={filters.priority || ''}
                  onChange={(e) => handleFilterChange('priority', e.target.value)}
                  label="Priority"
                >
                  <MenuItem value="">All</MenuItem>
                  {priorities.map(priority => (
                    <MenuItem key={priority} value={priority}>
                      {priority}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}

          {type === 'tasks' && (
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Type</InputLabel>
                <Select
                  value={filters.type || ''}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  label="Type"
                >
                  <MenuItem value="">All</MenuItem>
                  {taskTypes.map(type => (
                    <MenuItem key={type.id} value={type.id}>
                      {type.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}

          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Assignee</InputLabel>
              <Select
                value={filters.assignee_id || ''}
                onChange={(e) => handleFilterChange('assignee_id', e.target.value)}
                label="Assignee"
              >
                <MenuItem value="">All</MenuItem>
                {users.map(user => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Due Date From"
              type="date"
              value={filters.due_date_from || ''}
              onChange={(e) => handleFilterChange('due_date_from', e.target.value)}
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Due Date To"
              type="date"
              value={filters.due_date_to || ''}
              onChange={(e) => handleFilterChange('due_date_to', e.target.value)}
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>

        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            onClick={clearFilters}
            sx={{ mr: 1 }}
          >
            Clear
          </Button>
          <Button
            variant="contained"
            onClick={() => setExpanded(false)}
          >
            Apply Filters
          </Button>
        </Box>
      </Collapse>
    </Paper>
  );
};

export default FilterPanel; 