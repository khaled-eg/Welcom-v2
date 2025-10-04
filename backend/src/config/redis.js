const Redis = require('ioredis');
const logger = require('../utils/logger');

const redisClient = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3
});

redisClient.on('connect', () => {
  logger.info('✅ Redis connected successfully');
});

redisClient.on('error', (error) => {
  logger.error('❌ Redis connection error:', error);
});

redisClient.on('ready', () => {
  logger.info('✅ Redis is ready to accept commands');
});

module.exports = redisClient;
