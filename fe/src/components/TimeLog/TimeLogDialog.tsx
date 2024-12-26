import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  CircularProgress
} from '@mui/material';
import { TimeLogDialogProps } from '../../types/timeLog';
import { useAuth } from '../../context/AuthContext';
import TimeLogForm from './TimeLogForm';
import { useTimeLogDialog } from '../../hooks/timeLog/useTimeLogDialog';

const TimeLogDialog: React.FC<TimeLogDialogProps> = ({
  open,
  projectId,
  taskId,
  timeLog,
  onClose,
  onSubmit
}) => {
  const { currentUser, hasPermission } = useAuth();
  const hasAdminPermission = hasPermission('Admin') || hasPermission('Project Manager');
  
  const {
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
  } = useTimeLogDialog({
    timeLog: timeLog || undefined,
    currentUser,
    onSubmit,
    onClose,
    open,
    projectId,
    hasAdminPermission,
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{timeLog ? 'Edit Time Log' : 'Log Time'}</DialogTitle>
      {isLoading ? (
        <DialogContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        </DialogContent>
      ) : (
        <form onSubmit={(e) => handleSubmit(e, taskId || null)}>
          <DialogContent>
            <TimeLogForm
              selectedProjectId={selectedProjectId}
              selectedTaskId={selectedTaskId}
              selectedUserId={selectedUserId}
              selectedActivityTypeId={selectedActivityTypeId}
              spentTime={spentTime}
              description={description}
              logDate={logDate}
              timeError={timeError}
              projects={projects}
              tasks={tasks}
              users={users}
              activityTypes={activityTypes}
              showUserSelect={hasAdminPermission}
              onProjectChange={handleProjectChange}
              onTaskChange={handleTaskChange}
              onUserChange={setSelectedUserId}
              onActivityTypeChange={setSelectedActivityTypeId}
              onSpentTimeChange={setSpentTime}
              onDescriptionChange={setDescription}
              onDateChange={handleDateChange}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              {timeLog ? 'Update' : 'Save'}
            </Button>
          </DialogActions>
        </form>
      )}
    </Dialog>
  );
};

export default TimeLogDialog;
