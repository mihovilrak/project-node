import React from 'react';
import {
  Checkbox,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Typography
} from '@mui/material';
import { ProjectMemberSelectProps } from '../../types/project';

const ProjectMemberSelect: React.FC<ProjectMemberSelectProps> = ({
  users,
  selectedUsers,
  onUserSelect
}) => {
  return (
    <Paper sx={{ mt: 2, p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Select Project Members
      </Typography>
      <List>
        {users.map((user) => (
          <ListItem
            component="div"
            key={user.id}
            dense
            onClick={() => onUserSelect(user.id)}
            sx={{ '&:hover': { cursor: 'pointer' } }}
          >
            <ListItemIcon>
              <Checkbox
                edge="start"
                checked={selectedUsers.includes(user.id)}
                tabIndex={-1}
                disableRipple
              />
            </ListItemIcon>
            <ListItemText 
              primary={`${user.name} ${user.surname}`}
              secondary={`Role: ${user.role}`}
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default ProjectMemberSelect;
