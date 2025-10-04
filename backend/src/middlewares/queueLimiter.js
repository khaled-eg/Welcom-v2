const redisClient = require('../config/redis');
const logger = require('../utils/logger');

/**
 * Queue limiter to prevent overwhelming the system
 * Limits concurrent jobs in processing
 */
class QueueLimiter {
  constructor(maxConcurrent = 10) {
    this.maxConcurrent = maxConcurrent;
    this.queueKey = 'queue:active_jobs';
  }

  /**
   * Check if we can accept more jobs
   */
  async canAcceptJob() {
    try {
      const activeJobs = await redisClient.get(this.queueKey);
      const count = parseInt(activeJobs || '0');

      return count < this.maxConcurrent;
    } catch (error) {
      logger.error('Queue limiter check error:', error);
      return true; // Fail open
    }
  }

  /**
   * Increment active jobs counter
   */
  async incrementJobs() {
    try {
      await redisClient.incr(this.queueKey);
    } catch (error) {
      logger.error('Queue limiter increment error:', error);
    }
  }

  /**
   * Decrement active jobs counter
   */
  async decrementJobs() {
    try {
      const current = await redisClient.get(this.queueKey);
      if (parseInt(current || '0') > 0) {
        await redisClient.decr(this.queueKey);
      }
    } catch (error) {
      logger.error('Queue limiter decrement error:', error);
    }
  }

  /**
   * Get current active jobs count
   */
  async getActiveCount() {
    try {
      const count = await redisClient.get(this.queueKey);
      return parseInt(count || '0');
    } catch (error) {
      logger.error('Queue limiter get count error:', error);
      return 0;
    }
  }

  /**
   * Middleware to limit queue acceptance
   */
  middleware() {
    return async (req, res, next) => {
      const canAccept = await this.canAcceptJob();

      if (!canAccept) {
        const activeCount = await this.getActiveCount();

        logger.warn(`Queue limit reached: ${activeCount}/${this.maxConcurrent} active jobs`);

        return res.status(503).json({
          status: 'error',
          message: 'النظام مشغول حالياً، يرجى المحاولة بعد قليل',
          retryAfter: 30 // seconds
        });
      }

      next();
    };
  }
}

module.exports = new QueueLimiter(
  parseInt(process.env.MAX_CONCURRENT_JOBS) || 10
);
