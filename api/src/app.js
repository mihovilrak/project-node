const express = require('express');
const config = require('./config');
const { Pool } = require('pg');
const path = require('path');
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
const authMiddleware = require('./middleware/authMiddleware');
const sessionMiddleware = require('./middleware/sessionMiddleware');
const cors = require('cors');

// Create Express app
const app = express();

app.use(cors({
  credentials: true,
  origin: config.feUrl,
  optionsSuccessStatus: 200
}));

app.use(express.json());

// PostgreSQL connection pool
const pool = new Pool({
  connectionString: config.databaseUrl
});

// Session cookie middleware
app.use(
  sessionMiddleware(pool, config.sessionSecret)
);

// Test database connection
pool.connect(err => {
  if (err) {
    console.error('Error connecting to database:', err.stack);
  } else {
    console.log('Connected to database');
  }
});

// Define routes
app.use('/api/login', loginRoute(pool));
app.use('/api/logout', logoutRoute());
app.use('/api/projects', authMiddleware, projectRoutes(pool));
app.use('/api/tasks', authMiddleware, taskRoutes(pool));
app.use('/api/users', authMiddleware, userRoutes(pool));
app.use('/api/roles', roleRouter(pool));
app.use('/api/comments', authMiddleware, commentRoutes(pool));
app.use('/api/notifications', authMiddleware, notificationRoutes(pool));
app.use('/api/files', authMiddleware, fileRoutes(pool));
app.use('/api/check-session', sessionRoute());

// Serve React build files for production
app.use(express.static(path.join(__dirname, 'client/build')));

// Handle React routing, return all requests to `index.html`
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

// Start the server
const PORT = config.port;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
