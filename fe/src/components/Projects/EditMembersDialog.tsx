import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  FormControlLabel,
  Checkbox,
  Alert,
  Typography,
} from '@mui/material';
import { EditMembersDialogProps, ProjectMember } from '../../types/project';
import { useLookup } from '../../context/LookupsContext';
import logger from '../../utils/logger';
import getApiErrorMessage from '../../utils/getApiErrorMessage';

const memberIds = (members: ProjectMember[] | undefined): number[] =>
  (members || [])
    .map((m) => m?.user_id)
    .filter((id): id is number => id !== undefined && id !== null);

const EditMembersDialog: React.FC<EditMembersDialogProps> = ({
  open,
  onClose,
  currentMembers,
  onSave,
}) => {
  const { data: users, error: usersError } = useLookup('users', open);
  const [selectedUsers, setSelectedUsers] = useState<number[]>(() =>
    memberIds(currentMembers),
  );
  const [error, setError] = useState<string>('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setSelectedUsers(memberIds(currentMembers));
      setError('');
    }
  }, [open, currentMembers]);

  const handleToggleUser = (userId: number) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      setError('');
      await onSave(selectedUsers);
      onClose();
    } catch (error: unknown) {
      logger.error('Failed to save members:', error);
      setError(getApiErrorMessage(error, 'Failed to save changes'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="edit-members-dialog-title"
    >
      <DialogTitle id="edit-members-dialog-title">
        Edit Project Members
      </DialogTitle>
      <DialogContent>
        {(error || usersError) && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error || usersError}
          </Alert>
        )}
        {users.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
            No users available
          </Typography>
        ) : (
          <List>
            {users.map((user) => (
              <ListItem key={user?.id}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={
                        user?.id ? selectedUsers.includes(user.id) : false
                      }
                      onChange={() => user?.id && handleToggleUser(user.id)}
                      disabled={!user?.id}
                    />
                  }
                  label={`${user?.name || ''} ${user?.surname || ''}`}
                />
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button onClick={handleSave} color="primary" disabled={saving}>
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditMembersDialog;
