const fileModel = require('../models/fileModel');
const path = require('path');
const fs = require('fs').promises;

// Get task files
exports.getTaskFiles = async (req, res, pool) => {
  try {
    const { taskId } = req.params;
    const files = await fileModel.getTaskFiles(pool, taskId);
    res.status(200).json(files);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Upload a file
exports.uploadFile = async (req, res, pool) => {
  try {
    const { taskId } = req.params;
    const userId = req.session.user?.id;
    const file = req.file;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileData = await fileModel.createFile(
      pool,
      taskId,
      userId,
      file.originalname,
      file.filename,
      file.size,
      file.mimetype
    );

    res.status(201).json(fileData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Download a file
exports.downloadFile = async (req, res, pool) => {
  try {
    const { taskId, fileId } = req.params;
    const file = await fileModel.getFileById(pool, fileId);
    
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    const filePath = path.join(__dirname, '../../uploads', file.stored_name);
    res.download(filePath, file.original_name);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete a file
exports.deleteFile = async (req, res, pool) => {
  try {
    const { taskId, fileId } = req.params;
    const file = await fileModel.getFileById(pool, fileId);
    
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    await fileModel.deleteFile(pool, fileId);
    
    const filePath = path.join(__dirname, '../../uploads', file.stored_name);
    await fs.unlink(filePath);

    res.status(200).json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
