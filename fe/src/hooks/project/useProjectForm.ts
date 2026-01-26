import { useState, useCallback, useEffect } from 'react';
import { SelectChangeEvent } from '@mui/material';
import dayjs from 'dayjs';
import { Project, ProjectFormData, ProjectStatus } from '../../types/project';
import { getProjectStatuses } from '../../api/projects';

export const useProjectForm = (project?: Project, parentId?: string | null) => {
  const [formData, setFormData] = useState<ProjectFormData>({
    name: project?.name || '',
    description: project?.description || null,
    start_date: project?.start_date || new Date().toISOString().split('T')[0],
    due_date: project?.due_date || '',
    status_id: project?.status_id || 1,
    parent_id: project?.parent_id || (parentId ? parseInt(parentId) : null)
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dateError, setDateError] = useState<string>('');
  const [statuses, setStatuses] = useState<ProjectStatus[]>([]);
  const [statusesLoading, setStatusesLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        setStatusesLoading(true);
        const statusList = await getProjectStatuses();
        setStatuses(statusList || []);
        // Set default status_id to first status if available and no project provided
        if (!project && statusList && statusList.length > 0 && formData.status_id === 1) {
          setFormData(prev => ({
            ...prev,
            status_id: statusList[0].id
          }));
        }
      } catch (err) {
        console.error('Failed to fetch project statuses:', err);
        setStatuses([]);
      } finally {
        setStatusesLoading(false);
      }
    };
    fetchStatuses();
  }, [project]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when field is modified - use functional update to avoid stale closure
    setErrors(prev => {
      if (prev[name]) {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      }
      return prev;
    });
  }, []);

  const handleStatusChange = useCallback((event: SelectChangeEvent<number>) => {
    setFormData(prev => ({
      ...prev,
      status_id: event.target.value as number
    }));
  }, []);

  const handleDateChange = useCallback((field: 'start_date' | 'due_date', newValue: dayjs.Dayjs | null) => {
    if (!newValue) {
      setFormData(prev => ({
        ...prev,
        [field]: ''
      }));
      return;
    }

    const value = newValue.format('YYYY-MM-DD');
    setFormData(prev => {
      const startDate = field === 'start_date' ? new Date(value) : new Date(prev.start_date);
      const dueDate = field === 'due_date' ? new Date(value) : new Date(prev.due_date);

      if (field === 'due_date' && startDate > dueDate) {
        setDateError('Due date must be after start date');
        setTimeout(() => setDateError(''), 3000);
        return prev;
      }

      setDateError('');
      return {
        ...prev,
        [field]: value
      };
    });
  }, []);

  const handleParentChange = useCallback((e: SelectChangeEvent<string | number>) => {
    const value = e.target.value ? Number(e.target.value) : null;
    setFormData(prev => ({
      ...prev,
      parent_id: value
    }));
  }, []);

  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Project name is required';
    }

    if (!formData.start_date) {
      newErrors.start_date = 'Start date is required';
    }

    if (!formData.due_date) {
      newErrors.due_date = 'Due date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  return {
    formData,
    errors,
    dateError,
    statuses,
    statusesLoading,
    handleChange,
    handleStatusChange,
    handleDateChange,
    handleParentChange,
    validateForm
  };
};
