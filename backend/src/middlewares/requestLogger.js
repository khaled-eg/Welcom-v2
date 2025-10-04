const logger = require('../utils/logger');

/**
 * Request logger middleware with timing
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();

  // Log request
  logger.info(`→ ${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent')
  });

  // Log response
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logLevel = res.statusCode >= 400 ? 'error' : 'info';

    logger[logLevel](`← ${req.method} ${req.path} ${res.statusCode} - ${duration}ms`, {
      ip: req.ip,
      duration,
      statusCode: res.statusCode
    });
  });

  next();
};

module.exports = requestLogger;
