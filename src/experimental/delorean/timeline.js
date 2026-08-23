// Shared timeline + geometry constants for the /delorean garage reveal.
// Everything on the page is a pure function of t (seconds since mount),
// so ?t=<seconds> can freeze any moment for screenshots.

export const TL = {
  linesStart: 0.5,
  linesEnd: 2.35,
  motorStart: 2.9, // shudder, interior lights ramp, DOM text -> door texture swap
  openStart: 3.08,
  openEnd: 7.4,
  end: 8.8,
};

export const DOOR = {
  W: 4.35, // door slab is slightly larger than the opening so no light leaks around it
  H: 2.15,
  OPEN_W: 4.27, // visible rough opening (a real 14ft door)
  OPEN_H: 2.11,
  PANELS: 5, // 5 panels keeps the lowest seam clear of the subtitle's descenders
  SEAM: 0.006, // gap between panels
  FACE_Z: -0.13, // world z of the door's outer face (behind the wall opening)
  SLAB_T: 0.045,
  CURVE_Y: 2.07, // height where the track starts curving into the room
  R: 0.34, // track curve radius
  TRAVEL: 2.34, // how far along the track the door slides when opening
  BOTTOM_GAP: 0.009, // daylight gap under the closed door (the light-tease sliver)
};
DOOR.PANEL_H = DOOR.H / DOOR.PANELS;
DOOR.PLANE_Z = DOOR.FACE_Z - DOOR.SLAB_T / 2;

export const ROOM = { W: 6.6, D: 6.4, H: 2.64 };

export const CAM_FOV = 40;
export const CAM_Y = DOOR.OPEN_H / 2; // face-on: no keystone, text projects as a flat rect

export const clamp01 = (x) => Math.min(1, Math.max(0, x));
export const easeOutCubic = (x) => 1 - Math.pow(1 - clamp01(x), 3);
export const easeInOutCubic = (x) => {
  x = clamp01(x);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
};
export const smoothstep = (a, b, x) => {
  const u = clamp01((x - a) / (b - a));
  return u * u * (3 - 2 * u);
};

// Trapezoidal velocity profile: short ramp up, constant travel, longer cushion at the end.
export function motorProfile(u) {
  u = clamp01(u);
  const a = 0.09, b = 0.84;
  const area = a / 2 + (b - a) + (1 - b) / 2;
  let s;
  if (u < a) s = (u * u) / (2 * a);
  else if (u < b) s = a / 2 + (u - a);
  else {
    const r = 1 - b;
    const v = 1 - u;
    s = a / 2 + (b - a) + (r / 2 - (v * v) / (2 * r));
  }
  return s / area;
}

export function doorTravel(t) {
  if (t <= TL.openStart) return 0;
  return DOOR.TRAVEL * motorProfile((t - TL.openStart) / (TL.openEnd - TL.openStart));
}

// --- Light signals -------------------------------------------------------
// The opener's little service lamp kicks in with the motor; the main LED
// fixtures wake dim and climb WITH the door, so the light level physically
// tracks the reveal instead of popping.

export function openerLamp(t) {
  const r = smoothstep(TL.motorStart, TL.motorStart + 0.12, t);
  if (r <= 0) return 0;
  const dt = t - TL.motorStart;
  return r * (1 - 0.3 * Math.exp(-dt * 6) * Math.pow(Math.sin(dt * 70), 2));
}

// f = doorTravel / TRAVEL. Warm-up flicker rides the door's first half-metre.
export function mainLights(t, f) {
  const wake = 0.22 * smoothstep(TL.motorStart + 0.05, TL.motorStart + 0.45, t);
  const rise = 0.78 * smoothstep(0.03, 0.55, f);
  let L = wake + rise;
  if (L <= 0) return 0;
  const flick = 1 - 0.2 * Math.exp(-f * 11) * (0.5 + 0.5 * Math.sin(t * 47))
    * smoothstep(TL.motorStart, TL.motorStart + 0.2, t);
  return L * flick;
}

// Headlights snap on mid-rise (door ~1/3 up) and warm to full like halogens.
export const HEADLIGHT_T = 4.55;
export function headlampLevel(t) {
  const on = smoothstep(HEADLIGHT_T, HEADLIGHT_T + 0.1, t);
  return on * (0.55 + 0.45 * smoothstep(HEADLIGHT_T, HEADLIGHT_T + 0.6, t));
}

// Position of a point riding the door track, s = arc length from the floor.
// Returns {y, z} with z relative to the door plane (negative = into the room).
export function trackPoint(s) {
  if (s <= DOOR.CURVE_Y) return { y: s, z: 0 };
  const a = s - DOOR.CURVE_Y;
  const arc = (Math.PI / 2) * DOOR.R;
  if (a <= arc) {
    const th = a / DOOR.R;
    return { y: DOOR.CURVE_Y + DOOR.R * Math.sin(th), z: -DOOR.R * (1 - Math.cos(th)) };
  }
  return { y: DOOR.CURVE_Y + DOOR.R, z: -DOOR.R - (a - arc) };
}

// Map the measured DOM nameplate onto a camera distance + screen-space door rect.
// ppm = screen pixels per world meter on the door plane.
export function calibrate(vw, vh, nameWidthPx) {
  let ppm = nameWidthPx / 0.88 / DOOR.OPEN_W; // name spans ~88% of the opening
  const maxPpm = Math.min((0.88 * vw) / DOOR.OPEN_W, (0.78 * vh) / DOOR.OPEN_H);
  ppm = Math.min(ppm, maxPpm);
  const dist = vh / (2 * ppm * Math.tan(((CAM_FOV / 2) * Math.PI) / 180));
  const openPx = {
    w: DOOR.OPEN_W * ppm,
    h: DOOR.OPEN_H * ppm,
    left: vw / 2 - (DOOR.OPEN_W * ppm) / 2,
    top: vh / 2 - (DOOR.OPEN_H * ppm) / 2,
  };
  openPx.right = openPx.left + openPx.w;
  openPx.bottom = openPx.top + openPx.h;
  return { vw, vh, ppm, dist, camZ: DOOR.FACE_Z + dist, openPx };
}

// Convert a DOM-pixel point to door-slab UV (u,v in 0..1 across the whole slab).
export function screenToSlabUV(calib, px, py) {
  const wx = (px - calib.vw / 2) / calib.ppm;
  const wy = CAM_Y + (calib.vh / 2 - py) / calib.ppm;
  return {
    u: (wx + DOOR.W / 2) / DOOR.W,
    v: (wy - DOOR.BOTTOM_GAP) / DOOR.H,
  };
}
