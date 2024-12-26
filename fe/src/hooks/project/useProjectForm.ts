import { useState } from 'react';
import { SelectChangeEvent } from '@mui/material';
import dayjs from 'dayjs';
import { Project, ProjectFormData } from '../../types/project';

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when field is modified
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleStatusChange = (event: SelectChangeEvent<number>) => {
    setFormData(prev => ({
      ...prev,
      status_id: event.target.value as number
    }));
  };

  const handleDateChange = (field: 'start_date' | 'due_date', newValue: dayjs.Dayjs | null) => {
    if (!newValue) {
      setFormData(prev => ({
        ...prev,
        [field]: ''
      }));
      return;
    }

    const value = newValue.format('YYYY-MM-DD');
    const startDate = field === 'start_date' ? new Date(value) : new Date(formData.start_date);
    const dueDate = field === 'due_date' ? new Date(value) : new Date(formData.due_date);

    if (field === 'due_date' && startDate > dueDate) {
      setDateError('Due date must be after start date');
      setTimeout(() => setDateError(''), 3000);
      return;
    }
    
    setDateError('');
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleParentChange = (e: SelectChangeEvent<string | number>) => {
    const value = e.target.value ? Number(e.target.value) : null;
    setFormData(prev => ({
      ...prev,
      parent_id: value
    }));
  };

  const validateForm = (): boolean => {
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
  };

  return {
    formData,
    errors,
    dateError,
    handleChange,
    handleStatusChange,
    handleDateChange,
    handleParentChange,
    validateForm
  };
};
