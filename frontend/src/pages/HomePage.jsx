import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { registerStudent, generateContent } from '../store/slices/studentSlice';
import {
  setVideoJobId,
  updateVideoProgress,
  setVideoCompleted,
  setVideoFailed
} from '../store/slices/videoSlice';
import {
  setCertificateJobId,
  updateCertificateProgress,
  setCertificateCompleted,
  setCertificateFailed
} from '../store/slices/certificateSlice';
import { getVideoStatus } from '../services/videoService';
import { getCertificateStatus } from '../services/certificateService';
import StudentForm from '../components/StudentForm';
import LoadingOverlay from '../components/common/LoadingOverlay';
import CertificateProgress from '../components/CertificateProgress';
import CertificateResult from '../components/CertificateResult';
import VideoProgress from '../components/VideoProgress';
import VideoResult from '../components/VideoResult';
import Swal from 'sweetalert2';
import JSConfetti from 'js-confetti';

const jsConfetti = new JSConfetti();

export default function HomePage() {
  const dispatch = useDispatch();
  const [showForm, setShowForm] = useState(true);
  const [showResults, setShowResults] = useState(false);

  const { loading: studentLoading } = useSelector((state) => state.student);
  const {
    jobId: videoJobId,
    state: videoState,
    progress: videoProgress
  } = useSelector((state) => state.video);
  const {
    jobId: certJobId,
    state: certState,
    progress: certProgress
  } = useSelector((state) => state.certificate);

  // Handle form submission
  const handleFormSubmit = async (formData) => {
    try {
      // Hide form, show loading
      setShowForm(false);

      // 1. Register student
      const registerResult = await dispatch(registerStudent(formData)).unwrap();

      // 2. Generate content
      const generateResult = await dispatch(
        generateContent(registerResult.studentId)
      ).unwrap();

      // 3. Store job IDs
      dispatch(setVideoJobId(generateResult.videoJobId));
      dispatch(setCertificateJobId(generateResult.certificateJobId));

      // 4. Show results section
      setShowResults(true);

    } catch (error) {
      setShowForm(true);
      Swal.fire({
        icon: 'error',
        title: 'حدث خطأ',
        text: error || 'حدث خطأ أثناء المعالجة',
        confirmButtonText: 'حسناً',
        confirmButtonColor: '#1B648E'
      });
    }
  };

  // Poll video status
  useEffect(() => {
    if (!videoJobId || videoState === 'completed' || videoState === 'failed') {
      return;
    }

    const interval = setInterval(async () => {
      try {
        const response = await getVideoStatus(videoJobId);
        const status = response.data;

        // Update progress
        dispatch(updateVideoProgress({
          progress: status.progress || 0,
          logs: status.logs || []
        }));

        // Check if completed
        if (status.state === 'completed') {
          dispatch(setVideoCompleted(status.result));

          // Show confetti
          jsConfetti.addConfetti({
            emojis: ['🎬', '🎥', '✨', '🎊'],
            emojiSize: 30,
            confettiNumber: 50
          });
        }

        // Check if failed
        if (status.state === 'failed') {
          dispatch(setVideoFailed(status.failedReason || 'حدث خطأ'));
          Swal.fire({
            icon: 'error',
            title: 'فشل إنشاء الفيديو',
            text: status.failedReason || 'حدث خطأ أثناء إنشاء الفيديو',
            confirmButtonText: 'حسناً',
            confirmButtonColor: '#1B648E'
          });
        }
      } catch (error) {
        console.error('Video status polling error:', error);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [videoJobId, videoState, dispatch]);

  // Poll certificate status
  useEffect(() => {
    if (!certJobId || certState === 'completed' || certState === 'failed') {
      return;
    }

    const interval = setInterval(async () => {
      try {
        const response = await getCertificateStatus(certJobId);
        const status = response.data;

        // Update progress
        dispatch(updateCertificateProgress({
          progress: status.progress || 0,
          logs: status.logs || []
        }));

        // Check if completed
        if (status.state === 'completed') {
          dispatch(setCertificateCompleted(status.result));

          // Show success message
          Swal.fire({
            icon: 'success',
            title: 'تم إنشاء الشهادة بنجاح! 🎓',
            text: 'انتظر الفيديو الخاص بك جاري التجهيز...',
            showConfirmButton: false,
            timer: 3000
          });
        }

        // Check if failed
        if (status.state === 'failed') {
          dispatch(setCertificateFailed(status.failedReason || 'حدث خطأ'));
        }
      } catch (error) {
        console.error('Certificate status polling error:', error);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [certJobId, certState, dispatch]);

  // Show final confetti when both completed
  useEffect(() => {
    if (videoState === 'completed' && certState === 'completed') {
      setTimeout(() => {
        jsConfetti.addConfetti({
          emojis: ['🎉', '🐬', '✨', '🎊', '👏', '🌟'],
          emojiSize: 40,
          confettiNumber: 80
        });
      }, 500);
    }
  }, [videoState, certState]);

  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-gradient-to-br from-dolphin-dark/5 to-dolphin-light/20 p-4">
      {/* Logo */}
      <div className="w-full flex justify-center mt-8 mb-4">
        <div className="text-6xl">🐬</div>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-3xl shadow-2xl shadow-dolphin-light/10 px-6 py-8 w-full max-w-lg flex flex-col items-center relative z-10">
        <h1 className="w-full text-center text-3xl md:text-4xl font-extrabold text-dolphin-dark flex items-center justify-center gap-2 mb-2">
          <i className="fa-solid fa-graduation-cap text-dolphin-light"></i>
          <span>منصة الدلفين التعليمية</span>
        </h1>

        <div className="text-dolphin-light text-lg mb-6 flex items-center gap-2 justify-center">
          <i className="fa-solid fa-magic opacity-80"></i>
          <span>اصنع فيديوك وشهادتك معاً!</span>
        </div>

        {/* Student Form */}
        {showForm && (
          <StudentForm
            onSubmit={handleFormSubmit}
            loading={studentLoading}
          />
        )}

        {/* Results Section */}
        {showResults && (
          <div className="w-full mt-6">
            {/* Certificate */}
            <div className="mb-6">
              <CertificateProgress />
              <CertificateResult />
            </div>

            {/* Video */}
            <div>
              <VideoProgress />
              <VideoResult />
            </div>
          </div>
        )}
      </div>

      {/* Loading Overlay */}
      <LoadingOverlay show={studentLoading} />

      {/* Footer */}
      <div className="text-center text-dolphin-dark/60 text-sm mt-8 mb-4">
        <p>© 2025 منصة الدلفين التعليمية - جميع الحقوق محفوظة</p>
      </div>
    </div>
  );
}
