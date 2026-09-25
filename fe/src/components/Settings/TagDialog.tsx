import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  Alert,
} from '@mui/material';
import { MuiColorInput } from 'mui-color-input';
import { TagDialogProps } from '../../types/setting';
import getApiErrorMessage from '../../utils/getApiErrorMessage';

const DEFAULT_COLOR = '#2196f3';

const TagDialog: React.FC<TagDialogProps> = ({
  open,
  tag,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState(tag?.name ?? '');
  const [color, setColor] = useState(tag?.color ?? DEFAULT_COLOR);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    if (!/^#[0-9A-Fa-f]{6}$/.test(color)) {
      setError('Color must be a hex value like #2196f3');
      return;
    }
    setSaving(true);
    try {
      await onSave({
        ...(tag ? { id: tag.id } : {}),
        name: name.trim(),
        color,
      });
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Failed to save tag'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      aria-labelledby="tag-dialog-title"
    >
      <form onSubmit={handleSubmit} noValidate>
        <DialogTitle id="tag-dialog-title">
          {tag ? 'Edit Tag' : 'Create Tag'}
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              required
              slotProps={{ htmlInput: { maxLength: 50 } }}
            />
            <MuiColorInput
              format="hex"
              label="Color"
              value={color}
              onChange={(value) => setColor(value)}
              fullWidth
              required
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={saving}>
            {tag ? 'Save Changes' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default TagDialog;
