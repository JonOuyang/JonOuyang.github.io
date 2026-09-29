/**
 * skyFrames.js — the SF timelapse as preloaded stills painted onto a <canvas>.
 *
 * Why not <video>: every scrub on a video is a seek → decode → present round trip,
 * which never feels live. Here drawing any frame is one synchronous drawImage.
 *
 * Two tiers, so it's both instant and sharp without holding ~500 MB of pixels:
 *  - LO (1152w, lightly sharpened): all 97 frames fetched + decoded up front (~280 MB
 *    of bitmaps, 7 MB download). Used while the sky is moving — motion hides softness.
 *  - HI (2560w): fetched + decoded on demand for the frame(s) the sky comes to rest
 *    on, shown in two <img>s layered over the canvas and faded in with CSS opacity.
 *    That layer is composited, never redrawn while moving, so the canvas can stay at
 *    1x (a 2x full-screen canvas redrawn per frame drops to ~13 fps in software GL).
 * Neighbouring frames are cross-faded, so the 12 fps source reads as continuous.
 *
 * Frames: public/assets/videos/sf_frames_{lo,hi}/001.webp … extracted from the video
 * at 12 fps starting at FIRST_SEC (see log.md for the ffmpeg commands).
 */

const FPS = 12;
const FIRST_SEC = 1.9; // video time of 001.webp
const COUNT = 97;
// Bump whenever the frames are regenerated (scripts/stabilize_sky.py): old and new sets have
// different framing, and a cached mix shows as a zoom jump between moving/resting frames.
const FRAMES_VERSION = 5;
const url = (tier, i) =>
  `/assets/videos/sf_frames_${tier}/${String(i + 1).padStart(3, '0')}.webp?v=${FRAMES_VERSION}`;
const HI_KEEP = 6; // sharp images kept decoded (~15 MB each at 2560w)
const REST_MS = 60; // how long the sky must hold still before sharpening
// Sharp layer in/out. Slow ease-in-out so the swap reads as the image "settling into
// focus" rather than a pop; fading out (instead of vanishing) hides the drop back to
// the moving frames when motion starts.
const FADE_IN = 'opacity 480ms cubic-bezier(0.45, 0, 0.25, 1)';
const FADE_OUT = 'opacity 200ms cubic-bezier(0.3, 0, 0.2, 1)';

/** video seconds → fractional frame index */
export const frameFor = (sec) => Math.max(0, Math.min(COUNT - 1, (sec - FIRST_SEC) * FPS));

/**
 * canvas: the moving (LO) layer. hiLayer: an element holding two <img>s stacked over the
 * canvas with object-fit: cover (the sharp resting pair). Its opacity is driven here.
 */
