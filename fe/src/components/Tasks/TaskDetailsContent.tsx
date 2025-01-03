import React from 'react';
import { Grid, Typography, Box, Button } from '@mui/material';
import SubtaskList from './SubtaskList';
import TaskTimeLogging from './TaskTimeLogging';
import TaskCommentSection from './TaskCommentSection';
import { TaskDetailsContentProps } from '../../types/task';
import AddTaskIcon from '@mui/icons-material/AddTask';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const TaskDetailsContent: React.FC<TaskDetailsContentProps> = ({
  id,
  task,
  subtasks,
  timeLogs,
  comments,
  timeLogDialogOpen,
  selectedTimeLog,
  editingComment,
  onSubtaskDeleted,
  onSubtaskUpdated,
  onTimeLogSubmit,
  onTimeLogDelete,
  onTimeLogEdit,
  onTimeLogDialogClose,
  onCommentSubmit,
  onCommentUpdate,
  onCommentDelete,
  onEditStart,
  onEditEnd,
  onAddSubtaskClick,
  onTimeLogClick
}) => (
  <Grid item xs={12} md={8}>
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" component="h2">
            Subtasks
          </Typography>
        </Box>
        <Button
          variant="contained"
          size="small"
          startIcon={<AddTaskIcon />}
          onClick={onAddSubtaskClick}
        >
          Add Subtask
        </Button>
      </Box>
      <SubtaskList
        subtasks={subtasks}
        parentTaskId={task.id}
        onSubtaskDeleted={onSubtaskDeleted}
        onSubtaskUpdated={onSubtaskUpdated}
      />
    </Box>

    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" component="h2">
            Time Logs
          </Typography>
        </Box>
        <Button
          variant="contained"
          size="small"
          startIcon={<AccessTimeIcon />}
          onClick={onTimeLogClick}
        >
          Log Time
        </Button>
      </Box>
      <TaskTimeLogging
        taskId={Number(id)}
        projectId={task.project_id}
        timeLogs={timeLogs}
        timeLogDialogOpen={timeLogDialogOpen}
        selectedTimeLog={selectedTimeLog}
        onTimeLogSubmit={onTimeLogSubmit}
        onTimeLogDelete={onTimeLogDelete}
        onTimeLogEdit={onTimeLogEdit}
        onTimeLogDialogClose={onTimeLogDialogClose}
      />
    </Box>

    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" component="h2">
          Comments
        </Typography>
      </Box>
      <TaskCommentSection
        taskId={Number(id)}
        comments={comments}
        editingComment={editingComment}
        onCommentSubmit={onCommentSubmit}
        onCommentUpdate={onCommentUpdate}
        onCommentDelete={onCommentDelete}
        onEditStart={onEditStart}
        onEditEnd={onEditEnd}
      />
    </Box>
  </Grid>
);

export default TaskDetailsContent;
