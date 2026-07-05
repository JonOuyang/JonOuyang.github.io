import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

/* ═══════════════════════════════════════════════════════════════════════════
   WalkJanitor — the pitch-black menu after the barn doors close on /walk.

   Four dim, left-aligned nav lines flush out character-by-character. Then a
   tiny ORANGE Alan-Becker-style stick figure walks in with a flashlight and
   gets to work: he straightens the crooked "?", climbs up on top of the
   letters (struggling — first jump fails), walks along the glyph tops dusting
   them, leaps line-to-line, waves at you occasionally, and reacts to your
   cursor (watches it, gets startled, waves back if you linger).

   Tech: two <canvas> layers over real DOM links.
     - light canvas (mix-blend-mode: screen) → his flashlight beam + ambient
       pool genuinely brighten the dim gray letters underneath, per-pixel.
     - figure canvas (normal) → the orange stickman, drawn with a 2-bone-IK
       skeletal rig; all animation is procedural (no sprites, no video).
   Letter geometry is measured from the REAL rendered glyphs (per-char spans +
   canvas actualBoundingBox metrics), so he stands taller on "W" than on "o"
   and everything survives any viewport size.
   ═══════════════════════════════════════════════════════════════════════════ */

const LINES = [
  { label: "Work", to: "/work-history" },
  { label: "Projects", to: "/projects" },
  { label: "My Research", to: "/research" },
  { label: "Want to Chat?", href: "mailto:jonathanouyang@ucla.edu" },
];

const ORANGE = "#FF7A1A";
const DIM = "#6E6E6E"; // resting letter gray — readable, moody
const TAU = Math.PI * 2;

/* ── tiny math kit ─────────────────────────────────────────────────────── */
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const ss = (t) => { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); }; // smoothstep
const easeOutBack = (t) => { const c = 1.70158; t -= 1; return t * t * ((c + 1) * t + c) + 1; };
const dist2 = (ax, ay, bx, by) => { const dx = ax - bx, dy = ay - by; return Math.hypot(dx, dy); };

/* 2-bone analytic IK: origin → target with lengths l1,l2; bend = ±1 side.
   Returns [mx,my, ex,ey] (mid joint + clamped end). */
function ik2(ox, oy, tx, ty, l1, l2, bend) {
  let dx = tx - ox, dy = ty - oy;
  let d = Math.hypot(dx, dy) || 1e-4;
  const dc = clamp(d, Math.abs(l1 - l2) + 1e-3, (l1 + l2) * 0.9995);
  dx *= dc / d; dy *= dc / d; d = dc;
  const a = Math.acos(clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1));
  const base = Math.atan2(dy, dx);
  const ang = base + bend * a;
  const mx = ox + Math.cos(ang) * l1, my = oy + Math.sin(ang) * l1;
  return [mx, my, ox + dx, oy + dy];
}

/* ═══ Stickman ═══════════════════════════════════════════════════════════
   All positions in section-local CSS px. y grows DOWN. "floor" of a text
   line = its baseline (glyphs sit on it; so does he — he walks in front of
   the words, letters are about shoulder height, and he can climb on top). */
class Stickman {
  constructor(world) {
    this.world = world;             // {W,Hs,lines,onGlyphAngle,spawnHint}
    const cap = world.lines[0]?.cap || 48;
    this.H = cap * 1.18;            // a bit taller than a capital letter
    const H = this.H;
    this.L = {                      // limb lengths
      legU: 0.26 * H, legL: 0.26 * H, torso: 0.30 * H,
      armU: 0.17 * H, armL: 0.17 * H, headR: 0.115 * H, neck: 0.035 * H,
    };
    this.legStand = (this.L.legU + this.L.legL) * 0.955;
    this.lw = Math.max(1.6, 0.055 * H);

    const floor3 = world.lines[3].baseline;
    this.pose = {
      px: -H * 2, py: floor3 - this.legStand, lean: 0, face: 1, front: 0,
      hdx: 0, hdy: 0,
      hl: { x: -H * 2, y: floor3 }, hr: { x: -H * 2, y: floor3 },
      fl: { x: -H * 2, y: floor3 }, fr: { x: -H * 2, y: floor3 },
    };
    this.floorY = floor3;
    this.lineIdx = 3;               // which line's floor he's on
    this.onTop = false;             // standing on glyph tops?

    this.flash = { mode: "carried", x: 0, y: 0, ang: 0, aim: -0.25, on: true };
    this.particles = [];
    this.cursor = { x: -9e3, y: -9e3, vx: 0, vy: 0, seen: 0, still: 0 };
    this.hoverLine = -1;

    this.busy = false;              // non-interruptible (mid-air / climbing)
    this.interrupt = null;          // one-shot iterator (startle, stumble…)
    this.it = null;                 // current task iterator
    this.plan = world.rig ? [() => this.gRig(world.rig)] : this.buildPlan();
    this.didFailBeat = false;
    this.lastStartle = -9;
    this.lastWaveAtCursor = -20;
    this.lastStumble = -9;
    this.t = 0;
  }

  buildPlan() {
    return [
      () => this.gEnter(),
      () => this.gFixQuestion(),
      () => this.gCleanLine(3, true),
      () => this.gAscend(3), () => this.gCleanLine(2, false),
      () => this.gAscend(2), () => this.gCleanLine(1, false),
      () => this.gAscend(1), () => this.gCleanLine(0, false),
      () => this.gFinale(),
      () => this.gAmbient(), // never ends
    ];
  }

  /* ── per-frame ──────────────────────────────────────────────────────── */
  update(dt) {
    this.t += dt;
    // cursor bookkeeping
    const c = this.cursor;
    const speed = Math.hypot(c.vx, c.vy);
    const dHim = dist2(c.x, c.y, this.pose.px, this.pose.py);
    c.still = speed < 40 && dHim < 3 * this.H ? c.still + dt : 0;

    // reactive interrupts (only when calm; off in rig-test mode)
    if (!this.world.rig && !this.busy && !this.interrupt) {
      if (speed > 1400 && dHim < 2.2 * this.H && this.t - this.lastStartle > 5) {
        this.lastStartle = this.t;
        this.interrupt = this.gStartle();
      } else if (this.hoverLine === this.lineIdx && this.onTop && this.t - this.lastStumble > 2.5) {
        this.lastStumble = this.t;
        this.interrupt = this.gStumble();
      } else if (c.still > 2.6 && this.t - this.lastWaveAtCursor > 18) {
        this.lastWaveAtCursor = this.t;
        this.interrupt = this.gWave(false);
      }
    }

    // run current behavior
    if (this.interrupt) {
      if (this.interrupt.next(dt).done) this.interrupt = null;
    } else {
      if (!this.it && this.plan.length) this.it = this.plan.shift()();
      if (this.it && this.it.next(dt).done) this.it = null;
    }

    // head look-at overlay (cursor > hovered line)
    let lx = 0, ly = 0;
    if (dHim < 4 * this.H && c.x > -8e3) {
      const w = ss(1 - dHim / (4 * this.H));
      const ang = Math.atan2(c.y - this.pose.py, c.x - this.pose.px);
      lx = Math.cos(ang) * 0.05 * this.H * w;
      ly = Math.sin(ang) * 0.035 * this.H * w;
    } else if (this.hoverLine >= 0) {
      const ln = this.world.lines[this.hoverLine];
      const ang = Math.atan2(ln.baseline - this.pose.py, ln.midX - this.pose.px);
      lx = Math.cos(ang) * 0.04 * this.H; ly = Math.sin(ang) * 0.03 * this.H;
    }
    this.pose.hdx = lerp(this.pose.hdx, lx, 1 - Math.pow(0.001, dt));
    this.pose.hdy = lerp(this.pose.hdy, ly, 1 - Math.pow(0.001, dt));

    // flashlight aim: drift toward cursor when carried & cursor near
    if (this.flash.mode === "carried" && dHim < 6 * this.H && c.x > -8e3 && !this.busy) {
      const tip = this.flashTip();
      const want = Math.atan2(c.y - tip.y, c.x - tip.x);
      this.flash.aim += (want - this.flash.aim) * (1 - Math.pow(0.02, dt));
    }

    // particles
    for (const p of this.particles) {
      p.x += p.vx * dt; p.y += p.vy * dt; p.vy -= 8 * dt; p.life -= dt;
    }
    this.particles = this.particles.filter((p) => p.life > 0);
  }

  /* ── generators (behaviors). Convention: `const dt = yield;` each frame ── */

  *gWait(dur) { let t = 0; while (t < dur) t += yield; }

