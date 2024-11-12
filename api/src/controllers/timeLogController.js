const timeLogModel = require('../models/timeLogModel');

// Get all time logs
exports.getAllTimeLogs = async (req, res, pool) => {
  try {
    const timeLogs = await timeLogModel.getAllTimeLogs(pool);
    res.status(200).json(timeLogs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get task time logs
exports.getTaskTimeLogs = async (req, res, pool) => {
  try {
    const { taskId } = req.params;
    const timeLogs = await timeLogModel.getTaskTimeLogs(pool, taskId);
    res.status(200).json(timeLogs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get task spent time
exports.getTaskSpentTime = async (req, res, pool) => {
  try {
    const { taskId } = req.params;
    const spentTime = await timeLogModel.getTaskSpentTime(pool, taskId);
    res.status(200).json(spentTime);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get project time logs
exports.getProjectTimeLogs = async (req, res, pool) => {
  try {
    const { projectId } = req.params;
    const params = req.query;
    const timeLogs = await timeLogModel.getProjectTimeLogs(pool, projectId, params);
    res.status(200).json(timeLogs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get project spent time
exports.getProjectSpentTime = async (req, res, pool) => {
  try {
    const { projectId } = req.params;
    const spentTime = await timeLogModel.getProjectSpentTime(pool, projectId);
    res.status(200).json(spentTime);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create time log
exports.createTimeLog = async (req, res, pool) => {
  try {
    const { taskId } = req.params;
    const userId = req.session.user?.id;
    const { spent_time, description, activity_type_id } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!spent_time || !description || !activity_type_id) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const timeLog = await timeLogModel.createTimeLog(pool, taskId, userId, {
      spent_time,
      description,
      activity_type_id
    });
    res.status(201).json(timeLog);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update time log
exports.updateTimeLog = async (req, res, pool) => {
  try {
    const { timeLogId } = req.params;
    const { spent_time, description, activity_type_id } = req.body;
    
    const timeLog = await timeLogModel.updateTimeLog(pool, timeLogId, {
      spent_time,
      description,
      activity_type_id
    });
    res.status(200).json(timeLog);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete time log
exports.deleteTimeLog = async (req, res, pool) => {
  try {
    const { timeLogId } = req.params;
    await timeLogModel.deleteTimeLog(pool, timeLogId);
    res.status(200).json({ message: 'Time log deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get user time logs
exports.getUserTimeLogs = async (req, res, pool) => {
  try {
    const userId = req.session.user?.id;
    const params = req.query;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const timeLogs = await timeLogModel.getUserTimeLogs(pool, userId, params);
    res.status(200).json(timeLogs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};