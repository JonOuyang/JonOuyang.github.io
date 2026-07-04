import { useEffect, useRef, useState } from "react";

const NAME = "Jonathan";

// ── glyph slam ─────────────────────────────────────────────────────────────
// One typographic voice (Google Sans 900) carries every name; each brand's
// REAL glyph rides next to it as a compact mark — authenticity without the
// sponsor-wall chaos of full wordmark logos. A hairline "record" band of
// smaller achievements fills the bottom. Everything fades → Jonathan.
const L = (f) => "/assets/logos/" + f;

// hero slams — glyph mark + typographic name, alternating sides. Sizes are
// capped in vw AND vh so the stack fits any aspect ratio (no overflow).
const HEROES = [
  {
    glyph: { src: "deepmind_mark.svg", alt: "Google DeepMind" },
    name: "GOOGLE DEEPMIND",
    align: "left",
    tag: "INTERN — AI STUDIO",
  },
  {
    glyph: { src: "stanford_s.svg", alt: "Stanford" },
    name: "STANFORD",
    align: "right",
    sub2: { logo: { src: "toyota.svg", h: "min(2.8vw, 4vh)", alt: "Toyota" }, text: "RESEARCH INSTITUTE" },
    tag: "VISITING RESEARCHER — ILIAD LAB · 96% AUTONOMOUS PARKING",
  },
  {
    glyph: { src: "openai_glyph.svg", alt: "OpenAI" },
    name: "OPENAI",
    align: "left",
    sub2: { logo: { src: "ucla.svg", h: "min(2.7vw, 3.8vh)", alt: "UCLA" }, text: "ROBOT INTELLIGENCE LAB" },
    tag: "RESEARCH COLLABORATION — RSS 2025 · CO-FIRST AUTHOR",
  },
  {
    glyph: { src: "amazon_icon.svg", alt: "Amazon" },
    name: "AMAZON",
    align: "right",
    tag: "SOFTWARE ENGINEER INTERN — PRIME VIDEO",
  },
];

// bottom record band — the rest of the flexes, compact stat cells
const MINIS = [
  { big: "GRAND PRIZE", cap: "GEMINI API COMPETITION — WON A DELOREAN", glogo: true },
  { big: "$21,000", cap: "HACKTECH — WINNER" },
  { big: "3× PUBLISHED", cap: "RSS 2025 · IEEE SSIAI · IEEE TRONSHOW" },
  { big: "2× FOUNDER", cap: "VISORLABS · GLITCH @ UCLA" },
  { big: "INCOMING", cap: "IRONSITE — WORLD MODELS FOR ROBOTICS" },
  { big: "STEALTH", cap: "FOUNDING ENGINEER — AI STARTUP" },
];

const GS = '"Google Sans", sans-serif';

const Slam = ({ item }) => (
  <div style={{ width: "100%", textAlign: item.align }}>
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: item.align === "right" ? "flex-end" : "flex-start",
        gap: "1.3vw",
        animation: "slamIn 0.34s cubic-bezier(0.16, 1, 0.3, 1) both",
      }}
    >
      <img
        src={L(item.glyph.src)}
        alt={item.glyph.alt}
        style={{ height: "min(4.8vw, 6.8vh)", width: "auto", display: "block", flex: "none" }}
      />
      <h2
        style={{
          fontFamily: GS,
          fontSize: "min(6vw, 8.5vh)",
          fontWeight: 900,
          letterSpacing: "-0.04em",
          lineHeight: 0.92,
          color: "#0A0A0A",
          margin: 0,
          whiteSpace: "nowrap",
        }}
      >
        {item.name}
      </h2>
    </div>
    {item.sub2 && (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: item.align === "right" ? "flex-end" : "flex-start",
          gap: "0.8vw",
          marginTop: "1vh",
          animation: "subIn 0.45s ease 0.1s both",
        }}
      >
        <span style={{ fontFamily: GS, fontWeight: 300, fontSize: "min(2.2vw, 3.2vh)", color: "#C4C4C4", lineHeight: 1 }}>
          ×
        </span>
        <img src={L(item.sub2.logo.src)} alt={item.sub2.logo.alt} style={{ height: item.sub2.logo.h, width: "auto" }} />
        <span
          style={{
            fontFamily: GS,
            fontSize: "min(2vw, 2.9vh)",
            fontWeight: 800,
            letterSpacing: "-0.015em",
            lineHeight: 1,
            color: "#404040",
          }}
        >
          {item.sub2.text}
        </span>
      </div>
    )}
    {item.tag && (
      <div
        style={{
          fontFamily: GS,
          fontSize: "10px",
          fontWeight: 600,
          letterSpacing: "0.24em",
          textTransform: "uppercase",
          color: "#8F8F8F",
          marginTop: "0.9vh",
          animation: "subIn 0.45s ease 0.16s both",
        }}
      >
        {item.tag}
      </div>
    )}
  </div>
);

const Mini = ({ item }) => (
  <div style={{ animation: "slamIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) both", minWidth: 0 }}>
    <div
      style={{
        fontFamily: GS,
        fontSize: "clamp(13px, 1.4vw, 21px)",
        fontWeight: 900,
        letterSpacing: "-0.02em",
        lineHeight: 1,
        color: "#0A0A0A",
        whiteSpace: "nowrap",
      }}
    >
      {item.big}
    </div>
    <div
      style={{
        fontFamily: GS,
        fontSize: "8.5px",
        fontWeight: 600,
        letterSpacing: "0.16em",
        textTransform: "uppercase",
        color: "#9C9C9C",
        lineHeight: 1.5,
        marginTop: "5px",
        display: "flex",
        alignItems: "flex-start",
        gap: "5px",
      }}
    >
      {item.glogo && <img src={L("gemini_icon.svg")} alt="Gemini" style={{ height: "11px", width: "auto", marginTop: "1px" }} />}
      <span>{item.cap}</span>
    </div>
  </div>
);

