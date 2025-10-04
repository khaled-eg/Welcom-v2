import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { getCertificateViewUrl } from '../services/certificateService';
import Swal from 'sweetalert2';
import axios from 'axios';

export default function CertificateResult() {
  const { certificateUrl, fileName, state } = useSelector((state) => state.certificate);
  const [downloading, setDownloading] = useState(false);

  if (state !== 'completed' || !certificateUrl) return null;

  const handleDownload = async () => {
    try {
      setDownloading(true);

      const response = await axios.get(certificateUrl, {
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: 'image/png' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = fileName || 'certificate.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);

      Swal.fire({
        icon: 'success',
        title: 'تم تحميل الشهادة بنجاح! 🎓',
        showConfirmButton: false,
        timer: 1500
      });
    } catch (error) {
      window.open(certificateUrl, '_blank');
    } finally {
      setDownloading(false);
    }
  };

  const handleWhatsAppShare = () => {
    const currentDomain = window.location.origin;
    const certPageUrl = `${currentDomain}/certificate?file=${fileName}`;

    const shareText = `أهلاً وسهلاً أصدقائي الأعزاء! 🎉

أنا سعيد جداً لأشارككم خبر تخرجي من منصة الدلفين التعليمية! 🐬✨

لقد أكملت رحلتي التعليمية بنجاح وحصلت على شهادة التخرج عن جدارة واستحقاق 🏆

يمكنكم مشاهدة شهادتي من هنا:
${certPageUrl}

شكراً لكم على دعمكم المستمر! 💙

#منصة_الدلفين_التعليمية #تخرج #تعليم #إنجاز #شهادة`;

    const encodedText = encodeURIComponent(shareText);
    window.open(`https://wa.me/?text=${encodedText}`, '_blank');
  };

  return (
    <div className="result-card">
      <h3 className="text-xl font-bold text-dolphin-dark mb-3 flex items-center gap-2">
        <i className="fa-solid fa-certificate text-green-600"></i>
        <span>الشهادة</span>
      </h3>

      <div className="certificate-preview p-3 mb-3">
        <div className="relative w-full" style={{ height: '360px' }}>
          <img
            src={getCertificateViewUrl(fileName)}
            alt="شهادة الإنجاز"
            className="w-full h-full object-contain rounded-xl"
          />
        </div>
      </div>

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
          onClick={handleWhatsAppShare}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-all duration-300 text-sm min-w-[120px] justify-center"
        >
          <i className="fa-brands fa-whatsapp text-lg"></i>
          <span>واتساب</span>
        </button>
      </div>
    </div>
  );
}
