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
  Alert
} from '@mui/material';
import { User } from '../../types/user';
import { EditMembersDialogProps } from '../../types/project';
import { getUsers } from '../../api/users';

const EditMembersDialog: React.FC<EditMembersDialogProps> = ({
  open,
  onClose,
  currentMembers,
  onSave
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<number[]>(
    currentMembers.map(m => m.user_id)
  );
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const fetchedUsers = await getUsers();
        setUsers(fetchedUsers);
      } catch (error) {
        console.error('Failed to fetch users:', error);
        setError('Failed to load users');
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    setSelectedUsers(currentMembers.map(m => m.user_id));
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
      onSave(selectedUsers);
      onClose();
    } catch (error) {
      console.error('Failed to save members:', error);
      setError('Failed to save changes');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Project Members</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <List>
          {users.map(user => (
            <ListItem key={user.id}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => handleToggleUser(user.id)}
                  />
                }
                label={`${user.name} ${user.surname}`}
              />
            </ListItem>
          ))}
        </List>
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
