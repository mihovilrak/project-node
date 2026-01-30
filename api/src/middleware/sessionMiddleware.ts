import session from 'express-session';
import pgConnect from 'connect-pg-simple';
import { Pool } from 'pg';
import { RequestHandler } from 'express';
import logger from '../utils/logger';

const pgSession = pgConnect(session);

export default (
  pool: Pool,
  sessionSecret: string,
  nodeEnv: string = 'development'
): RequestHandler => {
  return session({
    store: new pgSession({
      pool: pool as any, // connect-pg-simple uses a different @types/pg; Pool types are incompatible
      tableName: 'session',
      createTableIfMissing: false, // Table is created by DB init scripts
      errorLog: (error: Error) => {
        logger.error({ err: error }, 'Session store error');
      },
      pruneSessionInterval: 60 // Prune expired sessions every minute
    }),
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    rolling: true, // Refresh session with each request
    cookie: {
      sameSite: 'lax',
      maxAge: 60 * 60 * 1000, // 1 hour
      secure: nodeEnv === 'production',
      httpOnly: true,
    },
  });
}
