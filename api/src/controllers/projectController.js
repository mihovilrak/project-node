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
    due_date, 
    created_by } = req.body;
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
