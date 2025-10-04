import api from './api';

/**
 * Get certificate generation job status
 */
export const getCertificateStatus = async (jobId) => {
  const response = await api.get(`/certificates/status/${jobId}`);
  return response.data;
};

/**
 * Get certificate download URL
 */
export const getCertificateDownloadUrl = (filename) => {
  return `${import.meta.env.VITE_API_URL || '/api'}/certificates/download/${filename}`;
};

/**
 * Get certificate view URL
 */
export const getCertificateViewUrl = (filename) => {
  return `${import.meta.env.VITE_API_URL || '/api'}/certificates/view/${filename}`;
};
