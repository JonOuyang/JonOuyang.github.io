import { useState } from 'react';

// Parses the body of a ```manim fenced block:
//   scene: GradientDescentScene
//   src: /assets/manim/gradient-descent.mp4
//   caption: Gradient descent on a 2D quadratic bowl
// All three keys are optional, one per line as `key: value`.
function parseManimBlock(raw) {
  const data = {};
  const lines = String(raw || '').replace(/\r\n/g, '\n').split('\n');
  for (const line of lines) {
    if (!line.trim()) continue;
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    if (key) data[key] = value;
  }
  return data;
}

function FilmIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2.5" y="4.5" width="19" height="15" rx="1.5" />
      <line x1="7" y1="4.5" x2="7" y2="19.5" />
      <line x1="17" y1="4.5" x2="17" y2="19.5" />
      <line x1="2.5" y1="9" x2="7" y2="9" />
      <line x1="2.5" y1="14" x2="7" y2="14" />
      <line x1="17" y1="9" x2="21.5" y2="9" />
      <line x1="17" y1="14" x2="21.5" y2="14" />
    </svg>
  );
}

export default function Manim({ raw }) {
  const { scene, src, caption } = parseManimBlock(raw);
  const [failed, setFailed] = useState(!src);

  return (
    <figure className="n-manim">
      {!failed ? (
        <video
          className="n-manim-video"
          src={src}
          autoPlay
          loop
          muted
          playsInline
          controls
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="n-manim-placeholder">
          <FilmIcon />
          <span className="n-manim-placeholder-text">
            Animation pending{scene ? <> — <code>{scene}</code></> : null}
          </span>
        </div>
      )}
      {caption ? <figcaption className="n-manim-caption">{caption}</figcaption> : null}
    </figure>
  );
}
