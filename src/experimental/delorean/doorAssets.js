import * as THREE from 'three';
import { DOOR, screenToSlabUV } from './timeline';

// ---------------------------------------------------------------------------
// Emissive face texture: the nameplate painted onto the door slab, calibrated
// so its screen projection matches the DOM nameplate pixel-for-pixel.
// ---------------------------------------------------------------------------

const FONT_STACK = '"Space Grotesk", "Google Sans", sans-serif';

function drawTracked(ctx, text, centerX, centerY, fontPx, weight, spacingPx, fill, glowBlur, glowColor) {
  ctx.font = `${weight} ${fontPx}px ${FONT_STACK}`;
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';
  const chars = [...text];
  const widths = chars.map((c) => ctx.measureText(c).width);
  // CSS letter-spacing adds after every char including the last — match that for centering.
  const total = widths.reduce((a, b) => a + b, 0) + spacingPx * chars.length;
  const m = ctx.measureText(text);
  const baselineY = centerY + (m.actualBoundingBoxAscent - m.actualBoundingBoxDescent) / 2;
  let x = centerX - total / 2;
  ctx.save();
  ctx.fillStyle = fill;
  if (glowBlur > 0) {
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = glowBlur;
  }
  chars.forEach((c, i) => {
    ctx.fillText(c, x, baselineY);
    x += widths[i] + spacingPx;
  });
  ctx.restore();
}

export async function buildDoorFaceTexture(calib, nameRect, subRect, nameFontPx, subFontPx) {
  const texW = 4096;
  const texH = Math.round((texW * DOOR.H) / DOOR.W);
  const canvas = document.createElement('canvas');
  canvas.width = texW;
  canvas.height = texH;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, texW, texH);

  await Promise.all([
    document.fonts.load(`700 ${Math.round(nameFontPx)}px "Space Grotesk"`),
    document.fonts.load(`500 ${Math.round(subFontPx)}px "Space Grotesk"`),
  ]).catch(() => {});

  const scale = (texW / DOOR.W) / calib.ppm; // texture px per screen px
  const toCanvas = (rect) => {
    const { u, v } = screenToSlabUV(calib, rect.left + rect.width / 2, rect.top + rect.height / 2);
    return { x: u * texW, y: (1 - v) * texH };
  };

  const glowPx = Math.min(Math.max(14, 0.025 * calib.vw), 40) * scale;
  const nc = toCanvas(nameRect);
  drawTracked(
    ctx, 'Jonathan', nc.x, nc.y,
    nameFontPx * scale, 700, -0.035 * nameFontPx * scale,
    '#ffffff', glowPx, 'rgba(215, 226, 236, 0.28)'
  );
  const sc = toCanvas(subRect);
  drawTracked(
    ctx, "I couldn't figure out how to design a good home page. I'm just an engineer",
    sc.x, sc.y,
    subFontPx * scale, 500, 0.02 * subFontPx * scale,
    '#5c6672', 0, ''
  );

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

// ---------------------------------------------------------------------------
// Procedural normal maps — embossed rectangles outside, stiffener ribs inside.
// Height field painted to canvas, converted with a Sobel pass.
// ---------------------------------------------------------------------------

function heightToNormalTexture(src, strength) {
  const w = src.width, h = src.height;
  const data = src.getContext('2d').getImageData(0, 0, w, h).data;
  const out = document.createElement('canvas');
  out.width = w;
  out.height = h;
  const octx = out.getContext('2d');
  const img = octx.createImageData(w, h);
  const hAt = (x, y) => {
    x = Math.min(w - 1, Math.max(0, x));
    y = Math.min(h - 1, Math.max(0, y));
    return data[(y * w + x) * 4];
  };
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const dx = (hAt(x + 1, y) - hAt(x - 1, y)) / 255;
      const dy = (hAt(x, y + 1) - hAt(x, y - 1)) / 255;
      let nx = -dx * strength, ny = dy * strength, nz = 1; // +dy: canvas y-down + flipY cancel
      const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
      nx /= len; ny /= len; nz /= len;
      const i = (y * w + x) * 4;
      img.data[i] = (nx * 0.5 + 0.5) * 255;
      img.data[i + 1] = (ny * 0.5 + 0.5) * 255;
      img.data[i + 2] = (nz * 0.5 + 0.5) * 255;
      img.data[i + 3] = 255;
    }
  }
  octx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(out);
  tex.anisotropy = 8;
  return tex;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// Exterior: classic short raised panels, 14 across per row.
