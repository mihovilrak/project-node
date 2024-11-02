const express = require('express');
const config = require('./config');
const { Pool } = require('pg');
const path = require('path');
const cors = require('cors');

// Import routes
const sessionRoute = require('./routes/sessionRouter');
const loginRoute = require('./routes/loginRouter');
const logoutRoute = require('./routes/logoutRouter');
const projectRoutes = require('./routes/projectRouter');
const taskRoutes = require('./routes/taskRouter');
const roleRouter = require('./routes/roleRouter');
const userRoutes = require('./routes/userRouter');
const commentRoutes = require('./routes/commentRouter');
const notificationRoutes = require('./routes/notificationRouter');
const fileRoutes = require('./routes/fileRoutes');
const tagRoutes = require('./routes/tagRouter');
const timeLogRoutes = require('./routes/timeLogRouter');

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
apiRouter.use('/time-logs', authMiddleware, timeLogRoutes(pool));
apiRouter.use('/users', authMiddleware, userRoutes(pool));
apiRouter.use('/roles', authMiddleware, roleRouter(pool));
apiRouter.use('/comments', authMiddleware, commentRoutes(pool));
apiRouter.use('/notifications', authMiddleware, notificationRoutes(pool));
apiRouter.use('/files', authMiddleware, fileRoutes(pool));

// Mount API router
app.use('/api', apiRouter);

// Serve static files in production
if (config.nodeEnv === 'production') {
  // Serve React build files
  app.use(express.static(path.join(__dirname, '../client/build')));

  // Handle React routing, return all requests to React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

// Error handling middleware
app.use(errorHandler);

// Start the server
const PORT = config.port || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
