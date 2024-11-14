const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

module.exports = {
  port: process.env.PORT || 5000,
  databaseUrl: `postgres://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@db:5432/${process.env.POSTGRES_DB}`,
  sessionSecret: process.env.SESSION_SECRET,
  feUrl: 'http://localhost',
  nodeEnv: process.env.NODE_ENV
};
