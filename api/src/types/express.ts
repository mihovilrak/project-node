import { Request } from 'express';
import { Session } from 'express-session';

declare module 'express-session' {
  interface Session {
    user?: {
      id: string;
      login: string;
      role_id: number;
    };
  }
}

export interface CustomRequest extends Request {
  session: Session;
  taskId?: string;  // Added to handle task-related requests
}

export type ProjectRequest = Request & {
  session: Session;
  taskId?: string;
};