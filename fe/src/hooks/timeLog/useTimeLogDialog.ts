import { useState, useEffect } from 'react';
import { TimeLogCreate, UseTimeLogDialogProps } from '../../types/timeLog';
import dayjs, { Dayjs } from 'dayjs';
import { Task } from '../../types/task';
import { useTimeLogData } from './useTimeLogData';
import { useTimeLogValidation } from './useTimeLogValidation';

export const useTimeLogDialog = ({
  timeLog,
  currentUser,
  onSubmit,
  onClose,
  open,
  projectId,
  taskId,
  hasAdminPermission,
}: UseTimeLogDialogProps) => {
  const [selectedProjectId, setSelectedProjectId] = useState<number | undefined>(undefined);
  const [selectedTaskId, setSelectedTaskId] = useState<number | undefined>(undefined);
  const [selectedUserId, setSelectedUserId] = useState<number>(currentUser?.id || 0);
  const [selectedActivityTypeId, setSelectedActivityTypeId] = useState<number>(0);
  const [spentTime, setSpentTime] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [logDate, setLogDate] = useState<Dayjs>(dayjs());

  const { timeError, validateTime, validateAndFormatTime } = useTimeLogValidation();
  const {
    projects,
    tasks,
    users,
    activityTypes,
    isLoading,
    handleProjectSelect: handleProjectDataFetch
  } = useTimeLogData({ open, projectId: selectedProjectId, hasAdminPermission });

  // Initialize form when dialog opens
  useEffect(() => {
    if (open) {
      if (timeLog) {
        const project = tasks.find(t => t.id === timeLog.task_id)?.project_id;
        setSelectedProjectId(project);
        setSelectedTaskId(timeLog.task_id);
        setSelectedUserId(timeLog.user_id);
        setSelectedActivityTypeId(timeLog.activity_type_id);
        const spentTimeNum = typeof timeLog.spent_time === 'string' ? parseFloat(timeLog.spent_time) : timeLog.spent_time;
        setSpentTime(String(spentTimeNum));
        setDescription(timeLog.description || '');
        setLogDate(dayjs(timeLog.log_date));
      } else {
        setSelectedProjectId(projectId);
        setSelectedTaskId(taskId);
        setSelectedUserId(currentUser?.id || 0);
        setSelectedActivityTypeId(0);
        setSpentTime('');
        setDescription('');
        setLogDate(dayjs());
      }
    }
  }, [open, timeLog, projectId, taskId, currentUser, tasks]);

  const handleProjectChange = (id: number | null) => {
    setSelectedProjectId(id || undefined);
    setSelectedTaskId(undefined);
    if (id) {
      handleProjectDataFetch(id);
    }
  };

  const handleTaskChange = (id: number | null, taskList: Task[]) => {
    setSelectedTaskId(id || undefined);
  };

  const handleSubmit = async () => {
    const validatedHours = validateAndFormatTime(spentTime);
    console.log('Validated hours:', validatedHours);
    if (!selectedTaskId || validatedHours === null) {
      return;
    }

    const timeLogData: TimeLogCreate = {
      task_id: selectedTaskId,
      user_id: selectedUserId,
      activity_type_id: selectedActivityTypeId,
      log_date: logDate.format('YYYY-MM-DD'),
      spent_time: validatedHours, // Store as hours, no conversion needed
      description: description || undefined
    };
    console.log('Submitting time log data:', timeLogData);

    try {
      await onSubmit(timeLogData);
      onClose();
    } catch (error) {
      console.error('Failed to submit time log:', error);
    }
  };

  const handleDateChange = (date: Dayjs | null) => {
    if (date) {
      setLogDate(date);
    }
  };

  return {
    selectedProjectId,
    selectedTaskId,
    selectedUserId,
    selectedActivityTypeId,
    spentTime,
    description,
    logDate,
    timeError,
    projects,
    tasks,
    users,
    activityTypes,
    isLoading,
    setSelectedProjectId,
    setSelectedTaskId,
    setSelectedUserId,
    setSelectedActivityTypeId,
    setSpentTime,
    setDescription,
    handleDateChange,
    handleProjectChange,
    handleTaskChange,
    handleSubmit,
  };
};
