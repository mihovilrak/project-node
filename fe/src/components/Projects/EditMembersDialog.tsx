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
  Typography
} from '@mui/material';
import { User } from '../../types/user';
import { EditMembersDialogProps } from '../../types/project';
import { getUsers } from '../../api/users';
import logger from '../../utils/logger';
import getApiErrorMessage from '../../utils/getApiErrorMessage';

const EditMembersDialog: React.FC<EditMembersDialogProps> = ({
  open,
  onClose,
  currentMembers,
  onSave
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<number[]>(
    (currentMembers || []).map(m => m?.user_id).filter((id): id is number => id !== undefined && id !== null)
  );
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const fetchedUsers = await getUsers();
        setUsers(fetchedUsers || []);
      } catch (error: unknown) {
        logger.error('Failed to fetch users:', error);
        setUsers([]);
        setError(getApiErrorMessage(error, 'Failed to load users'));
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    setSelectedUsers((currentMembers || []).map(m => m?.user_id).filter((id): id is number => id !== undefined && id !== null));
  }, [currentMembers]);

  const handleToggleUser = (userId: number) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSave = async () => {
    try {
      setError('');
      await onSave(selectedUsers);
      onClose();
    } catch (error: unknown) {
      logger.error('Failed to save members:', error);
      setError(getApiErrorMessage(error, 'Failed to save changes'));
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Project Members</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {users.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
            No users available
          </Typography>
        ) : (
          <List>
            {users.map(user => (
              <ListItem key={user?.id}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={user?.id ? selectedUsers.includes(user.id) : false}
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
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} color="primary">
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditMembersDialog;
