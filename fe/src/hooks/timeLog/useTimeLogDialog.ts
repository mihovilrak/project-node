import { useState, useEffect, useMemo, useRef } from 'react';
import { TimeLogCreate, UseTimeLogDialogProps } from '../../types/timeLog';
import dayjs, { Dayjs } from 'dayjs';
import { Task } from '../../types/task';
import { useTimeLogData } from './useTimeLogData';
import { useTimeLogValidation } from './useTimeLogValidation';
import logger from '../../utils/logger';
import getApiErrorMessage from '../../utils/getApiErrorMessage';
import { UserOption } from '../../types/user';

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
  const [selectedProjectId, setSelectedProjectId] = useState<
    number | undefined
  >(undefined);
  const [selectedTaskId, setSelectedTaskId] = useState<number | undefined>(
    undefined,
  );
  const [selectedUserId, setSelectedUserId] = useState<number>(
    currentUser?.id || 0,
  );
  const [selectedActivityTypeId, setSelectedActivityTypeId] =
    useState<number>(0);
  const [spentTime, setSpentTime] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [logDate, setLogDate] = useState<Dayjs>(dayjs());

  // Track if form has been initialized to prevent infinite loops
  const isInitialized = useRef(false);

  const { timeError, validateAndFormatTime } = useTimeLogValidation();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    projects,
    tasks,
    users: loadedUsers,
    activityTypes,
    isLoading,
    loadError,
  } = useTimeLogData({
    open,
    projectId: selectedProjectId ?? projectId,
    hasAdminPermission,
  });

  // Keep the log's current owner (edit) or the caller (create) selectable even
  // when they are not in the member list: both are accepted without reassigning.
  const users = useMemo<UserOption[]>(() => {
    const keep: UserOption | null = timeLog
      ? {
          id: timeLog.user_id,
          login: '',
          name: timeLog.user ?? `User ${timeLog.user_id}`,
          surname: '',
        }
      : currentUser
        ? {
            id: currentUser.id,
            login: currentUser.login,
            name: currentUser.name,
            surname: currentUser.surname,
          }
        : null;
    if (!keep || loadedUsers.some((u) => u.id === keep.id)) {
      return loadedUsers;
    }
    return [keep, ...loadedUsers];
  }, [timeLog, currentUser, loadedUsers]);

  // Reset initialization flag and submit error when dialog closes
  useEffect(() => {
    if (!open) {
      isInitialized.current = false;
      setSubmitError(null);
    }
  }, [open]);

  // Initialize form when dialog opens (only once per open)
  useEffect(() => {
    if (open && !isInitialized.current) {
      isInitialized.current = true;
      if (timeLog) {
        // For editing, set the task_id directly - we don't need to look up project from tasks
        // The project_id should come from the timeLog or be passed as prop
        setSelectedProjectId(projectId);
        setSelectedTaskId(timeLog.task_id);
        setSelectedUserId(timeLog.user_id);
        setSelectedActivityTypeId(timeLog.activity_type_id);
        const spentTimeNum =
          typeof timeLog.spent_time === 'string'
            ? parseFloat(timeLog.spent_time)
            : timeLog.spent_time;
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
  }, [open, timeLog, projectId, taskId, currentUser]);

  const handleProjectChange = (id: number | null) => {
    setSelectedProjectId(id || undefined);
    setSelectedTaskId(undefined);
    // The previous pick may not be a member of the new project.
    if (!timeLog) setSelectedUserId(currentUser?.id || 0);
  };

  const handleTaskChange = (id: number | null, taskList: Task[]) => {
    setSelectedTaskId(id || undefined);
  };

  const handleSubmit = async () => {
    setSubmitError(null);
    const validatedHours = validateAndFormatTime(spentTime);
    logger.debug('Validated hours:', validatedHours);
    if (!selectedTaskId) {
      setSubmitError('Please select a task.');
      return;
    }
    if (selectedActivityTypeId == null) {
      setSubmitError('Please select an activity type.');
      return;
    }
    if (validatedHours === null) {
      return;
    }

    // Send user_id only when it changes the owner, so edits of logs whose owner
    // has since left the project don't re-trigger the membership check.
    const defaultOwner = timeLog ? timeLog.user_id : currentUser?.id;
    const timeLogData: TimeLogCreate = {
      task_id: selectedTaskId,
      ...(hasAdminPermission &&
      selectedUserId &&
      selectedUserId !== defaultOwner
        ? { user_id: selectedUserId }
        : {}),
      activity_type_id: selectedActivityTypeId,
      log_date: logDate.format('YYYY-MM-DD'),
      spent_time: validatedHours,
      description: description || undefined,
    };
    logger.debug('Submitting time log data:', timeLogData);

    try {
      await onSubmit(timeLogData);
      onClose();
    } catch (error: unknown) {
      logger.error('Failed to submit time log:', error);
      setSubmitError(
        getApiErrorMessage(error, 'Failed to save time log. Please try again.'),
      );
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
    submitError,
    projects,
    tasks,
    users,
    activityTypes,
    isLoading,
    loadError,
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
