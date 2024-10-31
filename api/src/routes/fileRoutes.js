const express = require('express');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fileController = require('../controllers/fileController');

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

module.exports = (pool) => {
  const router = express.Router();

  router.get('/tasks/:taskId/files', (req, res) => 
    fileController.getTaskFiles(req, res, pool));

  router.post('/tasks/:taskId/files', 
    upload.single('file'),
    (req, res) => fileController.uploadFile(req, res, pool));

  router.get('/tasks/:taskId/files/:fileId/download', (req, res) => 
    fileController.downloadFile(req, res, pool));

  router.delete('/tasks/:taskId/files/:fileId', (req, res) => 
    fileController.deleteFile(req, res, pool));

  return router;
};
