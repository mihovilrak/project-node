import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useParams,
  Outlet
} from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout/Layout';
import Home from './components/Home/Home';
import Login from './components/Auth/Login';
import PrivateRoute from './utils/PrivateRoute';
import Users from './components/Users/Users';
import UserForm from './components/Users/UserForm';
import UserDetails from './components/Users/UserDetails';
import Projects from './components/Projects/Projects';
import ProjectDetails from './components/Projects/ProjectDetails';
import ProjectForm from './components/Projects/ProjectForm';
import Tasks from './components/Tasks/Tasks';
import TaskDetails from './components/Tasks/TaskDetails';
import TaskForm from './components/Tasks/TaskForm';
import ActiveTasks from './components/Tasks/ActiveTasks';
import Settings from './components/Settings/Settings';
import Profile from './components/Profile/Profile';
import Calendar from './components/Calendar/Calendar';
import TaskFiles from './components/Tasks/TaskFiles';
import TaskTimeLogs from './components/Tasks/TaskTimeLogs';
import TimeLogCalendar from './components/TimeLog/TimeLogCalendar';
import { TaskFile } from './types/files';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Task } from './types/task';
import { getTaskById } from './api/tasks';
import { ThemeProvider } from './context/ThemeContext';
import CssBaseline from '@mui/material/CssBaseline';

// Wrapper component for TaskFiles with proper types
const TaskFileWrapper: React.FC = () => {
  const handleFileUploaded = (file: TaskFile) => {
    // Handle file upload success
    console.log('File uploaded:', file);
  };

  const handleFileDeleted = (fileId: number) => {
    // Handle file deletion
    console.log('File deleted:', fileId);
  };

  return (
    <TaskFiles
      taskId={parseInt(window.location.pathname.split('/')[2])}
      onFileUploaded={handleFileUploaded}
      onFileDeleted={handleFileDeleted}
    />
  );
};

// Wrapper component for TimeLogCalendar with proper types
const TimeLogCalendarWrapper: React.FC = () => {
  const projectId = parseInt(window.location.pathname.split('/')[2]);
  return <TimeLogCalendar projectId={projectId} />;
};

// Update the TaskTimeLogsWrapper component
const TaskTimeLogsWrapper: React.FC = () => {
  const [task, setTask] = useState<Task | null>(null);
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    const fetchTask = async () => {
      if (id) {
        try {
          const taskData = await getTaskById(parseInt(id));
          setTask(taskData);
        } catch (error) {
          console.error('Failed to fetch task:', error);
        }
      }
    };
    fetchTask();
  }, [id]);

  if (!task) {
    return null; // or a loading spinner
  }

  return <TaskTimeLogs task={task} />;
};

const App: React.FC = () => {
  const [taskFormOpen, setTaskFormOpen] = useState(false);

  return (
    <ThemeProvider>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Layout><Outlet /></Layout>}>
                <Route index element={<PrivateRoute element={<Home />} />} />
                <Route path="/users" element={<Users />} />
                <Route path="/users/new" element={<UserForm />} />
                <Route path="/users/:id" element={<UserDetails />} />
                <Route path="/users/:id/edit" element={<UserForm />} />
                <Route path="/projects" element={<PrivateRoute element={<Projects />} />} />
                <Route path="/projects/new" element={<PrivateRoute element={<ProjectForm />} />} />
                <Route path="/projects/:id" element={<PrivateRoute element={<ProjectDetails />} />} />
                <Route path="/tasks" element={<Tasks />} />
                <Route 
                  path="/tasks/new" 
                  element={<PrivateRoute element={
                    <TaskForm 
                      open={taskFormOpen}
                      onClose={() => setTaskFormOpen(false)}
                      onCreated={() => {
                        setTaskFormOpen(false);
                      }}
                    />
                  } />}
                />
                <Route path="/tasks/:id" element={<TaskDetails />} />
                <Route path="/tasks/:id/edit" element={<TaskForm />} />
                <Route path="/tasks/active" element={<ActiveTasks />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/calendar" element={<PrivateRoute element={<Calendar />} />} />
                <Route path="/tasks/:id/files" element={<TaskFileWrapper />} />
                <Route path="/tasks/:id/time-logs" element={<TaskTimeLogsWrapper />} />
                <Route path="/projects/:projectId/time-logs/calendar" element={<TimeLogCalendarWrapper />} />
              </Route>
            </Routes>
          </Router>
        </AuthProvider>
      </LocalizationProvider>
    </ThemeProvider>
  );
};

export default App;
