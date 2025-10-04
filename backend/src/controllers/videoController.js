const videoService = require('../services/videoService');
const { Request, GeneratedFile } = require('../models');
const logger = require('../utils/logger');
const path = require('path');
const fs = require('fs');

/**
 * Get video job status
 */
exports.getVideoStatus = async (req, res) => {
  try {
    const { jobId } = req.params;

    const status = await videoService.getJobStatus(jobId);

    // Update request log
    if (status.state === 'completed') {
      await Request.update(
        { status: 'completed', completedAt: new Date() },
        { where: { jobId } }
      );

      // Log generated file
      const request = await Request.findOne({ where: { jobId } });
      if (request && status.result) {
        const fileSize = fs.statSync(status.result.videoPath).size;

        await GeneratedFile.create({
          studentId: request.studentId,
          fileType: 'video',
          filePath: status.result.videoPath,
          fileUrl: status.result.videoUrl,
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
    logger.error('Get video status error:', error);
    res.status(500).json({
      status: 'error',
      message: 'حدث خطأ أثناء جلب حالة الفيديو'
    });
  }
};

/**
 * Download video file
 */
exports.downloadVideo = async (req, res) => {
  try {
    const { filename } = req.params;

    // Security check - prevent directory traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({
        status: 'error',
        message: 'اسم ملف غير صحيح'
      });
    }

    const outputDir = process.env.VIDEO_OUTPUT_DIR || path.join(__dirname, '../../output/videos');
    const filePath = path.join(outputDir, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        status: 'error',
        message: 'الملف غير موجود'
      });
    }

    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

  } catch (error) {
    logger.error('Download video error:', error);
    res.status(500).json({
      status: 'error',
      message: 'حدث خطأ أثناء تحميل الفيديو'
    });
  }
};

/**
 * Stream video file
 */
exports.streamVideo = async (req, res) => {
  try {
    const { filename } = req.params;

    // Security check
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({
        status: 'error',
        message: 'اسم ملف غير صحيح'
      });
    }

    const outputDir = process.env.VIDEO_OUTPUT_DIR || path.join(__dirname, '../../output/videos');
    const filePath = path.join(outputDir, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        status: 'error',
        message: 'الملف غير موجود'
      });
    }

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;
      const file = fs.createReadStream(filePath, { start, end });
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'video/mp4',
      };

      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4',
      };
      res.writeHead(200, head);
      fs.createReadStream(filePath).pipe(res);
    }

  } catch (error) {
    logger.error('Stream video error:', error);
    res.status(500).json({
      status: 'error',
      message: 'حدث خطأ أثناء تشغيل الفيديو'
    });
  }
};
