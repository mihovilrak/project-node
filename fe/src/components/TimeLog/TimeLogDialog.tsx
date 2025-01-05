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
    taskId,
    hasAdminPermission
  });

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: 3
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        {timeLog ? 'Edit Time Log' : 'Log Time'}
      </DialogTitle>
      <DialogContent sx={{ pt: 2, mt: 2 }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TimeLogForm
            selectedProjectId={selectedProjectId === undefined ? null : selectedProjectId}
            selectedTaskId={selectedTaskId === undefined ? null : selectedTaskId}
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
            isProjectReadOnly={Boolean(projectId)}
            isTaskReadOnly={Boolean(taskId)}
            onProjectChange={handleProjectChange}
            onTaskChange={handleTaskChange}
            onUserChange={(userId) => setSelectedUserId(userId)}
            onActivityTypeChange={(typeId) => setSelectedActivityTypeId(typeId)}
            onSpentTimeChange={setSpentTime}
            onDescriptionChange={setDescription}
            onDateChange={handleDateChange}
          />
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2, pt: 0 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit}
          variant="contained" 
          color="primary"
          disabled={isLoading}
        >
          {timeLog ? 'Update' : 'Submit'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TimeLogDialog;
