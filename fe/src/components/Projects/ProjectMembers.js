import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  Paper
} from '@mui/material';

const ProjectMembers = ({ members }) => {
  // Group members by role
  const membersByRole = members.reduce((acc, member) => {
    if (!acc[member.role]) {
      acc[member.role] = [];
    }
    acc[member.role].push(member);
    return acc;
  }, {});

  return (
    <Paper sx={{ width: '300px', height: '100%', p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Project Members
      </Typography>
      {Object.entries(membersByRole).map(([role, roleMembers]) => (
        <Box key={role} sx={{ mb: 2 }}>
          <Typography variant="subtitle1" color="primary" sx={{ mb: 1 }}>
            {role}
          </Typography>
          <List dense>
            {roleMembers.map((member) => (
              <ListItem key={member.user_id}>
                <ListItemText 
                  primary={`${member.name} ${member.surname}`}
                />
              </ListItem>
            ))}
          </List>
          <Divider />
        </Box>
      ))}
    </Paper>
  );
};

export default ProjectMembers; 