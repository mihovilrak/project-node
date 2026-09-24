import { Request } from 'express';
import { Session, SessionData } from 'express-session';

declare module 'express-session' {
  interface SessionData {
    user?: {
      id: string;
      login: string;
      role_id: number;
    };
  }
}

// Set by the task and file routers from the route param or ?taskId=.
declare module 'express-serve-static-core' {
  interface Request {
    taskId?: string;
  }
}

export interface CustomRequest extends Request {
  session: Session & Partial<SessionData>;
}

/**
 * Extend Express Request with session data containing user and authentication context.
 */
export type ProjectRequest = Request & {
  session: Session & Partial<SessionData>;
};
