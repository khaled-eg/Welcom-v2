import React from 'react';
import { useSelector } from 'react-redux';
import DolphinAnimation from './DolphinAnimation';
import FunFacts from './FunFacts';
import MiniGame from './MiniGame';
import { VIDEO_PROGRESS_MESSAGES } from '../utils/constants';

export default function VideoProgress() {
  const { progress, state } = useSelector((state) => state.video);

  if (state === 'idle' || state === 'completed') return null;

  const getMessage = () => {
    if (progress >= 85) return VIDEO_PROGRESS_MESSAGES[4];
    if (progress >= 65) return VIDEO_PROGRESS_MESSAGES[3];
    if (progress >= 45) return VIDEO_PROGRESS_MESSAGES[2];
    if (progress >= 25) return VIDEO_PROGRESS_MESSAGES[1];
    return VIDEO_PROGRESS_MESSAGES[0];
  };

  return (
    <div className="mb-4">
      {/* Fun Waiting Area */}
      <div className="mb-6">
        <DolphinAnimation />
        <FunFacts />
        <MiniGame />
      </div>

      {/* Progress Bar */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-dolphin-dark">جاري إنشاء الفيديو...</span>
        <span className="text-sm font-bold text-dolphin-light">{Math.floor(progress)}%</span>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className="progress-bar h-full rounded-full transition-all duration-500 ease-out relative"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="text-center text-sm text-dolphin-light mt-2 font-medium">
        {getMessage()}
      </div>
    </div>
  );
}
