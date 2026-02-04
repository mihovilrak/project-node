import React from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { Box, Typography, Paper, Grid } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { useTaskForm } from '../../hooks/task/useTaskForm';
import { SimpleChangeEvent } from '../../types/task';

import { TaskNameField } from './Form/TaskNameField';
import { TaskDescriptionField } from './Form/TaskDescriptionField';
import { DatePickerSection } from './Form/DatePickerSection';
import { TaskStatusSelect } from './Form/TaskStatusSelect';
import { TaskPrioritySelect } from './Form/TaskPrioritySelect';
import { ProjectSelect } from './ProjectSelect';
import { AssigneeSelectionSection } from './Form/AssigneeSelectionSection';
import { ParentTaskSelect } from './Form/ParentTaskSelect';
import { TaskTypeSection } from './Form/TaskTypeSection';
import { TaskTagsSection } from './Form/TaskTagsSection';
import { EstimatedTimeField } from './Form/EstimatedTimeField';
import { TaskFormActionButtons } from './Form/TaskFormActionButtons';
import { TaskProgressField } from './Form/TaskProgressField';

const TaskForm: React.FC = () => {
  const { currentUser } = useAuth();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const projectIdFromQuery = queryParams.get('projectId');
  const parentId = queryParams.get('parentId');
  const { id } = useParams<{ id?: string }>();

  const {
    formData,
    fieldErrors,
    projects,
    projectMembers,
    projectTasks,
    statuses,
    priorities,
    isEditing,
    isLoading,
    handleChange,
    handleSubmit
  } = useTaskForm({
    taskId: id,
    projectIdFromQuery,
    parentTaskId: parentId,
    currentUserId: currentUser?.id
  });

  // Force project and parent task IDs from URL
  React.useEffect(() => {
    if (projectIdFromQuery) {
      handleChange({
        target: {
          name: 'project_id',
          value: parseInt(projectIdFromQuery, 10)
        }
      });
    }
  }, [projectIdFromQuery, handleChange]);

  React.useEffect(() => {
    if (parentId) {
      handleChange({
        target: {
          name: 'parent_id',
          value: parseInt(parentId, 10)
        }
      });
    }
  }, [parentId, handleChange]);

  const handleFormChange = (e: SimpleChangeEvent) => {
    // Don't allow changing project_id and parent_id if they come from URL
    if ((e.target.name === 'project_id' && projectIdFromQuery) ||
        (e.target.name === 'parent_id' && parentId)) {
      return;
    }
    handleChange(e);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSubmit(e);
    // Navigation is handled in handleSubmit
  };

  return (
    <Box component={Paper} sx={{ p: 3, maxWidth: 800, mx: 'auto', mt: 3 }}>
      <Typography variant="h4" gutterBottom>
        {isLoading ? 'Loading...' : (isEditing ? 'Edit Task' : 'Create Task')}
      </Typography>
      <form onSubmit={onSubmit} data-testid="task-form">
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <TaskNameField
              formData={formData}
              handleChange={handleFormChange}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: formData.project_id ? 6 : 12 }}>
            <ProjectSelect
              projects={projects}
              formData={formData}
              handleChange={handleFormChange}
              projectIdFromQuery={projectIdFromQuery}
            />
          </Grid>

          {formData.project_id && (
            <Grid size={{ xs: 12, sm: 6 }}>
              <ParentTaskSelect
                formData={formData}
                projectTasks={projectTasks}
                handleChange={handleFormChange}
                parentIdFromUrl={parentId}
              />
            </Grid>
          )}

          <Grid size={{ xs: 12 }}>
            <TaskDescriptionField
              formData={formData}
              handleChange={handleFormChange}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <DatePickerSection
              formData={formData}
              handleChange={handleFormChange}
              errors={{ start_date: fieldErrors.start_date, due_date: fieldErrors.due_date }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TaskPrioritySelect
              formData={formData}
              priorities={priorities}
              handleChange={handleFormChange}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TaskStatusSelect
              formData={formData}
              statuses={statuses}
              handleChange={handleFormChange}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <AssigneeSelectionSection
              formData={formData}
              projectMembers={projectMembers}
              handleChange={handleFormChange}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TaskTypeSection
              formData={formData}
              handleChange={handleFormChange}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <EstimatedTimeField
              formData={formData}
              handleChange={handleFormChange}
            />
          </Grid>

          {isEditing && (
            <Grid size={{ xs: 12 }}>
              <TaskProgressField
                value={formData.progress || 0}
                handleChange={handleFormChange}
              />
            </Grid>
          )}

          <Grid size={{ xs: 12 }}>
            <TaskTagsSection
              formData={formData}
              handleChange={handleFormChange}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TaskFormActionButtons isEditing={isEditing} />
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};

export default TaskForm;
