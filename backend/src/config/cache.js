const redisClient = require('./redis');
const logger = require('../utils/logger');

/**
 * Cache middleware with Redis
 */
class CacheService {
  constructor() {
    this.defaultTTL = 3600; // 1 hour
  }

  /**
   * Get cached data
   */
  async get(key) {
    try {
      const data = await redisClient.get(key);
      if (data) {
        logger.debug(`Cache HIT: ${key}`);
        return JSON.parse(data);
      }
      logger.debug(`Cache MISS: ${key}`);
      return null;
    } catch (error) {
      logger.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Set cache data
   */
  async set(key, data, ttl = this.defaultTTL) {
    try {
      await redisClient.setex(key, ttl, JSON.stringify(data));
      logger.debug(`Cache SET: ${key} (TTL: ${ttl}s)`);
      return true;
    } catch (error) {
      logger.error('Cache set error:', error);
      return false;
    }
  }

  /**
   * Delete cache key
   */
  async del(key) {
    try {
      await redisClient.del(key);
      logger.debug(`Cache DEL: ${key}`);
      return true;
    } catch (error) {
      logger.error('Cache delete error:', error);
      return false;
    }
  }

  /**
   * Clear all cache with pattern
   */
  async clearPattern(pattern) {
    try {
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(...keys);
        logger.info(`Cache cleared: ${keys.length} keys matching ${pattern}`);
      }
      return true;
    } catch (error) {
      logger.error('Cache clear pattern error:', error);
      return false;
    }
  }

  /**
   * Cache middleware for Express
   */
  middleware(ttl = this.defaultTTL) {
    return async (req, res, next) => {
      // Only cache GET requests
      if (req.method !== 'GET') {
        return next();
      }

      const key = `cache:${req.originalUrl}`;

      try {
        const cachedData = await this.get(key);

        if (cachedData) {
          return res.json(cachedData);
        }

        // Store original send function
        const originalSend = res.json;

        // Override send function
        res.json = function (data) {
          // Cache the response
          cacheService.set(key, data, ttl);

          // Call original send
          originalSend.call(this, data);
        };

        next();
      } catch (error) {
        logger.error('Cache middleware error:', error);
        next();
      }
    };
  }
}

const cacheService = new CacheService();

module.exports = cacheService;
