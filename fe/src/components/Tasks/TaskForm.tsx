import React from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { Box, Typography, Paper } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { TaskFormProps } from '../../types/task';
import { useTaskForm } from '../../hooks/task/useTaskForm';
import { SimpleChangeEvent } from './Form/types';

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

const TaskForm: React.FC<TaskFormProps> = () => {
  const { currentUser } = useAuth();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const projectIdFromQuery = queryParams.get('projectId');
  const parentTaskId = queryParams.get('parentTaskId');
  const { projectId, taskId } = useParams();

  const {
    formData,
    projects,
    projectMembers,
    projectTasks,
    statuses,
    priorities,
    isEditing,
    handleChange,
    handleSubmit
  } = useTaskForm({
    taskId,
    projectId,
    projectIdFromQuery,
    parentTaskId,
    currentUserId: currentUser?.id
  });

  const handleFormChange = (e: SimpleChangeEvent) => {
    handleChange(e);
  };

  return (
    <Box sx={{ maxWidth: '600px', margin: '0 auto', padding: '16px' }}>
      <Paper elevation={3} sx={{ padding: 4 }}>
        <Typography variant="h4">{isEditing ? 'Edit Task' : 'Add New Task'}</Typography>
        <form onSubmit={handleSubmit}>
          <TaskNameField formData={formData} handleChange={handleFormChange} />
          
          <ProjectSelect 
            projects={projects} 
            formData={formData} 
            handleChange={handleFormChange}
            projectIdFromQuery={projectIdFromQuery}
          />
          
          <TaskDescriptionField formData={formData} handleChange={handleFormChange} />
          
          <DatePickerSection formData={formData} handleChange={handleFormChange} />
          
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
            />
          )}
          
          <TaskTypeSection formData={formData} handleChange={handleFormChange} />
          
          <TaskTagsSection formData={formData} handleChange={handleFormChange} />
          
          <EstimatedTimeField formData={formData} handleChange={handleFormChange} />
          
          <TaskFormActionButtons isEditing={isEditing} />
        </form>
      </Paper>
    </Box>
  );
};

export default TaskForm;
