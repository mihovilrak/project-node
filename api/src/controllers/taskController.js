const taskModel = require('../models/taskModel');
const taskTypeModel = require('../models/taskTypeModel');

// Get tasks
exports.getTasks = async (req, res, pool) => {
  const { project_id } = req.query;
  try {
    let tasks;
    if (project_id) {
      tasks = await taskModel.getTasksByProject(pool, project_id);
    } else {
      tasks = await taskModel.getTasks(pool);
    }
    res.status(200).json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get Task by ID
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

// Get tasks by assignee
exports.getTaskByAssignee = async (req, res, pool) => {
  try {
    const { assignee_id } = req.query;
    const result = await taskModel.getTasks(pool, { assignee_id });
    if (!result) {
      return res.status(404).json({ message: 'No tasks assigned' });
    }
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error'});
  }
};

// Get tasks by holder
exports.getTaskByHolder = async (req, res, pool) => {
  try {
    const { holder_id } = req.query;
    const result = await taskModel.getTasks(pool, { holder_id });
    if (!result) {
      return res.status(404).json({ message: 'No tasks assigned' });
    }
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error'});
  }
};

// Create a task
exports.createTask = async (req, res, pool) => {
  try {
    const {
      name,
      description,
      start_date,
      due_date,
      priority_id,
      status_id,
      type_id,
      parent_id,
      project_id,
      holder_id,
      assignee_id,
      created_by,
      tagIds
    } = req.body;

    // Validate required fields
    if (!name || !start_date || !due_date || !priority_id || !status_id || !type_id || !project_id || !holder_id || !assignee_id) {
      return res.status(400).json({
        error: 'Missing required fields',
        requiredFields: {
          name,
          start_date,
          due_date,
          priority_id,
          status_id,
          type_id,
          project_id,
          holder_id,
          assignee_id
        }
      });
    }

    const result = await taskModel.createTask(
      pool,
      name,
      description,
      start_date,
      due_date,
      priority_id,
      status_id,
      type_id,
      parent_id,
      project_id,
      holder_id,
      assignee_id,
      created_by,
      tagIds
    );

    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update a task
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

// Change task status
exports.changeTaskStatus = async (req, res, pool) => {
  const { id } = req.params;
  const { statusId } = req.body;
  try {
    const task = await taskModel.changeTaskStatus(pool, id, statusId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.status(200).json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete a task
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

// Get task statuses
exports.getTaskStatuses = async (req, res, pool) => {
  try {
    const statuses = await taskModel.getTaskStatuses(pool);
    return res.status(200).json(statuses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get task priorities
exports.getPriorities = async (req, res, pool) => {
  try {
    const priorities = await taskModel.getPriorities(pool);
    return res.status(200).json(priorities);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get active tasks
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

// Get subtasks
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
exports.getTaskTypes = async (req, res, pool) => {
  try {
    const result = await taskTypeModel.getTaskTypes(pool);
    res.json(result);
  } catch (error) {
    console.error('Error fetching task types:', error);
    res.status(500).json({ error: 'Failed to fetch task types' });
  }
};

// Get task type by ID
exports.getTaskTypeById = async (req, res, pool) => {
  try {
    const { id } = req.params;
    const result = await taskTypeModel.getTaskTypeById(pool, id);

    if (!result) {
      return res.status(404).json({ error: 'Task type not found' });
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching task type:', error);
    res.status(500).json({ error: 'Failed to fetch task type' });
  }
};

// Create a task type
exports.createTaskType = async (req, res, pool) => {
  try {
    const { name, description, color, icon, active = true } = req.body;
    
    // Validate required fields
    if (!name || !color) {
      return res.status(400).json({ error: 'Name and color are required' });
    }

    // Validate color format
    if (!color.match(/^#[0-9A-Fa-f]{6}$/)) {
      return res.status(400).json({ error: 'Invalid color format' });
    }

    const result = await taskTypeModel.createTaskType(
      pool,
      name,
      description,
      color,
      icon,
      active
    );
    
    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating task type:', error);
    res.status(500).json({ error: 'Failed to create task type' });
  }
};

// Update a task type
exports.updateTaskType = async (req, res, pool) => {
  try {
    const { id } = req.params;
    const { name, description, color, icon, active } = req.body;
    
    const result = await pool.query(
      taskTypeModel.updateTaskType(
        pool,
        id,
        name,
        description,
        color,
        icon,
        active
      )
    );
    
    if (!result) {
      return res.status(404).json({ error: 'Task type not found' });
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error updating task type:', error);
    res.status(500).json({ error: 'Failed to update task type' });
  }
};

// Delete a task type
exports.deleteTaskType = async (req, res, pool) => {
  try {
    const { id } = req.params;
    const result = await taskTypeModel.deleteTaskType(pool, id);
    
    if (!result) {
      return res.status(404).json({ error: 'Task type not found' });
    }
    
    res.json({ message: 'Task type deleted successfully' });
  } catch (error) {
    console.error('Error deleting task type:', error);
    res.status(500).json({ error: 'Failed to delete task type' });
  }
};