// ── debug frame-stepper ── visit /walk?step to step the loop CONTENT frame-by-frame.
const STEP_MODE =
  typeof window !== "undefined" &&
  new URLSearchParams(window.location.search).has("step");

const DIAG_MODE =
  typeof window !== "undefined" &&
  new URLSearchParams(window.location.search).has("diag");

// ── playback-timing probe (visit /walk?probe) ── overlays a live HUD on the REAL main-page playback:
// which path is active (canvas vs native <video loop> fallback), framesReady, rolling/peak frame dt,
// frame-skips, and the WRAP dt (109→0) vs the intro→loop handoff dt. Also POSTs snapshots to :8899 for
// headless reads. Behind this flag the production playback is byte-for-byte unchanged.
const PROBE_MODE =
  typeof window !== "undefined" &&
  new URLSearchParams(window.location.search).has("probe");

const FPS = 60;
const LAST_REAL = 102;
// ⚠️ MUST equal the loop's actual frame count (ffprobe -count_frames public/assets/walk/loop.webm).
// If this is off by even 1, the capture duplicates/drops a frame at the wrap → a freeze/jump every loop.
// v15 = 103 real + 7 bridge = 110. Update this whenever the loop is re-rendered.
const TOTAL = 110;
// bump when the video assets change — busts any stale browser-cached copy
const ASSET_V = "?v=15";
// Safari can't decode VP9-alpha webm (it plays the RAW video, background and all) → serve HEVC-with-alpha .mov
const IS_SAFARI =
  typeof navigator !== "undefined" &&
  /safari/i.test(navigator.userAgent) &&
  !/chrome|chromium|crios|android|edg/i.test(navigator.userAgent);
const EXT = IS_SAFARI ? ".mov" : ".webm";
const SRC_INTRO = "/assets/walk/intro" + EXT + ASSET_V;
const SRC_LOOP = "/assets/walk/loop" + EXT + ASSET_V;
// figure bounding box (union over all frames, small pad) — crop capture to this to cut memory ~78%
const CROP = { x: 478, y: 68, w: 318, h: 652 };

const LoopStepper = () => {
  const canvasRef = useRef(null);
  const bitmapsRef = useRef([]);
  const idxRef = useRef(0);
  const rafRef = useRef(0);
  const [idx, setIdx] = useState(0);
  const [loaded, setLoaded] = useState(0);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);

  const draw = (i) => {
    const c = canvasRef.current;
    const bm = bitmapsRef.current[i];
    if (!c || !bm) return;
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.drawImage(bm, 0, 0, c.width, c.height);
  };

  const go = (i) => {
    const w = ((i % TOTAL) + TOTAL) % TOTAL;
    idxRef.current = w;
    draw(w);
    setIdx(w);
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const arr = new Array(TOTAL);
      let done = 0;
      const BATCH = 12;
      for (let s = 0; s < TOTAL && !cancelled; s += BATCH) {
        await Promise.all(
          Array.from({ length: Math.min(BATCH, TOTAL - s) }, (_, k) => s + k).map(async (i) => {
            const res = await fetch(`/_stepframes/f${String(i).padStart(4, "0")}.png`);
            arr[i] = await createImageBitmap(await res.blob());
            done += 1;
            if (!cancelled) setLoaded(done);
          })
        );
      }
      if (cancelled) return;
      bitmapsRef.current = arr;
      const c = canvasRef.current;
      if (c && arr[0]) { c.width = arr[0].width; c.height = arr[0].height; }
      setReady(true);
      draw(0);
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (!ready) return;
      if (e.key === "ArrowRight") { e.preventDefault(); setPlaying(false); go(idxRef.current + 1); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); setPlaying(false); go(idxRef.current - 1); }
      else if (e.key === "ArrowUp") { e.preventDefault(); setPlaying(false); go(idxRef.current + 10); }
      else if (e.key === "ArrowDown") { e.preventDefault(); setPlaying(false); go(idxRef.current - 10); }
      else if (e.key === " ") { e.preventDefault(); setPlaying((p) => !p); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [ready]);

  useEffect(() => {
    if (!playing || !ready) return;
    let last = performance.now();
    let acc = 0;
    const dur = 1000 / FPS;
    const tick = (now) => {
      acc += now - last; last = now;
      let stepped = false;
      while (acc >= dur) { acc -= dur; idxRef.current = (idxRef.current + 1) % TOTAL; stepped = true; }
      if (stepped) { draw(idxRef.current); setIdx(idxRef.current); }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [playing, ready]);

  const region = idx <= LAST_REAL ? "REAL" : "RIFE BRIDGE";
  let marker = "";
  if (idx === 0) marker = "loop start (wrap lands here)";
  else if (idx === LAST_REAL) marker = "last REAL frame — next is the real→RIFE seam";
  else if (idx === LAST_REAL + 1) marker = "first RIFE bridge frame (real→RIFE seam)";
  else if (idx === TOTAL - 1) marker = "LAST frame — next → WRAP back to 0";

  const box = {
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
    fontSize: "13px", lineHeight: 1.6, color: "#111",
    background: "rgba(255,255,255,0.92)", border: "1px solid #ddd",
    borderRadius: "8px", padding: "12px 16px", whiteSpace: "pre",
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-white">
      <canvas ref={canvasRef} className="absolute left-1/2 top-1/2 h-[92vh] w-auto max-w-none -translate-x-1/2 -translate-y-1/2" />
      {!ready && (
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 20, ...box }}>
          {`decoding frames…  ${loaded} / ${TOTAL}`}
        </div>
      )}
      <div style={{ position: "absolute", top: 16, left: 16, zIndex: 20, ...box }}>
        {`FRAME  ${idx} / ${TOTAL - 1}   [${region}]${playing ? "   ▶ playing" : ""}
${marker ? "→ " + marker : ""}`}
      </div>
      <div style={{ position: "absolute", bottom: 16, left: 16, zIndex: 20, ...box, fontSize: "12px", color: "#555" }}>
        {`←/→  step ±1 frame (wraps 109→0)     ↑/↓  ±10     space  play/pause
real frames 0–${LAST_REAL} · RIFE bridge ${LAST_REAL + 1}–${TOTAL - 1} · wrap = ${TOTAL - 1}→0`}
      </div>
    </div>
  );
};