  /* Walk along current floor to targetX. Foot-plant bookkeeping → zero slide. */
  *gWalkTo(tx, opts = {}) {
    const p = this.pose, H = this.H;
    const speed = (opts.speed || 1.6) * H;
    const stride = 0.6 * H;
    p.face = tx > p.px ? 1 : -1;
    let swing = null; // {foot:'fl'|'fr', t, dur, fx,fy, txx}
    const floor = this.floorY;
    // make sure both feet start under him on this floor
    if (Math.abs(p.fl.y - floor) > 2 || Math.abs(p.fr.y - floor) > 2) {
      yield* this.gSettleFeet();
    }
    while (Math.abs(tx - p.px) > 2) {
      const dt = yield;
      const dir = tx > p.px ? 1 : -1;
      p.face = dir;
      const v = Math.min(speed, speed * (0.25 + Math.abs(tx - p.px) / (0.9 * H)));
      p.px += dir * Math.min(v * dt, Math.abs(tx - p.px));
      // swing management
      if (!swing) {
        const rear = (p.fl.x - p.px) * dir < (p.fr.x - p.px) * dir ? "fl" : "fr";
        if ((p.px - p[rear].x) * dir > stride * 0.30) {
          const dur = Math.min(0.3, 0.16 * (1.6 / (opts.speed || 1.6)));
          // land the foot ahead of where the pelvis will BE, not where it is —
          // otherwise the foot touches down already-behind and one leg drags
          swing = { foot: rear, t: 0, dur, fx: p[rear].x, fy: p[rear].y, txx: p.px + dir * (v * dur + 0.45 * stride) };
        }
      }
      if (swing) {
        swing.t += dt;
        const t01 = clamp(swing.t / swing.dur, 0, 1);
        const f = p[swing.foot];
        f.x = lerp(swing.fx, swing.txx, ss(t01));
        f.y = floor - Math.sin(t01 * Math.PI) * 0.16 * H;
        if (t01 >= 1) { f.y = floor; swing = null; }
      }
      // compass gait: pelvis height follows the planted-leg geometry, so the
      // legs can NEVER hyperextend — pelvis naturally sinks when feet split
      const legMax = (this.L.legU + this.L.legL) * 0.985;
      const dxMax = Math.max(Math.abs(p.px - p.fl.x), Math.abs(p.px - p.fr.x));
      const stand = Math.min(this.legStand, Math.sqrt(Math.max(legMax * legMax - dxMax * dxMax, (0.28 * H) ** 2)));
      p.py = lerp(p.py, floor - stand, 0.5);
      p.lean = lerp(p.lean, 0.09, 0.15);
      this.walkArms(dir);
    }
    this.pose.lean = 0.02;
    yield* this.gSettleFeet();
  }

  walkArms(dir) {
    const p = this.pose, H = this.H;
    const sh = this.shoulderPos();
    const armPhase = ((p.fl.x - p.fr.x) / (0.6 * H)) * 0.85; // opposite of legs
    if (this.flash.mode === "carried") {
      // flashlight hand held out front, slight bob; beam follows the direction
      // of travel (otherwise he walks left while lighting the way behind him)
      const wantAim = dir > 0 ? -0.15 : Math.PI + 0.15;
      this.flash.aim += (wantAim - this.flash.aim) * 0.12;
      p.hr.x = sh.x + dir * 0.27 * H; p.hr.y = sh.y + 0.10 * H + Math.sin(this.t * 9) * 0.01 * H;
      p.hl.x = sh.x - dir * armPhase * 0.16 * H; p.hl.y = sh.y + 0.27 * H;
    } else {
      p.hr.x = sh.x + dir * armPhase * 0.16 * H; p.hr.y = sh.y + 0.27 * H;
      p.hl.x = sh.x - dir * armPhase * 0.16 * H; p.hl.y = sh.y + 0.27 * H;
    }
  }

  *gSettleFeet() {
    const p = this.pose, H = this.H, floor = this.floorY;
    const t0 = { flx: p.fl.x, fly: p.fl.y, frx: p.fr.x, fry: p.fr.y, py: p.py };
    let t = 0; const dur = 0.14;
    while (t < dur) {
      t += yield; const k = ss(t / dur);
      p.fl.x = lerp(t0.flx, p.px - 0.10 * H, k); p.fl.y = lerp(t0.fly, floor, k);
      p.fr.x = lerp(t0.frx, p.px + 0.10 * H, k); p.fr.y = lerp(t0.fry, floor, k);
      p.py = lerp(t0.py, floor - this.legStand, k);
      this.idleArms(k);
    }
  }

  idleArms(blend = 1) {
    const p = this.pose, H = this.H, sh = this.shoulderPos();
    const sway = Math.sin(this.t * 1.6) * 0.008 * H;
    if (this.flash.mode === "carried") {
      p.hr.x = lerp(p.hr.x, sh.x + p.face * 0.26 * H, 0.2 * blend);
      p.hr.y = lerp(p.hr.y, sh.y + 0.14 * H + sway, 0.2 * blend);
      p.hl.x = lerp(p.hl.x, sh.x - p.face * 0.05 * H, 0.2 * blend);
      p.hl.y = lerp(p.hl.y, sh.y + 0.315 * H + sway, 0.2 * blend);
    } else {
      p.hl.x = lerp(p.hl.x, sh.x - p.face * 0.06 * H - (p.front ? 0.10 * H : 0), 0.2 * blend);
      p.hl.y = lerp(p.hl.y, sh.y + 0.315 * H + sway, 0.2 * blend);
      p.hr.x = lerp(p.hr.x, sh.x + p.face * 0.06 * H + (p.front ? 0.10 * H : 0), 0.2 * blend);
      p.hr.y = lerp(p.hr.y, sh.y + 0.315 * H + sway, 0.2 * blend);
    }
  }

  /* ballistic hop of the pelvis to (tx, tyFloor); feet tuck then land+absorb */
  *gHop(tx, tyFloor, opts = {}) {
    const p = this.pose, H = this.H;
    this.busy = true;
    const x0 = p.px, y0 = p.py, y1 = tyFloor - this.legStand;
    const rise = Math.max(0.22 * H, (y0 - y1) + 0.24 * H) * (opts.power || 1);
    const dur = opts.dur || 0.4;
    // crouch
    let t = 0; const cd = opts.noCrouch ? 0 : 0.16;
    while (t < cd) { t += yield; const k = ss(t / cd); p.py = y0 + k * 0.10 * H; p.lean = 0.22 * k; this.idleArms(); }
    t = 0;
    while (t < dur) {
      const dt = yield; t += dt; const k = clamp(t / dur, 0, 1);
      p.px = lerp(x0, tx, k);
      p.py = lerp(y0 + (cd ? 0.10 * H : 0), y1, k) - Math.sin(k * Math.PI) * rise;
      p.face = tx > x0 ? 1 : tx < x0 ? -1 : p.face;
      // tuck feet + arms out
      p.fl.x = p.px - 0.10 * H; p.fl.y = p.py + this.legStand * (0.62 + 0.3 * Math.abs(0.5 - k));
      p.fr.x = p.px + 0.12 * H; p.fr.y = p.py + this.legStand * (0.70 + 0.3 * Math.abs(0.5 - k));
      const sh = this.shoulderPos();
      p.hl.x = sh.x - 0.22 * H; p.hl.y = sh.y + 0.06 * H;
      p.hr.x = sh.x + 0.22 * H; p.hr.y = sh.y + 0.06 * H;
    }
    // land: plant feet, absorb
    this.floorY = tyFloor;
    p.fl.x = tx - 0.10 * H; p.fl.y = tyFloor; p.fr.x = tx + 0.10 * H; p.fr.y = tyFloor;
    t = 0; const ad = 0.18;
    while (t < ad) {
      t += yield; const k = Math.sin(clamp(t / ad, 0, 1) * Math.PI);
      p.py = y1 + k * 0.11 * H; p.lean = 0.1 * k;
      this.idleArms();
    }
    p.py = y1; p.lean = 0;
    this.busy = false;
  }

