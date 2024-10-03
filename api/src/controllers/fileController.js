const fileModel = require('../models/fileModel');

exports.getTaskFiles = async (req, res, pool) => {
  const { task_id } = req.params;
  try {
    const files = await fileModel.getFilesByTaskId(pool, task_id);
    res.status(200).json(files);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.uploadFile = async (req, res, pool) => {
  const { task_id } = req.params;
  const { user_id } = req.body;
  const filePath = req.file.path;

  try {
    const newFile = await fileModel.uploadFile(pool, task_id, user_id, filePath);
    res.status(201).json(newFile);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
