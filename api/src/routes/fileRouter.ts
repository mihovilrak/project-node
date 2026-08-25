import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { Pool } from 'pg';
import checkPermission from '../middleware/permissionMiddleware';
import * as fileController from '../controllers/fileController';
import { withPool } from '../utils/withPool';

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer configuration
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const upload = multer({ storage, limits: { fileSize: MAX_FILE_SIZE } });

// File routes
export default (pool: Pool): Router => {
  const router = Router();

  // Middleware to set taskId from query params
  router.use((req: any, res, next) => {
    if (req.query.taskId) {
      req.taskId = req.query.taskId;
    }
    next();
  });

  // Get task files
  router.get('/', withPool(pool, fileController.getTaskFiles));

  // Upload a file
  router.post('/',
    upload.single('file'),
    withPool(pool, fileController.uploadFile));

  // Download a file
  router.get('/:fileId/download', withPool(pool, fileController.downloadFile));

  // Delete a file
  router.delete('/:fileId', checkPermission(pool, 'Delete files'), withPool(pool, fileController.deleteFile));

  return router;
};
