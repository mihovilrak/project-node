import dotenv from 'dotenv';

dotenv.config();

import { Config } from './types/config.types';

export const config: Config = {
  db: {
    user: process.env.POSTGRES_USER,
    host: process.env.POSTGRES_HOST,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
  },
  email: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
    from: process.env.EMAIL_FROM || 'Project Management <noreply@yourcompany.com>',
  },
  app: {
    nodeEnv: process.env.NODE_ENV || 'development',
    emailEnabled: process.env.EMAIL_ENABLED === 'true',
    baseUrl: `http://localhost:${process.env.PORT || '5001'}`,
    port: parseInt(process.env.PORT || '5001')
  }
};

export function validateConfig(): void {
  const missing: string[] = [];
  if (!process.env.POSTGRES_HOST) missing.push('POSTGRES_HOST');
  if (!process.env.POSTGRES_USER) missing.push('POSTGRES_USER');
  if (!process.env.POSTGRES_DB) missing.push('POSTGRES_DB');
  if (!process.env.POSTGRES_PASSWORD) missing.push('POSTGRES_PASSWORD');
  if (process.env.EMAIL_ENABLED === 'true') {
    if (!process.env.EMAIL_USER) missing.push('EMAIL_USER');
    if (!process.env.EMAIL_PASSWORD) missing.push('EMAIL_PASSWORD');
  }
  if (missing.length > 0) {
    throw new Error(`Missing required env: ${missing.join(', ')}`);
  }
}
