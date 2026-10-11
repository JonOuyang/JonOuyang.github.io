import React, { useEffect, useRef } from 'react';
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

const ChatPage = () => {
  const aboutRef = useRef(null);

  useEffect(() => {
    const el = aboutRef.current;
    if (!el) return undefined;
    if (typeof IntersectionObserver === 'undefined') {
      el.classList.add('is-visible');
      return undefined;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) el.classList.add('is-visible');
      },
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <>
    <div className="cv-root">
      <style>{`
        .cv-root {
          position: relative;
          min-height: 100vh;
          min-height: 100svh;
          background: #000;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: default;
          user-select: none;
        }

        /* ── Top Navigation ── */
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
          z-index: 10;
          opacity: 0;
          transform: translateY(-16px);
          pointer-events: none;
          transition: opacity 0.8s ease 0.15s, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.15s;
        }
        .cv-nav.visible {
          opacity: 1;
          transform: translateY(0);
          pointer-events: auto;
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

        /* ── Centered Card & Logo Box (Preserves Exact Original Sizing) ── */
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

        /* ── Video Element ── */
        /* During intro: softly blurred & brightened for pristine text legibility */
        /* During shrink/done: seamlessly transitions to pin-sharp original */
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

        /* ── Multiply Black Mask (Black hides, White reveals) ── */
        .cv-mask {
          position: relative;
          background: #000;
          mix-blend-mode: multiply;
          user-select: none;
        }

        /* ── The 3x3 Monogram Cutout Grid (Phase 2 & Final) ── */
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
          margin: 0;
          transform-origin: center center;
          cursor: default;
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

        /* ── About section ── */
        .cv-about {
          min-height: 100vh;
          min-height: 100svh;
          background: #000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: clamp(5rem, 14vh, 9rem) 1.5rem;
          box-sizing: border-box;
          user-select: text;
          font-family: "Space Grotesk", "Google Sans", sans-serif;
        }
        .cv-about-inner {
          max-width: 860px;
          width: 100%;
          opacity: 0;
          transform: translateY(18px);
          transition: opacity 0.9s cubic-bezier(0.16, 1, 0.3, 1),
                      transform 0.9s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .cv-about-inner.is-visible {
          opacity: 1;
          transform: translateY(0);
        }
        @media (prefers-reduced-motion: reduce) {
          .cv-about-inner {
            transform: none;
            transition: none;
          }
        }
        .cv-about-lead {
          font-size: clamp(1.35rem, 2.6vw, 2.2rem);
          font-weight: 400;
          line-height: 1.3;
          color: #f4f4f5;
          letter-spacing: -0.01em;
          margin: 0 0 2.25rem;
        }
        .cv-about-p {
          font-size: clamp(1rem, 1.25vw, 1.125rem);
          font-weight: 300;
          line-height: 1.75;
          color: #a1a1aa;
          margin: 0 0 1.4rem;
        }

      `}</style>

      {/* Top navigation */}
      <nav className="cv-nav visible">
        {NAV_LINKS.map((l) => (
          <Link key={l.path} to={l.path}>{l.name}</Link>
        ))}
        <a href="/resumes/CV/Jonathan_Ouyang_CV.pdf" target="_blank" rel="noopener noreferrer">Resume</a>
      </nav>

      {/* Main Centered Card */}
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

    <section className="cv-about">
      <div className="cv-about-inner" ref={aboutRef}>
        <p className="cv-about-lead">
          I am currently an intern at Google DeepMind working on benchmarks, evals, and RSI research for Gemini Computer Use.
        </p>
        <p className="cv-about-p">
          Before that I was a software engineer intern at Amazon Studios.
        </p>
        <p className="cv-about-p">
          I am a junior at UCLA studying computer science. I do robotics research at the UCLA Robot Intelligence Lab and at Stanford with Dorsa Sadigh.
        </p>
      </div>
    </section>
    </>
  );
};

export default ChatPage;
