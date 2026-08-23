import React from 'react';
import { Link } from 'react-router-dom';

const NAV_LINKS = [
  { name: 'Work History', path: '/work-history' },
  { name: 'Projects', path: '/projects' },
  { name: 'Research', path: '/research' },
];

const LETTERS = [
  'J', 'O', 'N',
  'O', 'U', 'Y',
  'A', 'N', 'G'
];

const ChatPage = () => (
  <div className="cv-root">
    <style>{`
      .cv-root {
        position: fixed;
        inset: 0;
        background: #000;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        cursor: default;
      }
      .cv-card {
        position: relative;
        z-index: 1;
        text-align: center;
        padding: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
      }
      .cv-logo-box {
        position: relative;
        display: inline-block;
        overflow: hidden;
        background: #000;
        isolation: isolate;
      }
      .cv-video {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center;
        transform: scale(1.9);
        transform-origin: center;
        pointer-events: none;
      }
      .cv-mask {
        position: relative;
        background: #000;
        mix-blend-mode: multiply;
        user-select: none;
      }
      .cv-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        justify-items: center;
        align-items: center;
        font-family: "Space Grotesk", "Google Sans", sans-serif;
        font-weight: 800;
        font-size: clamp(5.5rem, min(37.5vw, 28.5vh), 22rem);
        line-height: 0.88;
        letter-spacing: -0.03em;
        gap: 0.035em;
        padding: clamp(4px, 0.8vw, 14px);
        color: #fff;
        -webkit-text-stroke: 0.065em #fff;
        paint-order: stroke fill;
        text-align: center;
      }
      .cv-grid span:nth-child(5) {
        -webkit-text-stroke: 0.185em #fff;
      }
      .cv-grid span:not(:nth-child(5)) {
        transform: scale(1.135);
      }
      .cv-grid span {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 0.05em;
      }
      .cv-nav {
        position: fixed;
        top: clamp(1.2rem, 3.5vh, 2.5rem);
        left: 0;
        right: 0;
        display: flex;
        justify-content: center;
        gap: clamp(0.75rem, 3.5vw, 3.5rem);
        padding: 0 1rem;
        box-sizing: border-box;
        z-index: 2;
      }
      .cv-nav a {
        position: relative;
        font-family: "Space Grotesk", "Google Sans", sans-serif;
        font-weight: 500;
        font-size: clamp(0.62rem, 1.8vw, 0.82rem);
        letter-spacing: clamp(0.10em, 1.2vw, 0.22em);
        text-transform: uppercase;
        text-decoration: none;
        padding: 0.4rem 0.3rem;
        white-space: nowrap;
        color: #71717a;
        transition: color 0.3s cubic-bezier(0.16, 1, 0.3, 1),
                    letter-spacing 0.35s cubic-bezier(0.16, 1, 0.3, 1),
                    text-shadow 0.3s ease;
      }
      .cv-nav a::after {
        content: "";
        position: absolute;
        bottom: 0px;
        left: 50%;
        width: 0;
        height: 1px;
        background: linear-gradient(90deg, transparent, #ffffff, transparent);
        box-shadow: 0 0 10px rgba(255, 255, 255, 0.9);
        transition: width 0.35s cubic-bezier(0.16, 1, 0.3, 1),
                    left 0.35s cubic-bezier(0.16, 1, 0.3, 1);
      }
      .cv-nav a:hover {
        color: #ffffff;
        letter-spacing: 0.26em;
        text-shadow: 0 0 14px rgba(255, 255, 255, 0.55);
      }
      .cv-nav a:hover::after {
        width: 100%;
        left: 0;
      }
    `}</style>
    <nav className="cv-nav">
      {NAV_LINKS.map((l) => (
        <Link key={l.path} to={l.path}>{l.name}</Link>
      ))}
      <a href="/resumes/CV/Jonathan_Ouyang_CV.pdf" target="_blank" rel="noopener noreferrer">Resume</a>
    </nav>
    <div className="cv-card">
      <div className="cv-logo-box">
        <video
          className="cv-video"
          src="/assets/videos/merged_output.mp4"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          disablePictureInPicture
        />
        <div className="cv-mask">
          <h1 className="cv-grid">
            {LETTERS.map((char, idx) => (
              <span key={`${char}-${idx}`}>{char}</span>
            ))}
          </h1>
        </div>
      </div>
    </div>
  </div>
);

export default ChatPage;