  /* Climb: jump + grab a ledge at (gx, gy), dangle, struggle, pull up.
     fail=true → first attempt comes up short (comedy beat, used once). */
  *gClimb(gx, gy, opts = {}) {
    const p = this.pose, H = this.H;
    this.busy = true;
    const side = opts.side || (gx > p.px ? 1 : -1); // approach side
    const standX = gx - side * 0.34 * H;
    this.busy = false; yield* this.gWalkTo(standX); this.busy = true;
    p.face = side;
    // look up beat
    let t = 0;
    while (t < 0.4) { t += yield; p.hdy = -0.05 * H; this.idleArms(); }

    const attempts = opts.fail ? 2 : 1;
    for (let a = 0; a < attempts; a++) {
      const short = opts.fail && a === 0;
      // crouch deep
      t = 0; const cd = short ? 0.18 : 0.26;
      const y0 = this.floorY - this.legStand;
      while (t < cd) { t += yield; const k = ss(t / cd); p.py = y0 + k * 0.16 * H; p.lean = 0.3 * k; this.idleArms(); }
      // leap toward hang position. Grip is asymmetric and the body hangs
      // OFFSET to the side, chin tucked — otherwise the head lands exactly
      // between the two gripping hands and reads as an orange blob.
      const gripL = { x: gx - 0.15 * H, y: gy - 0.02 * H };
      const gripR = { x: gx + 0.11 * H, y: gy - 0.02 * H };
      const hangShY = gy + 0.28 * H;                 // shoulders when hanging
      const hangPy = hangShY + this.L.torso;
      const hangPx = gx - side * 0.10 * H;
      const apexY = short ? gy + 0.42 * H + this.L.torso : hangPy - 0.06 * H;
      const lx0 = p.px, ly0 = p.py, lx1 = hangPx;
      t = 0; const jd = 0.34;
      let caught = false;
      while (t < jd) {
        const dt = yield; t += dt; const k = clamp(t / jd, 0, 1);
        p.px = lerp(lx0, lx1, k);
        p.py = lerp(ly0 + 0.16 * H, apexY, ss(Math.min(1, k * 1.15))) - Math.sin(k * Math.PI) * 0.10 * H;
        // arms reach up at the ledge
        const sh = this.shoulderPos();
        const reach = ss(clamp((k - 0.25) / 0.5, 0, 1));
        p.hl.x = lerp(sh.x - 0.1 * H, gripL.x, reach); p.hl.y = lerp(sh.y + 0.2 * H, gripL.y, reach);
        p.hr.x = lerp(sh.x + 0.1 * H, gripR.x, reach); p.hr.y = lerp(sh.y + 0.2 * H, gripR.y, reach);
        p.fl.x = p.px - 0.08 * H; p.fl.y = p.py + this.legStand * 0.66;
        p.fr.x = p.px + 0.10 * H; p.fr.y = p.py + this.legStand * 0.74;
        if (!short && k > 0.8) caught = true;
      }
      if (short) {
        // swipe air, drop back, head-shake, retry
        t = 0; const fd = 0.3;
        const fy0 = p.py;
        while (t < fd) {
          const dt = yield; t += dt; const k = clamp(t / fd, 0, 1);
          p.py = lerp(fy0, this.floorY - this.legStand, k * k);
          p.px = lerp(lx1, standX, k * 0.6);
          const sh = this.shoulderPos();
          p.hl.x = sh.x - 0.14 * H; p.hl.y = sh.y - 0.05 * H;
          p.hr.x = sh.x + 0.14 * H; p.hr.y = sh.y - 0.02 * H;
          p.fl.x = p.px - 0.1 * H; p.fl.y = lerp(p.fl.y, this.floorY, k);
          p.fr.x = p.px + 0.1 * H; p.fr.y = lerp(p.fr.y, this.floorY, k);
        }
        // land absorb + head shake ("tsk")
        t = 0;
        while (t < 0.75) {
          const dt = yield; t += dt;
          p.py = this.floorY - this.legStand + Math.max(0, 0.1 - t) * 0.8 * H * 0.12;
          p.hdx = Math.sin(t * 16) * 0.03 * H * Math.max(0, 1 - t / 0.6);
          this.idleArms();
        }
        continue;
      }
      // CAUGHT: hands pinned on ledge, body hangs + settles
      p.hl.x = gripL.x; p.hl.y = gripL.y; p.hr.x = gripR.x; p.hr.y = gripR.y;
      t = 0; const hd = 0.5;
      while (t < hd) {
        const dt = yield; t += dt; const k = t / hd;
        p.px = hangPx + Math.sin(t * 10) * 0.015 * H * (1 - k);
        p.py = hangPy + Math.sin(t * 9) * 0.05 * H * (1 - k) + 0.04 * H * k;
        p.fl.x = p.px - 0.05 * H + Math.sin(t * 5) * 0.05 * H * (1 - k * 0.5); p.fl.y = p.py + this.legStand * 0.82;
        p.fr.x = p.px + 0.07 * H - Math.sin(t * 5) * 0.05 * H * (1 - k * 0.5); p.fr.y = p.py + this.legStand * 0.88;
        p.lean = -0.05;
        p.hdx = -side * 0.05 * H; p.hdy = 0.025 * H; // chin tuck, head beside the arms
      }
      // struggle: two effortful pulls that sag back
      for (let s = 0; s < (opts.easy ? 1 : 2); s++) {
        t = 0; const pd = 0.42;
        while (t < pd) {
          const dt = yield; t += dt; const k = Math.sin(clamp(t / pd, 0, 1) * Math.PI);
          p.py = hangPy + 0.04 * H - k * 0.14 * H;
          p.fl.y = p.py + this.legStand * 0.82; p.fr.y = p.py + this.legStand * 0.88;
          p.fl.x = p.px - 0.05 * H; p.fr.x = p.px + 0.07 * H;
          p.hdx = -side * 0.05 * H; p.hdy = 0.02 * H;
        }
      }
      // pull-up: rise, knee up onto ledge, stand
      t = 0; const pu = 0.55;
      const py0 = p.py;
      while (t < pu) {
        const dt = yield; t += dt; const k = ss(clamp(t / pu, 0, 1));
        p.py = lerp(py0, gy - this.legStand, k);
        p.px = lerp(hangPx, gx, k);
        if (k > 0.45) { p.fr.x = gx + 0.10 * H; p.fr.y = gy; } // knee up
        else { p.fr.x = p.px + 0.06 * H; p.fr.y = p.py + this.legStand * 0.9; }
        p.fl.x = k > 0.75 ? gx - 0.08 * H : p.px - 0.06 * H;
        p.fl.y = k > 0.75 ? gy : p.py + this.legStand * 0.92;
        if (k > 0.8) { // release hands, arms balance
          const sh = this.shoulderPos();
          p.hl.x = sh.x - 0.2 * H; p.hl.y = sh.y + 0.1 * H;
          p.hr.x = sh.x + 0.2 * H; p.hr.y = sh.y + 0.1 * H;
        }
        p.lean = 0.25 * (1 - k);
      }
      this.floorY = gy;
      // wobble-balance + brush hands
      t = 0;
      while (t < 0.55) {
        const dt = yield; t += dt;
        p.lean = Math.sin(t * 14) * 0.09 * Math.max(0, 1 - t / 0.5);
        p.py = gy - this.legStand;
        const sh = this.shoulderPos();
        if (t > 0.25) { // brush
          const b = Math.sin((t - 0.25) * 22);
          p.hl.x = sh.x - 0.05 * H + b * 0.05 * H; p.hl.y = sh.y + 0.16 * H;
          p.hr.x = sh.x + 0.05 * H - b * 0.05 * H; p.hr.y = sh.y + 0.16 * H;
        }
      }
      p.lean = 0;
    }
    this.busy = false;
  }

  /* Walk across glyph tops of line i from char a→b, dusting on the way. */
  *gTraverseTops(i, opts = {}) {
    const H = this.H, p = this.pose;
    const chars = this.world.lines[i].chars.filter((c) => !c.space);
    this.onTop = true;
    let sinceWipe = 0;
    for (let ci = 1; ci < chars.length; ci++) {
      const c = chars[ci], prev = chars[ci - 1];
      const txx = c.x + c.w * 0.5, tyy = c.topY;
      const gap = c.x - (prev.x + prev.w);
      const dy = tyy - this.floorY;
      if (gap > 0.5 * H || Math.abs(dy) > 0.12 * H) {
        this.busy = true;
        yield* this.gHop(txx, tyy, { dur: 0.3, noCrouch: Math.abs(dy) < 0.2 * H, power: dy < 0 ? 1 : 0.7 });
        this.busy = false;
      } else {
        this.floorY = tyy; // tiny height drift — feet follow during walk
        yield* this.gWalkTo(txx, { speed: 1.3 });
      }
      sinceWipe++;
      if (sinceWipe >= (opts.wipeEvery || 3) || ci === chars.length - 1) {
        sinceWipe = 0;
        yield* this.gWipeDown();
      }
    }
    // hop down to the line's own floor, past the last char
    const last = chars[chars.length - 1];
    this.busy = true;
    yield* this.gHop(last.x + last.w + 0.55 * H, this.world.lines[i].baseline, { dur: 0.38 });
    this.busy = false;
    this.onTop = false;
  }

  /* squat down + wipe the surface underfoot; dust poofs.
     Deep squat (pelvis sinks to ~0.15H above floor) so the wiping hand can
     actually reach the ground with a bent arm — a standing bend can't. */
  *gWipeDown() {
    const p = this.pose, H = this.H;
    let t = 0; const dur = 1.35;
    const floor = this.floorY;
    while (t < dur) {
      const dt = yield; t += dt;
      const k = clamp(t / dur, 0, 1);
      const bend = ss(Math.min(1, k * 4)) * ss(Math.min(1, (1 - k) * 4));
      p.lean = 0.9 * bend;
      p.py = floor - lerp(this.legStand, 0.15 * H, bend);
      p.fl.x = p.px - 0.17 * H; p.fl.y = floor; p.fr.x = p.px + 0.15 * H; p.fr.y = floor;
      const sh = this.shoulderPos();
      // wiping hand rides DOWN with the squat (never pinned to a floor it
      // can't reach yet); off hand braces on the knee
      const sweep = Math.sin(t * 11);
      p.hr.x = sh.x + p.face * (0.06 + 0.10 * sweep * bend) * H;
      p.hr.y = lerp(sh.y + 0.25 * H, floor - 0.04 * H, bend);
      p.hl.x = p.px + p.face * 0.13 * H; p.hl.y = lerp(sh.y + 0.27 * H, floor - 0.22 * H, bend);
      if (bend > 0.8 && Math.random() < dt * 22) {
        this.particles.push({
          x: p.hr.x + (Math.random() - 0.5) * 6, y: p.hr.y - 2,
          vx: (Math.random() - 0.5) * 34 + p.face * 12, vy: -12 - Math.random() * 22,
          life: 0.45 + Math.random() * 0.4, r: 0.8 + Math.random() * 1.4,
        });
      }
    }
    // wipe brow flourish
    t = 0;
    while (t < 0.45) {
      const dt = yield; t += dt;
      p.lean = lerp(p.lean, 0, 0.2);
      p.py = lerp(p.py, this.floorY - this.legStand, 0.2);
      const head = this.headPos();
      p.hr.x = head.x + p.face * 0.06 * H + Math.sin(t * 18) * 0.03 * H;
      p.hr.y = head.y - 0.02 * H;
      this.idleArmL();
    }
    p.lean = 0;
  }

