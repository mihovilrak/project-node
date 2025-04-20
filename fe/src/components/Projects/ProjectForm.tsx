import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Paper } from '@mui/material';
import {
  createProject,
  addProjectMember,
  getProjects,
} from '../../api/projects';
import { getUsers } from '../../api/users';
import { ProjectFormProps, Project } from '../../types/project';
import { User } from '../../types/user';
import { useProjectForm } from '../../hooks/project/useProjectForm';
import ProjectDetailsForm from './ProjectDetailsForm';
import ProjectMembersForm from './ProjectMembersForm';

const ProjectForm: React.FC<ProjectFormProps> = ({ project, onSubmit, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const parentId = searchParams.get('parentId');

  const [availableProjects, setAvailableProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [step, setStep] = useState<'details' | 'members'>('details');
  const [memberError, setMemberError] = useState<string>('');

  const {
    formData,
    errors,
    dateError,
    handleChange,
    handleStatusChange,
    handleDateChange,
    handleParentChange,
    validateForm
  } = useProjectForm(project, parentId);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const projects = await getProjects();
        setAvailableProjects(projects);
      } catch (error) {
        console.error('Failed to fetch projects:', error);
      }
    };
    fetchProjects();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const userList = await getUsers();
        setUsers(userList);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      }
    };
    fetchUsers();
  }, []);

  const handleUserSelect = (userId: number) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
    setMemberError('');
  };

  const handleDetailsSubmit = () => {
    if (validateForm()) {
      setStep('members');
    }
  };

  const handleMembersSubmit = async () => {
    if (selectedUsers.length === 0) {
      setMemberError('Please select at least one project member');
      return;
    }
    setMemberError('');

    try {
      const projectData = { ...formData };
      const response = await createProject(projectData);
      
      await Promise.all(
        selectedUsers.map(userId => addProjectMember(response.id, userId))
      );

      if (onSubmit) {
        onSubmit(response);
      }
      navigate(`/projects/${response.id}`);
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  const handleCancel = () => {
    if (onClose) {
      onClose();
    } else {
      navigate('/projects');
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <form onSubmit={(e) => e.preventDefault()}>
        {step === 'details' ? (
          <ProjectDetailsForm
            formData={formData}
            errors={errors}
            dateError={dateError}
            availableProjects={availableProjects}
            parentId={parentId}
            handleChange={handleChange}
            handleStatusChange={handleStatusChange}
            handleDateChange={handleDateChange}
            handleParentChange={handleParentChange}
            handleCancel={handleCancel}
            onSubmit={handleDetailsSubmit}
            data-testid="project-details-form"
          />
        ) : (
          <ProjectMembersForm
            users={users}
            selectedUsers={selectedUsers}
            memberError={memberError}
            onUserSelect={handleUserSelect}
            onBack={() => setStep('details')}
            onSubmit={handleMembersSubmit}
            data-testid="project-members-form"
          />
        )}
      </form>
    </Paper>
  );
};

export default ProjectForm;
