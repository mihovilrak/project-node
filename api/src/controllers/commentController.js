const commentModel = require('../models/commentModel');

exports.getTaskComments = async (req, res, pool) => {
  const { task_id } = req.params;
  try {
    const comments = await commentModel.getCommentsByTaskId(pool, task_id);
    res.status(200).json(comments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.addComment = async (req, res, pool) => {
  const { task_id } = req.params;
  const { user_id, comment } = req.body;
  
  try {
    const newComment = await commentModel.addComment(pool, task_id, user_id, comment);
    res.status(201).json(newComment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

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