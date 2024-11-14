module.exports = {
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
      pass: process.env.EMAIL_PASSWORD, // App-specific password for Gmail
    },
    from: process.env.EMAIL_FROM || 'Project Management <noreply@yourcompany.com>',
  },
  app: {
    nodeEnv: process.env.NODE_ENV || 'development',
    emailEnabled: process.env.EMAIL_ENABLED === 'true',
    baseUrl: `http://localhost:${process.env.PORT || '5001'}`
  }
}; 