import React from 'react';
import {
  Autocomplete,
  Chip,
  TextField
} from '@mui/material';

const TagSelect = ({ value, onChange, tags, error }) => {
  return (
    <Autocomplete
      multiple
      value={value}
      onChange={onChange}
      options={tags}
      getOptionLabel={(tag) => tag.name}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Tags"
          error={error}
          placeholder="Select tags"
        />
      )}
      renderTags={(tagValue, getTagProps) =>
        tagValue.map((tag, index) => (
          <Chip
            key={tag.id}
            label={tag.name}
            {...getTagProps({ index })}
            sx={{
              backgroundColor: tag.color,
              color: 'white',
              '& .MuiChip-deleteIcon': {
                color: 'white'
              }
            }}
          />
        ))
      }
    />
  );
};

export default TagSelect; 