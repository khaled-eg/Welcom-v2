import api from './api';

/**
 * Register new student
 */
export const registerStudent = async (studentData) => {
  const response = await api.post('/students/register', studentData);
  return response.data;
};

/**
 * Get student information
 */
export const getStudentInfo = async (studentId) => {
  const response = await api.get(`/students/${studentId}`);
  return response.data;
};

/**
 * Generate video and certificate for student
 */
export const generateContent = async (studentId) => {
  const response = await api.post('/students/generate', { studentId });
  return response.data;
};
