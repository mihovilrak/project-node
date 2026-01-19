import { Request, Response } from 'express';
import { Pool } from 'pg';
import path from 'path';
import fs from 'fs/promises';
import fsSync from 'fs';
import * as fileModel from '../models/fileModel';
import { TaskRequest } from '../types/comment';
import { FileUploadRequest } from '../types/file';

// Get task files
export const getTaskFiles = async (
  req: TaskRequest,
  res: Response,
  pool: Pool
): Promise<Response | void> => {
  try {
    const taskId = req.taskId || '';
    const files = await fileModel.getTaskFiles(pool, taskId);
    res.status(200).json(files);
  } catch (error) {
    console.error('Error in getTaskFiles:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Upload a file
export const uploadFile = async (
  req: FileUploadRequest,
  res: Response,
  pool: Pool
): Promise<Response | void> => {
  try {
    const taskId = req.taskId;
    const userId = req.session?.user?.id;
    const file = req.file;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    if (!taskId || isNaN(Number(taskId))) {
      return res.status(400).json({ error: 'Invalid task ID' });
    }

    // Construct the file path relative to the uploads directory
    const filePath = path.join('uploads', file.filename);

    const fileData = await fileModel.createFile(
      pool,
      taskId,
      userId,
      file.originalname,
      file.filename,
      file.size,
      file.mimetype,
      filePath
    );

    res.status(201).json(fileData);
  } catch (error) {
    console.error('Error in uploadFile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Download a file
export const downloadFile = async (
  req: Request,
  res: Response,
  pool: Pool
): Promise<Response | void> => {
  try {
    const { fileId } = req.params;
    const file = await fileModel.getFileById(pool, fileId);

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    const filePath = path.resolve(__dirname, '../../uploads', file.stored_name);

    try {
      // Check if file exists using sync version to avoid race conditions
      if (!fsSync.existsSync(filePath)) {
        return res.status(404).json({ error: 'File not found on disk' });
      }
      res.download(filePath, file.original_name);
    } catch (error) {
      console.error('Error accessing file:', error);
      res.status(500).json({ error: 'Error accessing file' });
    }
  } catch (error) {
    console.error('Error in downloadFile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete a file
export const deleteFile = async (
  req: Request,
  res: Response,
  pool: Pool
): Promise<Response | void> => {
  try {
    const { fileId } = req.params;
    const file = await fileModel.getFileById(pool, fileId);

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    await fileModel.deleteFile(pool, fileId);

    const filePath = path.resolve(__dirname, '../../uploads', file.stored_name);
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.error('Error deleting file from disk:', error);
      // Continue even if file doesn't exist on disk
    }

    res.status(200).json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Error in deleteFile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
