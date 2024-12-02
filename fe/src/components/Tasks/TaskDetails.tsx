import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Button, 
  Paper,
  CircularProgress,
  Grid,
  Chip,
  Icon,
  MenuItem,
  Menu
} from '@mui/material';
import PermissionButton from '../common/PermissionButton';
import * as Icons from '@mui/icons-material';
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
import { editComment, deleteComment } from '../../api/comments';
import { deleteTimeLog } from '../../api/timeLogService';
import { Task } from '../../types/task';
import { Comment } from '../../types/comment';
import { TimeLog } from '../../types/timeLog';
import { TaskFile } from '../../types/files';

const TaskDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [statusMenuAnchor, setStatusMenuAnchor] = useState<null | HTMLElement>(null);
  const [editingComment, setEditingComment] = useState<Comment | null>(null);
  const [subtaskFormOpen, setSubtaskFormOpen] = useState(false);

  const {
    task,
    subtasks,
    comments,
    timeLogs,
    files,
    statuses,
    loading,
    error,
    timeLogDialogOpen,
    selectedTimeLog,
    handleStatusChange,
    handleDelete,
    handleTimeLogSubmit,
    handleCommentSubmit,
    setTimeLogDialogOpen,
    setSelectedTimeLog,
    setComments,
    setFiles,
    setTimeLogs,
    setSubtasks,
    canEdit,
    canDelete
  } = useTaskDetails(id!);

  const handleStatusClick = (event: React.MouseEvent<HTMLElement>) => {
    setStatusMenuAnchor(event.currentTarget);
  };

  const handleCommentUpdate = async (commentId: number, newText: string) => {
    try {
      await editComment(commentId, Number(id), { comment: newText });
      const updatedComments = comments.map(comment =>
        comment.id === commentId ? { ...comment, comment: newText } : comment
      );
      setComments(updatedComments);
      setEditingComment(null);
    } catch (error) {
      console.error('Failed to update comment:', error);
    }
  };

  const handleCommentDelete = async (commentId: number) => {
    try {
      await deleteComment(commentId, Number(id));
      const updatedComments = comments.filter(comment => comment.id !== commentId);
      setComments(updatedComments);
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  const handleSaveComment = async (commentId: number, newText: string) => {
    await handleCommentUpdate(commentId, newText);
  };

  const handleFileUploaded = (file: TaskFile) => {
    setFiles([...files, file]);
  };

  const handleFileDeleted = (fileId: number) => {
    setFiles(files.filter(file => file.id !== fileId));
  };

  const handleTimeLogEdit = (timeLog: TimeLog) => {
    setSelectedTimeLog(timeLog);
    setTimeLogDialogOpen(true);
  };

  const handleTimeLogDelete = async (timeLogId: number) => {
    try {
      await deleteTimeLog(timeLogId);
      setTimeLogs(timeLogs.filter(log => log.id !== timeLogId));
    } catch (error) {
      console.error('Failed to delete time log:', error);
    }
  };

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
      <Paper
        elevation={3} 
        sx={{ padding: 4 }}
      >
        <Typography variant="h4">{task.name}</Typography>
        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={12} sm={6}>
            <Typography
              variant="body1">
              Project: {task.project_name}
            </Typography>
            <Typography
              variant="body1">
              Holder: {task.holder_name}
            </Typography>
            <Typography
              variant="body1">
              Assignee: {task.assignee_name}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography
              variant="body1">
              Priority: {task.priority_name}
            </Typography>
            <Typography
              variant="body1">
              Status: {task.status_name}
            </Typography>
            <Typography
              variant="body1">
              Start Date: {new Date(task.start_date).toLocaleDateString()}
            </Typography>
            <Typography
              variant="body1">
              Due Date: {new Date(task.due_date).toLocaleDateString()}
            </Typography>
          </Grid>
        </Grid>
        <Typography
          variant="body1"
          sx={{ mt: 2 }}
        >
          Description: {task.description}
        </Typography>
        <Box sx={{ mt: 2 }}>
        <PermissionButton
            requiredPermission="Update task status"
            variant="contained"
            onClick={handleStatusClick}
            sx={{ mr: 1 }}
            tooltipText="You don't have permission to update task status"
        >
            Change Status
        </PermissionButton>
        <Menu
            anchorEl={statusMenuAnchor}
            open={Boolean(statusMenuAnchor)}
            onClose={() => setStatusMenuAnchor(null)}
        >
            {statuses.map((status) => (
            <MenuItem
                key={status.id}
                onClick={() => handleStatusChange(status)}
                selected={task.status_id === status.id}
              >
                {status.name}
              </MenuItem>
            ))}
          </Menu>
          <PermissionButton 
            requiredPermission="Edit tasks"
            variant="contained" 
            color="secondary" 
            onClick={() => navigate(`/tasks/${id}/edit`)} 
            sx={{ mr: 1 }}
            tooltipText="You don't have permission to edit tasks"
          >
            Edit Task
          </PermissionButton>
          <PermissionButton 
            requiredPermission="Delete tasks"
            variant="contained" 
            color="error" 
            onClick={handleDelete}
            tooltipText="You don't have permission to delete tasks"
          >
            Delete Task
          </PermissionButton>
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
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => setSubtaskFormOpen(true)}
          >
            Add Subtask
          </Button>
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
          onCommentAdded={handleCommentSubmit}
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
            onFileDeleted={handleFileDeleted}
          />
        </Box>
      </Paper>

      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        mb: 2
      }}>
        {task.type_icon && (
          <Icon 
            component={Icons[task.type_icon as keyof typeof Icons]} 
            sx={{ color: task.type_color }} 
          />
        )}
        <Typography variant="body1">
          Type: {task.type_name}
        </Typography>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Typography variant="body1" gutterBottom>
          Tags:
        </Typography>
        <Box sx={{
          display: 'flex',
          gap: 1,
          flexWrap: 'wrap'
        }}>
          {task.tags?.map(tag => (
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
            onClick={() => setTimeLogDialogOpen(true)}
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
          taskId={Number(id)}
          open={timeLogDialogOpen}
          onClose={() => setTimeLogDialogOpen(false)}
          timeLog={null}
        />
      </Paper>
    </Box>
  );
};

export default TaskDetails;
