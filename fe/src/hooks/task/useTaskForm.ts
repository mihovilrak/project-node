import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import {
  getTaskById,
  createTask,
  updateTask,
  getTaskStatuses,
  getPriorities,
  changeTaskStatus
} from '../../api/tasks';
import { getTaskTags, getTags } from '../../api/tags';
import { TaskStatus, TaskPriority, TaskFormState } from '../../types/task';
import { ProjectMember } from '../../types/project';
import { Tag } from '../../types/tag';
import { useProjectSelect } from './useProjectSelect';

interface UseTaskFormProps {
  taskId?: string;
  projectId?: string;
  projectIdFromQuery: string | null;
  parentTaskId: string | null;
  currentUserId?: number;
}

export const useTaskForm = ({ 
  taskId, 
  projectId, 
  projectIdFromQuery, 
  parentTaskId,
  currentUserId 
}: UseTaskFormProps) => {
  const navigate = useNavigate();
  const today = dayjs();
  const isEditing = Boolean(taskId);

  const [formData, setFormData] = useState<TaskFormState>({
    name: '',
    description: '',
    start_date: today.toISOString(),
    due_date: '',
    priority_id: 2,
    status_id: 1,
    type_id: 1,
    parent_id: parentTaskId ? Number(parentTaskId) : null,
    project_id: projectIdFromQuery ? Number(projectIdFromQuery) : (projectId ? Number(projectId) : 0),
    holder_id: 0,
    assignee_id: null,
    created_by: currentUserId,
    tags: [],
    estimated_time: 0
  });

  const [projectMembers, setProjectMembers] = useState<ProjectMember[]>([]);
  const [statuses, setStatuses] = useState<TaskStatus[]>([]);
  const [priorities, setPriorities] = useState<TaskPriority[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);

  const { 
    projects, 
    projectMembers: fetchedProjectMembers, 
    projectTasks 
  } = useProjectSelect(formData.project_id, taskId);

  useEffect(() => {
    setProjectMembers(fetchedProjectMembers);
  }, [fetchedProjectMembers]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statusesData, prioritiesData, tagsData] = await Promise.all([
          getTaskStatuses(),
          getPriorities(),
          getTags()
        ]);

        setStatuses(statusesData);
        setPriorities(prioritiesData);
        setAvailableTags(tagsData);

        if (taskId) {
          const taskData = await getTaskById(Number(taskId));
          const taskTags = await getTaskTags(Number(taskId));
          setFormData({
            name: taskData.name,
            description: taskData.description || '',
            start_date: taskData.start_date,
            due_date: taskData.due_date,
            priority_id: taskData.priority_id,
            status_id: taskData.status_id,
            type_id: taskData.type_id,
            parent_id: taskData.parent_id,
            project_id: taskData.project_id,
            holder_id: taskData.holder_id,
            assignee_id: taskData.assignee_id,
            created_by: taskData.created_by,
            tags: taskTags || [],
            estimated_time: taskData.estimated_time || 0
          });
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [taskId]);

  const handleChange = async (e: { target: { name: string; value: any } }) => {
    const { name, value } = e.target;
    const newValue = value === '' ? null : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));

    // If we're editing and the status changes, update it immediately
    if (isEditing && name === 'status_id' && newValue !== null) {
      try {
        const updatedTask = await changeTaskStatus(Number(taskId), newValue);
        setFormData(prev => ({
          ...prev,
          status_id: updatedTask.status_id
        }));
      } catch (error) {
        console.error('Error updating task status:', error);
        // Revert the status if update fails
        setFormData(prev => ({
          ...prev,
          status_id: prev.status_id
        }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await updateTask(Number(taskId), formData);
      } else {
        await createTask(formData);
      }
      navigate(-1);
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  return {
    formData,
    projects,
    projectMembers,
    projectTasks,
    statuses,
    priorities,
    availableTags,
    isEditing,
    handleChange,
    handleSubmit
  };
};
