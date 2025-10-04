import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { getVideoStreamUrl } from '../services/videoService';
import Swal from 'sweetalert2';
import axios from 'axios';

export default function VideoResult() {
  const { videoUrl, fileName, state } = useSelector((state) => state.video);
  const [downloading, setDownloading] = useState(false);

  if (state !== 'completed' || !videoUrl) return null;

  const handleDownload = async () => {
    try {
      setDownloading(true);

      const response = await axios.get(videoUrl, {
        responseType: 'blob',
        timeout: 300000 // 5 minutes
      });

      const blob = new Blob([response.data], { type: 'video/mp4' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = fileName || 'video.mp4';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);

      Swal.fire({
        icon: 'success',
        title: 'تم تحميل الفيديو بنجاح! 🎬',
        showConfirmButton: false,
        timer: 1500
      });
    } catch (error) {
      // Fallback: open in new tab
      window.open(videoUrl, '_blank');
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'فيديو ترحيبي من منصة الدلفين',
        url: videoUrl
      });
    } else {
      navigator.clipboard.writeText(videoUrl);
      Swal.fire({
        icon: 'success',
        title: 'تم نسخ الرابط!',
        showConfirmButton: false,
        timer: 1200
      });
    }
  };

  return (
    <div className="result-card">
      <h3 className="text-xl font-bold text-dolphin-dark mb-3 flex items-center gap-2">
        <i className="fa-solid fa-video text-dolphin-light"></i>
        <span>الفيديو</span>
      </h3>

      <video
        src={getVideoStreamUrl(fileName)}
        controls
        className="w-full rounded-xl shadow-lg mb-3"
      />

      <div className="flex gap-2 justify-center flex-wrap">
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="bg-dolphin-dark hover:bg-dolphin-light text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-all duration-300 text-sm min-w-[120px] justify-center disabled:opacity-50"
        >
          {downloading ? (
            <>
              <i className="fa-solid fa-spinner fa-spin"></i>
              <span>جاري التحميل...</span>
            </>
          ) : (
            <>
              <i className="fa-solid fa-download"></i>
              <span>تحميل</span>
            </>
          )}
        </button>

        <button
          onClick={handleShare}
          className="bg-dolphin-light hover:bg-dolphin-dark text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-all duration-300 text-sm min-w-[120px] justify-center"
        >
          <i className="fa-solid fa-share-nodes"></i>
          <span>مشاركة</span>
        </button>
      </div>
    </div>
  );
}
