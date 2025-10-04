import React, { useState, useEffect } from 'react';
import { FUN_FACTS } from '../utils/constants';

export default function FunFacts() {
  const [currentFact, setCurrentFact] = useState(FUN_FACTS[0]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => {
        const newIndex = (prevIndex + 1) % FUN_FACTS.length;
        setCurrentFact(FUN_FACTS[newIndex]);
        return newIndex;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gradient-to-r from-dolphin-light/10 to-dolphin-dark/10 rounded-2xl p-6 mb-6 shadow-md border-2 border-dolphin-light/20">
      <div className="fun-fact-text text-lg text-dolphin-dark text-center font-semibold leading-relaxed">
        {currentFact}
      </div>
    </div>
  );
}
