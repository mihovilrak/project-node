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

export interface CustomRequest extends Request {
  session: Session & Partial<SessionData>;
}

export type ProjectRequest = Request & {
  session: Session & Partial<SessionData>;
};