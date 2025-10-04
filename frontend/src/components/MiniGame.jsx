import React, { useState } from 'react';
import JSConfetti from 'js-confetti';

const jsConfetti = new JSConfetti();

export default function MiniGame() {
  const [score, setScore] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const handleClick = () => {
    const newScore = score + 1;
    setScore(newScore);

    // Celebration effects
    if (newScore % 10 === 0) {
      jsConfetti.addConfetti({
        emojis: ['🐬', '⭐', '💙'],
        emojiSize: 40,
        confettiNumber: 30
      });
    }

    // Encouraging messages
    if (newScore === 20) {
      showToastMessage('🎉 رائع! استمر!');
    } else if (newScore === 50) {
      showToastMessage('⭐ أنت بطل!');
    } else if (newScore === 100) {
      showToastMessage('🏆 مذهل! 100 ضغطة!');
    }
  };

  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  return (
    <div className="mb-6">
      <div className="bg-gradient-to-br from-white to-blue-50 border-3 border-dolphin-light rounded-3xl p-6 shadow-xl max-w-sm mx-auto">
        <h3 className="text-xl font-bold text-dolphin-dark mb-2 text-center">🎮 لعبة سريعة!</h3>
        <p className="text-sm text-dolphin-light mb-4 text-center">اضغط على الدلفين بسرعة!</p>

        <button
          onClick={handleClick}
          className="w-24 h-24 mx-auto flex items-center justify-center text-6xl bg-gradient-to-br from-dolphin-light to-dolphin-dark rounded-full shadow-lg hover:scale-105 active:scale-95 transition-transform duration-200"
        >
          🐬
        </button>

        <div className="mt-4 text-center">
          <span className="text-3xl font-bold text-dolphin-dark">{score}</span>
          <span className="text-sm text-dolphin-light mr-2">ضغطة</span>
        </div>
      </div>

      {/* Toast */}
      {showToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-gradient-to-r from-dolphin-light to-dolphin-dark text-white px-8 py-4 rounded-2xl font-bold z-50 shadow-2xl animate-[slideDown_0.5s_ease]">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
