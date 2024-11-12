# Project overview
You are building a Project Management application, where users can manage their projects and task.

You will be using docker compose, PostgreSQL, express.js, React.js and nginx.

# Core functionalities
1. User can login to the application using username and password.
2. When user login, user will be redirected to the home page.
    1. On the home page, user will see his active tasks.
    2. He can also see his active projects.
3. When user clicks on a project card, user will be redirected to the project details page.
    1. He will see all the tasks of the project.
    2. He can also see all the members of the project.
    3. He can also create a new task for the project.
    4. He can also update or delete a task.
    5. He can create a new subproject for the project.
4. When user clicks on a task card, user will be redirected to the task details page.
    1. He will see all the details of the task.
    2. He can also update or delete the task.
    3. He can also update the status of the task.
    4. He can also add a comment to the task.
    5. He can also add a file to the task.
    6. He can also add a subtask to the task.
    7. He can also add a tag to the task.
5. When creating a new task, user can select the project for the task.
    1. He has to select the project from the list of his projects.
    2. He has to add a assignee to the task.
    3. He has to add a title to the task.
    4. He has to add a description to the task.
    5. He has to add a due date to the task.
    6. He has to select the status of the task.
    7. He has to select the priority of the task.
    8. He has to select the type of the task.
6. The user can also go to a calendar page.
    1. He can see all the tasks for each day.
7. The user can also go to a profile page.
    1. He can see his profile information.
    2. He can also update his profile information.
8. The user if admin can also go to a settings page.
    1. He can see all the users.
    2. He can also update the user information.
    3. He can also delete the user.
    4. He can also create a new user.
9. The user can also go to a help page.
    1. He can see the help information.
10. The user can also log his time spent on a task.
    1. He can select the task for which he wants to log time.
    2. He can add the start time.
    3. He can add the end time.
    4. He can add the description of the work done.
11. The user will get notifications for the tasks that are due soon.
    1. Also he will get notifications for the tasks that he is assigned to.
12. The admin can also add task types and activity types and roles.
13. the user can also see a Gantt chart for the project.
14. the user should also have a calendar for the time he logged.
15. The user should also be able to filter the tasks and projects by name, description, due date, status, priority, type, assignee, created by, created on, updated on, etc.
16. On the project details page, the user has a new layout with tabs for overview, tasks, activity, gantt
17. The user has also an activity tab on the home navigation bar.
18. On the settings page, the user can change the Application name, logo, add custom css and js and html.
19. The user can change app mode to dark or light.
20. The user has an avatar.

# Doc
Example of how a SQL file looks like:
```
create table if not exists projects (
    id serial primary key not null,
    name varchar(50) not null,
    description text null,
    start_date date not null,
    end_date date null,
    due_date date not null,
    status_id int references project_statuses(id) default 1 not null,
    created_by int references users(id) not null,
    created_on timestamptz default current_timestamp not null
);
create index project_created_by_idx on projects(created_by);
create index project_status_idx on projects(status_id);
```

Example of how a model file looks like:
```
exports.getProjects = async (pool, whereParams) => {
  let query = 'SELECT * FROM projects';
  let values = [];

  if (whereParams && Object.keys(whereParams).length > 0) {
    query += ' WHERE ';
    const conditions = [];

    Object.keys(whereParams).forEach((param, index) => {
      conditions.push(`${param} = $${index + 1}`);
      values.push(whereParams[param]);
    });

    query += conditions.join(' AND ');
  }

  const result = await pool.query(query, values);
  return result.rows;
};

  exports.getProjectById = async (pool, id) => {
    const result = await pool.query(
      'SELECT * FROM projects WHERE id = $1',
      [id]
    );
    return result.rows[0];
  };
  
  exports.createProject = async (
    pool, 
    name, 
    description, 
    start_date, 
    due_date, 
    created_by) => {
    const result = await pool.query(
      `INSERT INTO projects (name, description, start_date, due_date, created_by) 
      VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, description, start_date, due_date, created_by]
    );
    return result.rows[0];
  };
  
  exports.changeProjectStatus = async (pool, id) => {
    const result = await pool.query(
      'SELECT * FROM change_project_status($1)',
      [id]
    );
    return result.rows[0];
  };

  exports.updateProject = async (pool, updates, id) => {
    const columns = Object.keys(updates);
    const values = Object.values(updates);
  
    let query = `UPDATE projects SET (${columns.join(', ')}) = 
    (${columns.map((_, index) => `$${index + 1}`).join(', ')})`;
  
    query += ` WHERE id = $${columns.length + 1}`;
  
    values.push(id);
  
    const result = await pool.query(query, values);
    
    return result.rowCount;
  };
  
  exports.deleteProject = async (pool, id) => {
    const result = await pool.query(
      'SELECT * FROM delete_project($1)', 
      [id]);

    return result.rows[0];
  };
  
