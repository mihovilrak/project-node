import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import config from './config';
import { pool } from './db';

// Import routes
import sessionRoute from './routes/sessionRouter';
import loginRoute from './routes/loginRouter';
import logoutRoute from './routes/logoutRouter';
import projectRoutes from './routes/projectRouter';
import taskRouter from './routes/taskRouter';
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

// Security headers
app.use(helmet());

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session cookie middleware
app.use(sessionMiddleware(pool, config.sessionSecret, config.nodeEnv));

// Routes
app.use('/api/check-session', sessionRoute(pool));
app.use('/api/login', loginRoute(pool));
app.use('/api/logout', logoutRoute());

app.use('/api/projects', authMiddleware, projectRoutes(pool));
app.use('/api/tasks', authMiddleware, taskRouter(pool));
app.use('/api/roles', authMiddleware, roleRouter(pool));
app.use('/api/users', authMiddleware, userRoutes(pool));
app.use('/api/notifications', authMiddleware, notificationRoutes(pool));
app.use('/api/files', authMiddleware, fileRoutes(pool));
app.use('/api/tags', authMiddleware, tagRoutes(pool));
app.use('/api/profile', authMiddleware, profileRoutes(pool));
app.use('/api/admin', authMiddleware, adminRoutes(pool));
app.use('/api/settings', authMiddleware, settingsRoutes(pool));
app.use('/api/time-logs', authMiddleware, timeLogRoutes(pool));

// Error handling middleware
app.use(errorHandler);

export default app;