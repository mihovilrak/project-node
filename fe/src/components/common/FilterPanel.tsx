import React from 'react';
import {
  Box,
  Grid,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Collapse,
  SelectChangeEvent,
  Button
} from '@mui/material';
import { FilterPanelProps, FilterValues, FilterOption } from '../../types/filterPanel';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { useFilterPanel } from '../../hooks/common/useFilterPanel';

const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  options,
  onFilterChange
}) => {
  const {
    expanded,
    setExpanded,
    handleFilterChange,
    getAppliedFilters,
    handleClearFilters
  } = useFilterPanel(filters, onFilterChange);

  const getFilterField = (field: string): keyof FilterValues => {
    switch (field) {
      case 'statuses':
        return 'status_id';
      case 'priorities':
        return 'priority_id';
      case 'types':
        return 'type_id';
      case 'users':
        return 'assignee_id';
      case 'projects':
        return 'project_id';
      case 'activities':
        return 'type_id';
      case 'search':
        return 'search';
      default:
        return 'search';
    }
  };

  return (
    <Box sx={{ mb: 2 }} data-testid="filter-panel">
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Box sx={{ flex: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {getAppliedFilters(options).map((filter) => (
            <Chip
              key={filter.field}
              label={`${filter.field}: ${filter.displayValue}`}
              onDelete={() => handleFilterChange(filter.field as keyof typeof filters, null)}
              size="small"
            />
          ))}
        </Box>
        <IconButton
          size="small"
          onClick={() => setExpanded(!expanded)}
          sx={{ ml: 1 }}
        >
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>

      <Collapse in={expanded}>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {Object.entries(options).map(([field, fieldOption]) => (
            <Grid item xs={12} sm={6} md={4} key={field}>
              {Array.isArray(fieldOption) ? (
                <FormControl fullWidth size="small">
                  <InputLabel id={`${field}-label`}>{field}</InputLabel>
                  <Select
                    size="small"
                    value={String(filters[getFilterField(field)] || '')}
                    onChange={(e: SelectChangeEvent<string>) =>
                      handleFilterChange(getFilterField(field), e.target.value || null)
                    }
                    label={field}
                    labelId={`${field}-label`}
                    id={`${field}-select`}
                    data-testid={`${field}-select`}
                    aria-label={field}
                  >
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                    {fieldOption.map((opt: FilterOption) => (
                      <MenuItem key={opt.id} value={String(opt.id)}>
                        {opt.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ) : (
                <TextField
                  label={field === 'search' ? 'Search' : field}
                  value={filters[getFilterField(field)] || ''}
                  onChange={(e) => handleFilterChange(getFilterField(field), e.target.value)}
                  fullWidth
                  size="small"
                  type="text"
                />
              )}
            </Grid>
          ))}
        </Grid>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
          <Button
            variant="outlined"
            onClick={handleClearFilters}
          >
            Clear
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              setExpanded(false);
            }}
            data-testid="apply-filters-button"
            style={{ display: expanded ? 'inline-flex' : 'none' }}
          >
            Apply Filters
          </Button>
        </Box>
      </Collapse>
    </Box>
  );
};

export default FilterPanel;