export function buildExteriorNormal() {
  const w = 2048, h = Math.round((w * DOOR.H) / DOOR.W);
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d');
  ctx.fillStyle = 'rgb(128,128,128)';
  ctx.fillRect(0, 0, w, h);
  const rowH = h / DOOR.PANELS;
  const cols = 12;
  const cellW = w / cols;
  for (let row = 0; row < DOOR.PANELS; row++) {
    for (let col = 0; col < cols; col++) {
      const pad = cellW * 0.10;
      const x = col * cellW + pad;
      const y = row * rowH + rowH * 0.16;
      const rw = cellW - pad * 2;
      const rh = rowH * 0.68;
      ctx.save();
      ctx.shadowColor = 'rgb(255,255,255)';
      ctx.shadowBlur = 9;
      ctx.fillStyle = 'rgb(168,168,168)';
      roundRect(ctx, x, y, rw, rh, 6);
      ctx.fill();
      ctx.restore();
      ctx.save();
      ctx.shadowColor = 'rgb(128,128,128)';
      ctx.shadowBlur = 7;
      ctx.fillStyle = 'rgb(148,148,148)';
      roundRect(ctx, x + 10, y + 8, rw - 20, rh - 16, 4);
      ctx.fill();
      ctx.restore();
    }
  }
  return heightToNormalTexture(c, 1.35);
}

// Interior: long horizontal stiffener ribs + vertical stile lines per panel.
export function buildInteriorNormal() {
  const w = 2048, h = Math.round((w * DOOR.H) / DOOR.W);
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d');
  ctx.fillStyle = 'rgb(128,128,128)';
  ctx.fillRect(0, 0, w, h);
  const rowH = h / DOOR.PANELS;
  for (let row = 0; row < DOOR.PANELS; row++) {
    const y0 = row * rowH;
    ctx.save();
    ctx.shadowColor = 'rgb(96,96,96)';
    ctx.shadowBlur = 5;
    ctx.fillStyle = 'rgb(108,108,108)';
    ctx.fillRect(0, y0 + rowH * 0.30, w, 6);
    ctx.fillRect(0, y0 + rowH * 0.62, w, 6);
    ctx.restore();
    for (let s = 1; s < 8; s++) {
      ctx.save();
      ctx.shadowColor = 'rgb(150,150,150)';
      ctx.shadowBlur = 4;
      ctx.fillStyle = 'rgb(142,142,142)';
      ctx.fillRect((w / 8) * s - 3, y0 + rowH * 0.08, 6, rowH * 0.84);
      ctx.restore();
    }
  }
  return heightToNormalTexture(c, 1.1);
}

// Horizontal-streak roughness for brushed stainless (DeLorean body panels).
export function buildBrushedRoughness() {
  const w = 512, h = 512;
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d');
  let seed = 7411;
  const rnd = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  for (let y = 0; y < h; y++) {
    const v = 205 + Math.floor(rnd() * 50);
    ctx.fillStyle = `rgb(${v},${v},${v})`;
    ctx.fillRect(0, y, w, 1);
  }
  // fine broken streaks
  for (let i = 0; i < 900; i++) {
    const y = rnd() * h, x = rnd() * w, len = 20 + rnd() * 120;
    const v = 190 + Math.floor(rnd() * 65);
    ctx.fillStyle = `rgba(${v},${v},${v},0.5)`;
    ctx.fillRect(x, y, len, 1);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 3);
  return tex;
}

// Blotchy roughness map so the epoxy floor reflection isn't CG-perfect.
export function buildFloorRoughness() {
  const s = 512;
  const c = document.createElement('canvas');
  c.width = s; c.height = s;
  const ctx = c.getContext('2d');
  ctx.fillStyle = 'rgb(150,150,150)';
  ctx.fillRect(0, 0, s, s);
  let seed = 1337;
  const rnd = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  for (let i = 0; i < 260; i++) {
    const x = rnd() * s, y = rnd() * s, r = 8 + rnd() * 58;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    const v = 120 + Math.floor(rnd() * 80);
    g.addColorStop(0, `rgba(${v},${v},${v},${0.10 + rnd() * 0.16})`);
    g.addColorStop(1, 'rgba(150,150,150,0)');
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 2);
  return tex;
}