export function createSky(canvas, hiLayer, { startSec = 0, onFirstFrame } = {}) {
  const ctx = canvas.getContext('2d', { alpha: false });
  const lo = new Array(COUNT);
  const hi = new Map(); // i -> decoded HTMLImageElement, LRU by insertion order
  const hiPending = new Map(); // i -> Promise<img | null>
  const [hiA, hiB] = hiLayer.querySelectorAll('img');
  let loDecoded = 0;
  let pos = frameFor(startSec); // fractional frame on screen
  let drawnKey = '';
  let firstDone = false;
  let dead = false;
  let restTimer = 0;
  let sharp = false; // HI layer showing

  // ── LO tier: everything, nearest-to-current first, 6 at a time ──
  (async () => {
    const order = [...Array(COUNT).keys()].sort((a, b) => Math.abs(a - pos) - Math.abs(b - pos));
    let next = 0;
    const worker = async () => {
      while (!dead && next < order.length) {
        const i = order[next++];
        try {
          const blob = await (await fetch(url('lo', i))).blob();
          const bmp = await createImageBitmap(blob);
          if (dead) return bmp.close();
          lo[i] = bmp;
          loDecoded++;
          if (Math.abs(i - pos) < 2 || !firstDone) {
            draw(true);
            scheduleSharpen();
          }
        } catch {
          /* leave the gap; nearest() covers it */
        }
      }
    };
    await Promise.all(Array.from({ length: 6 }, worker));
  })();

  // ── HI tier: on demand ──
  function getHi(i) {
    if (hi.has(i)) {
      const img = hi.get(i);
      hi.delete(i);
      hi.set(i, img); // mark recently used
      return Promise.resolve(img);
    }
    if (hiPending.has(i)) return hiPending.get(i);
    const img = new Image();
    img.src = url('hi', i);
    const p = img
      .decode()
      .then(() => {
        hiPending.delete(i);
        if (dead) return null;
        hi.set(i, img);
        while (hi.size > HI_KEEP) hi.delete(hi.keys().next().value); // GC frees it
        return img;
      })
      .catch(() => {
        hiPending.delete(i);
        return null;
      });
    hiPending.set(i, p);
    return p;
  }

  function nearest(i) {
    for (let d = 0; d < COUNT; d++) {
      if (lo[i - d]) return lo[i - d];
      if (lo[i + d]) return lo[i + d];
    }
    return null;
  }

  function cover(bmp, alpha) {
    const cw = canvas.width, ch = canvas.height;
    const s = Math.max(cw / bmp.width, ch / bmp.height);
    const w = bmp.width * s, h = bmp.height * s;
    ctx.globalAlpha = alpha;
    ctx.drawImage(bmp, (cw - w) / 2, (ch - h) / 2, w, h);
  }

  // draw the (a, a+1) pair, blended by t, at overall opacity `alpha`
  function pair(A, B, t, alpha) {
    cover(A, alpha);
    if (B && t > 1 / 64) cover(B, alpha * t);
  }

  function draw(force) {
    if (!canvas.width) return;
    const a = Math.floor(pos), t = pos - a;
    const key = `${a}:${Math.round(t * 64)}`;
    if (!force && key === drawnKey) return;
    const A = lo[a] || nearest(a);
    if (!A) return;
    pair(A, lo[a + 1], t, 1);
    ctx.globalAlpha = 1;
    drawnKey = key;
    if (!firstDone) {
      firstDone = true;
      onFirstFrame?.();
    }
  }

  function showSharp(on) {
    if (sharp === on) return;
    sharp = on;
    hiLayer.style.transition = on ? FADE_IN : FADE_OUT;
    hiLayer.style.opacity = on ? '1' : '0';
  }

  // Once the sky holds still, load the sharp frame(s) for exactly this spot and fade them in.
  function scheduleSharpen() {
    clearTimeout(restTimer);
    restTimer = setTimeout(async () => {
      const at = pos;
      const a = Math.floor(at), t = at - a;
      const blend = t > 1 / 64 && a + 1 < COUNT;
      const [A, B] = await Promise.all([getHi(a), blend ? getHi(a + 1) : null]);
      if (dead || pos !== at || !A || (blend && !B)) return; // moved on meanwhile
      hiA.src = A.src;
      hiB.src = blend ? B.src : A.src;
      hiB.style.opacity = blend ? String(t) : '0';
      await Promise.all([hiA.decode(), hiB.decode()]).catch(() => {}); // cached, but be sure
      if (dead || pos !== at) return;
      showSharp(true);
    }, REST_MS);
  }

  function resize() {
    // 1x on purpose: this layer only ever shows motion; sharpness comes from the HI layer
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    draw(true);
  }
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);

  return {
    /** show video-second `sec` right now (fractional frames are cross-faded) */
    set(sec) {
      const next = frameFor(sec);
      if (next !== pos) {
        pos = next;
        showSharp(false); // moving: LO only
      }
      draw(false);
      scheduleSharpen();
    },
    /** start loading the sharp frame(s) for where the sky is heading, so they're ready on arrival */
    prefetch(sec) {
      const f = frameFor(sec);
      getHi(Math.floor(f));
      if (f % 1 > 1 / 64) getHi(Math.min(COUNT - 1, Math.floor(f) + 1));
    },
    /** for tests */
    stats: () => ({ decoded: loDecoded, total: COUNT, pos, sharp, hiCached: hi.size, drawnKey }),
    destroy() {
      dead = true;
      clearTimeout(restTimer);
      ro.disconnect();
      lo.forEach((b) => b?.close());
      hi.clear();
    },
  };
}
