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
import { getTaskComments } from '../../api/comments';
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
      await changeTaskStatus(id, { status: newStatus });
      const updatedTask = await getTaskById(id);
      setTask(updatedTask);
    } catch (error) {
      console.error('Failed to update task status', error);
    }
  };

  const handleCommentAdded = (newComment) => {
    setComments(prevComments => [newComment, ...prevComments]);
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
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => handleStatusChange('Completed')} 
            sx={{ mr: 1 }}
          >
            Mark as Completed
          </Button>
          <Button 
            variant="contained" 
            color="secondary" 
            onClick={() => navigate(`/tasks/${id}/edit`)} 
            sx={{ mr: 1 }}
          >
            Edit Task
          </Button>
          <Button 
            variant="contained" 
            color="error" 
            onClick={handleDelete}
          >
            Delete Task
          </Button>
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
            <CommentList comments={comments} />
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
