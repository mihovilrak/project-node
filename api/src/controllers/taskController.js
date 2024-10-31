const taskModel = require('../models/taskModel');

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
  const { name,
    project_id,
    holder_id,
    assignee_id,
    description,
    priority_id,
    start_date,
    due_date,
    created_by
  } = req.body;
  try {
    const task = await taskModel.createTask(
      pool,
      name,
      project_id,
      holder_id,
      assignee_id,
      description,
      priority_id,
      start_date,
      due_date,
      created_by
    );
    res.status(201).json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateTask = async (req, res, pool) => {
  const { id } = req.params;
  const { name,
    project_id,
    holder_id,
    assignee_id,
    description,
    status_id,
    priority_id,
    start_date,
    due_date,
    end_date    
  } = req.body;
  try {
    const task = await taskModel.updateTask(
      pool,
      id,
      name,
      project_id,
      holder_id,
      assignee_id,
      description,
      status_id,
      priority_id,
      start_date,
      due_date,
      end_date      
    );
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

exports.getTaskStatuses = async (req, res, pool) => {
  try {
    const statuses = await taskModel.getTaskStatuses(pool);
    return res.status(200).json(statuses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getPriorities = async (req, res, pool) => {
  try {
    const priorities = await taskModel.getPriorities(pool);
    return res.status(200).json(priorities);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getActiveTasks = async (req, res, pool) => {
  try {
    const userId = req.session.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const tasks = await taskModel.getActiveTasks(pool, userId);
    res.status(200).json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getTasks = async (req, res, pool) => {
  const { project_id } = req.query;
  try {
    let tasks;
    if (project_id) {
      tasks = await taskModel.getTasksByProject(pool, project_id);
    } else {
      tasks = await taskModel.getAllTasks(pool);
    }
    res.status(200).json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.createSubtask = async (req, res, pool) => {
  try {
    const { parentId } = req.params;
    const userId = req.session.user?.id;
    const { name, description, start_date, due_date, priority, status } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const subtask = await taskModel.createSubtask(
      pool,
      parentId,
      name,
      description,
      start_date,
      due_date,
      priority,
      status,
      userId
    );

    res.status(201).json(subtask);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getSubtasks = async (req, res, pool) => {
  try {
    const { parentId } = req.params;
    const subtasks = await taskModel.getSubtasks(pool, parentId);
    res.status(200).json(subtasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};