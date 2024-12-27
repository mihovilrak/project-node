import express, { Express, Request, Response, NextFunction } from 'express';
import { Pool } from 'pg';
import cors from 'cors';
import config from './config';
import { DatabasePool } from './types/models';

// Import routes
import sessionRoute from './routes/sessionRouter';
import loginRoute from './routes/loginRouter';
import logoutRoute from './routes/logoutRouter';
import projectRoutes from './routes/projectRouter';
import taskRoutes from './routes/taskRouter';
import roleRouter from './routes/roleRouter';
import userRoutes from './routes/userRouter';
import notificationRoutes from './routes/notificationRouter';
import fileRoutes from './routes/fileRouter';
import tagRoutes from './routes/tagRouter';
import profileRoutes from './routes/profileRouter';
import adminRoutes from './routes/adminRouter';
import settingsRoutes from './routes/settingsRouter';
import timeLogRoutes from './routes/timeLogRouter';

// Import middleware
import authMiddleware from './middleware/authMiddleware';
import sessionMiddleware from './middleware/sessionMiddleware';
import errorHandler from './middleware/errorHandler';

// Create Express app
const app: Express = express();

// CORS configuration
app.use(cors({
  credentials: true,
  origin: config.feUrl,
  optionsSuccessStatus: 200
}));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// PostgreSQL connection pool
const pool: DatabasePool = new Pool({
  connectionString: config.databaseUrl
}) as DatabasePool;

// Session cookie middleware
app.use(sessionMiddleware(pool, config.sessionSecret));

// Test database connection
pool.connect((err: Error) => {
  if (err) {
    console.error('Error connecting to the database:', err.stack);
    process.exit(1);
  }
  console.log('Connected to database successfully');
});

// Routes
app.use('/api/session', sessionRoute);
app.use('/api/login', loginRoute);
app.use('/api/logout', logoutRoute);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/roles', roleRouter);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/timelogs', timeLogRoutes);

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(config.port, () => {
  console.log(`Server is running on port ${config.port}`);
});
