import session from 'express-session';
import pgConnect from 'connect-pg-simple';
import { DatabasePool } from '../types/models';
import { RequestHandler } from 'express';

const pgSession = pgConnect(session);

export default (
  pool: DatabasePool,
  sessionSecret: string
): RequestHandler => {
  return session({
    store: new pgSession({
      pool: pool,
      tableName: 'session',
    }),
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      sameSite: 'lax',
      maxAge: 60 * 60 * 1000, // 1 hour
      secure: false,
      httpOnly: true,
    },
  });
}
