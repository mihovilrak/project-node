import { useState } from 'react';
import { TimeLogCreate, TimeLog } from '../../types/timeLog';
import dayjs, { Dayjs } from 'dayjs';
import { User } from '../../types/user';
import { Task } from '../../types/task';
import { useTimeLogData } from './useTimeLogData';
import { useTimeLogValidation } from './useTimeLogValidation';

interface UseTimeLogDialogProps {
  timeLog?: TimeLog;
  currentUser: User | null;
  onSubmit: (data: TimeLogCreate) => Promise<void>;
  onClose: () => void;
  open: boolean;
  projectId?: number;
  hasAdminPermission: boolean;
}

export const useTimeLogDialog = ({
  timeLog,
  currentUser,
  onSubmit,
  onClose,
  open,
  projectId,
  hasAdminPermission,
}: UseTimeLogDialogProps) => {
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<number>(currentUser?.id || 0);
  const [selectedActivityTypeId, setSelectedActivityTypeId] = useState<number>(0);
  const [spentTime, setSpentTime] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [logDate, setLogDate] = useState<Dayjs>(timeLog ? dayjs(timeLog.log_date) : dayjs());

  const { timeError, validateTime } = useTimeLogValidation();
  const {
    projects,
    tasks,
    users,
    activityTypes,
    isLoading,
    handleProjectSelect: handleProjectDataFetch
  } = useTimeLogData({ open, projectId, hasAdminPermission });

  const handleProjectChange = (projectId: number | null) => {
    setSelectedProjectId(projectId);
    handleProjectDataFetch(projectId);
    if (!selectedTaskId) {
      setSelectedTaskId(null);
    }
  };

  const handleTaskChange = (taskId: number | null, tasks: Task[]) => {
    setSelectedTaskId(taskId);
    if (taskId !== null) {
      const task = tasks.find(t => t.id === taskId);
      if (task && !selectedProjectId) {
        setSelectedProjectId(task.project_id);
      }
    }
  };

  const handleDateChange = (newDate: Dayjs | null) => {
    setLogDate(newDate || dayjs());
  };

  const handleSubmit = async (e: React.FormEvent, taskId: number | null) => {
    e.preventDefault();
    if (!validateTime(spentTime) || !taskId) return;

    const timeLogData: TimeLogCreate = {
      activity_type_id: selectedActivityTypeId || activityTypes[0]?.id || 0,
      spent_time: Number(spentTime),
      description: description || '',
      log_date: logDate.format('YYYY-MM-DD'),
      user_id: selectedUserId || currentUser?.id || 0,
      task_id: taskId
    };

    await onSubmit(timeLogData);
    onClose();
  };

  const resetForm = () => {
    if (timeLog) {
      setSelectedActivityTypeId(timeLog.activity_type_id);
      setSpentTime(String(timeLog.spent_time));
      setDescription(timeLog.description || '');
      setLogDate(dayjs(timeLog.log_date));
      setSelectedUserId(timeLog.user_id);
    } else {
      setSelectedActivityTypeId(activityTypes[0]?.id || 0);
      setSpentTime('');
      setDescription('');
      setLogDate(dayjs());
      setSelectedUserId(currentUser?.id || 0);
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
    resetForm,
  };
};
