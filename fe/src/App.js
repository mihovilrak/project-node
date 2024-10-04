import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Home from './components/Home/Home';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import ProjectDetail from './components/Projects/ProjectDetail';
import TaskDetail from './components/Tasks/TaskDetail';
import NotFound from './components/NotFound/NotFound';
import PrivateRoute from './utils/PrivateRoute';

const App = () => (
  <AuthProvider>
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {/* Use PrivateRoute to protect ProjectDetail and TaskDetail */}
        <Route
          path="/projects/:id"
          element={<PrivateRoute component={ProjectDetail} />}
        />
        <Route
          path="/tasks/:id"
          element={<PrivateRoute component={TaskDetail} />}
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  </AuthProvider>
);

export default App;
