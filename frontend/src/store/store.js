import { configureStore } from '@reduxjs/toolkit';
import studentReducer from './slices/studentSlice';
import videoReducer from './slices/videoSlice';
import certificateReducer from './slices/certificateSlice';

const store = configureStore({
  reducer: {
    student: studentReducer,
    video: videoReducer,
    certificate: certificateReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
