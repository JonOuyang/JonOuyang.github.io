/**
 * skyFrames.js — the SF timelapse as preloaded stills painted onto a <canvas>.
 *
 * Why not <video>: every scrub on a video is a seek → decode → present round trip,
 * which never feels live. Here drawing any frame is one synchronous drawImage.
 *
 * Two tiers, so it's both instant and sharp without holding ~500 MB of pixels:
 *  - LO (1152w, lightly sharpened): all 97 frames fetched + decoded up front (~280 MB
 *    of bitmaps, 7 MB download). Used while the sky is moving — motion hides softness.
 *    Phones get the lighter portrait-cropped 'md' set instead (see isPhone).
 *    Frames load COVERAGE-FIRST (every 12th, then 4th, 2nd, all) and drawing blends the
 *    nearest decoded frames on either side, so if the browser runs out of memory part-way
 *    the whole day still animates (coarser) instead of freezing on one scene.
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

// Phones (portrait, touch) only ever show the centre ~26% of a frame, and iOS Safari caps
// how much decoded image memory a tab may hold. Decoding all 97 full LO frames (~290 MB)
// silently failed part-way on iPhones, leaving the FAR end of the day (the morning, since
// loading starts from "now") undecoded → the sky froze on one scene for hours. So on
// portrait touch screens we load 'md': the same frames cropped to the centre 46% and
// scaled to 576px tall (~105 MB, 3.7 MB download). Framing is identical (both are
// centre-cover), it just skips pixels that are cropped off anyway.
const isPhone = (canvas) =>
  typeof matchMedia === 'function' &&
  matchMedia('(pointer: coarse)').matches &&
  canvas.clientWidth / Math.max(1, canvas.clientHeight) <= 0.78;
const HI_KEEP_DESKTOP = 6; // sharp images kept decoded (~15 MB each at 2560w)
const HI_KEEP_PHONE = 3;
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
  const loTier = isPhone(canvas) ? 'md' : 'lo';
  const hiKeep = loTier === 'md' ? HI_KEEP_PHONE : HI_KEEP_DESKTOP;
  const lo = new Array(COUNT);
  const hi = new Map(); // i -> decoded HTMLImageElement, LRU by insertion order
  const hiPending = new Map(); // i -> Promise<img | null>
  const [hiA, hiB] = hiLayer.querySelectorAll('img');
  let loDecoded = 0;
  let pos = frameFor(startSec); // fractional frame on screen
  let drawnKey = '';
  let curA = -1, curB = -1; // decoded frames bracketing what's on screen
  let firstDone = false;
  let dead = false;
  let restTimer = 0;
  let sharp = false; // HI layer showing

  // ── LO tier: everything, 6 at a time. Coarse-to-fine so every part of the day has SOME
  // frames early (a memory-starved device stops mid-list); nearest-to-current first within
  // each pass so the sky you're looking at sharpens first. ──
  (async () => {
    const seen = new Set();
    const order = [];
    for (const stride of [12, 4, 2, 1]) {
      const pass = [];
      for (let i = 0; i < COUNT; i += stride) if (!seen.has(i)) pass.push(i);
      pass.sort((a, b) => Math.abs(a - pos) - Math.abs(b - pos));
      pass.forEach((i) => seen.add(i));
      order.push(...pass);
    }
    if (!seen.has(COUNT - 1)) order.unshift(COUNT - 1); // the last (night) frame anchors the far end
    let next = 0;
    const worker = async () => {
      while (!dead && next < order.length) {
        const i = order[next++];
        try {
          const blob = await (await fetch(url(loTier, i))).blob();
          const bmp = await createImageBitmap(blob);
          if (dead) return bmp.close();
          lo[i] = bmp;
          loDecoded++;
          // a frame landing inside the bracket on screen improves it; anywhere else can't
          if (!firstDone || (i >= curA && i <= curB)) {
            draw(true);
            scheduleSharpen();
          }
        } catch {
          /* leave the gap; draw() blends the nearest decoded frames across it */
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
        while (hi.size > hiKeep) hi.delete(hi.keys().next().value); // GC frees it
        return img;
      })
      .catch(() => {
        hiPending.delete(i);
        return null;
      });
    hiPending.set(i, p);
    return p;
  }

  // nearest decoded frame at or before / at or after i (-1 if none)
  function before(i) {
    for (let k = Math.min(i, COUNT - 1); k >= 0; k--) if (lo[k]) return k;
    return -1;
  }
  function after(i) {
    for (let k = Math.max(i, 0); k < COUNT; k++) if (lo[k]) return k;
    return -1;
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
    // Bracket the (fractional) position with the nearest DECODED frames on each side, so a
    // partly-loaded set still dissolves smoothly through the day instead of sticking.
    let ia = before(Math.floor(pos));
    let ib = after(Math.ceil(pos));
    if (ia < 0) ia = ib;
    if (ib < 0) ib = ia;
    if (ia < 0) return; // nothing decoded yet
    const t = ib === ia ? 0 : Math.max(0, Math.min(1, (pos - ia) / (ib - ia)));
    const key = `${ia}:${ib}:${Math.round(t * 64)}`;
    if (!force && key === drawnKey) return;
    pair(lo[ia], ib === ia ? null : lo[ib], t, 1);
    ctx.globalAlpha = 1;
    drawnKey = key;
    curA = ia;
    curB = ib;
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
    stats: () => ({ decoded: loDecoded, total: COUNT, tier: loTier, pos, sharp, hiCached: hi.size, drawnKey }),
    destroy() {
      dead = true;
      clearTimeout(restTimer);
      ro.disconnect();
      lo.forEach((b) => b?.close());
      hi.clear();
    },
  };
}
