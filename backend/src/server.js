require('dotenv').config();
const clusterManager = require('./utils/cluster');
const logger = require('./utils/logger');

/**
 * Start server with clustering if enabled
 */
const startServer = () => {
  // Check if clustering is enabled
  const useCluster = process.env.USE_CLUSTER === 'true' && process.env.NODE_ENV === 'production';

  if (useCluster) {
    // Start with cluster
    clusterManager.start(() => {
      require('./app');
    });
  } else {
    // Start without cluster (development)
    logger.info('🔧 Starting in single-process mode (development)');
    require('./app');
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('💥 Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle SIGINT (Ctrl+C)
process.on('SIGINT', () => {
  logger.info('👋 SIGINT received, shutting down gracefully...');
  process.exit(0);
});

// Start server
startServer();
