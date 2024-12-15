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
    Typography
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Add as AddIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { ProjectMember } from '../../../types/project';
import { User } from '../../../types/user';
import { getUsers } from '../../../api/users';

interface ProjectMembersListProps {
  members: ProjectMember[];
  canManageMembers: boolean;
  onMemberRemove: (userId: number) => void;
  onMemberUpdate?: (memberId: number, role: string) => Promise<void>;
  onAddMember?: () => void;
}

interface EditMembersDialogProps {
  open: boolean;
  onClose: () => void;
  currentMembers: ProjectMember[];
  onSave: (selectedUsers: number[]) => void;
}

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
    fetchUsers();
  }, []);

  const handleToggleUser = (userId: number) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Project Members</DialogTitle>
      <DialogContent>
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
        <Button onClick={() => onSave(selectedUsers)} color="primary">
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const ProjectMembersList: React.FC<ProjectMembersListProps> = ({
  members,
  canManageMembers,
  onMemberRemove,
  onMemberUpdate,
  onAddMember
}) => {
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const handleSaveMembers = (selectedUsers: number[]) => {
    // Remove users that are no longer selected
    const removedUsers = members
      .filter(member => !selectedUsers.includes(member.user_id))
      .forEach(member => onMemberRemove(member.user_id));

    // Add new users
    const newUsers = selectedUsers
      .filter(userId => !members.find(member => member.user_id === userId))
      .forEach(userId => onAddMember && onAddMember());

    setEditDialogOpen(false);
  };

  return (
    <>
      {canManageMembers && (
        <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
          <Button 
            startIcon={<AddIcon />}
            onClick={onAddMember}
            variant="contained"
            color="primary"
          >
            Add Member
          </Button>
          <Button
            startIcon={<EditIcon />}
            onClick={() => setEditDialogOpen(true)}
            variant="outlined"
          >
            Edit Members
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
      </List>

      <EditMembersDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        currentMembers={members}
        onSave={handleSaveMembers}
      />
    </>
  );
};

export default ProjectMembersList;