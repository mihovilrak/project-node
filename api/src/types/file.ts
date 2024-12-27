import { CustomRequest } from './express';
export interface File {
  id: string;
  task_id: string;
  user_id: string;
  name: string;
  original_name: string;
  stored_name: string;
  mime_type: string;
  size: number;
  created_on: Date;
  updated_on: Date;
  active: boolean;
}

export interface FileWithUser extends File {
  user_name: string;
  user_surname: string;
  user_email: string;
  user_login: string;
}

export interface FileCreateInput {
  name: string;
  original_name: string;
  mime_type: string;
  size: number;
}

export interface FileUpdateInput {
  name?: string;
  active?: boolean;
}

export interface FileUploadRequest extends CustomRequest {
  file?: Express.Multer.File;
  taskId?: string;
}
