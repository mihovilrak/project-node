const tagModel = require('../models/tagModel');

// Get all tags
exports.getTags = async (req, res, pool) => {
  try {
    const tags = await tagModel.getTags(pool);
    res.status(200).json(tags);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create a tag
exports.createTag = async (req, res, pool) => {
  try {
    const { name, color } = req.body;
    const userId = req.session.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const tag = await tagModel.createTag(pool, name, color, userId);
    res.status(201).json(tag);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Add tags to task
exports.addTaskTags = async (req, res, pool) => {
  try {
    const { taskId } = req.params;
    const { tagIds } = req.body;
    const userId = req.session.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const result = await tagModel.addTaskTags(pool, taskId, tagIds);
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Remove tag from task
exports.removeTaskTag = async (req, res, pool) => {
  try {
    const { taskId, tagId } = req.params;
    await tagModel.removeTaskTag(pool, taskId, tagId);
    res.status(200).json({ message: 'Tag removed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get task tags
exports.getTaskTags = async (req, res, pool) => {
  try {
    const { taskId } = req.params;
    const tags = await tagModel.getTaskTags(pool, taskId);
    res.status(200).json(tags);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}; 