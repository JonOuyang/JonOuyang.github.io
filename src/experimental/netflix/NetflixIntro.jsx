import React, { useRef, useEffect, useState } from 'react';
import './NetflixIntro.css';

const NetflixIntro = ({ onComplete }) => {
  const videoRef = useRef(null);
  const [isFlashing, setIsFlashing] = useState(false);

  useEffect(() => {
    // Flash at 3.5s, complete after 4.5s
    const flashTimer = setTimeout(() => {
      setIsFlashing(true);
    }, 3500);

    const completionTimer = setTimeout(() => {
      if (onComplete) onComplete();
    }, 4500);

    return () => {
      clearTimeout(flashTimer);
      clearTimeout(completionTimer);
    };
  }, [onComplete]);

  return (
    <div className="netflix-intro-wrapper">
      <video
        ref={videoRef}
        src="/assets/videos/netflix_intro.mp4"
        style={{ width: '100%', height: '100%', objectFit: 'contain', background: 'black' }}
        autoPlay
        muted
        playsInline
      />
      <div className={`flash-overlay ${isFlashing ? 'flash-animation' : ''}`} />
    </div>
  );
};

export default NetflixIntro;
