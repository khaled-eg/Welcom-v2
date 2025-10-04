const { Student, Request, GeneratedFile } = require('../models');
const logger = require('../utils/logger');
const videoService = require('../services/videoService');
const certificateService = require('../services/certificateService');

/**
 * Register new student
 */
exports.register = async (req, res) => {
  try {
    const { studentName, phoneNumber, gradeLevel } = req.body;

    // Check if phone number already exists
    const existingStudent = await Student.findOne({ where: { phoneNumber } });

    if (existingStudent) {
      return res.status(200).json({
        status: 'success',
        message: 'تم العثور على الطالب المسجل مسبقاً',
        data: {
          studentId: existingStudent.id,
          student: existingStudent,
          isExisting: true
        }
      });
    }

    // Create new student
    const student = await Student.create({
      studentName,
      phoneNumber,
      gradeLevel
    });

    logger.info(`New student registered: ${studentName} (ID: ${student.id})`);

    res.status(201).json({
      status: 'success',
      message: 'تم تسجيل الطالب بنجاح',
      data: {
        studentId: student.id,
        student,
        isExisting: false
      }
    });

  } catch (error) {
    logger.error('Student registration error:', error);

    // Handle validation errors
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        status: 'error',
        message: error.errors[0].message
      });
    }

    // Handle unique constraint errors
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        status: 'error',
        message: 'رقم الهاتف مسجل مسبقاً'
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'حدث خطأ أثناء التسجيل'
    });
  }
};

/**
 * Get student information
 */
exports.getStudentInfo = async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await Student.findByPk(studentId, {
      include: [
        { model: Request, as: 'requests' },
        { model: GeneratedFile, as: 'files' }
      ]
    });

    if (!student) {
      return res.status(404).json({
        status: 'error',
        message: 'الطالب غير موجود'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { student }
    });

  } catch (error) {
    logger.error('Get student info error:', error);
    res.status(500).json({
      status: 'error',
      message: 'حدث خطأ أثناء جلب معلومات الطالب'
    });
  }
};

/**
 * Generate both video and certificate for student
 */
exports.generateContent = async (req, res) => {
  try {
    const { studentId } = req.body;

    // Get student info
    const student = await Student.findByPk(studentId);

    if (!student) {
      return res.status(404).json({
        status: 'error',
        message: 'الطالب غير موجود'
      });
    }

    // Start video generation
    const videoJobId = await videoService.generateVideo(student.studentName, student.id);

    // Create video request log
    await Request.create({
      studentId: student.id,
      requestType: 'video',
      status: 'processing',
      jobId: videoJobId
    });

    // Start certificate generation
    const certificateJobId = await certificateService.generateCertificate(
      student.studentName,
      student.id,
      'ar'
    );

    // Create certificate request log
    await Request.create({
      studentId: student.id,
      requestType: 'certificate_ar',
      status: 'processing',
      jobId: certificateJobId
    });

    logger.info(`Content generation started for student ${student.id}`);

    res.status(200).json({
      status: 'success',
      message: 'تم بدء إنشاء المحتوى',
      data: {
        videoJobId,
        certificateJobId
      }
    });

  } catch (error) {
    logger.error('Generate content error:', error);
    res.status(500).json({
      status: 'error',
      message: 'حدث خطأ أثناء إنشاء المحتوى'
    });
  }
};
