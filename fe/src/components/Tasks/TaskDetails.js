import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Button, 
  Paper,
  CircularProgress,
  Grid,
  Chip,
  Icon
} from '@mui/material';
import * as Icons from '@mui/icons-material';
import { getTaskById, deleteTask, changeTaskStatus } from '../../api/tasks';
import { getTaskComments, editComment, deleteComment } from '../../api/comments';
import CommentForm from '../Comments/CommentForm';
import CommentList from '../Comments/CommentList';
import FileUpload from '../Files/FileUpload';
import FileList from '../Files/FileList';
import { getTaskFiles } from '../../api/files';
import SubtaskForm from './SubtaskForm';
import SubtaskList from './SubtaskList';
import TimeLogDialog from '../TimeLog/TimeLogDialog';
import TimeLogList from '../TimeLog/TimeLogList';
import { getTaskTimeLogs, deleteTimeLog } from '../../api/timeLogs';
import TimeLogStats from '../TimeLog/TimeLogStats';
import CommentEditDialog from '../Comments/CommentEditDialog';

const TaskDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subtasks, setSubtasks] = useState([]);
  const [subtaskFormOpen, setSubtaskFormOpen] = useState(false);
  const [timeLogs, setTimeLogs] = useState([]);
  const [timeLogDialogOpen, setTimeLogDialogOpen] = useState(false);
  const [selectedTimeLog, setSelectedTimeLog] = useState(null);
  const [editingComment, setEditingComment] = useState(null);
  const { user } = useAuth(); 

  useEffect(() => {
    const fetchTaskData = async () => {
      try {
        const [taskData, commentsData, filesData, subtasksData, timeLogsData] = await Promise.all([
          getTaskById(id),
          getTaskComments(id),
          getTaskFiles(id),
          getSubtasks(id),
          getTaskTimeLogs(id)
        ]);
        setTask(taskData);
        setComments(commentsData);
        setFiles(filesData);
        setSubtasks(subtasksData);
        setTimeLogs(timeLogsData);
      } catch (error) {
        console.error('Failed to fetch task details', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTaskData();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(id);
        navigate('/tasks');
      } catch (error) {
        console.error('Failed to delete task', error);
      }
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await changeTaskStatus(id, { statusId: newStatus.id });
      const updatedTask = await getTaskById(id);
      setTask(updatedTask);
    } catch (error) {
      console.error('Failed to update task status', error);
    }
  };

  const fetchComments = async () => {
    try {
      const commentsData = await getTaskComments(id);
      setComments(commentsData);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    }
  };

  const handleCommentAdded = async (newComment) => {
    try {
      await fetchComments(); // Refresh the complete comments list
    } catch (error) {
      console.error('Error refreshing comments:', error);
    }
  };

  const handleFileUploaded = (newFile) => {
    setFiles(prevFiles => [...prevFiles, newFile]);
  };

  const handleFileDeleted = (fileId) => {
    setFiles(prevFiles => prevFiles.filter(file => file.id !== fileId));
  };

  const handleSubtaskCreated = (newSubtask) => {
    setSubtasks(prevSubtasks => [...prevSubtasks, newSubtask]);
  };

  const handleSubtaskUpdated = (subtaskId, updatedSubtask) => {
    setSubtasks(prevSubtasks =>
      prevSubtasks.map(subtask =>
        subtask.id === subtaskId ? updatedSubtask : subtask
      )
    );
  };

  const handleSubtaskDeleted = (subtaskId) => {
    setSubtasks(prevSubtasks =>
      prevSubtasks.filter(subtask => subtask.id !== subtaskId)
    );
  };

  const handleTimeLogCreated = async () => {
    const updatedTimeLogs = await getTaskTimeLogs(id);
    setTimeLogs(updatedTimeLogs);
  };

  const handleTimeLogEdit = (timeLog) => {
    setSelectedTimeLog(timeLog);
    setTimeLogDialogOpen(true);
  };

  const handleTimeLogDelete = async (timeLogId) => {
    try {
      await deleteTimeLog(id, timeLogId);
      const updatedTimeLogs = await getTaskTimeLogs(id);
      setTimeLogs(updatedTimeLogs);
    } catch (error) {
      console.error('Failed to delete time log:', error);
    }
  };

  const handleEditComment = (comment) => {
    setEditingComment(comment);
  };

  const handleSaveComment = async (commentId, newText) => {
    try {
      await editComment(id, commentId, { comment: newText });
      await fetchComments(); // Refresh comments after edit
      setEditingComment(null);
    } catch (error) {
      console.error('Failed to edit comment:', error);
      // You might want to add a snackbar/toast notification here
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        await deleteComment(id, commentId);
        await fetchComments(); // Refresh comments after delete
      } catch (error) {
        console.error('Failed to delete comment:', error);
        // You might want to add a snackbar/toast notification here
      }
    }
  };

  const handleCommentUpdate = async (commentId, newText) => {
    try {
      await editComment(id, commentId, { comment: newText });
      const updatedComments = await getTaskComments(id);
      setComments(updatedComments);
    } catch (error) {
      console.error('Failed to update comment:', error);
    }
  };

  const handleCommentDelete = async (commentId) => {
    try {
      await deleteComment(id, commentId);
      const updatedComments = await getTaskComments(id);
      setComments(updatedComments);
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
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
    <Box sx={{ maxWidth: '800px', margin: '0 auto', padding: '16px' }}>
      <Paper elevation={3} sx={{ padding: 4 }}>
        <Typography variant="h4">{task.name}</Typography>
        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={12} sm={6}>
            <Typography variant="body1">Project: {task.project}</Typography>
            <Typography variant="body1">Holder: {task.holder}</Typography>
            <Typography variant="body1">Assignee: {task.assignee}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body1">Priority: {task.priority}</Typography>
            <Typography variant="body1">Status: {task.status}</Typography>
            <Typography variant="body1">Start Date: {new Date(task.start_date).toLocaleDateString()}</Typography>
            <Typography variant="body1">Due Date: {new Date(task.due_date).toLocaleDateString()}</Typography>
          </Grid>
        </Grid>
        <Typography variant="body1" sx={{ mt: 2 }}>Description: {task.description}</Typography>
        <Box sx={{ mt: 2 }}>
          <PermissionButton 
            requiredPermission="Update task status"
            variant="contained" 
            color="primary" 
            onClick={() => handleStatusChange('Completed')} 
            sx={{ mr: 1 }}
            tooltipText="You don't have permission to update task status"
          >
            Mark as Completed
          </PermissionButton>
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

      {/* Subtasks Section */}
      <Paper sx={{ mt: 3, p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
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
          parentTaskId={id}
          onSubtaskUpdated={handleSubtaskUpdated}
          onSubtaskDeleted={handleSubtaskDeleted}
        />

        <SubtaskForm
          open={subtaskFormOpen}
          onClose={() => setSubtaskFormOpen(false)}
          parentTaskId={id}
          onSubtaskCreated={handleSubtaskCreated}
        />
      </Paper>

      {/* Comments Section */}
      <Paper sx={{ mt: 3, p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Comments ({comments.length})
        </Typography>
        
        <CommentForm 
          taskId={id} 
          onCommentAdded={handleCommentAdded} 
        />
        
        {comments.length > 0 ? (
          <Box sx={{ mt: 3 }}>
            <CommentList 
              comments={comments}
              onCommentUpdated={handleCommentUpdate}
              onCommentDeleted={handleCommentDelete}
              currentUserId={user?.id}
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

      {/* Files Section */}
      <Paper sx={{ mt: 3, p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Files ({files.length})
        </Typography>
        
        <FileUpload 
          taskId={id} 
          onFileUploaded={handleFileUploaded} 
        />
        
        <Box sx={{ mt: 2 }}>
          <FileList 
            files={files} 
            taskId={id}
            onFileDeleted={handleFileDeleted}
          />
        </Box>
      </Paper>

      {/* Task Type */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        {task.type_icon && (
          <Icon 
            component={Icons[task.type_icon]} 
            sx={{ color: task.type_color }} 
          />
        )}
        <Typography variant="body1">
          Type: {task.type_name}
        </Typography>
      </Box>

      {/* Tags */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="body1" gutterBottom>
          Tags:
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
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

      {/* Time Logs Section */}
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
          open={timeLogDialogOpen}
          onClose={() => {
            setTimeLogDialogOpen(false);
            setSelectedTimeLog(null);
          }}
          taskId={id}
          timeLog={selectedTimeLog}
          onTimeLogCreated={handleTimeLogCreated}
        />
      </Paper>
    </Box>
  );
};

export default TaskDetails;
