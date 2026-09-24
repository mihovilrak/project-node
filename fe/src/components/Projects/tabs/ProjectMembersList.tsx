import React from 'react';
import {
  List,
  ListItem,
  ListItemText,
  IconButton,
  Link,
  Typography,
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { ProjectMembersListProps } from '../../../types/project';

const ProjectMembersList: React.FC<ProjectMembersListProps> = ({
  members,
  canManageMembers,
  onMemberRemove,
}) => (
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
);

export default ProjectMembersList;
