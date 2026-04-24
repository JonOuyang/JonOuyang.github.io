import React, { useState } from 'react';
import NetflixIntro from './NetflixIntro';

const NetflixPage = () => {
  const [showIntro, setShowIntro] = useState(true);

  return (
    <div className="w-full h-screen bg-black text-white flex flex-col items-center justify-center">
      {showIntro && <NetflixIntro onComplete={() => setShowIntro(false)} />}

      {!showIntro && (
        <div className="w-full h-screen flex flex-col items-center justify-center" style={{ animation: 'netflix-fade-in 1s ease-out forwards', opacity: 0 }}>
          <style>{`
            @keyframes netflix-fade-in {
              from { opacity: 0; }
              to   { opacity: 1; }
            }
          `}</style>
          <img 
            src="/assets/images/delorean.jpg" 
            alt="DeLorean" 
            className="w-full h-full object-cover"
          />
        </div>
      )}
    </div>
  );
};

export default NetflixPage;
