const logger = require('../utils/logger');

/**
 * Error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  logger.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip
  });

  // Default error
  let statusCode = err.statusCode || 500;
  let message = err.message || 'حدث خطأ في الخادم';

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = err.message;
  }

  if (err.name === 'UnauthorizedError') {
    statusCode = 401;
    message = 'غير مصرح';
  }

  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'بيانات غير صحيحة';
  }

  // Send error response
  res.status(statusCode).json({
    status: 'error',
    message,
    ...(process.env.NODE_ENV === 'development' && {
      error: err.message,
      stack: err.stack
    })
  });
};

/**
 * Not found handler
 */
const notFound = (req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'الصفحة غير موجودة'
  });
};

module.exports = {
  errorHandler,
  notFound
};
