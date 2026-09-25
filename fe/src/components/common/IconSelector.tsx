import React, { useId } from 'react';
import {
  Alert,
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
} from '@mui/material';
import { useIconSelector } from '../../hooks/setting/useIconSelector';
import { IconSelectorProps } from '../../types/setting';
import { getMuiIcon } from '../../utils/muiIcons';

const renderIcon = (name?: string) => {
  const Icon = getMuiIcon(name);
  return Icon ? <Icon /> : null;
};

const IconSelector: React.FC<IconSelectorProps> = ({ value, onChange }) => {
  const titleId = useId();
  const { icons, open, error, handleOpen, handleClose, handleSelect } =
    useIconSelector(value);

  return (
    <FormControl fullWidth margin="normal">
      <InputLabel shrink>Icon</InputLabel>
      <Box mt={2}>
        <IconButton
          onClick={handleOpen}
          aria-label={value ? `Icon: ${value}. Change icon` : 'Select icon'}
          sx={{
            border: '1px dashed grey',
            borderRadius: 1,
            width: '100%',
            height: '56px',
          }}
        >
          {value ? renderIcon(value) || value : 'Select Icon'}
        </IconButton>
      </Box>

      <Dialog open={open} onClose={handleClose} aria-labelledby={titleId}>
        <DialogTitle id={titleId}>Select an Icon</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Grid container spacing={1} sx={{ p: 2 }}>
            {(icons || []).map((iconName, index) => (
              <Grid key={iconName ?? `icon-${index}`} size={{ xs: 6, sm: 4 }}>
                <IconButton
                  onClick={() => {
                    if (iconName) {
                      handleSelect(iconName);
                      onChange(iconName);
                    }
                  }}
                  disabled={!iconName}
                  aria-label={iconName ? `Select icon ${iconName}` : 'Icon'}
                  sx={{
                    border:
                      value === iconName ? '2px solid primary.main' : 'none',
                    borderRadius: 1,
                  }}
                >
                  {renderIcon(iconName) || iconName || 'Unknown'}
                </IconButton>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
      </Dialog>
    </FormControl>
  );
};

export default IconSelector;
