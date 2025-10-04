const express = require('express');
const router = express.Router();

const studentRoutes = require('./studentRoutes');
const videoRoutes = require('./videoRoutes');
const certificateRoutes = require('./certificateRoutes');

// Mount routes
router.use('/students', studentRoutes);
router.use('/videos', videoRoutes);
router.use('/certificates', certificateRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
