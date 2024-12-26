import React, { useState, useEffect } from 'react';
import {
  Autocomplete,
  Chip,
  TextField,
  CircularProgress,
  Box
} from '@mui/material';
import { getTags } from '../../api/tags';
import { Tag, TagSelectProps } from '../../types/tag';

const TagSelect: React.FC<TagSelectProps> = ({ selectedTags, onTagsChange }) => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchTags = async (): Promise<void> => {
      try {
        setLoading(true);
        const fetchedTags = await getTags() as Tag[];
        const activeTags = fetchedTags
          .filter(tag => tag.active)
          .map(tag => ({
            id: tag.id,
            name: tag.name,
            color: tag.color,
            description: tag.description || null,
            created_by: tag.created_by,
            active: tag.active,
            created_on: tag.created_on,
            creator_name: tag.creator_name
          }));
        setTags(activeTags);
      } catch (error) {
        console.error('Failed to fetch tags:', error);
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
      renderTags={(tagValue, getTagProps) =>
        tagValue.map((tag, index) => (
          <Chip
            {...getTagProps({ index })}
            key={tag.id}
            label={tag.name}
            sx={{
              backgroundColor: tag.color || '#666',
              color: 'white',
              '& .MuiChip-deleteIcon': {
                color: 'white',
                '&:hover': {
                  color: 'rgba(255, 255, 255, 0.7)'
                }
              }
            }}
          />
        ))
      }
    />
  );
};

export default TagSelect;
