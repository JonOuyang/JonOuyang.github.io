import React, { useState } from 'react';
import NetflixIntro from './NetflixIntro';

const NetflixPage = () => {
  const [showIntro, setShowIntro] = useState(true);

  return (
    <div className="w-full h-screen bg-black text-white flex flex-col items-center justify-center">
      {showIntro && <NetflixIntro onComplete={() => setShowIntro(false)} />}

      {!showIntro && (
        <div style={{ animation: 'netflix-fade-in 1s ease-out forwards', opacity: 0 }}>
          <style>{`
            @keyframes netflix-fade-in {
              from { opacity: 0; }
              to   { opacity: 1; }
            }
          `}</style>
          <h1 className="text-4xl font-bold mb-4">Welcome to Netflix</h1>
          <p className="text-gray-400">The intro animation has completed.</p>
        </div>
      )}
    </div>
  );
};

export default NetflixPage;
