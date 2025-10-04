import { createSlice } from '@reduxjs/toolkit';

const certificateSlice = createSlice({
  name: 'certificate',
  initialState: {
    jobId: null,
    progress: 0,
    state: 'idle', // idle | processing | completed | failed
    certificateUrl: null,
    fileName: null,
    error: null,
    logs: [],
  },
  reducers: {
    setCertificateJobId: (state, action) => {
      state.jobId = action.payload;
      state.state = 'processing';
      state.progress = 0;
    },
    updateCertificateProgress: (state, action) => {
      state.progress = action.payload.progress;
      state.logs = action.payload.logs || state.logs;
    },
    setCertificateCompleted: (state, action) => {
      state.state = 'completed';
      state.progress = 100;
      state.certificateUrl = action.payload.certificateUrl;
      state.fileName = action.payload.fileName;
    },
    setCertificateFailed: (state, action) => {
      state.state = 'failed';
      state.error = action.payload;
    },
    resetCertificate: (state) => {
      state.jobId = null;
      state.progress = 0;
      state.state = 'idle';
      state.certificateUrl = null;
      state.fileName = null;
      state.error = null;
      state.logs = [];
    },
  },
});

export const {
  setCertificateJobId,
  updateCertificateProgress,
  setCertificateCompleted,
  setCertificateFailed,
  resetCertificate,
} = certificateSlice.actions;

export default certificateSlice.reducer;
