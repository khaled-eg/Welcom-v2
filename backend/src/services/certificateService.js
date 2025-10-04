const Queue = require('bull');
const { createCanvas, loadImage, registerFont } = require('canvas');
const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');

class CertificateService {
  constructor() {
    // Create certificate processing queue
    this.certificateQueue = new Queue('certificate-processing', {
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379
      },
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000
        },
        removeOnComplete: false,
        removeOnFail: false
      }
    });

    this.setupWorker();
    this.setupEventListeners();

    // Paths
    this.templatesDir = path.join(__dirname, '../../assets/templates');
    this.fontsDir = path.join(__dirname, '../../assets/fonts');
    this.outputDir = process.env.CERTIFICATE_OUTPUT_DIR || path.join(__dirname, '../../output/certificates');

    // Ensure output directory exists
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }

    // Register fonts
    this.registerFonts();
  }

  /**
   * Register fonts for canvas
   */
  registerFonts() {
    try {
      const arabicFont = path.join(this.fontsDir, 'Amiri-Regular.ttf');
      const englishFont = path.join(this.fontsDir, 'Roboto-Bold.ttf');

      if (fs.existsSync(arabicFont)) {
        registerFont(arabicFont, { family: 'Amiri' });
        logger.info('✅ Arabic font registered');
      }

      if (fs.existsSync(englishFont)) {
        registerFont(englishFont, { family: 'Roboto' });
        logger.info('✅ English font registered');
      }
    } catch (error) {
      logger.error('❌ Font registration failed:', error);
    }
  }

  /**
   * Setup queue worker
   */
  setupWorker() {
    this.certificateQueue.process(async (job) => {
      const { studentName, studentId, language } = job.data;
      logger.info(`Processing certificate for student: ${studentName} (Language: ${language})`);

      try {
        // Step 1: Load template (20%)
        job.progress(20);
        await job.log('📄 جاري تحميل القالب...');

        const templateFile = language === 'ar' ? 'template_ar.png' : 'template_en.jpeg';
        const templatePath = path.join(this.templatesDir, templateFile);

        if (!fs.existsSync(templatePath)) {
          throw new Error(`Template not found: ${templatePath}`);
        }

        const template = await loadImage(templatePath);

        // Step 2: Create canvas (40%)
        job.progress(40);
        await job.log('✍️ نكتب اسمك على الشهادة...');

        const canvas = createCanvas(template.width, template.height);
        const ctx = canvas.getContext('2d');

        // Draw template
        ctx.drawImage(template, 0, 0);

        // Step 3: Add student name (70%)
        job.progress(70);
        await job.log('🖋️ نضيف التوقيع الرسمي...');

        if (language === 'ar') {
          await this.drawArabicText(ctx, studentName, canvas.width, canvas.height);
        } else {
          await this.drawEnglishText(ctx, studentName, canvas.width, canvas.height);
        }

        // Step 4: Save certificate (90%)
        job.progress(90);
        await job.log('💾 جاري الحفظ...');

        const fileName = `${studentName.replace(/\s+/g, '_')}_${language}.png`;
        const outputPath = path.join(this.outputDir, fileName);

        const buffer = canvas.toBuffer('image/png');
        fs.writeFileSync(outputPath, buffer);

        // Step 5: Generate URL
        job.progress(100);
        await job.log('🎉 تم إنشاء الشهادة بنجاح!');

        const certificateUrl = `${process.env.PUBLIC_URL}/api/certificates/download/${fileName}`;

        logger.info(`✅ Certificate generated successfully: ${outputPath}`);

        return {
          certificateUrl,
          certificatePath: outputPath,
          fileName
        };

      } catch (error) {
        logger.error('❌ Certificate processing failed:', error);
        throw error;
      }
    });
  }

  /**
   * Setup queue event listeners
   */
  setupEventListeners() {
    this.certificateQueue.on('completed', (job, result) => {
      logger.info(`Certificate job ${job.id} completed`);
    });

    this.certificateQueue.on('failed', (job, error) => {
      logger.error(`Certificate job ${job.id} failed:`, error);
    });
  }

  /**
   * Add certificate generation job to queue
   */
  async generateCertificate(studentName, studentId, language = 'ar') {
    const job = await this.certificateQueue.add({
      studentName,
      studentId,
      language
    });

    logger.info(`Certificate generation job created: ${job.id}`);
    return job.id;
  }

  /**
   * Get job status
   */
  async getJobStatus(jobId) {
    const job = await this.certificateQueue.getJob(jobId);

    if (!job) {
      throw new Error('Job not found');
    }

    const state = await job.getState();
    const progress = job._progress || 0;
    const logs = await this.certificateQueue.getJobLogs(jobId);

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
   * Draw Arabic text on canvas
   */
  async drawArabicText(ctx, text, canvasWidth, canvasHeight) {
    // Remove diacritics
    const cleanText = text.replace(/[ًٌٍَُِّْـ]/g, '');

    // Set font
    ctx.font = '130px Amiri';
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Calculate position (centered horizontally, y=900)
    const x = canvasWidth / 2;
    const y = 900;

    // Draw text
    ctx.fillText(cleanText, x, y);
  }

  /**
   * Draw English text on canvas
   */
  async drawEnglishText(ctx, text, canvasWidth, canvasHeight) {
    // Set font
    ctx.font = '80px Roboto';
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    // Position (x=1850, y=1080 as in original)
    const x = 1850;
    const y = 1080;

    // Draw text
    ctx.fillText(text, x, y);
  }

  /**
   * Clean Arabic name - remove non-Arabic characters
   */
  cleanArabicName(text) {
    return text.replace(/[^\u0600-\u06FF\s]/g, '').trim();
  }

  /**
   * Clean English name - remove non-English characters
   */
  cleanEnglishName(text) {
    return text.replace(/[^A-Za-z\s]/g, '').trim();
  }
}

module.exports = new CertificateService();
