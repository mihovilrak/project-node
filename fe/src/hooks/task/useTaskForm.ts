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
import {
  TaskStatus,
  TaskPriority,
  TaskFormState,
  UseTaskFormProps
} from '../../types/task';
import { ProjectMember } from '../../types/project';
import { Tag } from '../../types/tag';
import { useProjectSelect } from './useProjectSelect';

export const useTaskForm = ({
  taskId,
  projectId,
  projectIdFromQuery,
  parentTaskId,
  currentUserId
}: UseTaskFormProps) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

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
    progress: 0,
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
    const loadTaskData = async () => {
      // If taskId exists, we're in edit mode
      if (!taskId) {
        setIsEditing(false);
        return;
      }

      try {
        setIsLoading(true);
        const taskData = await getTaskById(Number(taskId));
        if (taskData) {
          setIsEditing(true);
          const taskTags = await getTaskTags(Number(taskId));

          // Format dates properly
          const formattedStartDate = taskData.start_date ? dayjs(taskData.start_date).format('YYYY-MM-DDTHH:mm:ss.SSS[Z]') : null;
          const formattedDueDate = taskData.due_date ? dayjs(taskData.due_date).format('YYYY-MM-DDTHH:mm:ss.SSS[Z]') : null;

          setFormData({
            name: taskData.name || '',
            description: taskData.description || '',
            project_id: taskData.project_id,
            type_id: taskData.type_id || 1,
            priority_id: taskData.priority_id || 2,
            status_id: taskData.status_id || 1,
            parent_id: taskData.parent_id || null,
            holder_id: taskData.holder_id || currentUserId || null,
            assignee_id: taskData.assignee_id || null,
            start_date: formattedStartDate,
            due_date: formattedDueDate,
            estimated_time: taskData.estimated_time || 0,
            progress: taskData.progress || 0,
            created_by: taskData.created_by || currentUserId,
            tags: taskTags || []
          });
        }
      } catch (error) {
        console.error('Error loading task:', error);
        setIsEditing(false);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchData = async () => {
      try {
        const [statusesData, prioritiesData, tagsData] = await Promise.all([
          getTaskStatuses(),
          getPriorities(),
          getTags()
        ]);

        setStatuses(statusesData || []);
        setPriorities(prioritiesData || []);
        setAvailableTags(tagsData || []);
      } catch (error: any) {
        console.error('Error fetching data:', error);
        setStatuses([]);
        setPriorities([]);
        setAvailableTags([]);
      }
    };

    loadTaskData();
    fetchData();
  }, [taskId, currentUserId]);

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
        navigate(`/tasks/${taskId}`);
      } else {
        const newTask = await createTask(taskData);
        if (newTask && newTask.id) {
          navigate(`/tasks/${newTask.id}`);
        } else {
          navigate(-1);
        }
      }
      } catch (error: any) {
        console.error('Error saving task:', error);
        const errorMessage = error?.response?.data?.error || 
                            error?.message || 
                            'Failed to save task';
        throw new Error(errorMessage);
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
    isLoading,
    handleChange,
    handleSubmit
  };
};
