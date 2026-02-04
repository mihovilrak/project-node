import React, { Suspense, lazy } from 'react';
import {
  Route,
  Routes,
  Outlet
} from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout/Layout';
import PrivateRoute from './utils/PrivateRoute';
import { LocalizationProvider } from '@mui/x-date-pickers';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

const Home = lazy(() => import('./components/Home/Home'));
const Login = lazy(() => import('./components/Auth/Login'));
const Users = lazy(() => import('./components/Users/Users'));
const UserForm = lazy(() => import('./components/Users/UserForm'));
const UserDetails = lazy(() => import('./components/Users/UserDetails'));
const Projects = lazy(() => import('./components/Projects/Projects'));
const ProjectDetails = lazy(() => import('./components/Projects/ProjectDetails'));
const ProjectForm = lazy(() => import('./components/Projects/ProjectForm'));
const Tasks = lazy(() => import('./components/Tasks/Tasks'));
const TaskDetails = lazy(() => import('./components/Tasks/TaskDetails'));
const TaskForm = lazy(() => import('./components/Tasks/TaskForm'));
const ActiveTasks = lazy(() => import('./components/Home/ActiveTasks'));
const Settings = lazy(() => import('./components/Settings/Settings'));
const Profile = lazy(() => import('./components/Profile/Profile'));
const Calendar = lazy(() => import('./components/Calendar/Calendar'));
const TaskFiles = lazy(() => import('./components/Tasks/TaskFiles'));
const TaskTimeLogs = lazy(() => import('./components/Tasks/TaskTimeLogs'));
const TimeLogCalendar = lazy(() => import('./components/TimeLog/TimeLogCalendar'));
const NotificationsPage = lazy(() => import('./components/Notifications/NotificationsPage'));
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { ThemeProvider } from './context/ThemeContext';
import CssBaseline from '@mui/material/CssBaseline';
import ErrorBoundary from './components/common/ErrorBoundary';
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
          <ErrorBoundary>
            <Suspense fallback={
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
                <CircularProgress />
              </Box>
            }>
            <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Layout><Outlet /></Layout>}>
              <Route index element={<PrivateRoute element={<Home />} />} />
              <Route path="/users" element={<PrivateRoute element={<Users />} />} />
              <Route path="/users/new" element={<PrivateRoute element={<UserForm />} />} />
              <Route path="/users/:id" element={<PrivateRoute element={<UserDetails />} />} />
              <Route path="/users/:id/edit" element={<PrivateRoute element={<UserForm />} />} />
              <Route path="/projects" element={<PrivateRoute element={<Projects />} />} />
              <Route path="/projects/new" element={<PrivateRoute element={<ProjectForm />} />} />
              <Route path="/projects/:id" element={<PrivateRoute element={<ProjectDetails />} />} />
              <Route path="/tasks" element={<PrivateRoute element={<Tasks />} />} />
              <Route
                path="/tasks/new"
                element={<PrivateRoute element={<TaskForm />} />}
              />
              <Route path="/tasks/:id" element={<PrivateRoute element={<TaskDetails />} />} />
              <Route path="/tasks/:id/edit" element={<PrivateRoute element={<TaskForm />} />} />
              <Route path="/tasks/active" element={<PrivateRoute element={<ActiveTasks />} />} />
              <Route path="/settings" element={<PrivateRoute element={<Settings />} />} />
              <Route path="/notifications" element={<PrivateRoute element={<NotificationsPage />} />} />
              <Route path="/profile" element={<PrivateRoute element={<Profile />} />} />
              <Route path="/calendar" element={<PrivateRoute element={<Calendar />} />} />
              <Route path="/tasks/:id/files" element={<PrivateRoute element={<TaskFileWrapper />} />} />
              <Route path="/tasks/:id/time-logs" element={<PrivateRoute element={<TaskTimeLogsWrapper />} />} />
              <Route path="/projects/:projectId/time-logs/calendar" element={<PrivateRoute element={<TimeLogCalendarWrapper />} />} />
            </Route>
          </Routes>
            </Suspense>
          </ErrorBoundary>
        </AuthProvider>
      </LocalizationProvider>
    </ThemeProvider>
  );
};

export default App;
