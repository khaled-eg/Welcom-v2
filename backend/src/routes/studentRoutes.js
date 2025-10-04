const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { validate, validateParams } = require('../middlewares/validation');
const { strictLimiter } = require('../middlewares/rateLimiter');

/**
 * @route   POST /api/students/register
 * @desc    Register new student
 * @access  Public
 */
router.post(
  '/register',
  validate('registerStudent'),
  studentController.register
);

/**
 * @route   GET /api/students/:studentId
 * @desc    Get student information
 * @access  Public
 */
router.get(
  '/:studentId',
  validateParams('studentId'),
  studentController.getStudentInfo
);

/**
 * @route   POST /api/students/generate
 * @desc    Generate video and certificate for student
 * @access  Public
 */
router.post(
  '/generate',
  strictLimiter,
  validate('generateContent'),
  studentController.generateContent
);

module.exports = router;
