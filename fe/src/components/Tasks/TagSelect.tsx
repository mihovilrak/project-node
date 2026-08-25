import React, { useState, useEffect } from 'react';
import {
  Autocomplete,
  Chip,
  TextField,
  CircularProgress,
  Box
} from '@mui/material';
import * as Icons from '@mui/icons-material';
import { getTags } from '../../api/tags';
import { Tag, TagSelectProps } from '../../types/tag';
import logger from '../../utils/logger';

const TagSelect: React.FC<TagSelectProps> = ({ selectedTags, onTagsChange }) => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchTags = async (): Promise<void> => {
      try {
        setLoading(true);
        const fetchedTags = await getTags() as Tag[];
        const activeTags = (fetchedTags || [])
          .filter(tag => tag?.active)
          .map(tag => ({
            id: tag?.id || 0,
            name: tag?.name || 'Unknown',
            color: tag?.color || '#666',
            icon: tag?.icon || 'Label',
            description: tag?.description || null,
            created_by: tag?.created_by || 0,
            active: tag?.active || false,
            created_on: tag?.created_on || '',
            creator_name: tag?.creator_name || ''
          }));
        setTags(activeTags);
      } catch (error) {
        logger.error('Failed to fetch tags:', error);
        setTags([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTags();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={1}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  const getIconComponent = (iconName?: string): React.ReactElement => {
    const name = iconName || 'Label';
    const IconComponent = Icons[name as keyof typeof Icons] as React.ComponentType<any>;
    return IconComponent ? React.createElement(IconComponent) : React.createElement(Icons.Label);
  };

  return (
    <Autocomplete
      multiple
      value={selectedTags}
      onChange={(_, newValue) => onTagsChange(newValue)}
      options={tags}
      getOptionLabel={(tag) => tag.name}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Tags"
          placeholder="Select tags"
        />
      )}
      renderOption={(props, tag) => (
        <Box component="li" {...props} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {getIconComponent(tag?.icon)}
          <span>{tag?.name || 'Unknown'}</span>
        </Box>
      )}
      renderTags={(tagValue, getTagProps) =>
        (tagValue || []).map((tag, index) => {
          const Icon = getIconComponent(tag?.icon);
          
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
                  color: 'white !important'
                },
                '& .MuiChip-deleteIcon': {
                  color: 'white',
                  '&:hover': {
                    color: 'rgba(255, 255, 255, 0.7)'
                  }
                }
              }}
            />
          );
        })
      }
    />
  );
};

export default TagSelect;