// ── blip diagnostic (visit /walk?diag) ── no text; isolates the figure. Paints RED where the biggest
// frame-to-frame light change happens (temporal 2nd-difference = a "blip", not smooth motion), plots that
// metric across the whole loop, and shows live playback timing so we can tell a CONTENT blip from a STUTTER.
const MW = 320, MH = 180; // analysis resolution
const DiagLoop = () => {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  const bmpsRef = useRef([]);
  const lumsRef = useRef([]);
  const alsRef = useRef([]);
  const metricRef = useRef(new Float32Array(TOTAL));
  const scaleRef = useRef(1);
  const rafRef = useRef(0);
  const [ready, setReady] = useState(false);
  const [loaded, setLoaded] = useState(0);
  const [hud, setHud] = useState({ idx: 0, neck: 0, whole: 0, peakF: 0, peakV: 0, dt: 0, maxDt: 0, skips: 0 });

  // neck ROI in analysis coords (full-res x500-780 y180-300)
  const NX0 = Math.round(500 * MW / 1280), NX1 = Math.round(780 * MW / 1280);
  const NY0 = Math.round(180 * MH / 720), NY1 = Math.round(300 * MH / 720);

  // load frames, precompute luminance/alpha + per-frame neck & whole-figure blip metric
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const off = document.createElement("canvas"); off.width = MW; off.height = MH;
      const octx = off.getContext("2d", { willReadFrequently: true });
      const bmps = new Array(TOTAL), lums = new Array(TOTAL), als = new Array(TOTAL);
      for (let k = 0; k < TOTAL && !cancelled; k++) {
        const r = await fetch(`/_stepframes/f${String(k).padStart(4, "0")}.png`);
        bmps[k] = await createImageBitmap(await r.blob());
        octx.clearRect(0, 0, MW, MH); octx.drawImage(bmps[k], 0, 0, MW, MH);
        const d = octx.getImageData(0, 0, MW, MH).data;
        const lum = new Float32Array(MW * MH), al = new Uint8Array(MW * MH);
        for (let p = 0, q = 0; p < MW * MH; p++, q += 4) {
          lum[p] = 0.114 * d[q] + 0.587 * d[q + 1] + 0.299 * d[q + 2];
          al[p] = d[q + 3];
        }
        lums[k] = lum; als[k] = al; setLoaded(k + 1);
      }
      if (cancelled) return;
      bmpsRef.current = bmps; lumsRef.current = lums; alsRef.current = als;
      const metric = new Float32Array(TOTAL); let gmax = 1e-3;
      for (let k = 0; k < TOTAL; k++) {
        const a = lums[(k - 1 + TOTAL) % TOTAL], b = lums[k], c = lums[(k + 1) % TOTAL], al = als[k];
        let s = 0, n = 0;
        for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) {
          const p = y * MW + x; if (al[p] < 128) continue;
          const v = Math.abs(b[p] - 0.5 * (a[p] + c[p]));
          if (v > gmax) gmax = v;
          if (x >= NX0 && x < NX1 && y >= NY0 && y < NY1) { s += v; n++; }
        }
        metric[k] = n ? s / n : 0;
      }
      metricRef.current = metric; scaleRef.current = gmax * 0.5;
      setReady(true);
    })();
    return () => { cancelled = true; };
  }, []);

  // playback + red overlay + HUD + chart
  useEffect(() => {
    if (!ready) return;
    const canvas = canvasRef.current; if (!canvas) return;
    canvas.width = 1280; canvas.height = 720;
    const ctx = canvas.getContext("2d");
    const bmps = bmpsRef.current, lums = lumsRef.current, als = alsRef.current;
    const metric = metricRef.current, SCALE = scaleRef.current;
    const redC = document.createElement("canvas"); redC.width = MW; redC.height = MH;
    const redCtx = redC.getContext("2d");
    const redImg = redCtx.createImageData(MW, MH);
    let peakF = 0, peakV = 0;
    for (let k = 0; k < TOTAL; k++) if (metric[k] > peakV) { peakV = metric[k]; peakF = k; }

    const drawRed = (k) => {
      const a = lums[(k - 1 + TOTAL) % TOTAL], b = lums[k], c = lums[(k + 1) % TOTAL], al = als[k];
      const D = redImg.data;
      for (let p = 0, q = 0; p < MW * MH; p++, q += 4) {
        let v = 0;
        if (al[p] >= 128) v = Math.abs(b[p] - 0.5 * (a[p] + c[p]));
        const t = Math.min(v / SCALE, 1);
        D[q] = 255; D[q + 1] = 0; D[q + 2] = 0; D[q + 3] = t > 0.18 ? Math.round(t * 230) : 0;
      }
      redCtx.putImageData(redImg, 0, 0);
    };

    const cc = chartRef.current && chartRef.current.getContext("2d");
    const CW = 470, CH = 96;
    let mmax = 1e-3; for (let k = 0; k < TOTAL; k++) mmax = Math.max(mmax, metric[k]);
    const drawChart = (cur) => {
      if (!cc) return;
      cc.fillStyle = "#fafafa"; cc.fillRect(0, 0, CW, CH);
      for (let k = 0; k < TOTAL; k++) {
        const x = (k / TOTAL) * CW, h = (metric[k] / mmax) * (CH - 14);
        cc.fillStyle = k === peakF ? "#dc2626" : (k > LAST_REAL ? "#c084fc" : "#94a3b8");
        cc.fillRect(x, CH - h, Math.max(1.5, CW / TOTAL - 0.5), h);
      }
      const cx = (cur / TOTAL) * CW;
      cc.strokeStyle = "#111"; cc.lineWidth = 1;
      cc.beginPath(); cc.moveTo(cx, 0); cc.lineTo(cx, CH); cc.stroke();
    };

    let idx = 0, last = performance.now(), acc = 0, skips = 0, maxDt = 0, lastHud = 0;
    const dur = 1000 / FPS;
    const tick = (now) => {
      const dt = now - last; acc += dt; last = now;
      if (dt > maxDt && now - lastHud < 5000) maxDt = dt;
      let adv = 0;
      while (acc >= dur) { acc -= dur; idx = (idx + 1) % TOTAL; adv++; }
      if (adv > 1) skips += adv - 1;
      ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, 1280, 720);
      ctx.drawImage(bmps[idx], 0, 0);
      drawRed(idx);
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(redC, 0, 0, 1280, 720);
      if (now - lastHud > 60) {
        lastHud = now;
        setHud({ idx, neck: metric[idx], peakF, peakV, dt: Math.round(dt * 10) / 10, maxDt: Math.round(maxDt * 10) / 10, skips });
        maxDt = 0;
        drawChart(idx);
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [ready]);

  const box = { fontFamily: "ui-monospace,Menlo,monospace", fontSize: "12px", lineHeight: 1.55, color: "#111", background: "rgba(255,255,255,.94)", border: "1px solid #ddd", borderRadius: "8px", padding: "10px 12px" };
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-white">
      <canvas ref={canvasRef} className="absolute left-1/2 top-1/2 h-[92vh] w-auto max-w-none -translate-x-1/2 -translate-y-1/2" />
      {!ready && <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 20, ...box }}>{`analyzing frames… ${loaded}/${TOTAL}`}</div>}
      <div style={{ position: "absolute", top: 14, left: 14, zIndex: 20, ...box, whiteSpace: "pre" }}>
        {`RED = biggest frame-to-frame LIGHT CHANGE (temporal 2nd-diff)
now: frame ${hud.idx}      neck-blip metric ${hud.neck.toFixed(2)}
PEAK blip: frame ${hud.peakF} (metric ${hud.peakV.toFixed(2)}) ${hud.peakF > LAST_REAL ? "· RIFE bridge frame" : "· real frame"}
playback: dt ${hud.dt}ms  peak ${hud.maxDt}ms  frame-skips ${hud.skips}`}
      </div>
      <div style={{ position: "absolute", bottom: 14, left: 14, zIndex: 20, ...box }}>
        <div style={{ marginBottom: 6, color: "#555" }}>neck-blip metric across the loop — red bar = peak · purple = RIFE bridge · black line = now</div>
        <canvas ref={chartRef} width={470} height={96} style={{ display: "block", borderRadius: 4 }} />
      </div>
    </div>
  );
};

