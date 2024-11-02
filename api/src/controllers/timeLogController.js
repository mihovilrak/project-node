const timeLogModel = require('../models/timeLogModel');

// Time log controller
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

// Create time log
exports.createTimeLog = async (req, res, pool) => {
  try {
    const { taskId } = req.params;
    const userId = req.session.user?.id;
    const timeLogData = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const timeLog = await timeLogModel.createTimeLog(pool, taskId, userId, timeLogData);
    res.status(201).json(timeLog);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update time log
exports.updateTimeLog = async (req, res, pool) => {
  try {
    const { taskId, timeLogId } = req.params;
    const timeLogData = req.body;
    const timeLog = await timeLogModel.updateTimeLog(pool, timeLogId, timeLogData);
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