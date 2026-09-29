/**
 * availability.js — Jonathan's free/busy for a given day.
 *
 * LIVE: busy blocks come from /api/freebusy, which merges his three Google calendars
 * (ucla.edu = hub, gmail, google.com) server-side and only ever returns busy intervals.
 * Results are cached per PT day; `loadRange` fills the cache and notifies subscribers
 * (use `useAvailability()` in components so they re-render when data lands).
 *
 * A day that hasn't loaded yet is "unknown": nothing on it is bookable until it loads.
 * In `npm run dev` without Google credentials the API answers 503 not_configured and we
 * fall back to deterministic FAKE data so the UI still works (never in production).
 *
 * All times are decimal hours in Pacific Time (13.5 = 1:30 PM).
 */
import { useSyncExternalStore } from 'react';
import { formatHour } from './timeVideoMapping.js';

export const DAY_START = 8; // 8 AM
export const DAY_END = 24; // midnight
export const SLOT = 0.5; // 30-min meetings

export const ymd = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

// ── store ──
const cache = new Map(); // 'YYYY-MM-DD' -> [{start,end}]
const inflight = new Map(); // range key -> Promise
let fake = false;
let error = null; // null | 'unavailable'
let version = 0;
const listeners = new Set();
const emit = () => {
  version++;
  listeners.forEach((fn) => fn());
};

/** Re-render on availability changes. Returns { version, error, fake }. */
export function useAvailability() {
  const v = useSyncExternalStore(
    (fn) => (listeners.add(fn), () => listeners.delete(fn)),
    () => version,
  );
  return { version: v, error, fake };
}

/** Fetch `days` PT days starting at `start` (Date) into the cache. Safe to call repeatedly. */
export function loadRange(start, days = 42, { force = false } = {}) {
  if (fake) return Promise.resolve();
  const first = ymd(start);
  const key = `${first}+${days}`;
  if (!force) {
    if (inflight.has(key)) return inflight.get(key);
    const all = Array.from({ length: days }, (_, i) => ymd(new Date(start.getFullYear(), start.getMonth(), start.getDate() + i)));
    if (all.every((d) => cache.has(d))) return Promise.resolve();
  }
  const p = fetch(`/api/freebusy?start=${first}&days=${days}`)
    .then(async (r) => {
      const body = await r.json().catch(() => ({}));
      if (r.status === 503 && body.error === 'not_configured' && import.meta.env.DEV) {
        console.warn('[schedule] Google Calendar not configured — using FAKE availability (dev only)');
        fake = true;
        return;
      }
      if (!r.ok) throw new Error(body.error || `HTTP ${r.status}`);
      Object.entries(body.days).forEach(([d, busy]) => cache.set(d, busy));
      error = null;
    })
    .catch((e) => {
      console.error('[schedule] availability failed', e);
      error = 'unavailable';
    })
    .finally(() => {
      inflight.delete(key);
      emit();
    });
  inflight.set(key, p);
  return p;
}

/** Drop cached days (e.g. after a booking) and refetch them. */
export function refreshDay(date) {
  cache.delete(ymd(date));
  return loadRange(date, 1, { force: true });
}

// ── fake data (dev fallback only) ──
function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}
const TEMPLATES = [
  [[9, 10], [11.5, 13], [15, 16.5], [19, 20]],
  [[8, 9.5], [12, 13], [14, 15], [17.5, 19]],
  [[10, 12], [13.5, 14], [16, 18]],
  [[9.5, 10.5], [11, 11.5], [13, 15], [18, 21]],
  [[8.5, 9], [10, 11.5], [14.5, 16], [16.5, 17.5], [20, 21.5]],
];
function fakeBusy(date) {
  const r = rng(date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate());
  const weekend = date.getDay() === 0 || date.getDay() === 6;
  const base = TEMPLATES[Math.floor(r() * TEMPLATES.length)];
  return (weekend ? base.filter(() => r() < 0.5) : base).map(([start, end]) => ({ start, end }));
}

/** Busy intervals for a date: [{ start, end }] sorted, non-overlapping — or null if not loaded yet. */
export function getBusy(date) {
  if (fake) return fakeBusy(date);
  return cache.get(ymd(date)) ?? null;
}

/** Current PT time as a decimal hour, and PT's calendar date (y, m, d). */
function ptNow(now = new Date()) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Los_Angeles',
      year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', hourCycle: 'h23',
    }).formatToParts(now).map((p) => [p.type, +p.value || p.value]),
  );
  return { y: parts.year, m: parts.month - 1, d: parts.day, decimal: parts.hour + parts.minute / 60 };
}

/** Earliest bookable decimal hour on `date` (DAY_START, or later if it's today in PT; Infinity if the day is over/past). */
export function earliestStart(date, now = new Date()) {
  const pt = ptNow(now);
  const day = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const today = new Date(pt.y, pt.m, pt.d);
  if (day < today) return Infinity;
  if (day > today) return DAY_START;
  // at least 30 min of notice (api/book.js enforces the same rule)
  return Math.max(DAY_START, Math.ceil((pt.decimal + SLOT) / SLOT) * SLOT);
}

/** Can a 30-min meeting start at `start` on `date`? (start can be any 5-min value) */
export function isFree(date, start, now = new Date()) {
  const end = start + SLOT;
  if (start < earliestStart(date, now) || end > DAY_END) return false;
  const busy = getBusy(date);
  return busy != null && !busy.some((b) => start < b.end && end > b.start);
}

/**
 * 30-min slots from DAY_START to DAY_END:
 * [{ start, end, free, reason: null | 'busy' | 'past' | 'loading', label: '3:00 PM' }]
 */
export function getDaySlots(date, now = new Date()) {
  const busy = getBusy(date);
  const unknown = busy == null;
  const earliest = earliestStart(date, now);
  const slots = [];
  for (let t = DAY_START; t < DAY_END; t += SLOT) {
    const isBusy = !unknown && busy.some((b) => t < b.end && t + SLOT > b.start);
    const past = t < earliest;
    slots.push({
      start: t,
      end: t + SLOT,
      free: !unknown && !isBusy && !past,
      reason: past ? 'past' : unknown ? 'loading' : isBusy ? 'busy' : null,
      label: formatHour(t),
    });
  }
  return slots;
}

/** Number of free 30-min slots on a day, or null while the day is still loading. */
export const freeCount = (date, now) =>
  getBusy(date) == null ? null : getDaySlots(date, now).filter((s) => s.free).length;
