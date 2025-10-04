import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as studentService from '../../services/studentService';

// Async thunks
export const registerStudent = createAsyncThunk(
  'student/register',
  async (studentData, { rejectWithValue }) => {
    try {
      const response = await studentService.registerStudent(studentData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const generateContent = createAsyncThunk(
  'student/generateContent',
  async (studentId, { rejectWithValue }) => {
    try {
      const response = await studentService.generateContent(studentId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const studentSlice = createSlice({
  name: 'student',
  initialState: {
    studentId: null,
    studentInfo: null,
    isExisting: false,
    loading: false,
    error: null,
  },
  reducers: {
    resetStudent: (state) => {
      state.studentId = null;
      state.studentInfo = null;
      state.isExisting = false;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register student
      .addCase(registerStudent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerStudent.fulfilled, (state, action) => {
        state.loading = false;
        state.studentId = action.payload.studentId;
        state.studentInfo = action.payload.student;
        state.isExisting = action.payload.isExisting;
      })
      .addCase(registerStudent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Generate content
      .addCase(generateContent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generateContent.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(generateContent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetStudent } = studentSlice.actions;
export default studentSlice.reducer;
