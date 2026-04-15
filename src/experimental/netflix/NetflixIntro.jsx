import React, { useEffect } from 'react';
import './NetflixIntro.css';

const FUR_COUNT = 31;
const LAMP_COUNT = 28;

const BrushEffect = () => (
  <div className="effect-brush">
    {Array.from({ length: FUR_COUNT }, (_, i) => (
      <span key={i} className={`fur-${FUR_COUNT - i}`} />
    ))}
  </div>
);

const LampEffect = () => (
  <div className="effect-lumieres">
    {Array.from({ length: LAMP_COUNT }, (_, i) => (
      <span key={i} className={`lamp-${i + 1}`} />
    ))}
  </div>
);

const NetflixIntro = ({ onComplete }) => {
  useEffect(() => {
    // zoom-in: 0.5s delay + 3.5s duration = 4s total
    const timer = setTimeout(() => {
      if (onComplete) onComplete();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="netflix-intro-wrapper">
      <div className="netflix-n">
        {/* Left vertical bar — has both brush and lamp effects */}
        <div className="helper helper-1">
          <BrushEffect />
          <LampEffect />
        </div>
        {/* Right vertical bar */}
        <div className="helper helper-2">
          <BrushEffect />
        </div>
        {/* Diagonal bar — must be last so it renders on top */}
        <div className="helper helper-3">
          <BrushEffect />
        </div>
      </div>
    </div>
  );
};

export default NetflixIntro;
