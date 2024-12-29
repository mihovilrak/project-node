import session from 'express-session';
import pgConnect from 'connect-pg-simple';
import { Pool } from 'pg';
import { RequestHandler } from 'express';

const pgSession = pgConnect(session);

export default (
  pool: Pool,
  sessionSecret: string
): RequestHandler => {
  return session({
    store: new pgSession({
      pool: pool,
      tableName: 'session',
      createTableIfMissing: false, // Table is created by DB init scripts
      errorLog: (error: Error) => {
        console.error('Session store error:', error);
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
      secure: false,
      httpOnly: true,
    },
  });
}