// ── main page ──────────────────────────────────────────────────────────────
const WalkPage = () => {
  if (DIAG_MODE) return <DiagLoop />;
  if (STEP_MODE) return <LoopStepper />;

  const [phase, setPhase] = useState("intro");
  const introRef = useRef(null);
  const loopRef = useRef(null);       // fallback: native <video loop>
  const canvasRef = useRef(null);     // primary: smooth canvas playback
  const capVideoRef = useRef(null);   // hidden source we capture frames from
  const bitmapsRef = useRef(null);    // captured cropped alpha ImageBitmap[]
  const [framesReady, setFramesReady] = useState(false);

  // ── probe instrumentation (only live under ?probe) ──
  const [probe, setProbe] = useState(
    PROBE_MODE ? { path: "…", frames: false, idx: 0, dt: 0, maxDt: 0, skips: 0, wrapDt: 0, wrapMax: 0, handoff: 0 } : null
  );
  const P = useRef({ lastT: 0, lastIdx: -1, maxDt: 0, skips: 0, wrapDt: 0, wrapMax: 0, handoff: 0, introEnd: 0, lastHud: 0, path: "…", frames: false, ring: [], prevSample: null, bitmapSeam: null });
  // record one frame presentation from either playback path
  const probePresent = (now, idx, path) => {
    if (!PROBE_MODE) return;
    const p = P.current;
    p.path = path; p.frames = framesReady;
    if (p.introEnd && !p.handoff) p.handoff = now - p.introEnd; // intro→loop first-frame latency
    let dt = 0;
    if (p.lastT) {
      dt = now - p.lastT;
      if (dt > p.maxDt) p.maxDt = dt;
      if (idx === 0 && p.lastIdx > TOTAL - 6 && p.lastIdx <= TOTAL - 1) { // wrap 109→0
        p.wrapDt = dt; if (dt > p.wrapMax) p.wrapMax = dt;
      }
    }
    p.lastT = now; p.lastIdx = idx;
    if (now - p.lastHud > 140) {
      p.lastHud = now;
      setProbe({ path: p.path, frames: p.frames, idx, dt: Math.round(dt * 10) / 10, maxDt: Math.round(p.maxDt * 10) / 10, skips: p.skips, wrapDt: Math.round(p.wrapDt * 10) / 10, wrapMax: Math.round(p.wrapMax * 10) / 10, handoff: Math.round(p.handoff) });
      p.maxDt = 0;
    }
  };

  // probe: sample the DISPLAYED canvas each drawn frame (neck region, frame coords x540 y230 220x110) —
  // composite-over-white mean lum + abs-diff vs the previous displayed frame. Catches presentation-order
  // bugs (skips/double-draws/wrong index at the wrap) that source-frame analysis can't see.
  const NECK = { x: 540, y: 230, w: 220, h: 110 };
  const sampleCanvas = (ctx, idx, now) => {
    const p = P.current;
    try {
      const d = ctx.getImageData(NECK.x, NECK.y, NECK.w, NECK.h).data;
      const n = d.length / 4;
      let s = 0;
      for (let q = 0; q < d.length; q += 4) {
        const a = d[q + 3] / 255;
        s += (0.299 * d[q] + 0.587 * d[q + 1] + 0.114 * d[q + 2]) * a + 255 * (1 - a);
      }
      let diff = 0;
      if (p.prevSample) {
        const pd = p.prevSample;
        let t = 0;
        for (let q = 0; q < d.length; q += 4) {
          const a = d[q + 3] / 255, pa = pd[q + 3] / 255;
          t += Math.abs(((0.299 * d[q] + 0.587 * d[q + 1] + 0.114 * d[q + 2]) * a + 255 * (1 - a)) -
                        ((0.299 * pd[q] + 0.587 * pd[q + 1] + 0.114 * pd[q + 2]) * pa + 255 * (1 - pa)));
        }
        diff = t / n;
      }
      p.prevSample = d;
      p.ring.push({ i: idx, t: Math.round(now * 10) / 10, lum: Math.round((s / n) * 100) / 100, d: Math.round(diff * 100) / 100 });
      if (p.ring.length > 400) p.ring.splice(0, p.ring.length - 400);
    } catch (e) {}
  };

  const [heroCount, setHeroCount] = useState(0); // hero logo slams revealed so far
  const [miniCount, setMiniCount] = useState(0); // record-band cells revealed so far
  const [dotsVisible, setDotsVisible] = useState(true);
  const [textFading, setTextFading] = useState(false);
  const [showName, setShowName] = useState(false);
  const [showPoster, setShowPoster] = useState(true);
  // poster removal is driven by the intro's first presented frame (see reveal effect below), NOT a timer.
  // The figure is a transparent silhouette, so a poster held UNDER the playing video shows through its
  // transparent regions as a frozen frame-0 ghost once the figure moves — the poster's only job is to cover
  // the white gap BEFORE the video's first frame, so it must be dropped the instant that frame paints.
  useEffect(() => {
    const t = setTimeout(() => setShowPoster(false), 2000); // safety net only (in case rvfc never fires)
    return () => clearTimeout(t);
  }, []);

  // dots → hero slams cascade → record band rapid-fires → fade → name
  useEffect(() => {
    const timers = [];
    const at = (fn, ms) => timers.push(setTimeout(fn, ms));

    at(() => {
      setDotsVisible(false);
      HEROES.forEach((_, i) => at(() => setHeroCount(i + 1), i * 260));
      const bandStart = HEROES.length * 260 + 120;
      MINIS.forEach((_, i) => at(() => setMiniCount(i + 1), bandStart + i * 75));
      at(() => {
        setTextFading(true);
        at(() => setShowName(true), 1600);
      }, bandStart + MINIS.length * 75 + 1400);
    }, 700);

    return () => timers.forEach(clearTimeout);
  }, []);

  // loop playback: canvas rAF (smooth, no seek-stall) when frames are captured; native <video loop> otherwise
  useEffect(() => {
    if (phase !== "loop") return;
    const intro = introRef.current;
    let cancelled = false;
    let raf = 0;
    const hideIntro = () => { if (!cancelled && intro) intro.style.opacity = "0"; };

    // ── primary: canvas playback of pre-captured frames ──
    if (framesReady && bitmapsRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const bms = bitmapsRef.current;
      if (canvas.width !== 1280) { canvas.width = 1280; canvas.height = 720; }
      const ctx = canvas.getContext("2d");
      const draw = (i) => { ctx.clearRect(0, 0, 1280, 720); const b = bms[i]; if (b) ctx.drawImage(b, CROP.x, CROP.y); };

      // if the fallback video is already on screen, align to its frame for a seamless swap
      const v = loopRef.current;
      let idx = 0;
      if (v && v.style.opacity === "1") { try { idx = Math.round((v.currentTime || 0) * FPS) % TOTAL; } catch (e) {} }

      draw(idx);
      canvas.style.zIndex = "3";
      canvas.style.opacity = "1";
      requestAnimationFrame(() => {           // once canvas has painted, drop intro + fallback video
        if (cancelled) return;
        hideIntro();
        if (v) { v.style.opacity = "0"; try { v.pause(); } catch (e) {} }
      });

      // accumulator: advance one media-frame per 1000/FPS ms, independent of display refresh (120Hz-safe)
      let last = performance.now(), acc = 0;
      const dur = 1000 / FPS;
      const tick = (now) => {
        if (cancelled) return;
        acc += now - last; last = now;
        let stepped = false, adv = 0;
        while (acc >= dur) { acc -= dur; idx = (idx + 1) % TOTAL; stepped = true; adv++; }
        if (stepped) {
          draw(idx);
          if (PROBE_MODE) { if (adv > 1) P.current.skips += adv - 1; probePresent(now, idx, "canvas"); sampleCanvas(ctx, idx, now); }
        }
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      return () => { cancelled = true; if (raf) cancelAnimationFrame(raf); };
    }

    // ── fallback: native <video loop> (until frames are ready, or if capture is unsupported) ──
    const loop = loopRef.current;
    if (!loop) return;
    const rvfc = typeof loop.requestVideoFrameCallback === "function";
    try { loop.currentTime = 0; } catch (e) {}
    loop.style.zIndex = "2";
    loop.style.opacity = "1";
    const p = loop.play();
    if (p && p.catch) p.catch(() => {});
    if (rvfc) loop.requestVideoFrameCallback(hideIntro);
    else setTimeout(hideIntro, 80);
    if (PROBE_MODE && rvfc) {
      const probeCb = (now, meta) => {
        if (cancelled) return;
        const i = ((Math.round(meta.mediaTime * FPS) % TOTAL) + TOTAL) % TOTAL;
        probePresent(now, i, "fallback <video loop>");
        loop.requestVideoFrameCallback(probeCb);
      };
      loop.requestVideoFrameCallback(probeCb);
    }
    return () => { cancelled = true; };
  }, [phase, framesReady]);

  // reveal the intro only once its first frame is actually PRESENTED. A visible-but-undecoded <video>
  // paints nothing (white page shows through) — this + the removed play/pause/seek "warm-up" of the
  // fallback video (decoder churn 1-3 frames after mount) caused a one-frame white flash on reload.
  // No warm-up is needed: the hidden capture video (same file) warms the decoder, and the fallback path
  // only hides the intro after its own first frame presents.
  useEffect(() => {
    const intro = introRef.current;
    if (!intro) return;
    const show = () => { intro.style.opacity = "1"; setShowPoster(false); }; // reveal video + drop poster in the same beat
    if (typeof intro.requestVideoFrameCallback === "function") intro.requestVideoFrameCallback(show);
    else intro.addEventListener("loadeddata", show, { once: true });
  }, []);

  // capture the loop's frames (from the shipped webm) into cropped alpha bitmaps, during the intro.
  // Fails soft: if unsupported / incomplete, framesReady stays false and the <video loop> fallback runs.
  useEffect(() => {
    const v = capVideoRef.current;
    if (!v) return;
    const supported =
      typeof v.requestVideoFrameCallback === "function" &&
      typeof window.createImageBitmap === "function";
    if (!supported) return;

    let cancelled = false;
    const off = document.createElement("canvas");
    let octx = null;
    const datas = new Array(TOTAL);
    let filled = 0;

    const onMeta = () => {
      if (!v.videoWidth) return;
      off.width = v.videoWidth; off.height = v.videoHeight;
      octx = off.getContext("2d");
    };
    if (v.readyState >= 1) onMeta();
    v.addEventListener("loadedmetadata", onMeta, { once: true });

    const store = (i) => {
      if (datas[i] || !octx) return;
      octx.clearRect(0, 0, off.width, off.height);
      octx.drawImage(v, 0, 0);
      datas[i] = octx.getImageData(CROP.x, CROP.y, CROP.w, CROP.h); // synchronous → no race, alpha preserved
      filled += 1;
    };

    const finalize = async () => {
      if (cancelled) return;
      try { v.pause(); } catch (e) {}
      // seek-fill any frames the play-through missed (no silent gaps)
      for (let i = 0; i < TOTAL && !cancelled; i++) {
        if (datas[i] || !octx) continue;
        // eslint-disable-next-line no-await-in-loop
        await new Promise((res) => {
          const onSeek = () => { v.removeEventListener("seeked", onSeek); store(i); res(); };
          v.addEventListener("seeked", onSeek);
          try { v.currentTime = (i + 0.5) / FPS; } catch (e) { v.removeEventListener("seeked", onSeek); res(); }
        });
      }
      if (cancelled) return;
      // alpha sanity: the crop corner is outside the figure and MUST be transparent. If the browser
      // dropped alpha in the canvas readback (e.g. some HEVC paths), the bitmaps hold the raw video —
      // keep the native fallback (which composites alpha correctly) instead.
      const probeFrame = datas.find(Boolean);
      if (probeFrame && probeFrame.data[3] > 8) return;
      const bms = new Array(TOTAL);
      for (let i = 0; i < TOTAL && !cancelled; i++) {
        if (datas[i]) bms[i] = await createImageBitmap(datas[i]); // eslint-disable-line no-await-in-loop
      }
      if (cancelled || bms.filter(Boolean).length !== TOTAL) return; // incomplete → keep fallback
      bitmapsRef.current = bms;
      // probe: measure the CAPTURED frames themselves (neck region) incl. the wrap pair — proves whether
      // capture reproduced the source webm (any slot holding the wrong/corrupt frame shows up here)
      if (PROBE_MODE) {
        const rx = 540 - CROP.x, ry = 230 - CROP.y, rw = 220, rh = 110;
        const lumD = (img) => {
          const d = img.data, W = img.width;
          let s = 0;
          for (let yy = 0; yy < rh; yy++) for (let xx = 0; xx < rw; xx++) {
            const q = ((ry + yy) * W + rx + xx) * 4, a = d[q + 3] / 255;
            s += (0.299 * d[q] + 0.587 * d[q + 1] + 0.114 * d[q + 2]) * a + 255 * (1 - a);
          }
          return s / (rw * rh);
        };
        const diffD = (im1, im2) => {
          const d1 = im1.data, d2 = im2.data, W = im1.width;
          let t = 0;
          for (let yy = 0; yy < rh; yy++) for (let xx = 0; xx < rw; xx++) {
            const q = ((ry + yy) * W + rx + xx) * 4;
            const a1 = d1[q + 3] / 255, a2 = d2[q + 3] / 255;
            t += Math.abs(((0.299 * d1[q] + 0.587 * d1[q + 1] + 0.114 * d1[q + 2]) * a1 + 255 * (1 - a1)) -
                          ((0.299 * d2[q] + 0.587 * d2[q + 1] + 0.114 * d2[q + 2]) * a2 + 255 * (1 - a2)));
          }
          return t / (rw * rh);
        };
        const seam = [];
        for (let i = 0; i < TOTAL; i++) {
          seam.push({
            lum: Math.round(lumD(datas[i]) * 100) / 100,
            d: Math.round(diffD(datas[(i - 1 + TOTAL) % TOTAL], datas[i]) * 100) / 100, // d of frame i = diff (i-1)->i; i=0 is the WRAP pair
          });
        }
        P.current.bitmapSeam = seam;
      }
      setFramesReady(true);
    };

    let loops = 0, lastMedia = -1;
    const cb = (_now, meta) => {
      if (cancelled) return;
      const i = Math.round(meta.mediaTime * FPS);
      if (octx && i >= 0 && i < TOTAL) store(i);
      if (meta.mediaTime < lastMedia - 0.5) loops += 1;
      lastMedia = meta.mediaTime;
      if (filled >= TOTAL || loops >= 2) { finalize(); return; }
      v.requestVideoFrameCallback(cb);
    };

    v.muted = true;
    const p = v.play();
    if (p && p.catch) p.catch(() => {});
    v.requestVideoFrameCallback(cb);
    const safety = setTimeout(() => { if (!cancelled && !bitmapsRef.current) finalize(); }, 8000);

    return () => { cancelled = true; clearTimeout(safety); };
  }, []);

  const onIntroEnded = () => { if (PROBE_MODE) P.current.introEnd = performance.now(); setPhase("loop"); };

  // probe: POST rolling snapshots to the collector (:8899) so a headless run can read the timing without a UI
  useEffect(() => {
    if (!PROBE_MODE) return;
    const id = setInterval(() => {
      const p = P.current;
      try {
        fetch("http://localhost:8899", {
          method: "POST",
          body: JSON.stringify({ path: p.path, frames: p.frames, wrapDt: p.wrapDt, wrapMax: p.wrapMax, skips: p.skips, handoff: Math.round(p.handoff), lastIdx: p.lastIdx, ring: p.ring.slice(-160), bitmapSeam: p.bitmapSeam }),
        }).catch(() => {});
      } catch (e) {}
    }, 1200);
    return () => clearInterval(id);
  }, []);

  // anchored to the viewport bottom: the figure's legs run to the video frame's
  // bottom edge, so the frame cut must coincide with the screen edge — centering
  // it leaves a white strip below the cut legs
  const figure =
    "absolute left-1/2 bottom-0 h-[92vh] w-auto max-w-none -translate-x-1/2 object-contain";

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-white">

      {/* ── playback-timing probe HUD (?probe) ── */}
      {PROBE_MODE && probe && (() => {
        const ideal = 1000 / FPS;
        const stall = probe.wrapMax > ideal * 1.6;      // wrap holding ≥ ~27ms = a seek-stall
        const skip = probe.skips > 2;
        const verdict = probe.path.startsWith("fallback")
          ? "▲ FALLBACK PATH — capture didn't take over"
          : stall ? "▲ WRAP STALL detected"
          : skip ? "▲ FRAME-SKIPS (display can't keep 60fps)"
          : "✓ CLEAN — wrap & cadence nominal";
        const col = verdict.startsWith("✓") ? "#15803d" : "#b91c1c";
        return (
          <div style={{
            position: "absolute", top: 12, right: 12, zIndex: 50,
            fontFamily: "ui-monospace,Menlo,monospace", fontSize: "12px", lineHeight: 1.6, color: "#111",
            background: "rgba(255,255,255,.96)", border: "1px solid #ccc", borderRadius: "8px", padding: "10px 14px", whiteSpace: "pre",
          }}>
            {`ACTIVE PATH  ${probe.path}
framesReady  ${String(probe.frames)}
frame ${probe.idx}   dt ${probe.dt}ms   peak ${probe.maxDt}ms
frame-skips  ${probe.skips}
WRAP dt (109→0)  ${probe.wrapDt}ms   worst ${probe.wrapMax}ms
intro→loop handoff  ${probe.handoff}ms
target: wrap ≈ ${ideal.toFixed(1)}ms · skips 0`}
            <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid #eee", color: col, fontWeight: 700 }}>{verdict}</div>
          </div>
        );
      })()}

      {/* ── logo-slam background: hero brand logos + bottom record band ── */}
      <style>{`
        @keyframes slamIn {
          0%   { opacity: 0; transform: translateY(16px) scale(1.03); filter: blur(10px); }
          55%  { filter: blur(0); }
          100% { opacity: 1; transform: none; filter: blur(0); }
        }
        @keyframes subIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: none; }
        }
      `}</style>
      <div
        style={{
          position: "absolute",
          top: "72px",
          left: "44px",
          right: "44px",
          bottom: "26px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          gap: "2.6vh",
          overflow: "hidden",
          opacity: textFading ? 0 : 1,
          transition: textFading ? "opacity 1.8s ease" : "none",
          pointerEvents: "none",
        }}
      >
        {HEROES.slice(0, heroCount).map((item, i) => (
          <Slam key={i} item={item} />
        ))}

        {/* record band — pinned to the bottom, cells rapid-fire in */}
        {miniCount > 0 && (
          <div
            style={{
              marginTop: "auto",
              borderTop: "1px solid #EBEBEB",
              paddingTop: "14px",
              display: "grid",
              gridTemplateColumns: `repeat(${MINIS.length}, 1fr)`,
              columnGap: "22px",
            }}
          >
            {MINIS.slice(0, miniCount).map((item, i) => (
              <Mini key={i} item={item} />
            ))}
          </div>
        )}
      </div>

      {/* ── thinking dots ── */}
      <>
        <style>{`@keyframes tp{0%,100%{opacity:.15;transform:scale(.7)}50%{opacity:1;transform:scale(1)}}`}</style>
        <div
          style={{
            position: "absolute", top: "68px", left: "44px",
            display: "flex", gap: "7px", alignItems: "center",
            zIndex: 10,
            opacity: dotsVisible ? 1 : 0,
            transition: "opacity 0.2s ease",
            pointerEvents: "none",
          }}
        >
          {[0, 1, 2].map(i => (
            <span key={i} style={{
              display: "inline-block", width: "6px", height: "6px",
              borderRadius: "50%", background: "#525252",
              animation: `tp 1.4s ease-in-out ${i * 0.22}s infinite`,
            }} />
          ))}
        </div>
      </>

      {/* ── name — fades in after text clears ── */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{
          opacity: showName ? 1 : 0,
          transition: showName ? "opacity 1.2s ease" : "none",
          pointerEvents: "none",
        }}
      >
        <h1
          className="-translate-y-[9vh] select-none whitespace-nowrap leading-none tracking-[0.08em] text-neutral-900 text-[19vw]"
          style={{
            fontFamily: '"Google Sans", sans-serif',
            fontOpticalSizing: "auto",
            fontWeight: 500,
            fontVariationSettings: '"GRAD" 0',
          }}
        >
          {NAME}
        </h1>
      </div>

      {/* ── poster safety layer: first-frame image UNDER the intro video, shown ONLY until the video's first
            frame paints (dropped in the reveal effect). Covers the white gap during decoder/compositor churn
            at load without ghosting through the transparent silhouette once the figure starts moving. ── */}
      {showPoster && phase === "intro" && (
        <img
          src={"/assets/walk/intro_poster.webp" + ASSET_V}
          className={figure}
          style={{ pointerEvents: "none" }}
          alt="" aria-hidden
        />
      )}

      {/* ── intro (plays once; revealed on its first presented frame — see effect above) ── */}
      <video
        ref={introRef}
        className={figure}
        style={{ opacity: 0 }}
        src={SRC_INTRO}
        autoPlay muted playsInline preload="auto"
        onEnded={onIntroEnded}
      />

      {/* ── loop fallback: native <video loop> (used until frames are captured, or if unsupported).
            preload=none: don't spin up a third decoder during the load window — it only needs to be
            ready by intro-end, and the intro stays visible until this presents its first frame. ── */}
      <video
        ref={loopRef}
        className={figure}
        style={{ opacity: 0 }}
        src={SRC_LOOP}
        loop muted playsInline preload="none"
      />

      {/* ── loop primary: smooth canvas playback of captured frames ── */}
      <canvas
        ref={canvasRef}
        width={1280}
        height={720}
        className={figure}
        style={{ opacity: 0 }}
        aria-hidden
      />

      {/* ── hidden capture source (opacity 0, NOT display:none so it keeps decoding) ── */}
      <video
        ref={capVideoRef}
        src={SRC_LOOP}
        muted playsInline preload="auto" loop aria-hidden
        style={{ position: "absolute", left: 0, top: 0, width: "64px", height: "36px", opacity: 0, pointerEvents: "none", zIndex: -1 }}
      />
    </div>
  );
};

export default WalkPage;
