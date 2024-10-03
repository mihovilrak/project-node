const projectModel = require('../models/projectModel');

exports.getAllProjects = async (req, res, pool) => {
  try {
    const { status } = req.query;
    const projects = await projectModel.getProjects(pool, status);
    res.status(200).json(projects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getOneProject = async (req, res, pool) => {
  try {
    const { id } = req.params;
    const project = await projectModel.getProject(pool, id);
    res.status(200).json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

exports.createProject = async (req, res, pool) => {
  const { name, description, start_date, due_date, created_by } = req.body;
  try {
    const result = await projectModel.createProject(pool, name, description, start_date, due_date, created_by);
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
