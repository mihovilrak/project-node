import { Request, Response } from 'express';
import { Pool } from 'pg';
import path from 'path';
import fs from 'fs/promises';
import fsSync from 'fs';
import * as fileModel from '../models/fileModel';
import { hasPermission } from '../models/permissionModel';
import logger from '../utils/logger';
import { TaskRequest } from '../types/comment';
import { FileUploadRequest } from '../types/file';
import { CustomRequest } from '../types/express';
import { UPLOADS_DIR } from '../utils/uploadsDir';

/**
 * Retrieve all files associated with a task.
 *
 * Extracts the task ID from the request and queries the database for matching files, returning them as a JSON array with a 200 status code.
 * @param req Request object containing an optional taskId property
 * @param res Response object used to send the file list back to the client
 * @param pool Database connection pool for executing the file retrieval query
 */
export const getTaskFiles = async (
  req: TaskRequest,
  res: Response,
  pool: Pool,
): Promise<Response | void> => {
  const taskId = req.taskId || '';
  const files = await fileModel.getTaskFiles(pool, taskId);
  res.status(200).json(files);
};

/**
 * Handle file upload for a task, validating authentication and storing file metadata.
 *
 * Requires an authenticated user session and valid task ID. Returns 401 if user is not authenticated, 400 if no file is provided or task ID is invalid. On success, creates a file record in the database and returns 201 with file metadata.
 * @param req FileUploadRequest containing the uploaded file, task ID, and user session
 * @param res Response object for sending HTTP responses
 * @param pool Database connection pool for file metadata storage
 */
export const uploadFile = async (
  req: FileUploadRequest,
  res: Response,
  pool: Pool,
): Promise<Response | void> => {
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
    filePath,
  );

  res.status(201).json(fileData);
};

/**
 * Retrieve and stream a file to the user after validating authentication and access permissions.
 *
 * Verifies user authentication, file existence, user access rights, and path safety before downloading. Rejects unauthenticated requests (401), missing files (404), unauthorized access (403), and invalid file paths (403).
 * @param req Express request containing fileId in params and authenticated user session
 * @param res Express response object for streaming the file download
 * @param pool Database connection pool for querying file metadata and access permissions
 */
export const downloadFile = async (
  req: Request,
  res: Response,
  pool: Pool,
): Promise<Response | void> => {
  const { fileId } = req.params;
  const userId = (req as CustomRequest).session?.user?.id;
  if (!userId) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  const file = await fileModel.getFileById(pool, fileId);
  if (!file) {
    return res.status(404).json({ error: 'File not found' });
  }

  const hasAccess = await fileModel.canUserAccessFile(pool, userId, fileId);
  if (!hasAccess) {
    return res.status(403).json({ error: 'Access denied to this file' });
  }

  const resolvedPath = path.resolve(UPLOADS_DIR, file.stored_name);
  const relativePath = path.relative(UPLOADS_DIR, resolvedPath);
  if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
    return res.status(403).json({ error: 'Invalid file path' });
  }

  if (!fsSync.existsSync(resolvedPath)) {
    return res.status(404).json({ error: 'File not found on disk' });
  }
  res.download(resolvedPath, file.original_name);
};

/**
 * Remove a file from storage after verifying user authentication, access rights, and ownership or admin status.
 *
 * Only the file uploader may delete their own attachments unless the user holds Admin permission, in which case any file may be deleted. The file record is removed from the database, and the stored file is deleted from disk if the path is safe. Failures to delete the file from disk are logged but do not prevent the operation from completing.
 * @param req Express request with fileId parameter and authenticated user session
 * @param res Express response object
 * @param pool Database connection pool
 */
export const deleteFile = async (
  req: Request,
  res: Response,
  pool: Pool,
): Promise<Response | void> => {
  const { fileId } = req.params;
  const userId = (req as CustomRequest).session?.user?.id;
  if (!userId) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  const file = await fileModel.getFileById(pool, fileId);
  if (!file) {
    return res.status(404).json({ error: 'File not found' });
  }

  const hasAccess = await fileModel.canUserAccessFile(pool, userId, fileId);
  if (!hasAccess) {
    return res.status(403).json({ error: 'Access denied to this file' });
  }

  // Anyone on the project may hold "Delete files", so restrict the delete to
  // the uploader's own attachments; an administrator may remove any of them.
  const isAdmin = await hasPermission(pool, userId, 'Admin');
  const deleted = await fileModel.deleteFile(
    pool,
    fileId,
    isAdmin ? undefined : userId,
  );
  if (!deleted) {
    return res.status(403).json({ error: 'Access denied to this file' });
  }

  const resolvedPath = path.resolve(UPLOADS_DIR, file.stored_name);
  const relativePath = path.relative(UPLOADS_DIR, resolvedPath);
  if (!relativePath.startsWith('..') && !path.isAbsolute(relativePath)) {
    try {
      await fs.unlink(resolvedPath);
    } catch (error) {
      logger.error({ err: error }, 'Error deleting file from disk');
    }
  }

  res.status(200).json({ message: 'File deleted successfully' });
};
