// backend/src/index.js (updated for Railway)
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const logger = require('./utils/logger');

// Import routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const contentRoutes = require('./routes/content.routes');
const personaRoutes = require('./routes/persona.routes');
const feedRoutes = require('./routes/feed.routes');
const insightsRoutes = require('./routes/insights.routes');
const companyRoutes = require('./routes/company.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy for Railway
app.set('trust proxy', 1);

// Configure CORS for Railway deployment
const corsOptions = {
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept']
};

app.use(cors(corsOptions));

// Middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false, // Disable for Railway compatibility
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging - more concise for production
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined', { 
    stream: { write: message => logger.info(message.trim()) }
  }));
} else {
  app.use(morgan('dev', { 
    stream: { write: message => logger.info(message.trim()) }
  }));
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/personas', personaRoutes);
app.use('/api/feed', feedRoutes);
app.use('/api/insights', insightsRoutes);
app.use('/api/companies', companyRoutes);

// Root route with API info
app.get('/', (req, res) => {
  res.json({ 
    message: "Welcome to MVP Dashboard API",
    version: "1.0.0",
    environment: process.env.NODE_ENV,
    endpoints: {
      health: "/health",
      auth: "/api/auth",
      users: "/api/users",
      content: "/api/content",
      personas: "/api/personas",
      feed: "/api/feed",
      insights: "/api/insights",
      companies: "/api/companies"
    }
  });
});

// Enhanced health check for Railway monitoring
app.get('/health', async (req, res) => {
  try {
    // Test database connection
    const db = require('./models/db');
    await db.query('SELECT 1');
    
    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      database: 'Connected',
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || "1.0.0"
    });
  } catch (error) {
    logger.error(`Health check failed: ${error.message}`);
    res.status(503).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: 'Disconnected',
      error: error.message
    });
  }
});

// API status endpoint
app.get('/api/status', (req, res) => {
  res.json({
    api: 'MVP Dashboard API',
    status: 'Running',
    version: "1.0.0",
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    message: "Route not found",
    availableEndpoints: [
      'GET /',
      'GET /health',
      'GET /api/status',
      'POST /api/auth/login',
      'POST /api/auth/register',
      'GET /api/users',
      'GET /api/content',
      'GET /api/personas',
      'GET /api/feed',
      'GET /api/insights',
      'GET /api/companies'
    ]
  });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  logger.error(`Error: ${err.message}`, {
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip
  });
  
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  logger.info(`🚀 Server is running on port ${PORT}`);
  logger.info(`📱 Environment: ${process.env.NODE_ENV}`);
  logger.info(`🌐 Health check: http://localhost:${PORT}/health`);
});

// Handle server errors
server.on('error', (error) => {
  if (error.syscall !== 'listen') {
    throw error;
  }

  switch (error.code) {
    case 'EACCES':
      logger.error(`Port ${PORT} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      logger.error(`Port ${PORT} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
});

module.exports = app;