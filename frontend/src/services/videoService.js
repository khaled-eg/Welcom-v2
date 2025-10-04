import api from './api';

/**
 * Get video generation job status
 */
export const getVideoStatus = async (jobId) => {
  const response = await api.get(`/videos/status/${jobId}`);
  return response.data;
};

/**
 * Get video download URL
 */
export const getVideoDownloadUrl = (filename) => {
  return `${import.meta.env.VITE_API_URL || '/api'}/videos/download/${filename}`;
};

/**
 * Get video stream URL
 */
export const getVideoStreamUrl = (filename) => {
  return `${import.meta.env.VITE_API_URL || '/api'}/videos/stream/${filename}`;
};
