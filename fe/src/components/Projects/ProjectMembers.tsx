import React, { useState } from 'react';
import {
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import {
  ProjectMembersProps,
  ProjectMember
} from '../../types/project';
import { removeProjectMember, updateProjectMember } from '../../api/projects';
import PermissionIconButton from '../common/PermissionIconButton';

const ProjectMembers: React.FC<ProjectMembersProps> = ({ 
  projectId, 
  members, 
  onMembersUpdated 
}) => {
  const [editMember, setEditMember] = useState<ProjectMember | null>(null);
  const [editRole, setEditRole] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleRemoveMember = async (userId: number) => {
    try {
      await removeProjectMember(projectId, userId);
      onMembersUpdated();
    } catch (error) {
      setError('Failed to remove member');
    }
  };

  const handleEditClick = (member: ProjectMember) => {
    setEditMember(member);
    setEditRole(member.role_name || '');
  };

  const handleSaveRole = async () => {
    if (!editMember) return;
    
    try {
      await updateProjectMember(projectId, editMember.user_id, editRole);
      onMembersUpdated();
      setEditMember(null);
    } catch (error) {
      setError('Failed to update member role');
    }
  };

  return (
    <Paper sx={{ p: 2 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <List>
        {members.map((member) => (
          <ListItem
            key={member.user_id}
            secondaryAction={
              <Box>
                <PermissionIconButton
                  requiredPermission="Edit projects"
                  onClick={() => handleEditClick(member)}
                  size="small"
                >
                  <EditIcon />
                </PermissionIconButton>
                <PermissionIconButton
                  requiredPermission="Delete projects"
                  onClick={() => handleRemoveMember(member.user_id)}
                  size="small"
                >
                  <DeleteIcon />
                </PermissionIconButton>
              </Box>
            }
          >
            <ListItemText
              primary={member.user_name}
              secondary={member.role_name}
            />
          </ListItem>
        ))}
      </List>

      <Dialog open={!!editMember} onClose={() => setEditMember(null)}>
        <DialogTitle>Edit Member Role</DialogTitle>
        <DialogContent>
          <TextField
            select
            fullWidth
            label="Role"
            value={editRole}
            onChange={(e) => setEditRole(e.target.value)}
            margin="normal"
          >
            <MenuItem value="owner">Owner</MenuItem>
            <MenuItem value="manager">Manager</MenuItem>
            <MenuItem value="member">Member</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditMember(null)}>Cancel</Button>
          <Button onClick={handleSaveRole} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default ProjectMembers; 