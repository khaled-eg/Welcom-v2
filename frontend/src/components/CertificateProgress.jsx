import React from 'react';
import { useSelector } from 'react-redux';
import { CERTIFICATE_PROGRESS_MESSAGES } from '../utils/constants';

export default function CertificateProgress() {
  const { progress, state } = useSelector((state) => state.certificate);

  if (state === 'idle' || state === 'completed') return null;

  const getMessage = () => {
    if (progress >= 80) return CERTIFICATE_PROGRESS_MESSAGES[4];
    if (progress >= 60) return CERTIFICATE_PROGRESS_MESSAGES[3];
    if (progress >= 40) return CERTIFICATE_PROGRESS_MESSAGES[2];
    if (progress >= 20) return CERTIFICATE_PROGRESS_MESSAGES[1];
    return CERTIFICATE_PROGRESS_MESSAGES[0];
  };

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-dolphin-dark">جاري إنشاء الشهادة...</span>
        <span className="text-sm font-bold text-green-600">{Math.floor(progress)}%</span>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out bg-gradient-to-r from-green-500 to-green-600 shadow-md"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="text-center text-sm text-green-600 mt-2 font-medium">
        {getMessage()}
      </div>
    </div>
  );
}
