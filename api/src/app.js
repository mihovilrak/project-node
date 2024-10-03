const express = require('express');
const config = require('./config');
const { Pool } = require('pg');
const loginRoute = require('./routes/loginRouter');
const projectRoutes = require('./routes/projectRouter');
const taskRoutes = require('./routes/taskRouter');
const userRoutes = require('./routes/userRouter');
const commentRoutes = require('./routes/commentRouter');
const notificationRoutes = require('./routes/notificationRouter');
const fileRoutes = require('./routes/fileRoutes');
const authMiddleware = require('./middleware/authMiddleware');

// Create Express app
const app = express();
app.use(express.json());

// PostgreSQL connection pool
const pool = new Pool({
  connectionString: config.databaseUrl
});

// Test database connection
pool.connect(err => {
  if (err) {
    console.error('Error connecting to database:', err.stack);
  } else {
    console.log('Connected to database');
  }
});

// Define routes
app.use('/api/', loginRoute(pool));
app.use('/api/projects', authMiddleware, projectRoutes(pool));
app.use('/api/tasks', authMiddleware, taskRoutes(pool));
app.use('/api/users', authMiddleware, userRoutes(pool));
app.use('/api/comments', authMiddleware, commentRoutes(pool));
app.use('/api/notifications', authMiddleware, notificationRoutes(pool));
app.use('api/files', authMiddleware, fileRoutes(pool));

// Start the server
const PORT = config.port;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
