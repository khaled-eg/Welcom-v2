import React from 'react';

export default function LoadingOverlay({ show }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 border-4 border-dolphin-light border-t-transparent rounded-full animate-spin"></div>
        <div className="text-dolphin-dark font-extrabold text-xl">جاري التحضير...</div>
        <div className="text-dolphin-light font-medium">نجهز كل شيء من أجلك</div>
      </div>
    </div>
  );
}
