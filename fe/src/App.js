import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import ProjectList from './components/Projects/ProjectList';
import ProjectDetail from './components/Projects/ProjectDetail';
import TaskDetail from './components/Tasks/TaskDetail';
import UserProfile from './components/Users/UserProfile';
import PrivateRoute from './utils/PrivateRoute';

const App = () => (
  <Router>
    <Routes>
      <Route exact path="/login" component={Login} />
      <Route exact path="/register" component={Register} />
      <PrivateRoute exact path="/projects" component={ProjectList} />
      <PrivateRoute exact path="/projects/:id" component={ProjectDetail} />
      <PrivateRoute exact path="/tasks/:id" component={TaskDetail} />
      <PrivateRoute exact path="/users/:id" component={UserProfile} />
    </Routes>
  </Router>
);

export default App;
