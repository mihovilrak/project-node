import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout/Layout';
import Home from './components/Home/Home';
import Login from './components/Auth/Login';
import PrivateRoute from './utils/PrivateRoute';
import Users from './components/Users/Users';
import UserForm from './components/Users/UserForm';
import UserDetails from './components/Users/UserDetails';
import Projects from './components/Projects/Projects';
import ProjectDetail from './components/Projects/ProjectDetail';
import ProjectForm from './components/Projects/ProjectForm';
import Tasks from './components/Tasks/Tasks';
import TaskDetails from './components/Tasks/TaskDetails';
import TaskForm from './components/Tasks/TaskForm';

const App = () => (
  <AuthProvider>
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<PrivateRoute element={<Layout />} />}>
          <Route path="/" element={<PrivateRoute element={<Home />} />} />
          <Route path="/users" element={<Users />} />
          <Route path="/users/new" element={<UserForm />} />
          <Route path="/users/:id" element={<UserDetails />} />
          <Route path="/users/:id/edit" element={<UserForm />} />
          <Route path="/projects" element={<PrivateRoute element={<Projects />} />} />
          <Route path="/projects/new" element={<PrivateRoute element={<ProjectForm />} />} />
          <Route path="/projects/:id" element={<PrivateRoute element={<ProjectDetail />} />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/tasks/new" element={<TaskForm />} />
          <Route path="/tasks/:id" element={<TaskDetails />} />
          <Route path="/tasks/:id/edit" element={<TaskForm />} />
        </Route>
      </Routes>
    </Router>
  </AuthProvider>
);

export default App;
