import { useEffect, useRef } from 'react';

// Recreation of the "Lazy Cat" hoodie ad:
//   Phase A (0–1690ms)  — 2D animation on a slate sketch background:
//     back-turned black cat holds, turns around, eyes pop in, tilts and
//     leans over the sketched circle, settles.
//   Phase B (1690–2350ms) — hard match-cut to real hoodie footage, then loop.

const BG = '#50515a';
const INK = '#0a0a0a';
const LINE = '#3d3f47';
const CREAM = '#e5e0b2';

const CUT_MS = 1690; // hard cut from animation to footage

// --- easing ---------------------------------------------------------------
const easeInOut = (u) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
const easeOutBack = (u) => 1 + 2.2 * Math.pow(u - 1, 3) + 1.2 * Math.pow(u - 1, 2);
const easeOut = (u) => 1 - Math.pow(1 - u, 3);
const linear = (u) => u;

// keys: [[time, value, easeForSegmentEndingHere?], ...]
function track(t, keys) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    if (t <= keys[i][0]) {
      const [t0, v0] = keys[i - 1];
      const [t1, v1, ease] = keys[i];
      const u = (t - t0) / (t1 - t0);
      return v0 + (v1 - v0) * (ease || easeInOut)(u);
    }
  }
  return keys[keys.length - 1][1];
}

// --- pose ------------------------------------------------------------------
// Beats (ms): 0-500 back-view hold · 500-850 turn (head narrows, ears swing)
// 850 eyes pop · 850-1120 tilt + lean onto circle · 1120-1300 settle · hold.
function pose(t) {
  const sway = Math.sin(t / 340); // idle micro-motion
  const p = {
    // head: center / radii / rotation (deg)
    hx: track(t, [[0, 155], [500, 155], [720, 134], [870, 160], [1150, 168]]),
    hy: track(t, [[0, 175], [500, 175], [720, 168], [870, 165], [1150, 178]]),
    hrx: track(t, [[0, 139], [500, 139], [720, 92], [870, 100], [1150, 127], [1320, 123]]),
    hry: track(t, [[0, 82], [500, 82], [720, 86], [870, 90], [1150, 96]]),
    hrot: track(t, [[0, -2], [500, -2], [720, -15], [870, 2], [1150, 0]]),
    // ears: absolute cat-space position + rotation (small corner flaps)
    elx: track(t, [[0, 44], [500, 44], [720, 86], [870, 100], [1150, 92]]),
    ely: track(t, [[0, 126], [500, 124], [720, 96], [870, 86], [1150, 98]]),
    elr: track(t, [[0, -58], [500, -58], [720, -40], [870, -30], [1150, -58]]),
    els: track(t, [[0, 1], [870, 1], [1150, 1.25]]),
    erx: track(t, [[0, 262], [500, 262], [720, 178], [870, 224], [1150, 240]]),
    ery: track(t, [[0, 122], [500, 120], [720, 78], [870, 88], [1150, 96]]),
    err: track(t, [[0, 52], [500, 52], [720, 6], [870, 30], [1150, 26]]),
    // body
    bx: track(t, [[0, 152], [720, 140], [870, 162], [1150, 172]]),
    by: track(t, [[0, 298], [870, 294], [1150, 298]]),
    brot: track(t, [[0, 0], [870, 0], [1150, 8]]),
    // whole-cat lean (rotates around pivot 200,340)
    crot: track(t, [[0, 0], [870, 0], [1150, 22, easeOut], [1320, 19, easeOutBack]]),
    cx: track(t, [[0, 0], [870, 0], [1150, 6, easeOut], [1320, 4, easeOutBack]]),
    cy: track(t, [[0, 0], [870, 0], [1150, 26, easeOut], [1320, 22, easeOutBack]]),
    // eyes pop in with overshoot
    eyes: track(t, [[850, 0], [870, 0], [940, 1, easeOutBack]]),
    // paw appears while leaning onto the circle edge
    paw: track(t, [[950, 0], [1180, 1, easeOutBack]]),
    // back-of-head highlight strokes fade as the face comes around
    hl: track(t, [[0, 0.55], [500, 0.55], [780, 0]]),
  };
  // idle breathing / sway
  if (t < 500) {
    p.hy += sway * 1.5;
    p.hrot += sway * 0.8;
  }
  if (t > 1320) {
    p.crot += sway * 0.6;
    p.cy += sway * 0.8;
  }
  return p;
}

const HEAD_D =
  'M -100,10 C -100,-32 -58,-58 -6,-60 C 46,-62 100,-38 100,4 C 100,40 58,60 -2,60 C -62,60 -100,44 -100,10 Z';
const BODY_D =
  'M -55,-40 C -20,-70 25,-68 50,-38 C 72,-12 68,30 40,52 C 10,72 -30,70 -52,44 C -72,20 -75,-15 -55,-40 Z';
const EAR_D =
  'M -26,18 C -30,-6 -14,-30 2,-34 C 10,-20 16,4 12,22 C 0,28 -14,26 -26,18 Z';

