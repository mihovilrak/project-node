import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Button, 
  Paper,
  CircularProgress,
  Grid,
  Chip,
  Menu,
  MenuItem
} from '@mui/material';
import PermissionButton from '../common/PermissionButton';
import CommentForm from '../Comments/CommentForm';
import CommentList from '../Comments/CommentList';
import FileUpload from '../Files/FileUpload';
import FileList from '../Files/FileList';
import SubtaskList from './SubtaskList';
import TimeLogDialog from '../TimeLog/TimeLogDialog';
import TimeLogList from '../TimeLog/TimeLogList';
import TimeLogStats from '../TimeLog/TimeLogStats';
import CommentEditDialog from '../Comments/CommentEditDialog';
import { useAuth } from '../../context/AuthContext';
import { useTaskDetails } from '../../hooks/useTaskDetails';
import { deleteTimeLog, getTaskTimeLogs, createTimeLog } from '../../api/timeLogService';
import { Task } from '../../types/task';
import { Comment } from '../../types/comment';
import { TimeLog, TimeLogCreate } from '../../types/timeLog';
import { TaskFile } from '../../types/files';

const TaskDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [statusMenuAnchor, setStatusMenuAnchor] = useState<null | HTMLElement>(null);
  const [editingComment, setEditingComment] = useState<Comment | null>(null);
  const [task, setTask] = useState<Task | null>(null);
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const [timeLogDialogOpen, setTimeLogDialogOpen] = useState(false);
  const [selectedTimeLog, setSelectedTimeLog] = useState<TimeLog | null>(null);

  const {
    task: taskFromHook,
    subtasks,
    comments,
    files,
    statuses,
    loading,
    error,
    handleStatusChange,
    handleDelete,
    handleCommentUpdate,
    handleCommentDelete,
    handleFileDelete,
    setComments,
    setFiles,
    setSubtasks,
    canEdit,
    canDelete,
    handleSubtasksUpdate
  } = useTaskDetails(id!);

  useEffect(() => {
    if (taskFromHook) {
      setTask(taskFromHook);
    }
  }, [taskFromHook]);

  const handleStatusMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setStatusMenuAnchor(event.currentTarget);
  };

  const handleStatusMenuClose = () => {
    setStatusMenuAnchor(null);
  };

  const handleSaveComment = async (commentId: number, newText: string) => {
    await handleCommentUpdate(commentId, newText);
  };

  const handleAddSubtask = () => {
    if (task) {
      navigate(`/tasks/new?projectId=${task.project_id}&parentTaskId=${task.id}`);
    }
  };

  const handleFileUploaded = (file: TaskFile) => {
    setFiles([...files, file]);
  };

  const handleFileDeleted = (fileId: number) => {
    setFiles(files.filter(file => file.id !== fileId));
  };

  const handleTimeLogSubmit = async (timeLogData: TimeLogCreate) => {
    try {
      await createTimeLog(Number(id), timeLogData);
      const updatedLogs = await getTaskTimeLogs(Number(id));
      setTimeLogs(updatedLogs);
      setTimeLogDialogOpen(false);
      setSelectedTimeLog(null);
    } catch (error) {
      console.error('Failed to submit time log:', error);
    }
  };

  const handleTimeLogDelete = async (timeLogId: number) => {
    try {
      await deleteTimeLog(timeLogId);
      const updatedLogs = await getTaskTimeLogs(Number(id));
      setTimeLogs(updatedLogs);
    } catch (error) {
      console.error('Failed to delete time log:', error);
    }
  };

  const handleTimeLogEdit = (timeLog: TimeLog) => {
    setSelectedTimeLog(timeLog);
    setTimeLogDialogOpen(true);
  };

  useEffect(() => {
    const loadTimeLogs = async () => {
      if (id) {
        try {
          const logs = await getTaskTimeLogs(Number(id));
          setTimeLogs(logs);
        } catch (error) {
          console.error('Failed to load time logs:', error);
        }
      }
    };
    loadTimeLogs();
  }, [id]);

  const handleSubtaskUpdated = async (subtaskId: number, updatedSubtask: Task) => {
    setSubtasks(subtasks.map(subtask =>
      subtask.id === subtaskId ? updatedSubtask : subtask
    ));
  };

  const handleSubtaskDeleted = async (subtaskId: number) => {
    setSubtasks(subtasks.filter(subtask => subtask.id !== subtaskId));
  };

  if (loading) {
    return (
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!task) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Task not found</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{
      maxWidth: '800px',
      margin: '0 auto',
      padding: '16px'
    }}>
      <Paper elevation={3} sx={{ padding: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="h4">{task.name}</Typography>
          <Box>
            <PermissionButton
              requiredPermission="Edit tasks"
              onClick={() => navigate(`/tasks/${id}/edit`)}
              color="primary"
              variant="contained"
              sx={{ mr: 1 }}
              tooltipText="You don't have permission to edit tasks"
            >
              Edit Task
            </PermissionButton>
            <Box>
              <PermissionButton
                requiredPermission="Edit tasks"
                onClick={handleStatusMenuClick}
                variant="contained"
                color="secondary"
                sx={{ mr: 1 }}
                tooltipText="You don't have permission to change task status"
              >
                Change Status
              </PermissionButton>
              <Menu
                anchorEl={statusMenuAnchor}
                open={Boolean(statusMenuAnchor)}
                onClose={handleStatusMenuClose}
              >
                {statuses.map((status) => (
                  <MenuItem
                    key={status.id}
                    onClick={() => {
                      handleStatusChange(status);
                      handleStatusMenuClose();
                    }}
                  >
                    {status.name}
                  </MenuItem>
                ))}
              </Menu>
            </Box>
            <PermissionButton
              requiredPermission="Delete tasks"
              onClick={handleDelete}
              color="error"
              variant="contained"
              tooltipText="You don't have permission to delete tasks"
            >
              Delete
            </PermissionButton>
          </Box>
        </Box>

        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={12} sm={6}>
            <Typography variant="body1">
              Project: {task.project_name}
            </Typography>
            <Typography variant="body1">
              Type: {task.type_name}
            </Typography>
            <Typography variant="body1"> 
              Priority: {task.priority_name}
            </Typography>
            <Typography variant="body1">
              Status: {task.status_name}
            </Typography>
            <Typography variant="body1">
              Parent Task: {task.parent_name || 'None'}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body1">
              Holder: {task.holder_name}
            </Typography>
            <Typography variant="body1">
              Assignee: {task.assignee_name}
            </Typography>
            <Typography variant="body1">
              Estimated Time: {task.estimated_time || 'Not set'} hours
            </Typography>
            <Typography variant="body1">
              Created By: {task.created_by_name}
            </Typography>
            <Typography variant="body1">
              Created On: {new Date(task.created_on).toLocaleString()}
            </Typography>
          </Grid>
        </Grid>
        
        {task.tags && task.tags.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1" gutterBottom>
              Tags:
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {task.tags.map(tag => (
                <Chip
                  key={tag.id}
                  label={tag.name}
                  sx={{
                    backgroundColor: tag.color,
                    color: 'white'
                  }}
                />
              ))}
            </Box>
          </Box>
        )}

        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Description
          </Typography>
          <Typography variant="body1">
            {task.description || 'No description provided'}
          </Typography>
        </Box>
      </Paper>

      <Paper sx={{ mt: 3, p: 3 }}>
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2
        }}>
          <Typography variant="h6">
            Subtasks ({subtasks.length})
          </Typography>
          <PermissionButton
            requiredPermission="Create tasks"
            onClick={handleAddSubtask}
            variant="contained"
            color="primary"
            sx={{ mb: 2 }}
            tooltipText="You don't have permission to create tasks"
          >
            Add Subtask
          </PermissionButton>
        </Box>

        <SubtaskList
          subtasks={subtasks}
          parentTaskId={Number(id)}
          onSubtaskUpdated={handleSubtaskUpdated}
          onSubtaskDeleted={handleSubtaskDeleted}
        />
      </Paper>

      <Paper sx={{ mt: 3, p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Comments ({comments.length})
        </Typography>
        
        <CommentForm 
          taskId={Number(id)}
          onCommentAdded={(comment) => setComments([...comments, comment])}
        />
        
        {comments.length > 0 ? (
          <Box sx={{ mt: 3 }}>
            <CommentList 
              comments={comments}
              onCommentUpdated={handleCommentUpdate}
              onCommentDeleted={handleCommentDelete}
              currentUserId={currentUser?.id}
            />
          </Box>
        ) : (
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ mt: 2, textAlign: 'center' }}
          >
            No comments yet. Be the first to comment!
          </Typography>
        )}
      </Paper>

      <CommentEditDialog
        open={Boolean(editingComment)}
        comment={editingComment}
        onClose={() => setEditingComment(null)}
        onSave={handleSaveComment}
      />

      <Paper sx={{ mt: 3, p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Files ({files.length})
        </Typography>
        
        <FileUpload 
          taskId={Number(id)}
          onFileUploaded={handleFileUploaded}
        />
        
        <Box sx={{ mt: 2 }}>
          <FileList 
            files={files} 
            taskId={Number(id)}
            onFileDeleted={handleFileDelete}
          />
        </Box>
      </Paper>
      <Paper sx={{ p: 3, mt: 3 }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 2 
        }}>
          <Typography variant="h6">Time Logs</Typography>
          <Button
            variant="contained"
            onClick={() => {
              setSelectedTimeLog(null);
              setTimeLogDialogOpen(true);
            }}
          >
            Log Time
          </Button>
        </Box>

        <TimeLogStats timeLogs={timeLogs} />
        <TimeLogList
          timeLogs={timeLogs}
          onEdit={handleTimeLogEdit}
          onDelete={handleTimeLogDelete}
        />

        <TimeLogDialog
          open={timeLogDialogOpen}
          taskId={Number(id)}
          projectId={task?.project_id || 0}
          timeLog={selectedTimeLog}
          onClose={() => setTimeLogDialogOpen(false)}
          onSubmit={handleTimeLogSubmit}
        />
      </Paper>
    </Box>
  );
};

export default TaskDetails;
