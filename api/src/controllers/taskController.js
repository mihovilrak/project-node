const taskModel = require('../models/taskModel');
const taskTypeQueries = require('../models/taskType');

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

// Task Type Controllers
const getTaskTypes = async (req, res, pool) => {
  try {
    const result = await pool.query(taskTypeQueries.getAllTaskTypes);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching task types:', error);
    res.status(500).json({ error: 'Failed to fetch task types' });
  }
};

const getTaskTypeById = async (req, res, pool) => {
  try {
    const { id } = req.params;
    const result = await pool.query(taskTypeQueries.getTaskTypeById, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task type not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching task type:', error);
    res.status(500).json({ error: 'Failed to fetch task type' });
  }
};

const createTaskType = async (req, res, pool) => {
  try {
    const { name, description, color, icon, is_active = true } = req.body;
    
    const result = await pool.query(
      taskTypeQueries.createTaskType,
      [name, description, color, icon, is_active]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating task type:', error);
    res.status(500).json({ error: 'Failed to create task type' });
  }
};

const updateTaskType = async (req, res, pool) => {
  try {
    const { id } = req.params;
    const { name, description, color, icon, is_active } = req.body;
    
    const result = await pool.query(
      taskTypeQueries.updateTaskType,
      [name, description, color, icon, is_active, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task type not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating task type:', error);
    res.status(500).json({ error: 'Failed to update task type' });
  }
};

const deleteTaskType = async (req, res, pool) => {
  try {
    const { id } = req.params;
    const result = await pool.query(taskTypeQueries.deleteTaskType, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task type not found' });
    }
    
    res.json({ message: 'Task type deleted successfully' });
  } catch (error) {
    console.error('Error deleting task type:', error);
    res.status(500).json({ error: 'Failed to delete task type' });
  }
};

module.exports = {
  // ... existing exports ...
  getTaskTypes,
  getTaskTypeById,
  createTaskType,
  updateTaskType,
  deleteTaskType
};