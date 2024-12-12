import React from 'react';
import {
  List,
  ListItem,
  ListItemText,
  IconButton,
  Typography,
  Box
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { useProjectDetails } from '../../hooks/useProjectDetails';
import { ProjectMember } from '../../types/project';

const ProjectMembers: React.FC<{ members: ProjectMember[], projectId: number }> = ({ members, projectId }) => {
  const {
    handleMemberUpdate,
    handleMemberRemove,
    canManageMembers
  } = useProjectDetails(projectId.toString());

  return (
    <Box>
      <Typography variant="h6">Project Members</Typography>
      <List>
        {members.map(member => (
          <ListItem
            key={member.user_id}
            secondaryAction={
              canManageMembers && (
                <Box>
                  <IconButton 
                    onClick={() => handleMemberUpdate(member.user_id, member.role || '')}
                    edge="end"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton 
                    onClick={() => handleMemberRemove(member.user_id)}
                    edge="end"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              )
            }
          >
            <ListItemText
              primary={`${member.name} ${member.surname}`}
              secondary={member.role}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default ProjectMembers; 