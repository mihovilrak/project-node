const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);

const sessionMiddleware = (pool, sessionSecret) => {
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
      maxAge: 60 * 60 * 1000,
      secure: false,
      httpOnly: true,
    },
  })
};

module.exports = sessionMiddleware;