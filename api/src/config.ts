import dotenv from 'dotenv';
import { Config } from './types/config';

// Load environment variables from .env file
dotenv.config();

const config: Config = {
  port: parseInt(process.env.PORT || '5000', 10),
  databaseUrl: `postgres://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@db:5432/${process.env.POSTGRES_DB}`,
  sessionSecret: process.env.SESSION_SECRET || 'default_secret',
  feUrl: 'http://localhost',
  nodeEnv: process.env.NODE_ENV || 'development'
};

export default config;