```

Example of how a controller file looks like:
```
const projectModel = require('../models/projectModel');

exports.getProjects = async (req, res, pool) => {
  try {
    const { whereParams } = req.query;
    const projects = await projectModel.getProjects(pool, whereParams);
    if (projects.length === 0) {
      return res.status(200).json([])
    }
    res.status(200).json(projects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getProjectById = async (req, res, pool) => {
  try {
    const { id } = req.params;
    const project = await projectModel.getProjectById(pool, id);
    res.status(200).json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

exports.createProject = async (req, res, pool) => {
  const { name, 
    description, 
    start_date, 
    due_date } = req.body;
  
  const created_by = req.session.user?.id;

  if (!created_by) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  try {
    const result = await projectModel.createProject(
      pool, 
      name, 
      description, 
      start_date, 
      due_date, 
      created_by);
    res.status(201).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.changeProjectStatus = async (req, res, pool) => {
  const { id } = req.params;
  try {
    const result = await projectModel.changeProjectStatus(pool, id);
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateProject = async (req, res, pool) => {
  const { id, updates } = req.params;
  try {
    const result = await projectModel.updateProject(pool, updates, id);
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.deleteProject = async (req, res, pool) => {
  const { id } = req.params;
  try {
    const result = await projectModel.deleteProject(pool, id);
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

```
Example of how a route file looks like:
```
const express = require('express');
const projectController = require('../controllers/projectController');

module.exports = (pool) => {
  const router = express.Router();

  // Get projects route
  router.get('/', (req, res) => projectController.getProjects(req, res, pool));

  // Get project by ID route
  router.get('/:id', (req, res) => projectController.getProjectById(req, res, pool));

  // Create project route
  router.post('/', (req, res) => projectController.createProject(req, res, pool));

  // Change project status route
  router.patch('/:id/status', (req, res) => projectController.changeProjectStatus(req, res, pool));

  // Update project route
  router.put('/:id', (req, res) => projectController.updateProject(req, res, pool));

  // Delete project route
  router.delete('/:id', (req, res) => projectController.deleteProject(req, res, pool));

  return router;
};
```
Example of how a React api call looks like:
```
import api from './api';

// Fetch all projects
const getProjects = async () => {
  try {
    const response = await api.get('/projects');
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
export { getProjects };

// Fetch a single project by its ID
const getProjectById = async (id) => {
  try {
    const response = await api.get(`projects/${id}`);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
export { getProjectById };

// Create a new project
const createProject = async (values) => {
  try {
    const response = await api.post('projects', values);
    console.log('Project successfully created!');
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
export { createProject };

// Change project status
const changeProjectStatus = async (id, status) => {
  try {
    const response = await api.patch(`projects/${id}/status`, { status });
    console.log('Project status changed!');
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
export { changeProjectStatus };

// Update a project
const updateProject = async (id, updates) => {
  try {
    const response = await api.put(`projects/${id}`, updates);
    console.log('Project updated!');
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
export { updateProject };

// Delete a project
const deleteProject = async (id) => {
  try {
    const response = await api.delete(`projects/${id}`);
    console.log('Project successfully deleted!');
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
export { deleteProject };

```
Example of how a React component looks like:
```
// src/components/Projects/Projects.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProjects } from '../../api/projects';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  TextField,
  Select,
  MenuItem
} from '@mui/material';

const Projects = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [filter, setFilter] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, [sortOrder]);

  const fetchProjects = async () => {
    try {
      const projectList = await getProjects();
      setProjects(projectList);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch projects', error);
      throw error;
    }
  };

  const handleCreateProject = () => {
    navigate('/projects/new');
  };

  const handleSortChange = (event) => {
    setSortOrder(event.target.value);
  };

  const filteredProjects = projects
    .filter((project) => project.name.toLowerCase().includes(filter.toLowerCase()))
    .sort((a, b) => (sortOrder === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)));

  if (loading) return <Typography>Loading projects...</Typography>;

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>Projects</Typography>
      
      <Box display="flex" alignItems="center" mb={2}>
        <TextField
          label="Filter by Name"
          variant="outlined"
          size="small"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          sx={{ mr: 2 }}
        />
        <Select value={sortOrder} onChange={handleSortChange} displayEmpty>
          <MenuItem value="asc">Ascending</MenuItem>
          <MenuItem value="desc">Descending</MenuItem>
        </Select>
        <Button variant="contained" color="primary" onClick={handleCreateProject} sx={{ ml: 'auto' }}>
          Create New Project
        </Button>
      </Box>

      {filteredProjects.length === 0 ? (
        <Typography>No projects yet.</Typography>
      ) : (
        <Grid container spacing={3}>
          {filteredProjects.map((project) => (
            <Grid item xs={12} sm={6} md={4} key={project.id}>
              <Card onClick={() => navigate(`/projects/${project.id}`)} sx={{ cursor: 'pointer' }}>
                <CardContent>
                  <Typography variant="h6">{project.name}</Typography>
                  <Typography variant="body2">{project.description}</Typography>
                  <Typography variant="caption">Due: {new Date(project.due_date).toLocaleDateString()}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default Projects;

```

# Current file structure
.
│   .dockerignore
│   .env
│   .gitignore
│   docker-compose.yml
│   instructions.md
│
├───api
│   │   Dockerfile
│   │   package.json
│   │
│   └───src
│       │   app.js
│       │   config.js
│       │
│       ├───controllers
│       │       commentController.js
│       │       fileController.js
│       │       loginController.js
│       │       notificationController.js
│       │       projectController.js
│       │       roleController.js
│       │       sessionController.js
│       │       taskController.js
│       │       userController.js
│       │
│       ├───middleware
│       │       authMiddleware.js
│       │       sessionMiddleware.js
│       │
│       ├───models
│       │       commentModel.js
│       │       fileModel.js
│       │       loginModel.js
│       │       notificationModel.js
│       │       projectModel.js
│       │       roleModel.js
│       │       taskModel.js
│       │       userModel.js
│       │
│       └───routes
│               commentRouter.js
│               fileRoutes.js
│               loginRouter.js
│               logoutRouter.js
│               notificationRouter.js
│               projectRouter.js
│               roleRouter.js
│               sessionRouter.js
│               taskRouter.js
│               userRouter.js
│
├───db
│   │   crontab
│   │   Dockerfile
│   │
│   ├───backup
│   │       backup.sh
│   │
│   ├───db_data
│   └───init
│           01_EXT_pgcrypto.sql
│           02_TBL_sessions.sql
│           03_TBL_permissions.sql
│           04_TBL_roles.sql
│           05_TBL_roles_permissions.sql
│           06_TBL_user_statuses.sql
│           07_TBL_project_statuses.sql
│           08_TBL_task_statuses.sql
│           09_TBL_priorities.sql
│           10_TBL_users.sql
│           11_TBL_projects.sql
│           12_TBL_tasks.sql
│           13_TBL_project_users.sql
│           14_TBL_comments.sql
│           15_TBL_notifications.sql
│           16_TBL_files.sql
│           17_TBL_time_entries.sql
│           18_TBL_app_logins.sql
│           19_VIEW_v_task_assignees.sql
│           20_VIEW_v_last_login.sql
│           20_VIEW_v_task_holders.sql
│           20_VIEW_v_users.sql
│           21_VIEW_v_task_created_by.sql
│           22_VIEW_v_tasks.sql
│           23_VIEW_v_comments.sql
│           24_FUNC_authentification.sql
│           25_FUNC_projects_for_user.sql
│           26_FUNC_change_project_status.sql
│           27_FUNC_delete_project.sql
│           28_DATA_permissions.sql
│           29_DATA_roles.sql
│           30_DATA_priorities.sql
│           31_DATA_project_statuses.sql
│           32_DATA_task_statuses.sql
│           33_DATA_user_statuses.sql
│           34_DATA_roles_permissions.sql
│           35_DATA_users.sql
│           36_SH_init.sh
│
└───fe
    │   Dockerfile
    │   nginx.conf
    │   package.json
    │
    ├───public
    │       index.html
    │
    └───src
        │   App.js
        │   index.js
        │
        ├───api
        │       api.js
        │       comments.js
        │       file.js
        │       notifications.js
        │       projects.js
        │       tasks.js
        │       users.js
        │
        ├───components
        │   ├───Auth
        │   │       Login.js
        │   │
        │   ├───Calendar
        │   ├───Comments
        │   ├───Files
        │   ├───GanttChart
        │   ├───Home
        │   │       Home.js
        │   │       
        │   ├───Layout
        │   │       Layout.js
        │   │
        │   ├───NotFound
        │   ├───Notifications
        │   ├───Projects
        │   │       ProjectDetail.js
        │   │       ProjectForm.js
        │   │       Projects.js
        │   │
        │   ├───SearchBar
        │   ├───Settings
        │   ├───Tasks
        │   │       TaskDetails.js
        │   │       TaskForm.js
        │   │       Tasks.js
        │   │
        │   ├───Users
        │   │       UserDetails.js
        │   │       UserForm.js
        │   │       Users.js
        │   │
        │   └───Worklogs
        │           WorkLogForm.js
        │
        ├───context
        │       AuthContext.js
        │
        └───utils
                PrivateRoute.js