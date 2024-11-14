const express = require('express');
const config = require('./config');
const { Pool } = require('pg');
const cors = require('cors');

// Import routes
const sessionRoute = require('./routes/sessionRouter');
const loginRoute = require('./routes/loginRouter');
const logoutRoute = require('./routes/logoutRouter');
const projectRoutes = require('./routes/projectRouter');
const taskRoutes = require('./routes/taskRouter');
const roleRouter = require('./routes/roleRouter');
const userRoutes = require('./routes/userRouter');
const notificationRoutes = require('./routes/notificationRouter');
const fileRoutes = require('./routes/fileRouter');
const tagRoutes = require('./routes/tagRouter');
const profileRoutes = require('./routes/profileRouter');
const adminRoutes = require('./routes/adminRouter');
const settingsRoutes = require('./routes/settingsRouter');

// Import middleware
const authMiddleware = require('./middleware/authMiddleware');
const sessionMiddleware = require('./middleware/sessionMiddleware');
const errorHandler = require('./middleware/errorHandler');

// Create Express app
const app = express();

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
const pool = new Pool({
  connectionString: config.databaseUrl
});

// Session cookie middleware
app.use(sessionMiddleware(pool, config.sessionSecret));

// Test database connection
pool.connect(err => {
  if (err) {
    console.error('Error connecting to database:', err.stack);
  } else {
    console.log('Connected to database');
  }
});

// API Routes
const apiRouter = express.Router();

// Public routes (no auth required)
apiRouter.use('/login', loginRoute(pool));
apiRouter.use('/logout', logoutRoute());
apiRouter.use('/check-session', sessionRoute());

// Protected routes (auth required)
apiRouter.use('/projects', authMiddleware, projectRoutes(pool));
apiRouter.use('/tasks', authMiddleware, taskRoutes(pool));
apiRouter.use('/tags', authMiddleware, tagRoutes(pool));
apiRouter.use('/users', authMiddleware, userRoutes(pool));
apiRouter.use('/roles', authMiddleware, roleRouter(pool));
apiRouter.use('/notifications', authMiddleware, notificationRoutes(pool));
apiRouter.use('/files', authMiddleware, fileRoutes(pool));
apiRouter.use('/profile', authMiddleware, profileRoutes(pool));
apiRouter.use('/admin', authMiddleware, adminRoutes(pool));
apiRouter.use('/settings', authMiddleware, settingsRoutes(pool));

// Mount API router
app.use('/api', apiRouter);

// Error handling middleware
app.use(errorHandler);

// Start the server
const PORT = config.port || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