  idleArmL() {
    const p = this.pose, H = this.H, sh = this.shoulderPos();
    p.hl.x = lerp(p.hl.x, sh.x - p.face * 0.06 * H, 0.2);
    p.hl.y = lerp(p.hl.y, sh.y + 0.315 * H, 0.2);
  }

  /* ── flashlight handling ────────────────────────────────────────────── */
  flashTip() {
    const f = this.flash;
    if (f.mode === "carried") {
      const h = this.pose.hr;
      return { x: h.x + Math.cos(f.aim) * 0.14 * this.H, y: h.y + Math.sin(f.aim) * 0.14 * this.H };
    }
    return { x: f.x + Math.cos(f.ang) * 0.13 * this.H, y: f.y + Math.sin(f.ang) * 0.13 * this.H };
  }

  *gSetFlashDown(x, aimAng) {
    const p = this.pose, H = this.H;
    yield* this.gWalkTo(x);
    // squat + place
    let t = 0; const dur = 0.55;
    while (t < dur) {
      const dt = yield; t += dt; const k = Math.sin(clamp(t / dur, 0, 1) * Math.PI);
      p.lean = 0.72 * k; p.py = this.floorY - lerp(this.legStand, 0.16 * H, k);
      const shD = this.shoulderPos();
      p.hr.x = lerp(p.hr.x, p.px + p.face * 0.28 * H, 0.3);
      p.hr.y = lerp(shD.y + 0.25 * H, this.floorY - 0.05 * H, k);
      p.hl.x = p.px + p.face * 0.12 * H; p.hl.y = lerp(p.hl.y, this.floorY - 0.24 * H, 0.3 * k);
      p.fl.x = p.px - 0.15 * H; p.fl.y = this.floorY; p.fr.x = p.px + 0.13 * H; p.fr.y = this.floorY;
    }
    this.flash = { mode: "ground", x: p.px + p.face * 0.3 * H, y: this.floorY - 0.035 * H, ang: aimAng, aim: aimAng, on: true };
    p.lean = 0;
  }

  *gPickFlash() {
    const f = this.flash, p = this.pose, H = this.H;
    if (f.mode === "carried") return;
    yield* this.gWalkTo(f.x - p.face * 0.2 * H);
    let t = 0; const dur = 0.48;
    while (t < dur) {
      const dt = yield; t += dt; const k = Math.sin(clamp(t / dur, 0, 1) * Math.PI);
      p.lean = 0.72 * k; p.py = this.floorY - lerp(this.legStand, 0.16 * H, k);
      const shP = this.shoulderPos();
      p.hr.x = lerp(p.hr.x, f.x, 0.35); p.hr.y = lerp(shP.y + 0.25 * H, f.y, k);
      p.hl.x = p.px + p.face * 0.12 * H; p.hl.y = lerp(p.hl.y, this.floorY - 0.24 * H, 0.3 * k);
      p.fl.x = p.px - 0.15 * H; p.fl.y = this.floorY; p.fr.x = p.px + 0.13 * H; p.fr.y = this.floorY;
    }
    this.flash.mode = "carried"; this.flash.aim = p.face > 0 ? -0.2 : Math.PI + 0.2;
    p.lean = 0;
  }

  stow() { if (this.flash.mode !== "ground") this.flash.mode = "stowed"; }
  unstow() { if (this.flash.mode === "stowed") { this.flash.mode = "carried"; this.flash.aim = this.pose.face > 0 ? -0.2 : Math.PI + 0.2; } }

  /* ── choreography tasks ─────────────────────────────────────────────── */

  *gEnter() {
    const ln = this.world.lines[3];
    this.floorY = ln.baseline; this.lineIdx = 3;
    this.flash.mode = "carried"; this.flash.aim = -0.18;
    yield* this.gWait(0.5);
    yield* this.gWalkTo(Math.max(this.H * 1.6, ln.left - 1.6 * this.H), { speed: 1.45 });
    yield* this.gWait(0.35);
  }

  *gFixQuestion() {
    // the crooked "?" at the end of line 3 — shine light at it, push it straight
    const ln = this.world.lines[3];
    const q = ln.chars[ln.chars.length - 1];
    const p = this.pose, H = this.H;
    yield* this.gWalkTo(q.x - 0.55 * H);
    // aim beam up at it, tilt head — "hm."
    let t = 0;
    while (t < 1.0) {
      const dt = yield; t += dt;
      const tip = this.flashTip();
      const want = Math.atan2(q.topY + 0.3 * (ln.baseline - q.topY) - tip.y, q.x + q.w * 0.5 - tip.x);
      this.flash.aim += (want - this.flash.aim) * 0.15;
      p.hdy = -0.04 * H; p.hdx = 0.03 * H;
      this.idleArms();
    }
    // set flashlight down aimed at the ?, then push with both hands
    yield* this.gSetFlashDown(q.x - 1.5 * H, -0.42);
    yield* this.gWalkTo(q.x - 0.26 * H);
    this.busy = true;
    // push LOW on the glyph with the whole body leaned in — arms near-straight
    // like a real shove, not stretched up at chest height from far away
    const px0 = q.x + 0.10 * q.w, py0 = ln.baseline - (ln.baseline - q.topY) * 0.45;
    t = 0; const dur = 1.15; const a0 = this.world.getGlyphAngle();
    while (t < dur) {
      const dt = yield; t += dt; const k = clamp(t / dur, 0, 1);
      // lean in hard, feet staggered, little slips
      p.lean = 0.7 * ss(Math.min(1, k * 3));
      const slip = (k > 0.3 && k < 0.7) ? Math.sin(k * 40) * 0.014 * H * (k < 0.5 ? 1 : 0.4) : 0;
      p.px = q.x - 0.26 * H + 0.05 * H * ss(k) + slip;
      p.py = this.floorY - this.legStand + 0.09 * H;
      p.fl.x = p.px - 0.24 * H; p.fl.y = this.floorY; p.fr.x = p.px + 0.08 * H; p.fr.y = this.floorY;
      p.hl.x = px0 - 0.02 * H; p.hl.y = py0 + 0.04 * H;
      p.hr.x = px0; p.hr.y = py0 - 0.03 * H;
      // glyph gives way in the last 40% with a springy settle
      const give = k < 0.55 ? ss(k / 0.55) * 0.25 : 0.25 + easeOutBack((k - 0.55) / 0.45) * 0.75;
      this.world.setGlyphAngle(a0 * (1 - give));
      if (k > 0.5 && Math.random() < dt * 10) {
        this.particles.push({ x: q.x + Math.random() * q.w, y: ln.baseline - Math.random() * 8, vx: (Math.random() - 0.5) * 20, vy: -18, life: 0.4, r: 1 });
      }
    }
    this.world.setGlyphAngle(0);
    // stumble forward as it gives
    t = 0;
    while (t < 0.4) {
      const dt = yield; t += dt; const k = clamp(t / 0.4, 0, 1);
      p.px += dt * 0.5 * H * (1 - k);
      p.lean = lerp(0.7, -0.06, ss(k));
      p.py = this.floorY - this.legStand;
      p.fl.x = p.px - 0.1 * H; p.fl.y = this.floorY; p.fr.x = p.px + 0.14 * H; p.fr.y = this.floorY;
      this.idleArms();
    }
    this.busy = false;
    // step back, admire, nod
    yield* this.gWalkTo(q.x - 0.9 * H);
    t = 0;
    while (t < 0.8) { const dt = yield; t += dt; p.hdy = Math.sin(t * 9) * 0.02 * this.H - 0.02 * this.H; this.idleArms(); }
    yield* this.gPickFlash();
  }

  *gCleanLine(i, firstEver) {
    const ln = this.world.lines[i];
    this.lineIdx = i; this.floorY = ln.baseline;
    const H = this.H;
    // park the flashlight left of the line, raking the letters
    yield* this.gSetFlashDown(ln.left - 1.35 * H, -0.20);
    // climb the first (capital) letter — with the one-time fail beat
    const first = ln.chars.find((c) => !c.space);
    const fail = firstEver && !this.didFailBeat;
    if (fail) this.didFailBeat = true;
    yield* this.gClimb(first.x + first.w * 0.5, first.topY, { fail, side: 1 });
    this.lineIdx = i;
    // dust across the tops
    yield* this.gTraverseTops(i, { wipeEvery: i === 0 ? 2 : 3 });
    this.lineIdx = i; this.floorY = ln.baseline;
    // fetch the flashlight back
    yield* this.gPickFlash();
  }

