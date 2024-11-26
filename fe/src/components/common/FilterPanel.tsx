import React, { useState } from 'react';
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
import {
  FilterPanelProps,
  FilterValues,
  FilterPanelOptions,
  FilterOption
} from '../../types/filterPanel';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  options,
  onFilterChange
}) => {
  const [expanded, setExpanded] = useState<boolean>(false);

  const handleFilterChange = (field: keyof FilterValues, value: string | number | null): void => {
    const newFilters: FilterValues = {
      ...filters,
      [field]: value
    };
    onFilterChange(newFilters);
  };

  const getAppliedFilters = () => {
    return Object.entries(filters)
      .filter(([_, value]) => value !== null && value !== undefined && value !== '')
      .map(([field, value]) => ({
        field,
        value,
        displayValue: getDisplayValue(field as keyof FilterPanelOptions, value)
      }));
  };

  const getDisplayValue = (field: keyof FilterPanelOptions, value: string | number): string => {
    const fieldOption = options[field];
    if (Array.isArray(fieldOption)) {
      const option = fieldOption.find((opt: FilterOption) => String(opt.id) === String(value));
      return option ? option.name : String(value);
    }
    return String(value);
  };

  const handleClearFilters = (): void => {
    const clearedFilters: FilterValues = {};
    onFilterChange(clearedFilters);
    setExpanded(false);
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Box sx={{ flex: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {getAppliedFilters().map((filter) => (
            <Chip
              key={filter.field}
              label={`${filter.field}: ${filter.displayValue}`}
              onDelete={() => handleFilterChange(filter.field as keyof FilterValues, null)}
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
                  <InputLabel>{field}</InputLabel>
                  <Select
                    value={String(filters[field as keyof FilterValues] || '')}
                    onChange={(e: SelectChangeEvent) => 
                      handleFilterChange(field as keyof FilterValues, e.target.value)
                    }
                    label={field}
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
                  label={field}
                  value={filters[field as keyof FilterValues] || ''}
                  onChange={(e) => handleFilterChange(field as keyof FilterValues, e.target.value)}
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
            onClick={() => setExpanded(false)}
          >
            Apply Filters
          </Button>
        </Box>
      </Collapse>
    </Box>
  );
};

export default FilterPanel;
