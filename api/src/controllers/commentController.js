const commentModel = require('../models/commentModel');

// Get task comments
exports.getTaskComments = async (req, res, pool) => {
  try {
    const taskId = req.taskId;
    const comments = await commentModel.getTaskComments(pool, taskId);
    res.status(200).json(comments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create a comment
exports.createComment = async (req, res, pool) => {
  try {
    const taskId = req.taskId;
    const { comment } = req.body;
    const userId = req.session.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const newComment = await commentModel.createComment(
      pool,
      taskId,
      userId,
      comment
    );
    res.status(201).json(newComment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Edit a comment
exports.editComment = async (req, res, pool) => {
  const { id } = req.params;
  const { comment } = req.body;

  try {
      const editedComment = await commentModel.editComment(pool, id, comment);
      res.status(200).json(editedComment);
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete a comment
exports.deleteComment = async (req, res, pool) => {
  const { id } = req.params;

  try {
      const deletedComment = await commentModel.deleteComment(pool, id);
      res.status(200).json(deletedComment);
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
  }
};