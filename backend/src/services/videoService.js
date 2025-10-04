const Queue = require('bull');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const logger = require('../utils/logger');
const ttsService = require('./ttsService');
const redisClient = require('../config/redis');

const unlinkAsync = promisify(fs.unlink);

class VideoService {
  constructor() {
    // Create video processing queue
    this.videoQueue = new Queue('video-processing', {
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379
      },
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000
        },
        removeOnComplete: false,
        removeOnFail: false
      }
    });

    this.setupWorker();
    this.setupEventListeners();

    // Video paths
    this.introVideo = process.env.VIDEO_INTRO_PATH || path.join(__dirname, '../../assets/intro.mp4');
    this.scriptVideo = process.env.VIDEO_SCRIPT_PATH || path.join(__dirname, '../../assets/script.mp4');
    this.outputDir = process.env.VIDEO_OUTPUT_DIR || path.join(__dirname, '../../output/videos');

    // Ensure output directory exists
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  /**
   * Setup queue worker
   */
  setupWorker() {
    this.videoQueue.process(async (job) => {
      const { studentName, studentId } = job.data;
      logger.info(`Processing video for student: ${studentName} (ID: ${studentId})`);

      const tempFiles = [];

      try {
        // Step 1: Generate greeting audio (10%)
        job.progress(10);
        await job.log('🎤 جاري إنشاء الصوت...');

        const greetingText = `يا هلا يا ${studentName} بطل منصة الدلفين التعليمية `;
        const audioPath = path.join(__dirname, '../../uploads', `audio_${studentId}_${Date.now()}.wav`);
        tempFiles.push(audioPath);

        await ttsService.synthesize(greetingText, audioPath);

        // Step 2: Normalize videos (30%)
        job.progress(30);
        await job.log('🎬 جاري تجهيز الفيديو...');

        const introNormalized = path.join(__dirname, '../../uploads', `intro_norm_${studentId}.mp4`);
        const scriptNormalized = path.join(__dirname, '../../uploads', `script_norm_${studentId}.mp4`);
        tempFiles.push(introNormalized, scriptNormalized);

        await this.normalizeVideo(this.introVideo, introNormalized);
        await this.normalizeVideo(this.scriptVideo, scriptNormalized);

        // Step 3: Extend intro video with audio (50%)
        job.progress(50);
        await job.log('✨ نضيف اللمسة السحرية...');

        const introExtended = path.join(__dirname, '../../uploads', `intro_ext_${studentId}.mp4`);
        tempFiles.push(introExtended);

        await this.extendVideoWithAudio(introNormalized, audioPath, introExtended);

        // Step 4: Concatenate videos (80%)
        job.progress(80);
        await job.log('🎯 اقتربنا من النهاية...');

        const finalOutput = path.join(this.outputDir, `${studentName.replace(/\s+/g, '_')}_G2025.mp4`);
        await this.concatenateVideos([introExtended, scriptNormalized], finalOutput);

        // Step 5: Generate URL (95%)
        job.progress(95);
        const videoUrl = `${process.env.PUBLIC_URL}/api/videos/download/${path.basename(finalOutput)}`;

        // Cleanup temp files
        await this.cleanupTempFiles(tempFiles);

        // Complete
        job.progress(100);
        await job.log('🎉 تم إنشاء الفيديو بنجاح!');

        logger.info(`✅ Video generated successfully: ${finalOutput}`);

        return {
          videoUrl,
          videoPath: finalOutput,
          fileName: path.basename(finalOutput)
        };

      } catch (error) {
        logger.error('❌ Video processing failed:', error);

        // Cleanup temp files on error
        await this.cleanupTempFiles(tempFiles);

        throw error;
      }
    });
  }

  /**
   * Setup queue event listeners
   */
  setupEventListeners() {
    this.videoQueue.on('completed', (job, result) => {
      logger.info(`Job ${job.id} completed with result:`, result);
    });

    this.videoQueue.on('failed', (job, error) => {
      logger.error(`Job ${job.id} failed:`, error);
    });

    this.videoQueue.on('progress', (job, progress) => {
      logger.debug(`Job ${job.id} progress: ${progress}%`);
    });
  }

  /**
   * Add video generation job to queue
   */
  async generateVideo(studentName, studentId) {
    const job = await this.videoQueue.add({
      studentName,
      studentId
    });

    logger.info(`Video generation job created: ${job.id}`);
    return job.id;
  }

  /**
   * Get job status and progress
   */
  async getJobStatus(jobId) {
    const job = await this.videoQueue.getJob(jobId);

    if (!job) {
      throw new Error('Job not found');
    }

    const state = await job.getState();
    const progress = job._progress || 0;
    const logs = await this.videoQueue.getJobLogs(jobId);

    return {
      id: jobId,
      state,
      progress,
      result: job.returnvalue,
      failedReason: job.failedReason,
      logs: logs.logs || []
    };
  }

  /**
   * Normalize video to 1080x1920, 30fps
   */
  normalizeVideo(inputPath, outputPath) {
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .videoFilters([
          'scale=1080:1920:force_original_aspect_ratio=decrease',
          'setsar=1',
          'pad=1080:1920:(1080-iw)/2:(1920-ih)/2:color=black',
          'fps=30'
        ])
        .videoCodec('libx264')
        .addOptions(['-preset', 'faster', '-crf', '23'])
        .audioCodec('aac')
        .audioFrequency(44100)
        .audioChannels(2)
        .fps(30)
        .on('end', () => {
          logger.info(`Video normalized: ${outputPath}`);
          resolve(outputPath);
        })
        .on('error', (err) => {
          logger.error('Video normalization error:', err);
          reject(err);
        })
        .save(outputPath);
    });
  }

  /**
   * Extend video with audio overlay
   */
  async extendVideoWithAudio(videoPath, audioPath, outputPath) {
    const videoDuration = await this.getVideoDuration(videoPath);
    const audioDuration = await ttsService.getAudioDuration(audioPath);

    // If audio is longer, extend video
    if (audioDuration > videoDuration + 0.05) {
      const extensionDuration = Math.min(5.0, audioDuration - videoDuration);

      // Extract last frame
      const freezeFrame = path.join(path.dirname(outputPath), `freeze_${Date.now()}.jpg`);
      await this.extractLastFrame(videoPath, freezeFrame);

      // Create extended part
      const extendedPart = path.join(path.dirname(outputPath), `extended_${Date.now()}.mp4`);
      await this.createVideoFromImage(freezeFrame, extensionDuration, extendedPart);

      // Concatenate original + extended
      const extendedVideo = path.join(path.dirname(outputPath), `concat_${Date.now()}.mp4`);
      await this.concatenateVideos([videoPath, extendedPart], extendedVideo);

      // Merge with audio
      await this.mergeAudioWithVideo(extendedVideo, audioPath, outputPath);

      // Cleanup
      [freezeFrame, extendedPart, extendedVideo].forEach(file => {
        if (fs.existsSync(file)) fs.unlinkSync(file);
      });
    } else {
      // Just merge audio
      await this.mergeAudioWithVideo(videoPath, audioPath, outputPath);
    }

    return outputPath;
  }

  /**
   * Get video duration
   */
  getVideoDuration(videoPath) {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(videoPath, (err, metadata) => {
        if (err) reject(err);
        else resolve(metadata.format.duration);
      });
    });
  }

  /**
   * Extract last frame from video
   */
  extractLastFrame(videoPath, outputPath) {
    return new Promise(async (resolve, reject) => {
      const duration = await this.getVideoDuration(videoPath);
      const seekTime = Math.max(0, duration - 0.05);

      ffmpeg(videoPath)
        .seekInput(seekTime)
        .frames(1)
        .on('end', () => resolve(outputPath))
        .on('error', reject)
        .save(outputPath);
    });
  }

  /**
   * Create video from static image
   */
  createVideoFromImage(imagePath, duration, outputPath) {
    return new Promise((resolve, reject) => {
      ffmpeg()
        .input(imagePath)
        .inputOptions(['-loop 1'])
        .duration(duration)
        .videoFilters([
          'scale=1080:1920:force_original_aspect_ratio=decrease',
          'setsar=1',
          'pad=1080:1920:(1080-iw)/2:(1920-ih)/2:color=black',
          'fps=30',
          'format=yuv420p'
        ])
        .videoCodec('libx264')
        .addOptions(['-preset', 'faster', '-crf', '23'])
        .on('end', () => resolve(outputPath))
        .on('error', reject)
        .save(outputPath);
    });
  }

  /**
   * Merge audio with video
   */
  mergeAudioWithVideo(videoPath, audioPath, outputPath) {
    return new Promise((resolve, reject) => {
      ffmpeg()
        .input(videoPath)
        .input(audioPath)
        .videoFilters('fps=30,format=yuv420p')
        .outputOptions([
          '-map 0:v:0',
          '-map 1:a:0',
          '-c:v libx264',
          '-preset faster',
          '-crf 23',
          '-c:a aac',
          '-b:a 192k',
          '-ar 44100',
          '-ac 2',
          '-shortest',
          '-movflags +faststart'
        ])
        .on('end', () => resolve(outputPath))
        .on('error', reject)
        .save(outputPath);
    });
  }

  /**
   * Concatenate multiple videos
   */
  concatenateVideos(videoPaths, outputPath) {
    return new Promise((resolve, reject) => {
      const filterComplex = videoPaths
        .map((_, i) => `[${i}:v:0][${i}:a:0]`)
        .join('') + `concat=n=${videoPaths.length}:v=1:a=1[outv][outa]`;

      const command = ffmpeg();

      videoPaths.forEach(videoPath => {
        command.input(videoPath);
      });

      command
        .complexFilter(filterComplex)
        .outputOptions([
          '-map [outv]',
          '-map [outa]',
          '-c:v libx264',
          '-preset faster',
          '-crf 23',
          '-pix_fmt yuv420p',
          '-r 30',
          '-c:a aac',
          '-b:a 192k',
          '-ar 44100',
          '-ac 2',
          '-movflags +faststart'
        ])
        .on('end', () => resolve(outputPath))
        .on('error', reject)
        .save(outputPath);
    });
  }

  /**
   * Cleanup temporary files
   */
  async cleanupTempFiles(files) {
    for (const file of files) {
      try {
        if (fs.existsSync(file)) {
          await unlinkAsync(file);
          logger.debug(`Cleaned up temp file: ${file}`);
        }
      } catch (error) {
        logger.warn(`Failed to cleanup temp file ${file}:`, error);
      }
    }
  }
}

module.exports = new VideoService();
