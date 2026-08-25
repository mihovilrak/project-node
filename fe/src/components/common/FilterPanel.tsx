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
    getAppliedFiltersFromValues,
    removeAppliedFilter,
    handleClearFilters,
    activeFilters,
    addFilter,
    removeFilter,
    updateFilter,
    applyFilters,
    availableFilters
  } = useFilterPanel(filters, onFilterChange, options, type);

  const [betweenFirstFocused, setBetweenFirstFocused] = useState<string | null>(null);
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
                onChange={(e: SelectChangeEvent<DateFilterOperator>) => {
                  const newOp = e.target.value as DateFilterOperator;
                  updateFilter(af.id, { operator: newOp, value2: newOp === 'between' ? af.value2 : undefined });
                  if (newOp === 'between') setBetweenFirstFocused(af.id);
                }}
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
                    if (v) {
                      setBetweenFirstFocused(null);
                      setBetweenSecondFocused(af.id);
                    }
                  }}
                  open={betweenFirstFocused === af.id}
                  onOpen={() => setBetweenFirstFocused(af.id)}
                  onClose={() => setBetweenFirstFocused(null)}
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
            {af.field === 'inactive_statuses_only' ? (
              <FormControl size="small" sx={{ minWidth: 180 }}>
                <InputLabel id={`${af.id}-val-label`}>Value</InputLabel>
                <Select
                  labelId={`${af.id}-val-label`}
                  value={String(af.value ?? '')}
                  onChange={(e: SelectChangeEvent<string>) =>
                    updateFilter(af.id, {
                      value: e.target.value === '' ? null : e.target.value === '1' ? 1 : 0
                    })
                  }
                  label="Value"
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  <MenuItem value="0">Active</MenuItem>
                  <MenuItem value="1">Inactive</MenuItem>
                </Select>
              </FormControl>
            ) : (af.operator as DropdownFilterOperator) === 'includes' ? (
              <FormControl size="small" sx={{ minWidth: 220 }}>
                <InputLabel id={`${af.id}-val-label`}>Values</InputLabel>
                <Select<number[]>
                  labelId={`${af.id}-val-label`}
                  multiple
                  value={af.valueMulti ?? []}
                  onChange={(e: SelectChangeEvent<number[]>) => {
                    const v = e.target.value;
                    updateFilter(af.id, { valueMulti: typeof v === 'string' ? [] : v });
                  }}
                  label="Values"
                  renderValue={(selected) =>
                    (def.optionKey ? (options[def.optionKey] as FilterOption[] | undefined) || [] : [])
                      .filter((opt) => selected.includes(opt?.id ?? 0))
                      .map((opt) => opt?.name || 'Unknown')
                      .join(', ')
                  }
                >
                  {(def.optionKey ? (options[def.optionKey] as FilterOption[] | undefined) || [] : []).map((opt: FilterOption) => (
                    <MenuItem key={opt?.id} value={opt?.id ?? 0}>
                      {opt?.name || 'Unknown'}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : (
              <FormControl size="small" sx={{ minWidth: 180 }}>
                <InputLabel id={`${af.id}-val-label`}>Value</InputLabel>
                <Select
                  labelId={`${af.id}-val-label`}
                  value={String(af.value ?? '')}
                  onChange={(e: SelectChangeEvent<string>) =>
                    updateFilter(af.id, { value: e.target.value ? Number(e.target.value) : null })
                  }
                  label="Value"
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {(def.optionKey ? (options[def.optionKey] as FilterOption[] | undefined) || [] : []).map((opt: FilterOption) => (
                    <MenuItem key={opt?.id} value={String(opt?.id ?? '')}>
                      {opt?.name || 'Unknown'}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
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
          {getAppliedFiltersFromValues(filters, options).map((filter) => (
            <Chip
              key={filter.id}
              label={`${filter.displayLabel}: ${filter.displayValue}`}
              onDelete={() => removeAppliedFilter(filter.id)}
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
        <Box sx={{ mt: 1 }} onClick={(e) => e.stopPropagation()}>
          <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: 2 }}>
            <Box sx={{ flexShrink: 0 }}>
              <Typography component="span" variant="subtitle2" sx={{ display: 'block', mb: 1 }}>
                Add filter
              </Typography>
              <List dense sx={{ py: 0, maxHeight: 200, overflow: 'auto', border: 1, borderColor: 'divider', borderRadius: 1, minWidth: 160 }}>
                {availableFilters.map((def) => (
                  <Box
                    key={def.key}
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleAddFilter(e, def);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleAddFilter(e as unknown as React.MouseEvent, def);
                      }
                    }}
                    sx={{ px: 2, py: 1, cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                    data-testid={`add-filter-${def.key}`}
                  >
                    {def.label}
                  </Box>
                ))}
              </List>
            </Box>

            <Box sx={{ flex: 1, minWidth: 0 }}>
              {activeFilters.length > 0 && (
                <>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Active filters
                  </Typography>
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: activeFilters.length > 3 ? '1fr 1fr' : '1fr',
                      gap: 2,
                      alignItems: 'start'
                    }}
                  >
                    {activeFilters.map((af) => renderFilterRow(af))}
                  </Box>
                </>
              )}
            </Box>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', flexWrap: 'wrap', gap: 1, mt: 2 }}>
            <Button type="button" variant="outlined" onClick={() => setExpanded(false)} data-testid="close-filters-button">
              Close
            </Button>
            <Button type="button" variant="outlined" onClick={handleClearFilters}>
              Clear
            </Button>
            <Button
              type="button"
              variant="contained"
              onClick={applyFilters}
              data-testid="apply-filters-button"
            >
              Apply Filters
            </Button>
            <Button
              type="button"
              variant="contained"
              onClick={() => {
                applyFilters();
                setExpanded(false);
              }}
              data-testid="apply-close-filters-button"
            >
              Apply & Close
            </Button>
          </Box>
        </Box>
      </Collapse>
    </Box>
  );
};

export default FilterPanel;
