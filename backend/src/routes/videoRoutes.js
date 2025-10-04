const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videoController');

/**
 * @route   GET /api/videos/status/:jobId
 * @desc    Get video generation job status
 * @access  Public
 */
router.get('/status/:jobId', videoController.getVideoStatus);

/**
 * @route   GET /api/videos/download/:filename
 * @desc    Download video file
 * @access  Public
 */
router.get('/download/:filename', videoController.downloadVideo);

/**
 * @route   GET /api/videos/stream/:filename
 * @desc    Stream video file
 * @access  Public
 */
router.get('/stream/:filename', videoController.streamVideo);

module.exports = router;
