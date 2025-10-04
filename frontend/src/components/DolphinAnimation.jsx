import React from 'react';

export default function DolphinAnimation() {
  return (
    <div className="relative w-48 h-36 mx-auto flex items-center justify-center">
      <div className="dolphin-animation relative z-10">🐬</div>
      <div className="water-waves">
        <div className="wave wave1"></div>
        <div className="wave wave2"></div>
        <div className="wave wave3"></div>
      </div>
    </div>
  );
}
