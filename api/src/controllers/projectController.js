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

exports.createSubproject = async (req, res, pool) => {
  const { 
    name, 
    description, 
    start_date, 
    due_date 
  } = req.body;
  const { id: parent_id } = req.params;
  const created_by = req.session.user?.id;

  if (!created_by) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  try {
    const result = await projectModel.createSubproject(
      pool,
      name,
      description,
      start_date,
      due_date,
      parent_id,
      created_by
    );
    res.status(201).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
