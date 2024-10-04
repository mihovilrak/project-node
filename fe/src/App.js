// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Home from './components/Home/Home';
import Login from './components/Auth/Login';
import PrivateRoute from './utils/PrivateRoute';
import ProjectDetail from './components/Projects/ProjectDetail';
import TaskDetail from './components/Tasks/TaskDetail';
import NotFound from './components/NotFound/NotFound';
import Settings from './components/Settings/Settings'; // Import your settings component
import Projects from './components/Projects/Projects'; // Projects page
import Tasks from './components/Tasks/Tasks'; // Tasks page
import Calendar from './components/Calendar/Calendar'; // Calendar page
import Users from './components/Users/Users'; // Users page

const App = () => (
  <AuthProvider>
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <PrivateRoute path="/projects" element={<Projects />} />
        <PrivateRoute path="/tasks" element={<Tasks />} />
        <PrivateRoute path="/calendar" element={<Calendar />} />
        <PrivateRoute path="/users" element={<Users />} />
        <PrivateRoute path="/settings" element={<Settings />} />
        <PrivateRoute path="/projects/:id" element={<ProjectDetail />} />
        <PrivateRoute path="/tasks/:id" element={<TaskDetail />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  </AuthProvider>
);

export default App;