  *gAscend(fromIdx) {
    const toIdx = fromIdx - 1;
    const from = this.world.lines[fromIdx], to = this.world.lines[toIdx];
    const H = this.H, p = this.pose;
    const first = from.chars.find((c) => !c.space);
    const firstAbove = to.chars.find((c) => !c.space);
    // stow light (needs both hands), climb atop this line's first capital
    this.stow();
    yield* this.gClimb(first.x + first.w * 0.5, first.topY, { easy: true, side: 1 });
    this.floorY = first.topY;
    yield* this.gWalkTo(first.x + 0.18 * H, { speed: 1.1 });
    // big leap up to the line above: grab the foot of its first letter
    yield* this.gClimb(firstAbove.x + 0.16 * H, to.baseline, { side: 1 });
    this.lineIdx = toIdx; this.floorY = to.baseline;
    yield* this.gWalkTo(to.left - 1.0 * H, { speed: 1.2 });
    this.unstow();
    yield* this.gWait(0.25);
  }

  *gWave(front = true) {
    const p = this.pose, H = this.H;
    this.busy = true;
    // little hop-turn to face out (or toward cursor side)
    if (!front) p.face = this.cursor.x > p.px ? 1 : -1;
    let t = 0; const td = 0.18;
    const y0 = p.py;
    while (t < td) {
      const dt = yield; t += dt; const k = Math.sin(clamp(t / td, 0, 1) * Math.PI);
      p.py = y0 - k * 0.08 * H;
      if (front) p.front = ss(clamp(t / td, 0, 1));
    }
    p.py = y0;
    // wave 3–4 cycles
    t = 0; const wd = 1.5;
    while (t < wd) {
      const dt = yield; t += dt;
      const sh = this.shoulderPos();
      const amp = ss(Math.min(1, t * 5)) * ss(Math.min(1, (wd - t) * 3));
      p.hr.x = sh.x + (front ? 0.11 : p.face * 0.11) * H + Math.sin(t * 13) * 0.09 * H * amp;
      p.hr.y = sh.y - 0.25 * H - Math.abs(Math.cos(t * 13)) * 0.03 * H * amp;
      p.hl.x = sh.x - (front ? 0.12 : p.face * 0.08) * H; p.hl.y = sh.y + 0.30 * H;
      p.hdx = Math.sin(t * 2) * 0.01 * H; p.hdy = -0.01 * H;
      p.fl.x = p.px - (front ? 0.13 : 0.10) * H; p.fl.y = this.floorY;
      p.fr.x = p.px + (front ? 0.13 : 0.10) * H; p.fr.y = this.floorY;
      p.py = this.floorY - this.legStand + Math.sin(t * 13) * 0.006 * H * amp;
    }
    // drop back to profile
    t = 0;
    while (t < 0.2) { const dt = yield; t += dt; p.front = front ? 1 - ss(t / 0.2) : 0; this.idleArms(); }
    p.front = 0;
    this.busy = false;
  }

  *gStartle() {
    const p = this.pose, H = this.H;
    this.busy = true;
    const away = this.cursor.x > p.px ? -1 : 1;
    const y0 = this.floorY - this.legStand;
    let t = 0; const dur = 0.3;
    const x0 = p.px;
    const x1 = clamp(x0 + away * 0.5 * H, 0.6 * H, this.world.W - 0.6 * H);
    while (t < dur) {
      const dt = yield; t += dt; const k = clamp(t / dur, 0, 1);
      p.px = lerp(x0, x1, ss(k));
      p.py = y0 - Math.sin(k * Math.PI) * 0.24 * H;
      p.lean = -0.2 * away * (p.face || 1) * Math.sin(k * Math.PI);
      const sh = this.shoulderPos();
      p.hl.x = sh.x - 0.24 * H; p.hl.y = sh.y - 0.14 * H;
      p.hr.x = sh.x + 0.24 * H; p.hr.y = sh.y - 0.14 * H;
      p.fl.x = p.px - 0.1 * H; p.fl.y = p.py + this.legStand * 0.8;
      p.fr.x = p.px + 0.1 * H; p.fr.y = p.py + this.legStand * 0.8;
    }
    p.fl.y = this.floorY; p.fr.y = this.floorY; p.py = y0; p.lean = 0;
    // stare at cursor a beat
    t = 0; p.face = this.cursor.x > p.px ? 1 : -1;
    while (t < 0.9) { const dt = yield; t += dt; this.idleArms(); }
    this.busy = false;
  }

  *gStumble() {
    const p = this.pose, H = this.H;
    let t = 0; const y0 = this.floorY - this.legStand;
    while (t < 0.4) {
      const dt = yield; t += dt; const k = Math.sin(clamp(t / 0.4, 0, 1) * Math.PI);
      p.py = y0 + k * 0.13 * H; p.lean = k * 0.18;
      const sh = this.shoulderPos();
      p.hl.x = sh.x - 0.22 * H; p.hl.y = sh.y + 0.02 * H;
      p.hr.x = sh.x + 0.22 * H; p.hr.y = sh.y + 0.02 * H;
    }
    p.py = y0; p.lean = 0;
  }

  *gFinale() {
    // all lines clean → face the viewer and wave proudly
    yield* this.gWait(0.4);
    yield* this.gWave(true);
  }

  *gSitDangle(dur) {
    const p = this.pose, H = this.H;
    // assumes standing on a glyph top (this.floorY = top). Sit ON its edge —
    // pelvis right down at the surface, legs over the side, propped on
    // straight-ish arms (lean-back pose), little alternating leg kicks.
    const gy = this.floorY;
    let t = 0; const sd = 0.35; const py0 = p.py;
    while (t < sd) {
      const dt = yield; t += dt; const k = ss(clamp(t / sd, 0, 1));
      p.py = lerp(py0, gy - 0.06 * H, k); p.front = k; p.lean = 0.06 * k;
      p.fl.x = p.px - 0.10 * H; p.fl.y = lerp(gy, gy + 0.30 * H, k);
      p.fr.x = p.px + 0.10 * H; p.fr.y = lerp(gy, gy + 0.30 * H, k);
    }
    t = 0;
    while (t < dur) {
      const dt = yield; t += dt;
      p.py = gy - 0.06 * H;
      p.fl.x = p.px - 0.10 * H; p.fl.y = gy + 0.36 * H + Math.sin(t * 3.1) * 0.04 * H;
      p.fr.x = p.px + 0.10 * H; p.fr.y = gy + 0.36 * H - Math.sin(t * 3.4) * 0.04 * H;
      p.hl.x = p.px - 0.17 * H; p.hl.y = gy - 0.01 * H;
      p.hr.x = p.px + 0.17 * H; p.hr.y = gy - 0.01 * H;
      p.hdx = Math.sin(t * 0.7) * 0.03 * H;
    }
    // stand back up
    t = 0;
    while (t < 0.3) {
      const dt = yield; t += dt; const k = ss(t / 0.3);
      p.py = lerp(gy - 0.06 * H, gy - this.legStand, k); p.front = 1 - k;
      p.fl.x = p.px - 0.1 * H; p.fl.y = gy; p.fr.x = p.px + 0.1 * H; p.fr.y = gy;
      this.idleArms();
    }
    p.front = 0;
  }

  *gLookAround(dur) {
    const p = this.pose;
    let t = 0;
    while (t < dur) {
      const dt = yield; t += dt;
      const ph = Math.sin(t * 0.9);
      p.face = ph > 0 ? 1 : -1;
      p.hdx = Math.sin(t * 1.7) * 0.03 * this.H;
      p.py = this.floorY - this.legStand + Math.sin(t * 1.1) * 0.006 * this.H;
      this.idleArms();
    }
  }

  *gStretch() {
    const p = this.pose, H = this.H;
    let t = 0; const dur = 1.4;
    while (t < dur) {
      const dt = yield; t += dt; const k = ss(Math.min(1, t * 3)) * ss(Math.min(1, (dur - t) * 3));
      const sh = this.shoulderPos();
      p.hl.x = sh.x - 0.10 * H; p.hl.y = sh.y - 0.34 * H * k;
      p.hr.x = sh.x + 0.10 * H; p.hr.y = sh.y - 0.34 * H * k;
      p.lean = -0.12 * k; p.hdy = -0.03 * H * k;
      p.py = this.floorY - this.legStand - 0.02 * H * k;
    }
    p.lean = 0;
  }

