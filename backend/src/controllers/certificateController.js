const certificateService = require('../services/certificateService');
const { Request, GeneratedFile } = require('../models');
const logger = require('../utils/logger');
const path = require('path');
const fs = require('fs');

/**
 * Get certificate job status
 */
exports.getCertificateStatus = async (req, res) => {
  try {
    const { jobId } = req.params;

    const status = await certificateService.getJobStatus(jobId);

    // Update request log
    if (status.state === 'completed') {
      await Request.update(
        { status: 'completed', completedAt: new Date() },
        { where: { jobId } }
      );

      // Log generated file
      const request = await Request.findOne({ where: { jobId } });
      if (request && status.result) {
        const fileSize = fs.statSync(status.result.certificatePath).size;

        await GeneratedFile.create({
          studentId: request.studentId,
          fileType: request.requestType,
          filePath: status.result.certificatePath,
          fileUrl: status.result.certificateUrl,
          fileSize
        });
      }
    } else if (status.state === 'failed') {
      await Request.update(
        { status: 'failed', errorMessage: status.failedReason },
        { where: { jobId } }
      );
    }

    res.status(200).json({
      status: 'success',
      data: status
    });

  } catch (error) {
    logger.error('Get certificate status error:', error);
    res.status(500).json({
      status: 'error',
      message: 'حدث خطأ أثناء جلب حالة الشهادة'
    });
  }
};

/**
 * Download certificate file
 */
exports.downloadCertificate = async (req, res) => {
  try {
    const { filename } = req.params;

    // Security check - prevent directory traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({
        status: 'error',
        message: 'اسم ملف غير صحيح'
      });
    }

    const outputDir = process.env.CERTIFICATE_OUTPUT_DIR || path.join(__dirname, '../../output/certificates');
    const filePath = path.join(outputDir, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        status: 'error',
        message: 'الشهادة غير موجودة'
      });
    }

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

  } catch (error) {
    logger.error('Download certificate error:', error);
    res.status(500).json({
      status: 'error',
      message: 'حدث خطأ أثناء تحميل الشهادة'
    });
  }
};

/**
 * View certificate in browser
 */
exports.viewCertificate = async (req, res) => {
  try {
    const { filename } = req.params;

    // Security check
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({
        status: 'error',
        message: 'اسم ملف غير صحيح'
      });
    }

    const outputDir = process.env.CERTIFICATE_OUTPUT_DIR || path.join(__dirname, '../../output/certificates');
    const filePath = path.join(outputDir, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        status: 'error',
        message: 'الشهادة غير موجودة'
      });
    }

    res.setHeader('Content-Type', 'image/png');
    res.sendFile(filePath);

  } catch (error) {
    logger.error('View certificate error:', error);
    res.status(500).json({
      status: 'error',
      message: 'حدث خطأ أثناء عرض الشهادة'
    });
  }
};
