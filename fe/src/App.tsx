import React from 'react';
import {
  Route,
  Routes,
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
import ActiveTasks from './components/Home/ActiveTasks';
import Settings from './components/Settings/Settings';
import Profile from './components/Profile/Profile';
import Calendar from './components/Calendar/Calendar';
import TaskFiles from './components/Tasks/TaskFiles';
import TaskTimeLogs from './components/Tasks/TaskTimeLogs';
import TimeLogCalendar from './components/TimeLog/TimeLogCalendar';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { ThemeProvider } from './context/ThemeContext';
import CssBaseline from '@mui/material/CssBaseline';
import { 
  useTaskFileWrapper, 
  useTimeLogCalendarWrapper, 
  useTaskTimeLogsWrapper,
  useAppState 
} from './hooks/app/useAppRoutes';

const TaskFileWrapper: React.FC = () => {
  const { taskId, handleFileUploaded, handleFileDeleted } = useTaskFileWrapper();
  
  return (
    <TaskFiles
      taskId={taskId}
      onFileUploaded={handleFileUploaded}
      onFileDeleted={handleFileDeleted}
    />
  );
};

const TimeLogCalendarWrapper: React.FC = () => {
  const { projectId } = useTimeLogCalendarWrapper();
  return <TimeLogCalendar projectId={projectId} />;
};

const TaskTimeLogsWrapper: React.FC = () => {
  const { task } = useTaskTimeLogsWrapper();

  if (!task) {
    return null;
  }

  return <TaskTimeLogs task={task} />;
};

const App: React.FC = () => {
  const { 
    taskFormOpen, 
    handleTaskCreated, 
    handleTaskFormClose 
  } = useAppState();

  return (
    <ThemeProvider>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <AuthProvider>
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
                element={<PrivateRoute element={<TaskForm />} />}
              />
              <Route path="/tasks/:id" element={<TaskDetails />} />
              <Route path="/tasks/:id/edit" element={<PrivateRoute element={<TaskForm />} />} />
              <Route path="/tasks/active" element={<ActiveTasks />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/calendar" element={<PrivateRoute element={<Calendar />} />} />
              <Route path="/tasks/:id/files" element={<TaskFileWrapper />} />
              <Route path="/tasks/:id/time-logs" element={<TaskTimeLogsWrapper />} />
              <Route path="/projects/:projectId/time-logs/calendar" element={<TimeLogCalendarWrapper />} />
            </Route>
          </Routes>
        </AuthProvider>
      </LocalizationProvider>
    </ThemeProvider>
  );
};

export default App;
