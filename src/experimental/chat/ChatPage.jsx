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
        padding: 0 1.5rem;
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
        font-size: clamp(5.85rem, min(22vw, 28vh), 18rem);
        line-height: 0.88;
        letter-spacing: -0.03em;
        gap: clamp(4px, 0.6vw, 8px);
        color: #fff;
        -webkit-text-stroke: 16px #fff;
        paint-order: stroke fill;
        text-align: center;
      }
      .cv-grid span:nth-child(5) {
        -webkit-text-stroke: 45px #fff;
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
        top: clamp(1.4rem, 4vh, 2.6rem);
        left: 0;
        right: 0;
        display: flex;
        justify-content: center;
        gap: clamp(2rem, 5vw, 4.5rem);
        z-index: 2;
      }
      .cv-nav a {
        font-family: "Space Grotesk", "Google Sans", sans-serif;
        font-weight: 500;
        font-size: clamp(0.7rem, 0.95vw, 0.85rem);
        letter-spacing: 0.22em;
        text-transform: uppercase;
        text-decoration: none;
        padding: 0.6rem 0.4rem;
        color: transparent;
        background-image: linear-gradient(
          100deg,
          #b9c0ca 0%,
          #b9c0ca 38%,
          #ffffff 50%,
          #494f58 62%,
          #494f58 100%
        );
        background-size: 300% 100%;
        background-position: 100% 0;
        -webkit-background-clip: text;
        background-clip: text;
        transition: background-position 0.9s cubic-bezier(0.22, 1, 0.36, 1);
      }
      .cv-nav a:hover {
        background-position: 0 0;
      }
      .cv-sub {
        font-family: "Space Grotesk", "Google Sans", sans-serif;
        font-weight: 500;
        font-size: clamp(0.7rem, 1.1vw, 0.92rem);
        letter-spacing: 0.02em;
        color: #5c6672;
        margin-top: clamp(1rem, 2.5vh, 1.8rem);
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
        />
        <div className="cv-mask">
          <h1 className="cv-grid">
            {LETTERS.map((char, idx) => (
              <span key={`${char}-${idx}`}>{char}</span>
            ))}
          </h1>
        </div>
      </div>
      <div className="cv-sub">I couldn&apos;t figure out how to design a good home page. I&apos;m just an engineer</div>
    </div>
  </div>
);

export default ChatPage;
