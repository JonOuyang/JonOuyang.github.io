import React, { useRef, useEffect } from 'react';
import './NetflixIntro.css';

const NetflixIntro = ({ onComplete }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    // Fallback timer
    const fallbackTimer = setTimeout(() => {
      if (onComplete) onComplete();
    }, 4500);

    return () => clearTimeout(fallbackTimer);
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
        onEnded={onComplete}
      />
    </div>
  );
};

export default NetflixIntro;