const GlassesPage = () => {
  const svgRef = useRef(null);
  const videoRef = useRef(null);
  const parts = useRef({});

  useEffect(() => {
    const svg = svgRef.current;
    const video = videoRef.current;
    if (!svg || !video) return;
    const g = (id) => svg.querySelector(`#${id}`);
    const P = {
      head: g('cat-head'), earL: g('cat-earl'), earR: g('cat-earr'),
      body: g('cat-body'), eyes: g('cat-eyes'), eyeL: g('cat-eyel'),
      eyeR: g('cat-eyer'), paw: g('cat-paw'), hl: g('cat-hl'), cat: g('cat'),
    };
    parts.current = P;

    let raf, start = null, playing = true, inVideo = false;

    const render = (t) => {
      const p = pose(t);
      P.cat.setAttribute(
        'transform',
        `translate(${p.cx},${p.cy}) rotate(${p.crot} 200 340)`
      );
      P.head.setAttribute(
        'transform',
        `translate(${p.hx},${p.hy}) rotate(${p.hrot}) scale(${p.hrx / 100},${p.hry / 60})`
      );
      P.earL.setAttribute('transform', `translate(${p.elx},${p.ely}) rotate(${p.elr}) scale(${p.els})`);
      P.earR.setAttribute('transform', `translate(${p.erx},${p.ery}) rotate(${p.err}) scale(-1,1)`);
      P.body.setAttribute('transform', `translate(${p.bx},${p.by}) rotate(${p.brot})`);
      const es = Math.max(p.eyes, 0);
      const sx = p.hrx / 100, sy = p.hry / 60;
      P.eyes.setAttribute('transform', `translate(${p.hx},${p.hy}) rotate(${p.hrot})`);
      P.eyes.setAttribute('opacity', es > 0.01 ? 1 : 0);
      P.eyeL.setAttribute('transform', `translate(${-16 * sx},${22 * sy}) scale(${es})`);
      P.eyeR.setAttribute('transform', `translate(${56 * sx},${-14 * sy}) scale(${es})`);
      P.paw.setAttribute('transform', `translate(268,318) scale(${Math.max(p.paw, 0)})`);
      P.hl.setAttribute('opacity', p.hl);
    };

    const showVideo = () => {
      inVideo = true;
      svg.style.visibility = 'hidden';
      video.style.visibility = 'visible';
      video.currentTime = 0;
      video.play().catch(() => {});
    };
    const showAnim = () => {
      inVideo = false;
      video.pause();
      video.style.visibility = 'hidden';
      svg.style.visibility = 'visible';
      start = null;
    };
    const onEnded = () => { if (playing) showAnim(); };
    video.addEventListener('ended', onEnded);

    const tick = (now) => {
      raf = requestAnimationFrame(tick);
      if (!playing || inVideo) return;
      if (start === null) start = now;
      const t = now - start;
      if (t >= CUT_MS) { showVideo(); return; }
      render(t);
    };
    raf = requestAnimationFrame(tick);

    // deterministic seek for the screenshot harness
    window.__glassesSeek = (ms) => { playing = false; video.pause(); video.style.visibility = 'hidden'; svg.style.visibility = 'visible'; render(ms); };
    window.__glassesPlay = () => { playing = true; start = null; showAnim(); };

    return () => {
      cancelAnimationFrame(raf);
      video.removeEventListener('ended', onEnded);
      delete window.__glassesSeek;
      delete window.__glassesPlay;
    };
  }, []);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center overflow-hidden">
      <div
        className="relative"
        style={{ aspectRatio: '310 / 384', height: 'min(88vh, 108vw)' }}
      >
        <svg
          ref={svgRef}
          viewBox="0 0 310 384"
          className="absolute inset-0 w-full h-full"
        >
          <rect width="310" height="384" fill={BG} />
          {/* sketch background: circles, artboard line, artist hand */}
          <g stroke={LINE} strokeWidth="1.1" fill="none" opacity="0.9">
            <line x1="0" y1="34" x2="310" y2="34" opacity="0.6" />
            <circle cx="190" cy="270" r="148" />
            <circle cx="-32" cy="302" r="128" />
            <circle cx="324" cy="208" r="70" />
            {/* sleeve + hand reaching in from top right */}
            <path d="M 236,0 C 240,42 248,82 266,108" />
            <path d="M 310,58 C 297,78 289,95 285,112" />
            <path d="M 266,108 C 259,117 260,130 270,137 C 281,144 295,140 300,129 C 304,120 300,111 292,107" />
            <path d="M 268,124 L 246,150" strokeWidth="0.9" />
          </g>

          {/* cat */}
          <g id="cat">
            <g id="cat-earl" fill={INK}><path d={EAR_D} /></g>
            <g id="cat-earr" fill={INK}><path d={EAR_D} /></g>
            <g id="cat-body" fill={INK}><path d={BODY_D} /></g>
            <g id="cat-head" fill={INK}><path d={HEAD_D} /></g>
            {/* thin hand-drawn highlights on the back of the head */}
            <g id="cat-hl" stroke="#f2f0e8" strokeWidth="1" fill="none" strokeLinecap="round">
              <path d="M 46,150 C 38,164 34,182 36,198" />
              <path d="M 236,128 C 246,138 252,150 254,162" />
            </g>
            <g id="cat-eyes" opacity="0">
              <g id="cat-eyel">
                <ellipse rx="33" ry="26" fill={CREAM} transform="rotate(-14)" />
                <ellipse rx="17" ry="12.5" fill={INK} transform="rotate(-14)" />
              </g>
              <g id="cat-eyer">
                <ellipse rx="18" ry="15.5" fill={CREAM} transform="rotate(-10)" />
                <ellipse rx="8.5" ry="7" fill={INK} transform="rotate(-10)" />
              </g>
            </g>
            <g id="cat-paw" fill={INK}>
              <ellipse rx="17" ry="12" transform="rotate(24)" />
            </g>
          </g>
        </svg>

        <video
          ref={videoRef}
          src="/assets/glasses/hoodie.mp4"
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ visibility: 'hidden' }}
        />
      </div>
    </div>
  );
};

export default GlassesPage;
