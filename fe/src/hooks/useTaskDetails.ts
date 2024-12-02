import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Comment } from '../types/comment';
import { TimeLog } from '../types/timeLog';
import { TaskFile } from '../types/files';
import { Task, TaskStatus } from '../types/task';
import {
    getTaskById,
    getSubtasks,
    getTaskStatuses,
    changeTaskStatus,
    deleteTask
} from '../api/tasks';
import { getTaskComments } from '../api/comments';
import { getTaskTimeLogs } from '../api/timeLogService';
import { getTaskFiles } from '../api/files';

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
      deleteDialogOpen: false
    });
  
    const navigate = useNavigate();
    const { hasPermission } = useAuth();
  
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
  
    const handleTimeLogSubmit = async (timeLog: TimeLog) => {
      try {
        const updatedTimeLogs = [...state.timeLogs, timeLog];
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
  
    const handleCommentSubmit = async (comment: Comment) => {
      try {
        const updatedComments = [...state.comments, comment];
        setState(prev => ({
          ...prev,
          comments: updatedComments,
          commentDialogOpen: false,
          selectedComment: null
        }));
      } catch (error) {
        console.error('Failed to add comment:', error);
      }
    };
  
    return {
      ...state,
      handleStatusChange,
      handleDelete,
      handleTimeLogSubmit,
      handleCommentSubmit,
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
      canDelete: hasPermission('Delete tasks')
    };
  };