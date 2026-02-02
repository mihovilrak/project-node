import React, { useState } from 'react';
import {
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Collapse,
  SelectChangeEvent,
  Button,
  ListItemButton,
  List,
  Typography
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import {
  FilterPanelProps,
  FilterValues,
  FilterOption,
  ActiveFilter,
  DateFilterOperator,
  DropdownFilterOperator,
  FILTER_FIELD_LABELS,
  DATE_FIELD_TO_KEYS,
  AvailableFilterDef
} from '../../types/filterPanel';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useFilterPanel } from '../../hooks/common/useFilterPanel';

const DATE_OPERATORS: { value: DateFilterOperator; label: string }[] = [
  { value: 'from', label: 'From' },
  { value: 'to', label: 'To' },
  { value: 'between', label: 'Between' }
];

const DROPDOWN_OPERATORS: { value: DropdownFilterOperator; label: string }[] = [
  { value: 'includes', label: 'Includes' },
  { value: 'excludes', label: 'Excludes' },
  { value: 'is', label: 'Is' }
];

const FilterPanel: React.FC<FilterPanelProps> = ({
  type,
  filters,
  options,
  onFilterChange
}) => {
  const {
    expanded,
    setExpanded,
    handleFilterChange,
    getAppliedFilters,
    handleClearFilters,
    activeFilters,
    addFilter,
    removeFilter,
    updateFilter,
    availableFilters
  } = useFilterPanel(filters, onFilterChange, options, type);

  const [betweenSecondFocused, setBetweenSecondFocused] = useState<string | null>(null);

  const getFilterDef = (field: ActiveFilter['field']): AvailableFilterDef | undefined =>
    availableFilters.find((d) => d.key === field);

  const handleAddFilter = (e: React.MouseEvent, def: AvailableFilterDef) => {
    e.preventDefault();
    e.stopPropagation();
    addFilter(def);
  };

  const renderFilterRow = (af: ActiveFilter) => {
    const def = getFilterDef(af.field);
    if (!def) return null;
    const label = def.label;
    const isDate = def.kind === 'date';
    const isDropdown = def.kind === 'dropdown';
    const isNumber = def.kind === 'number';
    const isText = def.kind === 'text';
    const dateOp = af.operator as DateFilterOperator;
    const isBetween = isDate && dateOp === 'between';

    return (
      <Box key={af.id} sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', gap: 1, mb: 2, p: 1.5, bgcolor: 'action.hover', borderRadius: 1 }}>
        <Box sx={{ minWidth: 120, fontWeight: 500 }}>{label}</Box>
        {isDate && (
          <>
            <FormControl size="small" sx={{ minWidth: 100 }}>
              <Select
                value={dateOp}
                onChange={(e: SelectChangeEvent<DateFilterOperator>) =>
                  updateFilter(af.id, { operator: e.target.value as DateFilterOperator, value2: isBetween ? af.value2 : undefined })
                }
                displayEmpty
              >
                {DATE_OPERATORS.map((op) => (
                  <MenuItem key={op.value} value={op.value}>
                    {op.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {dateOp !== 'between' && (
              <DatePicker
                label={dateOp === 'from' ? 'From' : 'To'}
                value={af.value ? dayjs(String(af.value)) : null}
                onChange={(date) => updateFilter(af.id, { value: date ? dayjs(date).format('YYYY-MM-DD') : null })}
                slotProps={{ textField: { size: 'small', sx: { width: 160 } } }}
              />
            )}
            {isBetween && (
              <>
                <DatePicker
                  label="From"
                  value={af.value ? dayjs(String(af.value)) : null}
                  onChange={(date) => {
                    const v = date ? dayjs(date).format('YYYY-MM-DD') : null;
                    updateFilter(af.id, { value: v });
                    if (v) setBetweenSecondFocused(af.id);
                  }}
                  slotProps={{
                    textField: { size: 'small', sx: { width: 160 } },
                    actionBar: { actions: ['accept'] }
                  }}
                />
                <DatePicker
                  label="To"
                  value={af.value2 ? dayjs(String(af.value2)) : null}
                  onChange={(date) => {
                    updateFilter(af.id, { value2: date ? dayjs(date).format('YYYY-MM-DD') : null });
                    setBetweenSecondFocused(null);
                  }}
                  open={betweenSecondFocused === af.id}
                  onOpen={() => setBetweenSecondFocused(af.id)}
                  onClose={() => setBetweenSecondFocused(null)}
                  slotProps={{
                    textField: { size: 'small', sx: { width: 160 } },
                    actionBar: { actions: ['accept'] }
                  }}
                />
              </>
            )}
          </>
        )}
        {isDropdown && (
          <>
            <FormControl size="small" sx={{ minWidth: 100 }}>
              <Select
                value={af.operator as DropdownFilterOperator}
                onChange={(e: SelectChangeEvent<DropdownFilterOperator>) =>
                  updateFilter(af.id, { operator: e.target.value as DropdownFilterOperator })
                }
              >
                {DROPDOWN_OPERATORS.map((op) => (
                  <MenuItem key={op.value} value={op.value}>
                    {op.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel id={`${af.id}-val-label`}>Value</InputLabel>
              <Select
                labelId={`${af.id}-val-label`}
                value={String(af.value ?? '')}
                onChange={(e: SelectChangeEvent<string>) =>
                  updateFilter(af.id, {
                    value: af.field === 'inactive_statuses_only'
                      ? (e.target.value === '' ? null : e.target.value === '1' ? 1 : 0)
                      : (e.target.value ? Number(e.target.value) : null)
                  })
                }
                label="Value"
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {af.field === 'inactive_statuses_only' ? (
                  <>
                    <MenuItem value="0">Active</MenuItem>
                    <MenuItem value="1">Inactive</MenuItem>
                  </>
                ) : (
                  (def.optionKey ? (options[def.optionKey] as FilterOption[] | undefined) || [] : []).map((opt: FilterOption) => (
                    <MenuItem key={opt?.id} value={String(opt?.id ?? '')}>
                      {opt?.name || 'Unknown'}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
          </>
        )}
        {(isNumber || isText) && (
          <TextField
            size="small"
            label="Value"
            type={isNumber ? 'number' : 'text'}
            value={af.value ?? ''}
            onChange={(e) => updateFilter(af.id, { value: isNumber ? (e.target.value === '' ? null : Number(e.target.value)) : e.target.value })}
            sx={{ width: 160 }}
          />
        )}
        <IconButton size="small" onClick={() => removeFilter(af.id)} aria-label="Remove filter">
          <DeleteOutlineIcon fontSize="small" />
        </IconButton>
      </Box>
    );
  };

  return (
    <Box sx={{ mb: 2 }} data-testid="filter-panel">
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Box sx={{ flex: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {getAppliedFilters(options).map((filter) => (
            <Chip
              key={(filter as { id?: string }).id ?? String(filter.field)}
              label={`${filter.displayLabel}: ${filter.displayValue}`}
              onDelete={() => removeFilter((filter as { id: string }).id)}
              size="small"
            />
          ))}
        </Box>
        <IconButton
          size="small"
          onClick={() => setExpanded(!expanded)}
          sx={{ ml: 1 }}
          aria-label={expanded ? 'Collapse filters' : 'Expand filters'}
        >
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>

      <Collapse in={expanded}>
        <Box
          component="form"
          sx={{ mt: 1 }}
          onSubmit={(e) => e.preventDefault()}
          noValidate
        >
          <Typography component="span" variant="subtitle2" sx={{ display: 'block', mb: 1 }}>
            Add filter
          </Typography>
          <List dense sx={{ py: 0, maxHeight: 200, overflow: 'auto', border: 1, borderColor: 'divider', borderRadius: 1 }}>
            {availableFilters.map((def) => (
              <ListItemButton
                key={def.key}
                component="button"
                type="button"
                onClick={(e) => handleAddFilter(e, def)}
                data-testid={`add-filter-${def.key}`}
              >
                {def.label}
              </ListItemButton>
            ))}
          </List>

          {activeFilters.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Active filters
              </Typography>
              {activeFilters.map((af) => renderFilterRow(af))}
            </Box>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
            <Button type="button" variant="outlined" onClick={handleClearFilters}>
              Clear
            </Button>
            <Button
              type="button"
              variant="contained"
              onClick={() => setExpanded(false)}
              data-testid="apply-filters-button"
            >
              Apply Filters
            </Button>
          </Box>
        </Box>
      </Collapse>
    </Box>
  );
};

export default FilterPanel;
