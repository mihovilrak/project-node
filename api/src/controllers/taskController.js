const taskModel = require('../models/taskModel');
const notificationModel = require('../models/notificationModel');

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
      estimated_time,
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

    // Create unique watchers array from holder, assignee, and creator
    const watchers = [...new Set([holder_id, assignee_id, created_by])].filter(id => id);

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
      estimated_time,
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
      tagIds,
      watchers
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
  const userId = req.session.user?.id;
  const {
    name,
    project_id,
    holder_id,
    assignee_id,
    description,
    estimated_time,
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
      estimated_time,
      status_id,
      priority_id,
      start_date,
      due_date,
      end_date
    );

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Create notifications for watchers
    await notificationModel.createWatcherNotifications(pool, {
      task_id: id,
      action_user_id: userId,
      type_id: 'task_updated'
    });

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
  const userId = req.session.user?.id;

  try {
    const task = await taskModel.changeTaskStatus(pool, id, statusId);
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Create notifications for watchers
    await notificationModel.createWatcherNotifications(pool, {
      task_id: id,
      action_user_id: userId,
      type_id: 'task_status_changed'
    });

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

// Get task watchers
exports.getTaskWatchers = async (req, res, pool) => {
  try {
    const { taskId } = req.params;
    const watchers = await taskModel.getTaskWatchers(pool, taskId);
    res.status(200).json(watchers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Add task watcher
exports.addTaskWatcher = async (req, res, pool) => {
  try {
    const { taskId, userId } = req.body;
    const watcher = await taskModel.addTaskWatcher(pool, taskId, userId);
    res.status(200).json(watcher);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Remove task watcher
exports.removeTaskWatcher = async (req, res, pool) => {
  try {
    const { taskId, userId } = req.body;
    const watcher = await taskModel.removeTaskWatcher(pool, taskId, userId);
    res.status(200).json(watcher);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
