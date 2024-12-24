import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Comment } from '../types/comment';
import { TimeLog, TimeLogCreate } from '../types/timeLog';
import { TaskFile } from '../types/files';
import { Task, TaskStatus } from '../types/task';
import {
    getTaskById,
    getSubtasks,
    getTaskStatuses,
    changeTaskStatus,
    deleteTask
} from '../api/tasks';
import {
  getTaskComments,
  createComment,
  editComment,
  deleteComment
} from '../api/comments';
import { getTaskTimeLogs } from '../api/timeLogService';
import {
  getTaskFiles,
  uploadFile,
  downloadFile,
  deleteFile
} from '../api/files';

export const useTaskDetails = (taskId: string) => {
    const [state, setState] = useState({
      task: null as Task | null,
      subtasks: [] as Task[],
      comments: [] as Comment[],
      timeLogs: [] as TimeLog[],
      files: [] as TaskFile[],
      statuses: [] as TaskStatus[],
      loading: true,
      error: null as string | null,
      timeLogDialogOpen: false,
      selectedTimeLog: null as TimeLog | null,
      commentDialogOpen: false,
      selectedComment: null as Comment | null,
      deleteDialogOpen: false,
      editingComment: null as Comment | null,
    });
  
    const navigate = useNavigate();
    const { hasPermission, currentUser } = useAuth();
  
    useEffect(() => {
      const fetchTaskData = async () => {
        try {
          setState(prev => ({ ...prev, loading: true, error: null }));
          
          const [
            taskData,
            subtasksData,
            commentsData,
            timeLogsData,
            filesData,
            statusesData
          ] = await Promise.all([
            getTaskById(Number(taskId)),
            getSubtasks(Number(taskId)),
            getTaskComments(Number(taskId)),
            getTaskTimeLogs(Number(taskId)),
            getTaskFiles(Number(taskId)),
            getTaskStatuses()
          ]);

          setState(prev => ({
            ...prev,
            task: taskData,
            subtasks: subtasksData,
            comments: commentsData,
            timeLogs: timeLogsData,
            files: filesData,
            statuses: statusesData,
            loading: false
          }));
        } catch (error) {
          setState(prev => ({
            ...prev,
            error: 'Failed to load task details',
            loading: false
          }));
        }
      };
  
      fetchTaskData();
    }, [taskId]);
  
    const handleStatusChange = async (newStatus: TaskStatus) => {
      try {
        await changeTaskStatus(Number(taskId), newStatus.id);
        setState(prev => ({
          ...prev,
          task: prev.task ? { ...prev.task, status_id: newStatus.id } : null
        }));
      } catch (error) {
        console.error('Failed to update task status:', error);
      }
    };
  
    const handleDelete = async () => {
      try {
        await deleteTask(Number(taskId));
        navigate('/tasks');
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: 'Failed to delete task'
        }));
      }
    };
  
    const handleTimeLogSubmit = async (timeLogData: TimeLogCreate) => {
      try {
        if (!currentUser?.id) {
          throw new Error('User not authenticated');
        }

        const newTimeLog: TimeLog = {
          id: Date.now(),
          user_id: currentUser.id,
          created_on: new Date().toISOString(),
          updated_on: new Date().toISOString(),
          description: timeLogData.description || null,
          ...timeLogData
        };
        
        const updatedTimeLogs = [...state.timeLogs, newTimeLog];
        setState(prev => ({
          ...prev,
          timeLogs: updatedTimeLogs,
          timeLogDialogOpen: false,
          selectedTimeLog: null
        }));
      } catch (error) {
        console.error('Failed to add time log:', error);
      }
    };
  
    const handleCommentSubmit = async (content: string) => {
      try {
        if (!currentUser?.id) throw new Error('User not authenticated');
        
        const newComment = await createComment(Number(taskId), {
          comment: content
        });

        setState(prev => ({
          ...prev,
          comments: [...prev.comments, newComment],
          commentDialogOpen: false
        }));
      } catch (error) {
        console.error('Failed to add comment:', error);
      }
    };
  
    const handleCommentUpdate = async (commentId: number, newText: string) => {
      try {
        const updatedComment = await editComment(commentId, Number(taskId), { 
          comment: newText 
        });

        setState(prev => ({
          ...prev,
          comments: prev.comments.map(c => 
            c.id === commentId ? updatedComment : c
          )
        }));
      } catch (error) {
        console.error('Failed to update comment:', error);
      }
    };
  
    const handleCommentDelete = async (commentId: number) => {
      try {
        await deleteComment(Number(taskId), commentId);
        setState(prev => ({
          ...prev,
          comments: prev.comments.filter(c => c.id !== commentId)
        }));
      } catch (error) {
        console.error('Failed to delete comment:', error);
      }
    };
  
    const handleFileUpload = async (file: File) => {
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('task_id', taskId);
        
        const uploadedFile = await uploadFile(Number(taskId), formData);
        
        setState(prev => ({
          ...prev,
          files: [...prev.files, uploadedFile]
        }));
      } catch (error) {
        console.error('Failed to upload file:', error);
      }
    };
  
    const handleFileDownload = async (fileId: number) => {
      try {
        await downloadFile(Number(taskId), fileId);
      } catch (error) {
        console.error('Failed to download file:', error);
      }
    };
  
    const handleFileDelete = async (fileId: number) => {
      try {
        await deleteFile(Number(taskId), fileId);
        setState(prev => ({
          ...prev,
          files: prev.files.filter(f => f.id !== fileId)
        }));
      } catch (error) {
        console.error('Failed to delete file:', error);
      }
    };
  
    const handleSubtasksUpdate = (newSubtasks: Task[]) => {
      setState(prev => ({
        ...prev,
        subtasks: newSubtasks
      }));
    };
  
    return {
      ...state,
      handleStatusChange,
      handleDelete,
      handleTimeLogSubmit,
      handleCommentSubmit,
      handleCommentUpdate,
      handleCommentDelete,
      handleFileUpload,
      handleFileDownload,
      handleFileDelete,
      handleSubtasksUpdate,
      setTimeLogDialogOpen: (open: boolean) => 
        setState(prev => ({ ...prev, timeLogDialogOpen: open })),
      setCommentDialogOpen: (open: boolean) => 
        setState(prev => ({ ...prev, commentDialogOpen: open })),
      setDeleteDialogOpen: (open: boolean) => 
        setState(prev => ({ ...prev, deleteDialogOpen: open })),
      setSelectedTimeLog: (timeLog: TimeLog | null) =>
        setState(prev => ({ ...prev, selectedTimeLog: timeLog })),
      setComments: (comments: Comment[]) =>
        setState(prev => ({ ...prev, comments })),
      setFiles: (files: TaskFile[]) =>
        setState(prev => ({ ...prev, files })),
      setTimeLogs: (timeLogs: TimeLog[]) =>
        setState(prev => ({ ...prev, timeLogs })),
      setSubtasks: (subtasks: Task[]) =>
        setState(prev => ({ ...prev, subtasks })),
      canEdit: hasPermission('Edit tasks'),
      canDelete: hasPermission('Delete tasks'),
      setEditingComment: (comment: Comment | null) =>
        setState(prev => ({ ...prev, editingComment: comment })),
    };
};