  *gAmbient() {
    // forever: wander line 0's world — perch, wave, look, stretch, re-dust
    const H = this.H;
    const ln = this.world.lines[0];
    const chars = ln.chars.filter((c) => !c.space);
    while (true) {
      const roll = Math.random();
      if (roll < 0.2) {
        yield* this.gLookAround(2.5 + Math.random() * 2);
      } else if (roll < 0.36) {
        yield* this.gWave(Math.random() < 0.6);
      } else if (roll < 0.52) {
        yield* this.gStretch();
        yield* this.gWait(0.8);
      } else if (roll < 0.74) {
        // climb a random capital-ish letter and sit, legs dangling
        const c = chars[Math.floor(Math.random() * Math.min(3, chars.length))];
        this.stow();
        yield* this.gClimb(c.x + c.w * 0.5, c.topY, { easy: true });
        this.floorY = c.topY;
        yield* this.gSitDangle(5 + Math.random() * 5);
        this.busy = true;
        yield* this.gHop(c.x - 0.5 * H, ln.baseline, { dur: 0.36 });
        this.busy = false;
        this.floorY = ln.baseline;
        this.unstow();
      } else if (roll < 0.88) {
        // patrol: wander with the beam
        const tx = ln.left - 1.5 * H + Math.random() * (ln.right - ln.left + 2 * H);
        yield* this.gWalkTo(clamp(tx, H, this.world.W - H), { speed: 1.0 });
        yield* this.gWait(1 + Math.random() * 1.5);
      } else {
        // spot-dust a random letter from the floor: reach up on tiptoes
        const c = chars[Math.floor(Math.random() * chars.length)];
        yield* this.gWalkTo(c.x + c.w * 0.5 - 0.3 * H);
        const p = this.pose;
        let t = 0;
        while (t < 1.2) {
          const dt = yield; t += dt;
          const k = ss(Math.min(1, t * 4)) * ss(Math.min(1, (1.2 - t) * 4));
          p.py = this.floorY - this.legStand - 0.05 * H * k; // tiptoe
          p.lean = -0.06 * k;
          const sh = this.shoulderPos();
          p.hr.x = c.x + c.w * 0.5 + Math.sin(t * 10) * 0.12 * c.w * k;
          p.hr.y = c.topY + 0.02 * H;
          this.idleArmL();
          if (k > 0.7 && Math.random() < dt * 14) {
            this.particles.push({ x: p.hr.x, y: p.hr.y, vx: (Math.random() - 0.5) * 26, vy: -16, life: 0.4, r: 1 });
          }
        }
        p.lean = 0; p.py = this.floorY - this.legStand;
      }
      yield* this.gWait(1.2 + Math.random() * 2.5);
    }
  }

  /* teleport to a clean standing pose (rig-test resets) */
  setStand(x, floorY, face = 1) {
    const p = this.pose, H = this.H;
    this.floorY = floorY;
    p.px = x; p.py = floorY - this.legStand; p.face = face; p.front = 0; p.lean = 0;
    p.fl.x = x - 0.10 * H; p.fl.y = floorY; p.fr.x = x + 0.10 * H; p.fr.y = floorY;
    const sh = this.shoulderPos();
    p.hl.x = sh.x - 0.05 * H; p.hl.y = sh.y + 0.30 * H;
    p.hr.x = sh.x + 0.05 * H; p.hr.y = sh.y + 0.30 * H;
  }

  /* ── rig-test mode: loop ONE behavior deterministically (?rig=walk …) ── */
  *gRig(name) {
    const H = this.H;
    const ln = this.world.lines[3];
    const first = ln.chars.find((c) => !c.space);
    const baseX = Math.max(ln.left + 0.5 * H, 2 * H);
    switch (name) {
      case "walk":
        this.setStand(baseX, ln.baseline);
        this.flash.mode = "carried"; this.flash.aim = -0.18;
        while (true) {
          yield* this.gWalkTo(baseX + 6 * H); yield* this.gWait(0.5);
          yield* this.gWalkTo(baseX); yield* this.gWait(0.5);
        }
      case "walkbare":
        this.setStand(baseX, ln.baseline);
        this.flash.mode = "stowed";
        while (true) {
          yield* this.gWalkTo(baseX + 6 * H); yield* this.gWait(0.5);
          yield* this.gWalkTo(baseX); yield* this.gWait(0.5);
        }
      case "climb":
      case "climbfail":
        this.flash.mode = "stowed";
        while (true) {
          this.setStand(first.x - 1.2 * H, ln.baseline);
          yield* this.gClimb(first.x + first.w * 0.5, first.topY, { fail: name === "climbfail", side: 1 });
          this.floorY = first.topY;
          yield* this.gWait(0.5);
          this.busy = true;
          yield* this.gHop(first.x + first.w + 0.7 * H, ln.baseline, { dur: 0.38 });
          this.busy = false;
          yield* this.gWait(0.5);
        }
      case "wipe":
        this.flash.mode = "stowed";
        this.setStand(first.x + first.w * 0.5, first.topY);
        while (true) { yield* this.gWipeDown(); yield* this.gWait(0.6); }
      case "wave":
        this.flash.mode = "carried"; this.flash.aim = -0.18;
        this.setStand(baseX + 2 * H, ln.baseline);
        while (true) {
          yield* this.gWave(true); yield* this.gWait(0.6);
          yield* this.gWave(false); yield* this.gWait(0.6);
        }
      case "hop":
        this.flash.mode = "stowed";
        while (true) {
          this.setStand(first.x - 0.8 * H, ln.baseline);
          yield* this.gWait(0.3);
          this.busy = true;
          yield* this.gHop(first.x + first.w * 0.5, first.topY, { dur: 0.34 });
          this.busy = false;
          yield* this.gWait(0.4);
          this.busy = true;
          yield* this.gHop(first.x + first.w + 0.6 * H, ln.baseline, { dur: 0.38 });
          this.busy = false;
          yield* this.gWait(0.4);
        }
      case "push":
        while (true) {
          this.world.setGlyphAngle(-7);
          this.flash.mode = "carried"; this.flash.aim = -0.18;
          this.setStand(baseX + 3 * H, ln.baseline);
          yield* this.gFixQuestion();
          yield* this.gWait(0.8);
        }
      case "sit":
        this.flash.mode = "stowed";
        while (true) {
          this.setStand(first.x - 1.2 * H, ln.baseline);
          yield* this.gClimb(first.x + first.w * 0.5, first.topY, { easy: true, side: 1 });
          this.floorY = first.topY;
          yield* this.gSitDangle(2.5);
          this.busy = true;
          yield* this.gHop(first.x - 0.8 * H, ln.baseline, { dur: 0.38 });
          this.busy = false;
          yield* this.gWait(0.5);
        }
      case "startle":
        this.flash.mode = "carried"; this.flash.aim = -0.18;
        this.setStand(baseX + 2 * H, ln.baseline);
        while (true) {
          this.cursor.x = this.pose.px + 1.2 * H; this.cursor.y = this.pose.py;
          yield* this.gStartle();
          yield* this.gWait(0.8);
        }
      case "idle":
        this.flash.mode = "carried"; this.flash.aim = -0.18;
        this.setStand(baseX + 2 * H, ln.baseline);
        while (true) {
          yield* this.gLookAround(3);
          yield* this.gStretch();
          yield* this.gWait(0.8);
        }
      default:
        this.setStand(baseX, ln.baseline);
        while (true) { yield* this.gWait(1); }
    }
  }

  /* ── skeleton resolve + draw ────────────────────────────────────────── */
  shoulderPos() {
    const p = this.pose;
    const a = -Math.PI / 2 + p.lean * (p.face || 1) * (1 - p.front * 0.7);
    return { x: p.px + Math.cos(a) * this.L.torso, y: p.py + Math.sin(a) * this.L.torso };
  }
  headPos() {
    const sh = this.shoulderPos(), p = this.pose;
    // head continues the torso's lean (counter-rotated ~40% toward vertical),
    // instead of floating straight above the shoulder at any bend
    const aTorso = -Math.PI / 2 + p.lean * (p.face || 1) * (1 - p.front * 0.7);
    const aHead = aTorso + (-Math.PI / 2 - aTorso) * 0.4;
    const r = this.L.neck + this.L.headR;
    return { x: sh.x + Math.cos(aHead) * r + p.hdx, y: sh.y + Math.sin(aHead) * r + p.hdy };
  }

  /* pull a target inside the limb's reach so nothing ever hyperextends */
  reachClamp(ox, oy, t, maxL) {
    const dx = t.x - ox, dy = t.y - oy;
    const d = Math.hypot(dx, dy);
    if (d <= maxL) return { x: t.x, y: t.y };
    const f = maxL / d;
    return { x: ox + dx * f, y: oy + dy * f };
  }

