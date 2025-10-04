const sdk = require('microsoft-cognitiveservices-speech-sdk');
const logger = require('../utils/logger');
const fs = require('fs');
const path = require('path');

class TTSService {
  constructor() {
    this.speechConfig = sdk.SpeechConfig.fromSubscription(
      process.env.AZURE_SPEECH_KEY,
      process.env.AZURE_SPEECH_REGION
    );
    this.speechConfig.speechSynthesisVoiceName = process.env.AZURE_VOICE_NAME || 'ar-LB-LaylaNeural';
  }

  /**
   * Test Azure TTS connection
   */
  async testConnection() {
    try {
      const testText = 'اختبار الاتصال';
      const tempFile = path.join(__dirname, '../../uploads', 'test_tts.mp3');

      const audioConfig = sdk.AudioConfig.fromAudioFileOutput(tempFile);
      const synthesizer = new sdk.SpeechSynthesizer(this.speechConfig, audioConfig);

      return new Promise((resolve, reject) => {
        synthesizer.speakTextAsync(
          testText,
          result => {
            synthesizer.close();
            if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
              // Clean up test file
              if (fs.existsSync(tempFile)) {
                fs.unlinkSync(tempFile);
              }
              logger.info('✅ Azure TTS connection successful');
              resolve(true);
            } else {
              reject(new Error(`TTS test failed: ${result.errorDetails}`));
            }
          },
          error => {
            synthesizer.close();
            reject(error);
          }
        );
      });
    } catch (error) {
      logger.error('❌ Azure TTS connection failed:', error);
      return false;
    }
  }

  /**
   * Generate speech from text using Azure TTS
   * @param {string} text - Arabic text to synthesize
   * @param {string} outputPath - Output file path
   * @returns {Promise<string>} - Path to generated audio file
   */
  async synthesize(text, outputPath) {
    try {
      logger.info(`Starting TTS synthesis for text: ${text.substring(0, 50)}...`);

      // Clean text - remove specific diacritics
      const cleanText = text
        .replace(/يَا هَلَا فِييييييكْ يَا/g, 'اهلا')
        .replace(/مُنْتَظِرِينْكْ بِكُلّ حَمَاسَةْ فِي/g, 'نتمنى لك التوفيق في');

      // Create SSML with prosody adjustments
      const ssml = `
        <speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='ar-LB'>
          <voice name='${this.speechConfig.speechSynthesisVoiceName}'>
            <prosody rate="4%" pitch="+14%">
              ${cleanText}
            </prosody>
          </voice>
        </speak>
      `;

      const audioConfig = sdk.AudioConfig.fromAudioFileOutput(outputPath);
      const synthesizer = new sdk.SpeechSynthesizer(this.speechConfig, audioConfig);

      return new Promise((resolve, reject) => {
        synthesizer.speakSsmlAsync(
          ssml,
          result => {
            synthesizer.close();

            if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
              logger.info(`✅ TTS synthesis completed: ${outputPath}`);
              resolve(outputPath);
            } else {
              const error = new Error(`TTS synthesis failed: ${result.errorDetails}`);
              logger.error('❌ TTS synthesis error:', error);
              reject(error);
            }
          },
          error => {
            synthesizer.close();
            logger.error('❌ TTS synthesis error:', error);
            reject(error);
          }
        );
      });
    } catch (error) {
      logger.error('❌ TTS synthesis failed:', error);
      throw error;
    }
  }

  /**
   * Get audio duration using ffprobe
   * @param {string} audioPath - Path to audio file
   * @returns {Promise<number>} - Duration in seconds
   */
  async getAudioDuration(audioPath) {
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execPromise = promisify(exec);

    try {
      const { stdout } = await execPromise(
        `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${audioPath}"`
      );
      return parseFloat(stdout.trim());
    } catch (error) {
      logger.error('Failed to get audio duration:', error);
      throw error;
    }
  }
}

module.exports = new TTSService();
