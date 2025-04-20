import React from 'react';
import { Typography, Box, Button } from '@mui/material';
import { ProjectMembersFormProps } from '../../types/project';
import ProjectMemberSelect from './ProjectMemberSelect';

const ProjectMembersForm: React.FC<ProjectMembersFormProps> = ({
  users,
  selectedUsers,
  memberError,
  onUserSelect,
  onBack,
  onSubmit
}) => {
  return (
    <>
      <Typography variant="h6" gutterBottom>
        Project Members
      </Typography>
      <ProjectMemberSelect
        users={users}
        selectedUsers={selectedUsers}
        onUserSelect={onUserSelect}
      />
      {memberError && (
        <Typography color="error" sx={{ mt: 1 }}>
          {memberError}
        </Typography>
      )}
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button 
          onClick={onBack} 
          color="inherit"
          data-testid="back-button"
        >
          Back
        </Button>
        <Button 
          onClick={onSubmit} 
          variant="contained" 
          color="primary"
          data-testid="create-project-button"
        >
          Create Project
        </Button>
      </Box>
    </>
  );
};

export default ProjectMembersForm;
