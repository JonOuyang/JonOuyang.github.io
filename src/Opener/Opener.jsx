import React, { useState, useEffect } from 'react';
import './Opener.css';
import GlowingHeader from '../components/GlowingHeader'; // 1. Import the GlowingHeader

const Opener = () => {
  const [isOverlayVisible, setOverlayVisible] = useState(false);
  
  // --- New state and data for the subtitle ---
  const subtitles = [
    "student at university", // The final text
    "first random text",
    "a second cool phrase",
    "another interesting line"
  ];
  const [subtitleIndex, setSubtitleIndex] = useState(0);
  const [subtitleIsVisible, setSubtitleIsVisible] = useState(true); // For fade transition
  // ---------------------------------------------

  const animationDelay = 1500; // 1.5 seconds

  useEffect(() => {
    // Timer for the main black overlay
    const overlayTimer = setTimeout(() => {
      setOverlayVisible(true);
    }, animationDelay);

    // --- New timer logic for cycling subtitles ---
    // Note: The total time for a cycle is the interval (1000ms) + transition time (500ms)
    const switchSubtitle = (index) => {
      // Don't do anything if it's the last subtitle
      if (index >= subtitles.length - 1) {
        // Ensure the final text is set and visible
        setSubtitleIndex(subtitles.length - 1);
        setSubtitleIsVisible(true);
        return;
      }

      // Set up the next switch
      setTimeout(() => {
        setSubtitleIsVisible(false); // Fade out

        setTimeout(() => {
          setSubtitleIndex(index + 1); // Change text
          setSubtitleIsVisible(true); // Fade in
          switchSubtitle(index + 1); // Recurse for the next one
        }, 500); // This should match your CSS transition time
      }, 2000); // How long each text stays on screen
    };

    // Start the subtitle switching process
    switchSubtitle(0);
    // --------------------------------------------

    // Clean up timers when the component is unmounted
    return () => clearTimeout(overlayTimer);
  }, []);

  return (
    <div className="opener-container">
      <video autoPlay loop muted playsInline className="background-video">
        <source src="/assets/videos/frame_hsr.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      
      <div className={`overlay ${isOverlayVisible ? 'visible' : ''}`}>
        <div className="text-container">
          {/* 2. Use the GlowingHeader component */}
          <GlowingHeader>FIRST LAST</GlowingHeader>

          {/* 3. Subtitle element with dynamic class for transitions */}
          <p className={`subtitle-text ${subtitleIsVisible ? 'visible' : ''}`}>
            {subtitles[subtitleIndex]}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Opener;