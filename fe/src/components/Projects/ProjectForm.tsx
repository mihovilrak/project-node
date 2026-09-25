import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Paper, Box } from '@mui/material';
import {
  createProject,
  addProjectMember,
  changeProjectStatus,
  getProjects,
} from '../../api/projects';
import { ProjectFormProps, Project } from '../../types/project';
import { useProjectForm } from '../../hooks/project/useProjectForm';
import { useAsyncResource } from '../../hooks/common/useAsyncResource';
import { useLookup } from '../../context/LookupsContext';
import logger from '../../utils/logger';
import getApiErrorMessage from '../../utils/getApiErrorMessage';
import ProjectDetailsForm from './ProjectDetailsForm';
import ProjectMembersForm from './ProjectMembersForm';

const ProjectForm: React.FC<ProjectFormProps> = ({
  project,
  onSubmit,
  onClose,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const parentId = useMemo(() => {
    const searchParams = new URLSearchParams(location.search);
    return searchParams.get('parentId');
  }, [location.search]);

  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [step, setStep] = useState<'details' | 'members'>('details');
  const [memberError, setMemberError] = useState<string>('');

  const {
    formData,
    errors,
    dateError,
    statuses,
    statusesLoading,
    handleChange,
    handleStatusChange,
    handleDateChange,
    handleParentChange,
    validateForm,
  } = useProjectForm(project, parentId);

  const { data: availableProjects } = useAsyncResource<Project[]>(
    async (signal) => (await getProjects(undefined, signal)) || [],
    [],
    { initialData: [], errorMessage: 'Failed to fetch projects' },
  );
  const { data: users } = useLookup('users');

  const handleUserSelect = useCallback((userId: number) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
    setMemberError('');
  }, []);

  const handleDetailsSubmit = useCallback(() => {
    if (validateForm()) {
      setStep('members');
    }
  }, [validateForm]);

  const handleMembersSubmit = useCallback(async () => {
    if (selectedUsers.length === 0) {
      setMemberError('Please select at least one project member');
      return;
    }
    setMemberError('');

    let response: Project;
    try {
      response = await createProject({ ...formData });
    } catch (error) {
      logger.error('Failed to create project:', error);
      setMemberError(getApiErrorMessage(error, 'Failed to create project'));
      return;
    }

    // The project exists now, so follow-up failures must not block navigation
    // (retrying would create a duplicate). The create endpoint ignores
    // status_id, hence the separate status call.
    const followUps = await Promise.allSettled([
      ...selectedUsers.map((userId) => addProjectMember(response.id, userId)),
      ...(formData.status_id && formData.status_id !== response.status_id
        ? [changeProjectStatus(response.id, formData.status_id)]
        : []),
    ]);
    followUps.forEach((result) => {
      if (result.status === 'rejected') {
        logger.error('Failed to finish project setup:', result.reason);
      }
    });

    if (onSubmit) {
      onSubmit(response);
    }
    navigate(`/projects/${response.id}`);
  }, [selectedUsers, formData, onSubmit, navigate]);

  const handleCancel = useCallback(() => {
    if (onClose) {
      onClose();
    } else {
      navigate('/projects');
    }
  }, [onClose, navigate]);

  return (
    <Box sx={{ maxWidth: '800px', margin: '0 auto', p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <form onSubmit={(e) => e.preventDefault()}>
          {step === 'details' ? (
            <ProjectDetailsForm
              formData={formData}
              errors={errors}
              dateError={dateError}
              availableProjects={availableProjects}
              parentId={parentId}
              statuses={statuses}
              statusesLoading={statusesLoading}
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
              users={users || []}
              selectedUsers={selectedUsers || []}
              memberError={memberError}
              onUserSelect={handleUserSelect}
              onBack={() => setStep('details')}
              onSubmit={handleMembersSubmit}
              data-testid="project-members-form"
            />
          )}
        </form>
      </Paper>
    </Box>
  );
};

export default ProjectForm;
