import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  Box
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

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const fetchedUsers = await getUsers();
        setUsers(fetchedUsers);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      }
    };
    if (open) {
      fetchUsers();
      setSelectedUsers(currentMembers.map(m => m.user_id));
    }
  }, [open, currentMembers]);

  const handleToggleUser = (userId: number) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSave = () => {
    onSave(selectedUsers);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Manage Project Members</DialogTitle>
      <DialogContent>
        <List>
          {users.map(user => (
            <ListItem key={user.id} button onClick={() => handleToggleUser(user.id)}>
              <Checkbox
                checked={selectedUsers.includes(user.id)}
                onChange={() => handleToggleUser(user.id)}
              />
              <ListItemText primary={user.name} />
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} color="primary" variant="contained">
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditMembersDialog;
