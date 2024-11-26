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
  Icon,
  MenuItem,
  Menu
} from '@mui/material';
import PermissionButton from '../common/PermissionButton';
import * as Icons from '@mui/icons-material';
import {
  getTaskById,
  deleteTask,
  changeTaskStatus,
  getSubtasks,
  getTaskStatuses
} from '../../api/tasks';
import {
  getTaskComments,
  editComment,
  deleteComment,
  createComment
} from '../../api/comments';
import CommentForm from '../Comments/CommentForm';
import CommentList from '../Comments/CommentList';
import FileUpload from '../Files/FileUpload';
import FileList from '../Files/FileList';
import { getTaskFiles } from '../../api/files';
import SubtaskForm from './SubtaskForm';
import SubtaskList from './SubtaskList';
import TimeLogDialog from '../TimeLog/TimeLogDialog';
import TimeLogList from '../TimeLog/TimeLogList';
import {
  getTaskTimeLogs,
  deleteTimeLog,
  createTimeLog
} from '../../api/timeLogs';
import TimeLogStats from '../TimeLog/TimeLogStats';
import CommentEditDialog from '../Comments/CommentEditDialog';
import { useAuth } from '../../context/AuthContext';
import {
    Task,
    TaskStatus
} from '../../types/task';
import { Comment } from '../../types/comment';
import {
  TimeLog,
  TimeLogUpdate,
  TimeLogCreate
} from '../../types/timeLog';
import { TaskFile } from '../../types/files';

const TaskDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [task, setTask] = useState<Task | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [files, setFiles] = useState<TaskFile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [subtasks, setSubtasks] = useState<Task[]>([]);
  const [subtaskFormOpen, setSubtaskFormOpen] = useState<boolean>(false);
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const [timeLogDialogOpen, setTimeLogDialogOpen] = useState<boolean>(false);
  const [selectedTimeLog, setSelectedTimeLog] = useState<TimeLog | null>(null);
  const [editingComment, setEditingComment] = useState<Comment | null>(null);
  const [statuses, setStatuses] = useState<TaskStatus[]>([]);
  const [statusMenuAnchor, setStatusMenuAnchor] = useState<null | HTMLElement>(null);

  useEffect(() => {
    const fetchTaskData = async (): Promise<void> => {
      if (!id) return;
      
      try {
        const [taskData,
          commentsData,
          filesData,
          subtasksData,
          timeLogsData
        ] = await Promise.all([
          getTaskById(parseInt(id)),
          getTaskComments(parseInt(id)),
          getTaskFiles(parseInt(id)),
          getSubtasks(parseInt(id)),
          getTaskTimeLogs(parseInt(id))
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

  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        const statusList = await getTaskStatuses();
        setStatuses(statusList);
      } catch (error) {
        console.error('Failed to fetch statuses:', error);
      }
    };
    fetchStatuses();
  }, []);

  const handleDelete = async (): Promise<void> => {
    if (!id || !window.confirm('Are you sure you want to delete this task?')) return;
    
    try {
      await deleteTask(parseInt(id));
      navigate('/tasks');
    } catch (error) {
      console.error('Failed to delete task', error);
    }
  };

  const handleStatusChange = async (statusId: number): Promise<void> => {
    if (!id) return;
    
    try {
      await changeTaskStatus(parseInt(id), statusId);
      const updatedTask = await getTaskById(parseInt(id));
      setTask(updatedTask);
      setStatusMenuAnchor(null);
    } catch (error) {
      console.error('Failed to update task status', error);
    }
  };

  const handleStatusClick = (event: React.MouseEvent<HTMLElement>) => {
    setStatusMenuAnchor(event.currentTarget);
  };

  const fetchComments = async (): Promise<void> => {
    if (!id) return;
    
    try {
      const commentsData = await getTaskComments(parseInt(id));
      setComments(commentsData);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    }
  };

  const handleCommentAdded = async (): Promise<void> => {
    try {
      await fetchComments();
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    }
  };

  const handleFileUploaded = (newFile: TaskFile): void => {
    setFiles(prevFiles => [...prevFiles, newFile]);
  };

  const handleFileDeleted = (fileId: number): void => {
    setFiles(prevFiles => prevFiles.filter(file => file.id !== fileId));
  };

  const handleSubtaskCreated = (newSubtask: Task): void => {
    setSubtasks(prevSubtasks => [...prevSubtasks, newSubtask]);
  };

  const handleSubtaskUpdated = (subtaskId: number, updatedSubtask: Task): void => {
    setSubtasks(prevSubtasks =>
      prevSubtasks.map(subtask =>
        subtask.id === subtaskId ? updatedSubtask : subtask
      )
    );
  };

  const handleSubtaskDeleted = (subtaskId: number): void => {
    setSubtasks(prevSubtasks =>
      prevSubtasks.filter(subtask => subtask.id !== subtaskId)
    );
  };

  const handleTimeLogCreated = async (): Promise<void> => {
    if (!id) return;
    
    const updatedTimeLogs = await getTaskTimeLogs(parseInt(id));
    setTimeLogs(updatedTimeLogs);
  };

  const handleTimeLogEdit = (timeLog: TimeLog): void => {
    setSelectedTimeLog(timeLog);
    setTimeLogDialogOpen(true);
  };

  const handleTimeLogDelete = async (timeLogId: number): Promise<void> => {
    if (!id) return;
    
    try {
      await deleteTimeLog(timeLogId);
      const updatedTimeLogs = await getTaskTimeLogs(parseInt(id));
      setTimeLogs(updatedTimeLogs);
    } catch (error) {
      console.error('Failed to delete time log:', error);
    }
  };

  const handleSaveComment = async (commentId: number, newText: string): Promise<void> => {
    if (!id) return;
    
    try {
      await editComment(parseInt(id), commentId, { content: newText });
      await fetchComments();
      setEditingComment(null);
    } catch (error) {
      console.error('Failed to edit comment:', error);
    }
  };

  const handleDeleteComment = async (commentId: number): Promise<void> => {
    if (!id || !window.confirm('Are you sure you want to delete this comment?')) return;
    
    try {
      await deleteComment(parseInt(id), commentId);
      await fetchComments();
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  const handleCommentUpdate = async (commentId: number, newText: string): Promise<void> => {
    if (!id) return;
    
    try {
      await editComment(parseInt(id), commentId, { content: newText });
      const updatedComments = await getTaskComments(parseInt(id));
      setComments(updatedComments);
    } catch (error) {
      console.error('Failed to update comment:', error);
    }
  };

  const handleCommentDelete = async (commentId: number): Promise<void> => {
    if (!id) return;
    
    try {
      await deleteComment(parseInt(id), commentId);
      const updatedComments = await getTaskComments(parseInt(id));
      setComments(updatedComments);
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  const handleCommentSubmit = async (comment: Comment): Promise<void> => {
    try {
      const response = await createComment(Number(id), { content: comment.comment });
      setComments(prev => [...prev, response]);
    } catch (error) {
      console.error('Failed to create comment:', error);
    }
  };

  const handleTimeLogSubmit = async (data: TimeLogUpdate): Promise<void> => {
    try {
      const timeLogData: TimeLogCreate = {
        task_id: Number(id),
        activity_type_id: data.activity_type_id!,
        spent_time: data.spent_time!,
        description: data.description
      };
      const response = await createTimeLog(Number(id), timeLogData);
      setTimeLogs(prev => [...prev, response]);
      setTimeLogDialogOpen(false);
    } catch (error) {
      console.error('Failed to create time log:', error);
    }
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
    <Box sx={{ maxWidth: '800px', margin: '0 auto', padding: '16px' }}>
      <Paper elevation={3} sx={{ padding: 4 }}>
        <Typography variant="h4">{task.name}</Typography>
        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={12} sm={6}>
            <Typography variant="body1">Project: {task.project_name}</Typography>
            <Typography variant="body1">Holder: {task.holder_name}</Typography>
            <Typography variant="body1">Assignee: {task.assignee_name}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body1">Priority: {task.priority_name}</Typography>
            <Typography variant="body1">Status: {task.status_name}</Typography>
            <Typography variant="body1">Start Date: {new Date(task.start_date).toLocaleDateString()}</Typography>
            <Typography variant="body1">Due Date: {new Date(task.due_date).toLocaleDateString()}</Typography>
          </Grid>
        </Grid>
        <Typography variant="body1" sx={{ mt: 2 }}>Description: {task.description}</Typography>
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
                onClick={() => handleStatusChange(status.id)}
                selected={task.status_name === status.name}
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

      {/* Subtasks Section */}
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

      {/* Files Section */}
      <Paper sx={{ mt: 3, p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Files ({files.length})
        </Typography>
        
        <FileUpload 
          taskId={parseInt(id || '0')} 
          onFileUploaded={handleFileUploaded} 
        />
        
        <Box sx={{ mt: 2 }}>
          <FileList 
            files={files} 
            taskId={parseInt(id || '0')}
            onFileDeleted={handleFileDeleted}
          />
        </Box>
      </Paper>

      {/* Task Type */}
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

      {/* Tags */}
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