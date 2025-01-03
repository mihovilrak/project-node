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
    project_id: projectIdFromQuery ? Number(projectIdFromQuery) : (projectId ? Number(projectId) : null),
    type_id: 1,
    priority_id: 2,
    status_id: 1,
    parent_id: parentTaskId ? Number(parentTaskId) : null,
    holder_id: currentUserId || null,
    assignee_id: null,
    start_date: dayjs().format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
    due_date: null,
    estimated_time: 0,
    created_by: currentUserId,
    tags: []
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
          setFormData(prev => ({
            name: taskData.name,
            description: taskData.description || '',
            project_id: taskData.project_id,
            type_id: taskData.type_id || prev.type_id,
            priority_id: taskData.priority_id || prev.priority_id,
            status_id: taskData.status_id || prev.status_id,
            parent_id: taskData.parent_id,
            holder_id: taskData.holder_id || prev.holder_id,
            assignee_id: taskData.assignee_id,
            start_date: taskData.start_date || prev.start_date,
            due_date: taskData.due_date,
            estimated_time: taskData.estimated_time || prev.estimated_time,
            created_by: taskData.created_by,
            tags: taskTags || []
          }));
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
      const taskData = {
        ...formData,
        project_id: formData.project_id ? Number(formData.project_id) : undefined,
        type_id: formData.type_id ? Number(formData.type_id) : undefined,
        priority_id: formData.priority_id ? Number(formData.priority_id) : undefined,
        status_id: formData.status_id ? Number(formData.status_id) : undefined,
        holder_id: formData.holder_id ? Number(formData.holder_id) : undefined,
        assignee_id: formData.assignee_id ? Number(formData.assignee_id) : undefined,
        parent_id: formData.parent_id ? Number(formData.parent_id) : undefined,
        estimated_time: formData.estimated_time ? Number(formData.estimated_time) : undefined
      };

      if (isEditing) {
        await updateTask(Number(taskId), taskData);
      } else {
        await createTask(taskData);
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
