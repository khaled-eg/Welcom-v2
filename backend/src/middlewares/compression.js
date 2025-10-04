const compression = require('compression');

/**
 * Compression middleware with custom filter
 */
const compressionMiddleware = compression({
  filter: (req, res) => {
    // Don't compress if client doesn't support it
    if (req.headers['x-no-compression']) {
      return false;
    }

    // Use compression for all responses
    return compression.filter(req, res);
  },
  level: 6, // Compression level (0-9)
  threshold: 1024, // Only compress if size > 1KB
});

module.exports = compressionMiddleware;
