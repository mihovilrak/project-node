import React from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Paper } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { useTaskForm } from '../../hooks/task/useTaskForm';
import { SimpleChangeEvent } from '../../types/task';

import { TaskNameField } from './Form/BasicInfo/TaskNameField';
import { TaskDescriptionField } from './Form/BasicInfo/TaskDescriptionField';
import { DatePickerSection } from './Form/Dates/DatePickerSection';
import { TaskStatusSelect } from './Form/Status/TaskStatusSelect';
import { TaskPrioritySelect } from './Form/Status/TaskPrioritySelect';
import { ProjectSelect } from './ProjectSelect';
import { AssigneeSelectionSection } from './Form/Assignment/AssigneeSelectionSection';
import { ParentTaskSelect } from './Form/Details/ParentTaskSelect';
import { TaskTypeSection } from './Form/Details/TaskTypeSection';
import { TaskTagsSection } from './Form/Details/TaskTagsSection';
import { EstimatedTimeField } from './Form/Estimation/EstimatedTimeField';
import { TaskFormActionButtons } from './Form/Actions/TaskFormActionButtons';
import { TaskProgressField } from './Form/Details/TaskProgressField';

const TaskForm: React.FC = () => {
  const { currentUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const projectIdFromQuery = queryParams.get('projectId');
  const parentId = queryParams.get('parentId');
  const { id } = useParams<{ id?: string }>();

  const {
    formData,
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
    navigate(-1);
  };

  return (
    <Box component={Paper} sx={{ p: 3, maxWidth: 800, mx: 'auto', mt: 3 }}>
      <Typography variant="h4" gutterBottom>
        {isLoading ? 'Loading...' : (isEditing ? 'Edit Task' : 'Create Task')}
      </Typography>
      <form onSubmit={onSubmit}>
        <TaskNameField
          formData={formData}
          handleChange={handleFormChange}
        />
        
        <ProjectSelect
          projects={projects}
          formData={formData}
          handleChange={handleFormChange}
          projectIdFromQuery={projectIdFromQuery}
        />
        
        <TaskDescriptionField
          formData={formData} 
          handleChange={handleFormChange} 
        />
        
        {isEditing && (
          <TaskProgressField
            value={formData.progress || 0}
            handleChange={handleFormChange}
          />
        )}
        
        <DatePickerSection
          formData={formData} 
          handleChange={handleFormChange} 
        />
        
        <TaskPrioritySelect
          formData={formData} 
          priorities={priorities} 
          handleChange={handleFormChange} 
        />
        
        <TaskStatusSelect 
          formData={formData} 
          statuses={statuses} 
          handleChange={handleFormChange} 
        />
        
        <AssigneeSelectionSection 
          formData={formData} 
          projectMembers={projectMembers} 
          handleChange={handleFormChange}
        />
        
        {formData.project_id && (
          <ParentTaskSelect
            formData={formData}
            projectTasks={projectTasks}
            handleChange={handleFormChange}
            parentIdFromUrl={parentId}
          />
        )}
        
        <TaskTypeSection
          formData={formData} 
          handleChange={handleFormChange} 
        />
        
        <TaskTagsSection 
          formData={formData} 
          handleChange={handleFormChange} 
        />
        
        <EstimatedTimeField
          formData={formData} 
          handleChange={handleFormChange} 
        />
        
        <TaskFormActionButtons isEditing={isEditing} />
      </form>
    </Box>
  );
};

export default TaskForm;
