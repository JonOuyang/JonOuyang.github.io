import { useEffect, useMemo, useRef, useState, Component } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import GarageScene from './GarageScene';
import { TL, DOOR, calibrate, easeInOutCubic, smoothstep, clamp01 } from './timeline';

// /delorean — the nameplate page, until the garage door it was painted on opens.
// Timeline: 0.5s hold -> white lines stretch into a garage shape -> motor
// shudder (DOM text hands off to the 3D door face) -> sectional door rolls up
// to reveal a DeLorean in a white room. ?t=<seconds> freezes any moment.

class CanvasBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {}
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function buildLineSpecs(calib) {
  const o = calib.openPx;
  const cx = o.left + o.w / 2;
  const seamY = (i) => o.bottom - i * DOOR.PANEL_H * calib.ppm;
  return [
    { t0: 0.50, d: 0.62, a: [cx, o.bottom], b: [o.left, o.bottom] },
    { t0: 0.50, d: 0.62, a: [cx, o.bottom], b: [o.right, o.bottom] },
    { t0: 0.82, d: 0.72, a: [o.left, o.bottom], b: [o.left, o.top] },
    { t0: 0.82, d: 0.72, a: [o.right, o.bottom], b: [o.right, o.top] },
    { t0: 1.18, d: 0.55, a: [o.left, o.top], b: [cx, o.top] },
    { t0: 1.18, d: 0.55, a: [o.right, o.top], b: [cx, o.top] },
    { t0: 1.50, d: 0.50, a: [o.left, seamY(1)], b: [o.right, seamY(1)] },
    { t0: 1.67, d: 0.50, a: [o.right, seamY(2)], b: [o.left, seamY(2)] },
    { t0: 1.84, d: 0.50, a: [o.left, seamY(3)], b: [o.right, seamY(3)] },
  ];
}