  /* full skeleton solve — single source of truth for draw() + the eval probe.
     Bend signs (canvas y grows DOWN): knees bow FORWARD (+face), which needs
     bend = -face here; elbows trail BEHIND (bend = +face) unless reaching up. */
  joints() {
    const p = this.pose, L = this.L, H = this.H;
    const sh = this.shoulderPos();
    const head = this.headPos();
    const spread = p.front * 0.07 * H;
    const f = p.face || 1;
    const armMax = (L.armU + L.armL) * 0.99;
    const legMax = (L.legU + L.legL) * 0.99;
    const hl = this.reachClamp(sh.x - spread, sh.y, p.hl, armMax);
    const hr = this.reachClamp(sh.x + spread, sh.y, p.hr, armMax);
    const fl = this.reachClamp(p.px - spread, p.py, p.fl, legMax);
    const fr = this.reachClamp(p.px + spread, p.py, p.fr, legMax);
    const bKL = p.front > 0.5 ? 1 : -f;
    const bKR = p.front > 0.5 ? -1 : -f;
    const bEL = p.front > 0.5 ? 1 : (p.hl.y < sh.y - 0.04 * H ? -f : f);
    const bER = p.front > 0.5 ? -1 : (p.hr.y < sh.y - 0.04 * H ? -f : f);
    const [klx, kly] = ik2(p.px - spread, p.py, fl.x, fl.y, L.legU, L.legL, bKL);
    const [krx, kry] = ik2(p.px + spread, p.py, fr.x, fr.y, L.legU, L.legL, bKR);
    const [elx, ely] = ik2(sh.x - spread, sh.y, hl.x, hl.y, L.armU, L.armL, bEL);
    const [erx, ery] = ik2(sh.x + spread, sh.y, hr.x, hr.y, L.armU, L.armL, bER);
    return {
      pelvis: { x: p.px, y: p.py }, sh, head, spread,
      hl, hr, fl, fr,
      kl: { x: klx, y: kly }, kr: { x: krx, y: kry },
      el: { x: elx, y: ely }, er: { x: erx, y: ery },
    };
  }

  draw(ctx) {
    const p = this.pose, L = this.L, H = this.H;
    const J = this.joints();
    ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.strokeStyle = ORANGE; ctx.fillStyle = ORANGE;
    ctx.lineWidth = this.lw;

    // torso
    ctx.beginPath(); ctx.moveTo(p.px, p.py); ctx.lineTo(J.sh.x, J.sh.y); ctx.stroke();

    // legs — drawn to the CLAMPED ends, never past the bone length
    ctx.beginPath(); ctx.moveTo(p.px - J.spread, p.py); ctx.lineTo(J.kl.x, J.kl.y); ctx.lineTo(J.fl.x, J.fl.y); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(p.px + J.spread, p.py); ctx.lineTo(J.kr.x, J.kr.y); ctx.lineTo(J.fr.x, J.fr.y); ctx.stroke();

    // arms
    ctx.beginPath(); ctx.moveTo(J.sh.x - J.spread, J.sh.y); ctx.lineTo(J.el.x, J.el.y); ctx.lineTo(J.hl.x, J.hl.y); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(J.sh.x + J.spread, J.sh.y); ctx.lineTo(J.er.x, J.er.y); ctx.lineTo(J.hr.x, J.hr.y); ctx.stroke();

    // head
    ctx.beginPath(); ctx.arc(J.head.x, J.head.y, L.headR, 0, TAU); ctx.fill();

    // flashlight body
    const f = this.flash;
    if (f.mode !== "stowed") {
      const fx = f.mode === "carried" ? J.hr.x : f.x;
      const fy = f.mode === "carried" ? J.hr.y : f.y;
      const fa = f.mode === "carried" ? f.aim : f.ang;
      ctx.save();
      ctx.translate(fx, fy); ctx.rotate(fa);
      ctx.fillStyle = "#3a3a3a";
      const fl2 = 0.22 * H, fw = 0.075 * H;
      ctx.fillRect(-fl2 * 0.4, -fw / 2, fl2, fw);
      ctx.fillStyle = "#585858";
      ctx.fillRect(fl2 * 0.6 - 3, -fw * 0.72, 4, fw * 1.44); // head ring
      ctx.restore();
    } else {
      // stowed: little handle at the hip
      ctx.fillStyle = "#3a3a3a";
      ctx.fillRect(p.px - 0.5 * this.lw, p.py - 0.05 * H, this.lw, 0.14 * H);
    }
  }

  drawLight(ctx) {
    const p = this.pose, H = this.H, f = this.flash;
    // ambient island around him
    const cx = p.px, cy = p.py - 0.1 * H;
    let g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 2.6 * H);
    g.addColorStop(0, "rgba(255,244,224,0.14)");
    g.addColorStop(0.45, "rgba(255,244,224,0.07)");
    g.addColorStop(1, "rgba(255,244,224,0)");
    ctx.fillStyle = g;
    ctx.fillRect(cx - 2.6 * H, cy - 2.6 * H, 5.2 * H, 5.2 * H);

    // flashlight beam + pool
    if (f.mode !== "stowed" && f.on) {
      const tip = this.flashTip();
      const ang = f.mode === "carried" ? f.aim : f.ang;
      const len = 7.5 * H, spr = Math.tan(0.16);
      ctx.save();
      ctx.translate(tip.x, tip.y); ctx.rotate(ang);
      const bg = ctx.createLinearGradient(0, 0, len, 0);
      bg.addColorStop(0, "rgba(255,246,228,0.30)");
      bg.addColorStop(0.5, "rgba(255,246,228,0.10)");
      bg.addColorStop(1, "rgba(255,246,228,0)");
      ctx.fillStyle = bg;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(len, -len * spr);
      ctx.lineTo(len, len * spr);
      ctx.closePath(); ctx.fill();
      ctx.restore();
      // floor pool where the beam meets his current floor
      if (Math.abs(Math.sin(ang)) > 0.02) {
        const dy = this.floorY - tip.y;
        const rx = dy / Math.sin(ang);
        if (rx > 0 && rx < len * 1.3) {
          const pxx = tip.x + Math.cos(ang) * rx;
          const pg = ctx.createRadialGradient(pxx, this.floorY, 0, pxx, this.floorY, 1.4 * H);
          pg.addColorStop(0, "rgba(255,246,228,0.16)");
          pg.addColorStop(1, "rgba(255,246,228,0)");
          ctx.fillStyle = pg;
          ctx.save(); ctx.translate(pxx, this.floorY); ctx.scale(1, 0.32); ctx.translate(-pxx, -this.floorY);
          ctx.fillRect(pxx - 1.4 * H, this.floorY - 1.4 * H, 2.8 * H, 2.8 * H);
          ctx.restore();
        }
      }
    }

