import { createSlice } from '@reduxjs/toolkit';

const videoSlice = createSlice({
  name: 'video',
  initialState: {
    jobId: null,
    progress: 0,
    state: 'idle', // idle | processing | completed | failed
    videoUrl: null,
    fileName: null,
    error: null,
    logs: [],
  },
  reducers: {
    setVideoJobId: (state, action) => {
      state.jobId = action.payload;
      state.state = 'processing';
      state.progress = 0;
    },
    updateVideoProgress: (state, action) => {
      state.progress = action.payload.progress;
      state.logs = action.payload.logs || state.logs;
    },
    setVideoCompleted: (state, action) => {
      state.state = 'completed';
      state.progress = 100;
      state.videoUrl = action.payload.videoUrl;
      state.fileName = action.payload.fileName;
    },
    setVideoFailed: (state, action) => {
      state.state = 'failed';
      state.error = action.payload;
    },
    resetVideo: (state) => {
      state.jobId = null;
      state.progress = 0;
      state.state = 'idle';
      state.videoUrl = null;
      state.fileName = null;
      state.error = null;
      state.logs = [];
    },
  },
});

export const {
  setVideoJobId,
  updateVideoProgress,
  setVideoCompleted,
  setVideoFailed,
  resetVideo,
} = videoSlice.actions;

export default videoSlice.reducer;
