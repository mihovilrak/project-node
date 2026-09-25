import React, { useMemo } from 'react';
import {
  Autocomplete,
  Chip,
  TextField,
  CircularProgress,
  Box,
} from '@mui/material';
import { Label as LabelIcon } from '@mui/icons-material';
import { TagSelectProps } from '../../types/tag';
import { useLookup } from '../../context/LookupsContext';
import { getMuiIcon } from '../../utils/muiIcons';

const renderTagIcon = (iconName?: string): React.ReactElement => {
  const Icon = getMuiIcon(iconName) ?? LabelIcon;
  return <Icon />;
};

const TagSelect: React.FC<TagSelectProps> = ({
  selectedTags,
  onTagsChange,
}) => {
  const { data: allTags, loading } = useLookup('tags');
  const tags = useMemo(
    () =>
      allTags
        .filter((tag) => tag?.active)
        .map((tag) => ({
          ...tag,
          name: tag.name || 'Unknown',
          color: tag.color || '#666',
          icon: tag.icon || 'Label',
        })),
    [allTags],
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={1}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  return (
    <Autocomplete
      multiple
      value={selectedTags}
      onChange={(_, newValue) => onTagsChange(newValue)}
      options={tags}
      getOptionLabel={(tag) => tag.name}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      renderInput={(params) => (
        <TextField {...params} label="Tags" placeholder="Select tags" />
      )}
      renderOption={(props, tag) => (
        <Box
          component="li"
          {...props}
          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
        >
          {renderTagIcon(tag?.icon)}
          <span>{tag?.name || 'Unknown'}</span>
        </Box>
      )}
      renderTags={(tagValue, getTagProps) =>
        (tagValue || []).map((tag, index) => {
          const Icon = renderTagIcon(tag?.icon);

          return (
            <Chip
              {...getTagProps({ index })}
              key={tag?.id || index}
              icon={Icon}
              label={tag?.name || 'Unknown'}
              sx={{
                backgroundColor: tag?.color || '#666',
                color: 'white',
                '& .MuiChip-icon': {
                  color: 'white !important',
                },
                '& .MuiChip-deleteIcon': {
                  color: 'white',
                  '&:hover': {
                    color: 'rgba(255, 255, 255, 0.7)',
                  },
                },
              }}
            />
          );
        })
      }
    />
  );
};

export default TagSelect;
