// fe/src/components/Projects/tabs/ProjectMembersList.tsx
import React, { useState, useEffect } from 'react';
import {
    List,
    ListItem,
    ListItemText,
    IconButton,
    Box,
    Link,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Checkbox,
    FormControlLabel,
    Typography,
    Alert
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import {
  ProjectMembersListProps,
  EditMembersDialogProps
} from '../../../types/project';
import { User } from '../../../types/user';
import { getUsers } from '../../../api/users';
import {
  addProjectMember,
  removeProjectMember
} from '../../../api/projects';

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

const ProjectMembersList: React.FC<ProjectMembersListProps> = ({
  projectId,
  members,
  canManageMembers,
  onMemberRemove,
  onMembersChange
}) => {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [error, setError] = useState<string>('');

  const handleSaveMembers = async (selectedUsers: number[]) => {
    try {
      // Remove users that are no longer selected
      const removedUsers = members
        .filter(member => !selectedUsers.includes(member.user_id));
      
      // Add new users
      const newUsers = selectedUsers
        .filter(userId => !members.find(member => member.user_id === userId));

      // Process removals
      await Promise.all(
        removedUsers.map(member => 
          removeProjectMember(projectId, member.user_id)
          .then(() => onMemberRemove(member.user_id))
        )
      );

      // Process additions
      await Promise.all(
        newUsers.map(userId => 
          addProjectMember(projectId, userId)
        )
      );

      // Notify parent of changes
      if (onMembersChange) {
        onMembersChange();
      }

      setEditDialogOpen(false);
    } catch (error) {
      console.error('Failed to update members:', error);
      setError('Failed to update project members');
    }
  };

  return (
    <>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      {canManageMembers && (
        <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
          <Button
            startIcon={<EditIcon />}
            onClick={() => setEditDialogOpen(true)}
            variant="contained"
            color="primary"
          >
            Manage Members
          </Button>
        </Box>
      )}

      <List>
        {members.map((member) => (
          <ListItem
            key={member.user_id}
            secondaryAction={
              canManageMembers && (
                <IconButton 
                  edge="end" 
                  onClick={() => onMemberRemove(member.user_id)}
                  aria-label="delete"
                >
                  <DeleteIcon />
                </IconButton>
              )
            }
          >
            <ListItemText
              primary={
                <Link
                  component={RouterLink}
                  to={`/users/${member.user_id}`}
                  underline="hover"
                  color="inherit"
                >
                  {`${member.name} ${member.surname}`}
                </Link>
              }
              secondary={`Role: ${member.role}`}
            />
          </ListItem>
        ))}
        {members.length === 0 && (
          <ListItem>
            <ListItemText
              primary={
                <Typography color="text.secondary">
                  No members in this project
                </Typography>
              }
            />
          </ListItem>
        )}
      </List>

      <EditMembersDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        projectId={projectId}
        currentMembers={members}
        onSave={handleSaveMembers}
      />
    </>
  );
};

export default ProjectMembersList;
