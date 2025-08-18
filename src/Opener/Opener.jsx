import React, { useState, useEffect } from 'react';
import './Opener.css';
import GlowingHeader from '../components/GlowingHeader';

const Opener = () => {
  const [isOverlayVisible, setOverlayVisible] = useState(false);

  // Fade duration must match your CSS `.subtitle-text` transition
  const FADE_MS = 500;

  // Absolute schedule (ms) from component mount for each fade-in
  const timeline = [
    { text: 'Leader, Innovator, and Dreamer', at: 1200 },
    { text: 'Computer Vision Specialist',       at: 3200 },
    { text: 'Researcher at UCLA, Stanford, SJSU', at: 5600 },
    { text: 'CS @ UCLA, Class of 2028',             at: 8200 },
    // Add more lines as needed...
  ];

  // We render current line from timeline[subtitleIndex]
  const [subtitleIndex, setSubtitleIndex] = useState(-1); // -1 = nothing yet
  const [subtitleIsVisible, setSubtitleIsVisible] = useState(false);

  const animationDelay = 700; // when your overlay itself appears

  useEffect(() => {
    const timers = [];

    // 1) Show main overlay after a delay
    timers.push(setTimeout(() => setOverlayVisible(true), animationDelay));

    // 2) Schedule each subtitle’s fade-in precisely
    //    - For each item i>0, schedule a fade-out right before the next fade-in.
    const sorted = [...timeline].sort((a, b) => a.at - b.at);

    sorted.forEach((item, i) => {
      const isFirst = i === 0;

      // Fade out previous line right before this line fades in (skip for the first)
      if (!isFirst) {
        const fadeOutAt = Math.max(0, item.at - FADE_MS);
        timers.push(setTimeout(() => setSubtitleIsVisible(false), fadeOutAt));
      }

      // At the exact `at` time, switch text and fade in
      timers.push(
        setTimeout(() => {
          setSubtitleIndex(i);
          setSubtitleIsVisible(true);
        }, item.at)
      );
    });

    // Cleanup
    return () => timers.forEach(clearTimeout);
  }, []);

  const currentText = subtitleIndex >= 0 ? timeline[subtitleIndex].text : '';

  return (
    <div className="opener-container">
      <video autoPlay muted playsInline className="background-video">
        <source src="/assets/videos/final_display_reencoded.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <div className={`overlay ${isOverlayVisible ? 'visible' : ''}`}>
        <div className="text-container">
          <GlowingHeader>Jonathan Ouyang</GlowingHeader>

          {/* Subtitle with fade class toggle */}
          <p className={`subtitle-text ${subtitleIsVisible ? 'visible' : ''}`}>
            {currentText}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Opener;
