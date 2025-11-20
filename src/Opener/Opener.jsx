import React, { useState, useEffect } from 'react';
import './Opener.css';

const TIMELINE = [
  { text: 'Leader, Innovator, and Dreamer',   at: 1200 },
  { text: 'Computer Vision Specialist',       at: 3200 },
  { text: 'Researcher at UCLA, Stanford, SJSU', at: 5600 },
  { text: 'CS @ UCLA, Class of 2028',         at: 8200 },
];

const Opener = () => {
  const [asciiArt, setAsciiArt] = useState('');
  const [isOverlayVisible, setOverlayVisible] = useState(false);
  const [subtitleIndex, setSubtitleIndex] = useState(-1);
  const [subtitleIsVisible, setSubtitleIsVisible] = useState(false);

  const ANIMATION_DELAY = 700;

  const renderAscii = (text) => {
    // 1. SPACING FIX:
    // Instead of double spaces, we use a "Hair Space" (U+200A) 
    // This adds just enough padding to prevent blurring without the huge gaps.
    const spacedText = text.split('').join('\u200A');

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // Font setup
    const fontSize = 80; 
    const font = `900 ${fontSize}px "Arial Black", sans-serif`;
    
    ctx.font = font;
    const metrics = ctx.measureText(spacedText);
    const width = Math.ceil(metrics.width);
    const height = Math.ceil(fontSize * 1.2);

    canvas.width = width;
    canvas.height = height;

    // Draw white text on black
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);
    ctx.font = font;
    ctx.fillStyle = '#fff';
    ctx.textBaseline = 'middle';
    ctx.fillText(spacedText, 0, height / 2);

    const imgData = ctx.getImageData(0, 0, width, height);
    const pixels = imgData.data;

    let ascii = '';

    // 2. RESOLUTION FIX (Half Resolution):
    // Previously stepX=2. Now stepX=4.
    // This skips more pixels, creating "chunkier" dots that are easier to see.
    const stepX = 4; 
    const stepY = 8; 

    for (let y = 0; y < height; y += stepY) {
      let row = '';
      for (let x = 0; x < width; x += stepX) {
        const offset = (y * width + x) * 4;
        const r = pixels[offset];
        
        // Thresholds for dots
        if (r < 40) row += ' ';       
        else if (r < 120) row += '·'; 
        else if (r < 200) row += '•'; 
        else row += '●';              
      }
      ascii += row + '\n';
    }
    return ascii;
  };

  useEffect(() => {
    const topName = renderAscii("JONATHAN");
    const bottomName = renderAscii("OUYANG");
    setAsciiArt(`${topName}\n${bottomName}`);

    const timers = [];
    timers.push(setTimeout(() => setOverlayVisible(true), ANIMATION_DELAY));

    TIMELINE.forEach((item, i) => {
      if (i > 0) {
        timers.push(setTimeout(() => setSubtitleIsVisible(false), Math.max(0, item.at - 500)));
      }
      timers.push(
        setTimeout(() => {
          setSubtitleIndex(i);
          setSubtitleIsVisible(true);
        }, item.at)
      );
    });

    return () => timers.forEach(clearTimeout);
  }, []);

  const currentText = subtitleIndex >= 0 ? TIMELINE[subtitleIndex].text : '';

  return (
    <div className="opener-container">
      <video autoPlay muted playsInline className="background-video">
        <source src="/assets/videos/final_display_reencoded.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <div className={`overlay ${isOverlayVisible ? 'visible' : ''}`}>
        <div className="text-container">
          <div className="ascii-wrapper">
             <pre className="ascii-text shine-effect">
               {asciiArt}
             </pre>
          </div>
          <p className={`subtitle-text ${subtitleIsVisible ? 'visible' : ''}`}>
            {currentText}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Opener;