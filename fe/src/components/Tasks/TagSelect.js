import React, { useState, useEffect } from 'react';
import {
  Autocomplete,
  Chip,
  TextField,
  CircularProgress
} from '@mui/material';
import { getTags } from '../../api/tags';

const TagSelect = ({ value = [], onChange, error, disabled }) => {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const fetchedTags = await getTags();
        setTags(fetchedTags);
      } catch (error) {
        console.error('Failed to fetch tags:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTags();
  }, []);

  const handleChange = (event, newValue) => {
    // Ensure we're passing an array of tag IDs to the parent
    onChange(newValue);
  };

  return (
    <Autocomplete
      multiple
      disabled={disabled || loading}
      value={value}
      onChange={handleChange}
      options={tags}
      getOptionLabel={(tag) => tag.name}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Tags"
          error={error}
          placeholder={loading ? 'Loading tags...' : 'Select tags'}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading && <CircularProgress size={20} />}
                {params.InputProps.endAdornment}
              </>
            )
          }}
        />
      )}
      renderTags={(tagValue, getTagProps) =>
        tagValue.map((tag, index) => (
          <Chip
            key={tag.id}
            label={tag.name}
            {...getTagProps({ index })}
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