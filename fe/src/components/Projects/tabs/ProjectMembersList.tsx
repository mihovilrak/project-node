import React, { useState } from 'react';
import {
    List,
    ListItem,
    ListItemText,
    IconButton,
    Box,
    Link,
    Button,
    Typography,
    Alert
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import {
  ProjectMembersListProps
} from '../../../types/project';
import EditMembersDialog from '../EditMembersDialog';
import {
  addProjectMember,
  removeProjectMember
} from '../../../api/projects';
import logger from '../../../utils/logger';
import getApiErrorMessage from '../../../utils/getApiErrorMessage';

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
    if (!projectId) {
      setError('Project ID is required');
      return;
    }
    try {
      // Remove users that are no longer selected
      const removedUsers = (members || [])
        .filter(member => member?.user_id && !selectedUsers.includes(member.user_id));

      // Add new users
      const newUsers = selectedUsers
        .filter(userId => !(members || []).find(member => member?.user_id === userId));

      // Process removals
      await Promise.all(
        removedUsers.map(member => {
          if (!member?.user_id) return Promise.resolve();
          return removeProjectMember(projectId, member.user_id)
            .then(() => onMemberRemove(member.user_id));
        })
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
      // Clear any previous errors when successful
      setError('');
    } catch (error: unknown) {
      logger.error('Failed to update members:', error);
      setError(getApiErrorMessage(error, 'Failed to update project members'));
      // Keep dialog open when there's an error
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

      {projectId && (
        <EditMembersDialog
          open={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          projectId={projectId}
          currentMembers={members || []}
          onSave={handleSaveMembers}
        />
      )}
    </>
  );
};

export default ProjectMembersList;
