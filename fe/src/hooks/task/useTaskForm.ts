import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { getTaskById, createTask, updateTask } from '../../api/tasks';
import { getTaskTags } from '../../api/tags';
import {
  SimpleChangeEvent,
  TaskFormState,
  UseTaskFormProps,
} from '../../types/task';
import { useProjectSelect } from './useProjectSelect';
import { useLookup } from '../../context/LookupsContext';
import logger from '../../utils/logger';
import getApiErrorMessage from '../../utils/getApiErrorMessage';
import {
  TaskPriorityId,
  TaskStatusId,
  TaskTypeId,
} from '../../constants/statusIds';

/**
 * Manage task form state, validation, and data loading for creating and editing
 * tasks.
 *
 * @param root0 Configuration object with task identifiers, project context, and
 *   current user information.
 */
export const useTaskForm = ({
  taskId,
  projectId,
  projectIdFromQuery,
  parentTaskId,
  currentUserId,
}: UseTaskFormProps) => {
  const navigate = useNavigate();
  const isEditing = Boolean(taskId);
  const [isLoading, setIsLoading] = useState(isEditing);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [formData, setFormData] = useState<TaskFormState>({
    name: '',
    description: '',
    project_id: projectIdFromQuery
      ? Number(projectIdFromQuery)
      : projectId
        ? Number(projectId)
        : null,
    type_id: TaskTypeId.Task,
    priority_id: TaskPriorityId.Normal,
    status_id: TaskStatusId.New,
    parent_id: parentTaskId ? Number(parentTaskId) : null,
    holder_id: currentUserId || null,
    assignee_id: null,
    start_date: dayjs().format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
    due_date: null,
    estimated_time: 0,
    progress: 0,
    created_by: currentUserId,
    tags: [],
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const { data: statuses, error: statusesError } = useLookup('statuses');
  const { data: priorities, error: prioritiesError } = useLookup('priorities');

  const { projects, projectMembers, projectTasks, selectError } =
    useProjectSelect(formData.project_id, taskId);

  useEffect(() => {
    if (!taskId) return;
    const controller = new AbortController();
    const loadTaskData = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);
        const [taskData, taskTags] = await Promise.all([
          getTaskById(Number(taskId), controller.signal),
          getTaskTags(Number(taskId), controller.signal),
        ]);
        if (controller.signal.aborted) return;
        if (!taskData) {
          setLoadError('Task not found');
        } else {
          const formattedStartDate = taskData.start_date
            ? dayjs(taskData.start_date).format('YYYY-MM-DD')
            : null;
          const formattedDueDate = taskData.due_date
            ? dayjs(taskData.due_date).format('YYYY-MM-DD')
            : null;

          setFormData({
            name: taskData.name || '',
            description: taskData.description || '',
            project_id: taskData.project_id,
            type_id: taskData.type_id || TaskTypeId.Task,
            priority_id: taskData.priority_id || TaskPriorityId.Normal,
            status_id: taskData.status_id || TaskStatusId.New,
            parent_id: taskData.parent_id || null,
            holder_id: taskData.holder_id || currentUserId || null,
            assignee_id: taskData.assignee_id || null,
            start_date: formattedStartDate,
            due_date: formattedDueDate,
            estimated_time: taskData.estimated_time || 0,
            progress: taskData.progress || 0,
            created_by: taskData.created_by || currentUserId,
            tags: taskTags || [],
          });
        }
      } catch (error) {
        if (controller.signal.aborted) return;
        logger.error('Error loading task:', error);
        setLoadError(getApiErrorMessage(error, 'Failed to load task'));
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };

    loadTaskData();
    return () => controller.abort();
  }, [taskId, currentUserId]);

  const handleChange = useCallback((e: SimpleChangeEvent) => {
    const { name, value } = e.target;
    let newValue: unknown = value === '' ? null : value;
    if (name === 'holder_id' || name === 'assignee_id') {
      if (value === '') {
        newValue = null;
      } else {
        const num = Number(value);
        newValue = Number.isNaN(num) ? null : num;
      }
    }

    setFieldErrors((prev) => {
      if (prev[name]) {
        const next = { ...prev };
        delete next[name];
        return next;
      }
      return prev;
    });
    setFormData((prev) =>
      prev[name as keyof TaskFormState] === newValue
        ? prev
        : { ...prev, [name]: newValue },
    );
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loadError) throw new Error(loadError);
    const err: Record<string, string> = {};
    if (!formData.name?.trim()) err.name = 'Name is required';
    if (formData.project_id == null) err.project_id = 'Project is required';
    if (!formData.start_date) err.start_date = 'Start date is required';
    if (!formData.due_date) err.due_date = 'Due date is required';
    if (formData.holder_id == null) err.holder_id = 'Holder is required';
    if (formData.assignee_id == null) err.assignee_id = 'Assignee is required';
    const start = formData.start_date
      ? dayjs(formData.start_date).valueOf()
      : null;
    const due = formData.due_date ? dayjs(formData.due_date).valueOf() : null;
    if (start != null && due != null && due < start) {
      err.due_date = err.due_date || 'Due date must be on or after start date';
    }
    if (Object.keys(err).length > 0) {
      setFieldErrors(err);
      throw new Error('Please fill in all required fields');
    }
    setFieldErrors({});
    try {
      const taskData = {
        ...formData,
        project_id: formData.project_id
          ? Number(formData.project_id)
          : undefined,
        type_id: formData.type_id ? Number(formData.type_id) : undefined,
        priority_id: formData.priority_id
          ? Number(formData.priority_id)
          : undefined,
        status_id: formData.status_id ? Number(formData.status_id) : undefined,
        holder_id: formData.holder_id ? Number(formData.holder_id) : undefined,
        assignee_id: formData.assignee_id
          ? Number(formData.assignee_id)
          : undefined,
        parent_id: formData.parent_id ? Number(formData.parent_id) : undefined,
        estimated_time: formData.estimated_time
          ? Number(formData.estimated_time)
          : undefined,
      };

      if (isEditing) {
        // Project and parent are fixed once a task exists.
        const { project_id: _project, parent_id: _parent, ...updates } =
          taskData;
        await updateTask(Number(taskId), updates);
        navigate(`/tasks/${taskId}`);
      } else {
        const newTask = await createTask(taskData);
        if (newTask && newTask.id) {
          navigate(`/tasks/${newTask.id}`);
        } else {
          navigate(-1);
        }
      }
    } catch (error: unknown) {
      logger.error('Error saving task:', error);
      throw new Error(getApiErrorMessage(error, 'Failed to save task'));
    }
  };

  return {
    formData,
    fieldErrors,
    projects,
    projectMembers,
    projectTasks,
    selectError: selectError || statusesError || prioritiesError,
    statuses,
    priorities,
    isEditing,
    isLoading,
    loadError,
    handleChange,
    handleSubmit,
  };
};