    // dust motes (they catch the light)
    for (const pt of this.particles) {
      ctx.globalAlpha = clamp(pt.life * 1.6, 0, 0.55);
      ctx.fillStyle = "#efe9dd";
      ctx.beginPath(); ctx.arc(pt.x, pt.y, pt.r, 0, TAU); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
}

/* ═══ React shell ════════════════════════════════════════════════════════ */
const WalkJanitor = () => {
  const sectionRef = useRef(null);
  const menuRef = useRef(null);
  const figCanvasRef = useRef(null);
  const lightCanvasRef = useRef(null);
  const lineRefs = useRef([]);
  const charRefs = useRef([]); // charRefs.current[line][char]
  const probeRefs = useRef([]);
  const qMarkRef = useRef(null); // the crooked "?" span
  const [flushed, setFlushed] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const stickRef = useRef(null);
  const worldRef = useRef(null);
  const hoverRef = useRef(-1);
  const visibleRef = useRef(false);
  const startedRef = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const cb = (e) => setReduceMotion(e.matches);
    mq.addEventListener?.("change", cb);
    return () => mq.removeEventListener?.("change", cb);
  }, []);

  /* flush trigger + visibility */
  useEffect(() => {
    // rig-test mode boots instantly, no scroll gating
    if (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("rig")) {
      setFlushed(true);
      visibleRef.current = true;
      return;
    }
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          visibleRef.current = e.isIntersecting;
          if (e.isIntersecting && e.intersectionRatio > 0.3) setFlushed(true);
        }
      },
      { threshold: [0, 0.3, 0.6] }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  /* measure + run */
  useEffect(() => {
    if (reduceMotion || !flushed) return;
    let raf = 0, last = 0, disposed = false;
    const qAngle = { current: -7 }; // crooked "?" degrees
    const params = new URLSearchParams(window.location.search);
    const speedup = params.has("janfast") ? 3 : 1;
    const rig = params.get("rig");

    const applyQ = () => {
      if (qMarkRef.current) {
        qMarkRef.current.style.transform = `rotate(${qAngle.current}deg)`;
      }
    };

    const measure = () => {
      const sec = sectionRef.current;
      if (!sec) return null;
      const sr = sec.getBoundingClientRect();
      const mctx = document.createElement("canvas").getContext("2d");
      const lines = LINES.map((ln, i) => {
        const el = lineRefs.current[i];
        const probe = probeRefs.current[i];
        if (!el || !probe) return null;
        const fs = parseFloat(getComputedStyle(el).fontSize);
        mctx.font = `700 ${fs}px "Google Sans","Product Sans",system-ui,sans-serif`;
        const baseline = probe.getBoundingClientRect().bottom - sr.top;
        const chars = ln.label.split("").map((c, j) => {
          const span = charRefs.current[i]?.[j];
          if (!span) return null;
          const r = span.getBoundingClientRect();
          const m = mctx.measureText(c);
          return {
            c,
            space: c === " ",
            x: r.left - sr.left,
            w: r.width,
            topY: baseline - (m.actualBoundingBoxAscent || fs * 0.7),
          };
        }).filter(Boolean);
        const solid = chars.filter((c) => !c.space);
        return {
          baseline,
          cap: mctx.measureText("W").actualBoundingBoxAscent || fs * 0.72,
          chars,
          left: solid[0]?.x ?? 0,
          right: solid.length ? solid[solid.length - 1].x + solid[solid.length - 1].w : 0,
          midX: ((solid[0]?.x ?? 0) + (solid.length ? solid[solid.length - 1].x + solid[solid.length - 1].w : 0)) / 2,
        };
      });
      if (lines.some((l) => !l)) return null;
      return {
        W: sec.clientWidth, Hs: sec.clientHeight, lines, rig,
        getGlyphAngle: () => qAngle.current,
        setGlyphAngle: (a) => { qAngle.current = a; applyQ(); },
      };
    };

    const sizeCanvases = () => {
      const sec = sectionRef.current;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      for (const cv of [figCanvasRef.current, lightCanvasRef.current]) {
        if (!cv || !sec) continue;
        cv.width = sec.clientWidth * dpr;
        cv.height = sec.clientHeight * dpr;
        cv.style.width = sec.clientWidth + "px";
        cv.style.height = sec.clientHeight + "px";
        cv.getContext("2d").setTransform(dpr, 0, 0, dpr, 0, 0);
      }
    };

    const boot = async () => {
      try { await document.fonts.ready; } catch { /* older browsers */ }
      if (disposed) return;
      applyQ();
      const world = measure();
      if (!world) return;
      worldRef.current = world;
      sizeCanvases();
      // enter after the flush finishes (rig mode: immediately)
      setTimeout(() => {
        if (disposed || startedRef.current) return;
        startedRef.current = true;
        stickRef.current = new Stickman(world);
        last = performance.now();
        raf = requestAnimationFrame(tick);
      }, rig ? 100 : 1400 / speedup);
    };

    const stepOnce = (dt) => {
      const stick = stickRef.current;
      const world = worldRef.current;
      if (!stick || !world) return;
      stick.hoverLine = hoverRef.current;
      stick.update(dt);
      if (speedup > 1 || rig) {
        window.__wj = { x: stick.pose.px, y: stick.pose.py, busy: stick.busy }; // debug probe
      }
      const fctx = figCanvasRef.current?.getContext("2d");
      const lctx = lightCanvasRef.current?.getContext("2d");
      if (!fctx || !lctx) return;
      fctx.clearRect(0, 0, world.W, world.Hs);
      lctx.clearRect(0, 0, world.W, world.Hs);
      stick.drawLight(lctx);
      stick.draw(fctx);
    };

    // deterministic external stepping for the animation eval harness
    if (rig || speedup > 1) {
      window.__wjStep = (dt) => { stepOnce(dt); };
      window.__wjPose = () => {
        const s = stickRef.current;
        if (!s) return null;
        const J = s.joints();
        return {
          t: s.t, H: s.H, floorY: s.floorY, busy: s.busy,
          face: s.pose.face, front: s.pose.front, lean: s.pose.lean,
          px: s.pose.px, py: s.pose.py,
          targets: { hl: { ...s.pose.hl }, hr: { ...s.pose.hr }, fl: { ...s.pose.fl }, fr: { ...s.pose.fr } },
          joints: J,
          reach: { arm: s.L.armU + s.L.armL, leg: s.L.legU + s.L.legL },
        };
      };
    }

    const tick = (now) => {
      if (disposed) return;
      raf = requestAnimationFrame(tick);
      let dt = Math.min(0.05, (now - last) / 1000) * speedup;
      last = now;
      if (window.__wjManual) return;               // harness drives time
      if (!visibleRef.current || document.hidden) return; // paused (keep clock fresh)
      stepOnce(dt);
    };

    const onMove = (e) => {
      const sec = sectionRef.current, stick = stickRef.current;
      if (!sec || !stick) return;
      const r = sec.getBoundingClientRect();
      const nx = e.clientX - r.left, ny = e.clientY - r.top;
      const c = stick.cursor;
      const now = performance.now() / 1000;
      const dt = Math.max(1e-3, now - (c.tPrev || now));
      c.vx = (nx - c.x) / dt; c.vy = (ny - c.y) / dt;
      c.x = nx; c.y = ny; c.tPrev = now;
    };
    const onLeave = () => {
      const c = stickRef.current?.cursor;
      if (c) { c.x = -9e3; c.y = -9e3; c.vx = 0; c.vy = 0; }
    };

    let resizeT = 0;
    const onResize = () => {
      clearTimeout(resizeT);
      resizeT = setTimeout(() => {
        const world = measure();
        if (!world || !stickRef.current) return;
        worldRef.current = world;
        sizeCanvases();
        // re-anchor: stand him on his current line's floor at a sane x
        const s = stickRef.current;
        s.world = world;
        const ln = world.lines[clamp(s.lineIdx, 0, 3)];
        s.floorY = ln.baseline;
        s.pose.px = clamp(s.pose.px, s.H, world.W - s.H);
        s.pose.py = ln.baseline - s.legStand;
        s.onTop = false; s.busy = false; s.interrupt = null;
        if (s.flash.mode === "ground") { s.flash.x = ln.left - 1.35 * s.H; s.flash.y = ln.baseline - 0.035 * s.H; }
      }, 200);
    };

    boot();
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("resize", onResize);
    sectionRef.current?.addEventListener("mouseleave", onLeave);
    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      clearTimeout(resizeT);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", onResize);
    };
  }, [flushed, reduceMotion]);

  /* char spans with flush stagger */
  let charDelayBase = 0;
  const renderLine = (ln, i) => {
    const isCrooked = (j) => i === 3 && j === ln.label.length - 1;
    const inner = (
      <>
        {ln.label.split("").map((c, j) => (
          <span
            key={j}
            ref={(el) => {
              if (!charRefs.current[i]) charRefs.current[i] = [];
              charRefs.current[i][j] = el;
              if (isCrooked(j)) qMarkRef.current = el;
            }}
            className="wj-ch"
            style={{
              animationDelay: `${(i * 0.13 + j * 0.016).toFixed(3)}s`,
              ...(isCrooked(j) ? { display: "inline-block", transformOrigin: "50% 100%" } : null),
            }}
          >
            {c === " " ? " " : c}
          </span>
        ))}
        {/* zero-size inline probe: its bottom = the text baseline */}
        <span
          ref={(el) => { probeRefs.current[i] = el; }}
          style={{ display: "inline-block", width: 0, height: 0 }}
          aria-hidden
        />
      </>
    );
    const common = {
      className: "wj-line",
      ref: (el) => { lineRefs.current[i] = el; },
      onMouseEnter: () => { hoverRef.current = i; },
      onMouseLeave: () => { hoverRef.current = -1; },
      "aria-label": ln.label,
    };
    return ln.to ? (
      <Link key={ln.label} to={ln.to} {...common}>{inner}</Link>
    ) : (
      <a key={ln.label} href={ln.href} {...common}>{inner}</a>
    );
  };

  return (
    <section
      ref={sectionRef}
      className={`relative h-screen w-full overflow-hidden bg-black ${flushed ? "wj-on" : ""}`}
      style={{ fontFamily: '"Google Sans","Product Sans",system-ui,sans-serif' }}
    >
      <style>{`
        .wj-line {
          display: block;
          width: fit-content;
          font-weight: 700;
          font-size: clamp(2.4rem, 5.2vw, 4.5rem);
          line-height: 1;
          letter-spacing: -0.01em;
          color: ${DIM};
          text-decoration: none;
          transition: color 0.35s ease, transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
          will-change: transform;
        }
        .wj-line + .wj-line { margin-top: 1.06em; }
        .wj-line:hover, .wj-line:focus-visible { color: #fff; transform: translateX(0.12em); outline: none; }
        .wj-line:focus-visible .wj-ch { text-shadow: 0 0 24px rgba(255,122,26,0.35); }
        .wj-ch { opacity: 0; }
        .wj-on .wj-ch { animation: wjFlush 0.22s ease-out forwards; }
        @keyframes wjFlush { from { opacity: 0; } to { opacity: 1; } }
        @media (prefers-reduced-motion: reduce) {
          .wj-ch { opacity: 1; animation: none !important; }
          .wj-line { color: #9a9a9a; transition: color 0.3s ease; }
          .wj-line:hover { transform: none; }
        }
      `}</style>

      <nav
        ref={menuRef}
        aria-label="Site navigation"
        className="absolute left-[8vw] top-1/2 -translate-y-1/2"
      >
        {LINES.map(renderLine)}
      </nav>

      {!reduceMotion && (
        <>
          {/* light layer: screen-blend genuinely brightens the letters below */}
          <canvas
            ref={lightCanvasRef}
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{ mixBlendMode: "screen" }}
          />
          {/* the janitor himself */}
          <canvas
            ref={figCanvasRef}
            aria-hidden
            className="pointer-events-none absolute inset-0"
          />
        </>
      )}
    </section>
  );
};

export default WalkJanitor;
