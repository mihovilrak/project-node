const taskModel = require('../models/taskModel');

exports.getAllTasks = async (req, res, pool) => {
  try {
    const { status, projectId } = req.query;
    const tasks = await taskModel.getTasks(pool, status, projectId);
    res.status(200).json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getTaskById = async (req, res, pool) => {
  const { id } = req.params;
  try {
    const task = await taskModel.getTaskById(pool, id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.status(200).json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getTaskByAssignee = async (req, res, pool) => {
  try {
    const { assignee_id } = req.params;
    const result = await taskModel.getTasksByAssignee(pool, assignee_id);
    if (!result) {
      return res.status(404).json({ message: 'No tasks assigned' });
    }
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error'});
  }
};

exports.getTaskByHolder = async (req, res, pool) => {
  try {
    const { holder_id } = req.params;
    const result = await taskModel.getTasksByHolder(pool, holder_id);
    if (!result) {
      return res.status(404).json({ message: 'No tasks assigned' });
    }
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error'});
  }
};

exports.createTask = async (req, res, pool) => {
  const { name, project_id, holder_id, assignee_id, description, priority_id, start_date, due_date, created_by } = req.body;
  try {
    const task = await taskModel.createTask(pool, name, project_id, holder_id, assignee_id, description, priority_id, start_date, due_date, created_by);
    res.status(201).json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateTask = async (req, res, pool) => {
  const { id } = req.params;
  const { name, project_id, holder_id, assignee_id, description, status_id, priority_id, start_date, due_date, end_date } = req.body;
  try {
    const task = await taskModel.updateTask(pool, id, name, project_id, holder_id, assignee_id, description, status_id, priority_id, start_date, due_date, end_date);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.status(200).json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.changeTaskStatus = async (req, res, pool) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const task = await taskModel.changeTaskStatus(pool, id, status);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.status(200).json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.deleteTask = async (req, res, pool) => {
  const { id } = req.params;
  try {
    const task = await taskModel.deleteTask(pool, id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.status(200).json({ message: 'Task deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
