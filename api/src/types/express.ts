import { Request } from 'express';
import { Session } from 'express-session';
import { User } from './models';

export interface CustomSession extends Session {
  user?: User;
}

export interface CustomRequest extends Request {
  session: CustomSession;
}