const DeloreanPage = () => {
  const reduced = useMemo(
    () => typeof window !== 'undefined'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  );
  const freezeT = useMemo(() => {
    const v = new URLSearchParams(window.location.search).get('t');
    return v == null ? null : Math.max(0, parseFloat(v) || 0);
  }, []);
  const debug = useMemo(
    () => new URLSearchParams(window.location.search).has('debug'),
    []
  );

  const rootRef = useRef(null);
  const nameRef = useRef(null);
  const subRef = useRef(null);
  const svgRef = useRef(null);
  const lineRefs = useRef([]);
  const timing = useRef({ start: null, freezeT }).current;
  const gates = useRef({ fonts: false, canvas: false }).current;

  const [measure, setMeasure] = useState(null);
  const [modelOk, setModelOk] = useState(false);

  // Measure the DOM nameplate once fonts are in; recalibrate on resize.
  useEffect(() => {
    if (reduced) return undefined;
    let dead = false;
    let lastKey = '';
    let debTimer = null;
    const doMeasure = () => {
      if (dead || !gates.fonts) return; // fallback-font metrics poison the calibration
      if (!nameRef.current || !subRef.current || !rootRef.current) return;
      const rr = rootRef.current.getBoundingClientRect();
      const nr = nameRef.current.getBoundingClientRect();
      const sr = subRef.current.getBoundingClientRect();
      // Bail if nothing meaningful changed — re-measures rebake the door texture.
      const key = `${rr.width.toFixed(1)}x${rr.height.toFixed(1)}:${nr.width.toFixed(1)}`;
      if (key === lastKey) return;
      lastKey = key;
      // Calibrate against the root element, not the window — they can disagree
      // (mobile URL-bar collapse, headless chrome allowance) and the canvas
      // tracks the element.
      const calib = calibrate(rr.width, rr.height, nr.width);
      setMeasure({
        calib,
        nameRect: { left: nr.left, top: nr.top, width: nr.width, height: nr.height },
        subRect: { left: sr.left, top: sr.top, width: sr.width, height: sr.height },
        nameFontPx: parseFloat(getComputedStyle(nameRef.current).fontSize),
        subFontPx: parseFloat(getComputedStyle(subRef.current).fontSize),
      });
    };
    const measureSoon = () => {
      clearTimeout(debTimer);
      debTimer = setTimeout(doMeasure, 150);
    };
    // fonts.ready (and even fonts.load) resolve as no-ops while the Google
    // Fonts stylesheet is still in flight — poll until the face is actually
    // usable or a 2.5s deadline passes, else the nameplate measures in
    // fallback and the whole 3D calibration inherits the wrong width.
    const fontsSettled = async () => {
      const deadline = performance.now() + 2500;
      for (;;) {
        try {
          await Promise.all([
            document.fonts.load('700 100px "Space Grotesk"'),
            document.fonts.load('500 16px "Space Grotesk"'),
          ]);
        } catch { /* keep polling */ }
        if (document.fonts.check('700 16px "Space Grotesk"') || performance.now() > deadline) return;
        await new Promise((r) => setTimeout(r, 100));
      }
    };
    fontsSettled().then(() => {
      if (dead) return;
      gates.fonts = true;
      doMeasure();
      if (gates.canvas && timing.start == null) timing.start = performance.now();
    });
    document.fonts.addEventListener?.('loadingdone', doMeasure);
    window.addEventListener('resize', measureSoon);
    const ro = new ResizeObserver(measureSoon);
    if (rootRef.current) ro.observe(rootRef.current);
    return () => {
      dead = true;
      clearTimeout(debTimer);
      window.removeEventListener('resize', measureSoon);
      ro.disconnect();
      document.fonts.removeEventListener?.('loadingdone', doMeasure);
    };
  }, [reduced, gates, timing]);

  // The GLB may not exist yet — Vite's dev server answers missing assets with
  // index.html, so a 200 isn't enough; require a non-HTML content type.
  useEffect(() => {
    if (reduced) return;
    fetch('/assets/delorean/model/delorean.glb', { method: 'HEAD' })
      .then((r) => {
        const ct = r.headers.get('content-type') || '';
        setModelOk(r.ok && !ct.includes('text/html'));
      })
      .catch(() => setModelOk(false));
  }, [reduced]);

  // DOM-side conductor: SVG line formation + nameplate handoff to the door.
  useEffect(() => {
    if (reduced || !measure) return undefined;
    const specs = buildLineSpecs(measure.calib);
    let raf;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const t = timing.freezeT != null
        ? timing.freezeT
        : timing.start == null ? -1 : (performance.now() - timing.start) / 1000;
      const swap = t >= TL.motorStart;
      if (nameRef.current) nameRef.current.style.visibility = swap ? 'hidden' : 'visible';
      if (subRef.current) subRef.current.style.visibility = swap ? 'hidden' : 'visible';
      if (svgRef.current) svgRef.current.style.display = t > TL.motorStart + 0.25 ? 'none' : 'block';
      specs.forEach((s, i) => {
        const el = lineRefs.current[i];
        if (!el) return;
        const e = easeInOutCubic((t - s.t0) / s.d);
        if (e <= 0) { el.setAttribute('opacity', '0'); return; }
        el.setAttribute('x1', s.a[0]);
        el.setAttribute('y1', s.a[1]);
        el.setAttribute('x2', s.a[0] + (s.b[0] - s.a[0]) * e);
        el.setAttribute('y2', s.a[1] + (s.b[1] - s.a[1]) * e);
        const fadeIn = clamp01((t - s.t0) / 0.12);
        const fadeOut = 1 - smoothstep(TL.motorStart - 0.02, TL.motorStart + 0.08, t);
        el.setAttribute('opacity', (0.95 * fadeIn * fadeOut).toFixed(3));
      });
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [reduced, measure, timing]);

  return (
    <div className="dl-root" ref={rootRef}>
      <style>{`
        .dl-root {
          position: fixed; inset: 0;
          background: #000;
          overflow: hidden;
          cursor: default;
        }
        .dl-canvas { position: absolute; inset: 0; z-index: 0; }
        .dl-lines { position: absolute; inset: 0; z-index: 1; pointer-events: none;
          filter: drop-shadow(0 0 7px rgba(255, 255, 255, 0.55)); }
        .dl-card {
          position: absolute; inset: 0; z-index: 2;
          display: flex; align-items: center; justify-content: center;
          text-align: center; pointer-events: none;
        }
        .dl-word {
          font-family: "Space Grotesk", "Google Sans", sans-serif;
          font-weight: 700; color: #fff;
          font-size: clamp(3.5rem, 15vw, 15rem);
          letter-spacing: -0.035em; line-height: 1;
          text-shadow: 0 0 clamp(14px, 2.5vw, 40px) rgba(215, 226, 236, 0.18);
          margin: 0;
        }
        .dl-sub {
          font-family: "Space Grotesk", "Google Sans", sans-serif;
          font-weight: 500;
          font-size: clamp(0.7rem, 1.1vw, 0.92rem);
          letter-spacing: 0.02em;
          color: #5c6672;
          margin-top: clamp(1rem, 2.5vh, 1.8rem);
        }
      `}</style>

      {!reduced && measure && (
        <div className="dl-canvas">
          <CanvasBoundary>
            <Canvas
              dpr={Math.min(window.devicePixelRatio || 1, 1.8)}
              shadows="soft"
              gl={{ antialias: true, powerPreference: 'high-performance' }}
              onCreated={({ gl }) => {
                gl.toneMapping = THREE.ACESFilmicToneMapping;
                gl.toneMappingExposure = 1.12;
                gates.canvas = true;
                if (gates.fonts && timing.start == null) timing.start = performance.now();
              }}
            >
              <GarageScene measure={measure} timing={timing} modelOk={modelOk} />
            </Canvas>
          </CanvasBoundary>
        </div>
      )}

      {!reduced && (
        <svg ref={svgRef} className="dl-lines" width="100%" height="100%">
          {Array.from({ length: 9 }, (_, i) => (
            <line
              key={i}
              ref={(el) => { lineRefs.current[i] = el; }}
              stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0"
            />
          ))}
        </svg>
      )}

      <div className="dl-card">
        <div>
          <h1 className="dl-word" ref={nameRef}>Jonathan</h1>
          <div className="dl-sub" ref={subRef}>
            I couldn&apos;t figure out how to design a good home page. I&apos;m just an engineer
          </div>
        </div>
      </div>

      {debug && measure && (
        <>
          <div style={{
            position: 'absolute', zIndex: 30, border: '1px solid red', pointerEvents: 'none',
            left: measure.calib.openPx.left, top: measure.calib.openPx.top,
            width: measure.calib.openPx.w, height: measure.calib.openPx.h,
          }} />
          <pre style={{
            position: 'absolute', zIndex: 30, left: 8, bottom: 8, color: '#0f0',
            font: '11px monospace', textAlign: 'left', margin: 0,
          }}>
            {JSON.stringify({
              vw: measure.calib.vw, vh: measure.calib.vh,
              nameW: Math.round(measure.nameRect.width),
              ppm: +measure.calib.ppm.toFixed(2),
              dist: +measure.calib.dist.toFixed(3),
              camZ: +measure.calib.camZ.toFixed(3),
              openW: Math.round(measure.calib.openPx.w),
              cam: (typeof window !== 'undefined' && window.__dlCam) || null,
            }, null, 1)}
          </pre>
        </>
      )}
    </div>
  );
};

export default DeloreanPage;
