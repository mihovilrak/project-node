const projectModel = require('../models/projectModel');

// Get all projects
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

// Get a project by ID
exports.getProjectById = async (req, res, pool) => {
  try {
    const { id } = req.params;
    const project = await projectModel.getProjectById(pool, id);
    res.status(200).json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get project details
exports.getProjectDetails = async (req, res, pool) => {
  try {
    const { id } = req.params;
    const project = await projectModel.getProjectDetails(pool, id);
    res.status(200).json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create a project
exports.createProject = async (req, res, pool) => {
  const { 
    name, 
    description, 
    start_date, 
    due_date,
    parent_id 
  } = req.body;
  
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
      created_by,
      parent_id
    );
    res.status(201).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Change project status
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

// Update a project
exports.updateProject = async (req, res, pool) => {
  const { id } = req.params;
  const updates = req.body;
  try {
    const result = await projectModel.updateProject(pool, updates, id);
    if (!result) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete a project
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

// Get project members
exports.getProjectMembers = async (req, res, pool) => {
  try {
    const { id } = req.params;
    const members = await projectModel.getProjectMembers(pool, id);
    res.status(200).json(members);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Add project member
exports.addProjectMember = async (req, res, pool) => {
  const { id } = req.params;
  const { userId } = req.body;
  try {
    const result = await projectModel.addProjectMember(pool, id, userId);
    res.status(201).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete project member
exports.deleteProjectMember = async (req, res, pool) => {
  const { id } = req.params;
  const { userId } = req.body;
  try {
    const result = await projectModel.deleteProjectMember(pool, id, userId);
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get subprojects
exports.getSubprojects = async (req, res, pool) => {
  try {
    const { id } = req.params;
    const subprojects = await projectModel.getSubprojects(pool, id);
    res.status(200).json(subprojects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get tasks by project ID
exports.getProjectTasks = async (req, res, pool) => {
  try {
    const { id: projectId } = req.params;
    const { status, priority, assignee } = req.query;
    
    // Create filters object only if values exist
    const filters = {};
    if (status) filters.status = status;
    if (priority) filters.priority = priority;
    if (assignee) filters.assignee = assignee;

    const tasks = await projectModel.getProjectTasks(pool, projectId, filters);
    res.status(200).json(tasks);
  } catch (error) {
    console.error('Error fetching project tasks:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get project statuses
exports.getProjectStatuses = async (req, res, pool) => {
  try {
    const statuses = await projectModel.getProjectStatuses(pool);
    res.status(200).json(statuses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};