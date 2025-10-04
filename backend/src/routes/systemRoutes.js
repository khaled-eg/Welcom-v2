const express = require('express');
const router = express.Router();
const clusterManager = require('../utils/cluster');
const queueLimiter = require('../middlewares/queueLimiter');
const videoService = require('../services/videoService');
const certificateService = require('../services/certificateService');

/**
 * @route   GET /api/system/health
 * @desc    Health check endpoint
 * @access  Public
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

/**
 * @route   GET /api/system/stats
 * @desc    Get system statistics
 * @access  Public (should be protected in production)
 */
router.get('/stats', async (req, res) => {
  try {
    const clusterStats = clusterManager.getStats();
    const activeJobs = await queueLimiter.getActiveCount();

    // Get queue stats
    const videoQueueCounts = await videoService.videoQueue.getJobCounts();
    const certQueueCounts = await certificateService.certificateQueue.getJobCounts();

    res.status(200).json({
      status: 'success',
      data: {
        cluster: clusterStats,
        queues: {
          video: videoQueueCounts,
          certificate: certQueueCounts,
          activeJobs
        },
        memory: process.memoryUsage(),
        uptime: process.uptime()
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to get stats'
    });
  }
});

module.exports = router;
