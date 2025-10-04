require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

const logger = require('./utils/logger');
const { testConnection, syncDatabase } = require('./config/database');
const ttsService = require('./services/ttsService');
const { errorHandler, notFound } = require('./middlewares/errorHandler');
const { apiLimiter } = require('./middlewares/rateLimiter');
const requestLogger = require('./middlewares/requestLogger');
const compressionMiddleware = require('./middlewares/compression');
const queueLimiter = require('./middlewares/queueLimiter');
const routes = require('./routes');
const systemRoutes = require('./routes/systemRoutes');

// Create Express app
const app = express();

// ========================================
// MIDDLEWARE
// ========================================

// Security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false
}));

// CORS
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? [process.env.PUBLIC_URL, 'https://learnadolphin.com']
    : '*',
  credentials: true
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compressionMiddleware);

// Request logging
app.use(requestLogger);

// Trust proxy (for rate limiting behind reverse proxy)
app.set('trust proxy', 1);

// Rate limiting for API
app.use('/api', apiLimiter);

// ========================================
// ROUTES
// ========================================

// Static files (for serving frontend in production)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../frontend/dist')));
}

// System routes (health, stats)
app.use('/api/system', systemRoutes);

// API routes with queue limiter for resource-intensive operations
app.use('/api/students/generate', queueLimiter.middleware());
app.use('/api', routes);

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
  });
}

// ========================================
// ERROR HANDLING
// ========================================

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

// ========================================
// STARTUP
// ========================================

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    const isWorker = require('cluster').isWorker;
    const processId = process.pid;

    logger.info('='.repeat(50));
    logger.info(`🐬 Dolphin Learning Platform - ${isWorker ? 'Worker' : 'Server'} Starting...`);
    logger.info(`📍 Process ID: ${processId}`);
    logger.info('='.repeat(50));

    // Test database connection
    logger.info('📦 Testing database connection...');
    const dbConnected = await testConnection();
    if (!dbConnected) {
      throw new Error('Database connection failed');
    }

    // Sync database (only in master or single process)
    if (!isWorker || process.env.USE_CLUSTER !== 'true') {
      logger.info('🔄 Synchronizing database...');
      await syncDatabase();
    }

    // Test Azure TTS
    logger.info('🎤 Testing Azure TTS connection...');
    await ttsService.testConnection();

    // Create required directories
    const fs = require('fs');
    const dirs = [
      './uploads',
      './output/videos',
      './output/certificates',
      './assets/templates',
      './assets/fonts',
      './logs'
    ];

    dirs.forEach(dir => {
      const fullPath = path.join(__dirname, '..', dir);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
        logger.info(`📁 Created directory: ${dir}`);
      }
    });

    // Start server
    app.listen(PORT, () => {
      logger.info('='.repeat(50));
      logger.info(`✅ ${isWorker ? 'Worker' : 'Server'} is running on port ${PORT}`);
      logger.info(`🔧 Process: ${processId}`);
      logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🔗 API URL: http://localhost:${PORT}/api`);
      logger.info(`🏥 Health check: http://localhost:${PORT}/api/system/health`);
      logger.info(`📊 Stats: http://localhost:${PORT}/api/system/stats`);
      logger.info('='.repeat(50));
    });

  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

// Start server
startServer();

module.exports = app;
