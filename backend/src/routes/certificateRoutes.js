const express = require('express');
const router = express.Router();
const certificateController = require('../controllers/certificateController');

/**
 * @route   GET /api/certificates/status/:jobId
 * @desc    Get certificate generation job status
 * @access  Public
 */
router.get('/status/:jobId', certificateController.getCertificateStatus);

/**
 * @route   GET /api/certificates/download/:filename
 * @desc    Download certificate file
 * @access  Public
 */
router.get('/download/:filename', certificateController.downloadCertificate);

/**
 * @route   GET /api/certificates/view/:filename
 * @desc    View certificate in browser
 * @access  Public
 */
router.get('/view/:filename', certificateController.viewCertificate);

module.exports = router;
