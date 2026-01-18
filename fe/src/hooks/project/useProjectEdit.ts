import { useState, useEffect } from 'react';
import { SelectChangeEvent } from '@mui/material';
import { FormData, Project } from '../../types/project';
import { getProjectStatuses } from '../../api/projects';

export const useProjectEdit = (project: Project | null) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: null,
    start_date: '',
    due_date: '',
    status_id: 1
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [statuses, setStatuses] = useState<Array<{ id: number; name: string }>>([]);

  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        const statusList = await getProjectStatuses();
        setStatuses(statusList);
      } catch (err) {
        console.error('Failed to fetch project statuses:', err);
        setError('Failed to load project statuses');
      }
    };
    fetchStatuses();
  }, []);

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        description: project.description,
        start_date: project.start_date.split('T')[0],
        due_date: project.due_date.split('T')[0],
        status_id: project.status_id
      });
    }
  }, [project]);

  const handleTextChange = (field: keyof FormData) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = event.target.value;

    if (field === 'start_date' || field === 'due_date') {
      const startDate = field === 'start_date' ? new Date(value) : new Date(formData.start_date);
      const dueDate = field === 'due_date' ? new Date(value) : new Date(formData.due_date);

      if (field === 'due_date' && startDate > dueDate) {
        return; // Don't update if due date is before start date
      }
    }

    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleStatusChange = (event: SelectChangeEvent<number>) => {
    setFormData(prev => ({
      ...prev,
      status_id: event.target.value as number
    }));
  };

  return {
    formData,
    error,
    loading,
    statuses,
    setError,
    setLoading,
    handleTextChange,
    handleStatusChange
  };
};
