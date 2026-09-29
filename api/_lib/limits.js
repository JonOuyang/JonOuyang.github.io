/**
 * api/_lib/limits.js — anti-abuse helpers for the booking backend: identity
 * hashing (so a booking can be tagged and matched without ever storing a raw
 * email or IP) and a best-effort in-memory burst rate limiter.
 *
 * No database, by design. Burst-limit state lives in a module-scope Map,
 * which only survives for the lifetime of one warm serverless instance — a
 * cold start, a deploy, or traffic landing on a different instance resets it.
 * That's fine for "slow down a script hammering one endpoint"; it is NOT a
 * hard guarantee. The real anti-abuse caps (1 upcoming booking per email, 2
 * per IP) are enforced against Google Calendar itself in book.js, which is
 * durable regardless of which instance handles the request.
 */
import { createHash } from 'node:crypto';

// Set BOOKING_SALT in the environment for a real secret. This fallback just
// means the hashes are reproducible (not attacker-chosen) without it — fine
// for a tagging/filtering use case, not a security boundary — but setting
// BOOKING_SALT is still better.
const FALLBACK_SALT = 'jo-schedule-fallback-salt-set-BOOKING_SALT-in-env-instead';

function salt() {
  return process.env.BOOKING_SALT || FALLBACK_SALT;
}

function hash(kind, value) {
  return createHash('sha256').update(`${salt()}:${kind}:${value}`).digest('hex').slice(0, 32);
}

/** 32-hex-char tag for an email address (trimmed, lowercased first). Stable across requests, not reversible without the salt. */
export function emailHash(email) {
  return hash('email', String(email || '').trim().toLowerCase());
}

/** 32-hex-char tag for a client IP. The raw IP itself is never stored anywhere — only this hash. */
export function ipHash(ip) {
  return hash('ip', String(ip || ''));
}

/**
 * Client IP. Prefer headers Vercel's edge sets itself (x-real-ip, x-vercel-forwarded-for).
 * Never trust the FIRST x-forwarded-for entry: a client can send its own XFF and the
 * edge appends the real IP after it, so only the LAST entry is edge-supplied.
 */
export function getClientIp(req) {
  for (const h of ['x-real-ip', 'x-vercel-forwarded-for']) {
    const v = req.headers?.[h];
    if (typeof v === 'string' && v.trim()) return v.split(',').pop().trim();
  }
  const xff = req.headers?.['x-forwarded-for'];
  if (typeof xff === 'string' && xff.trim()) return xff.split(',').pop().trim();
  const remote = req.socket?.remoteAddress;
  if (typeof remote === 'string' && remote.trim()) return remote.trim();
  return 'unknown';
}

// ---- burst rate limiting (best-effort, in-memory, per warm instance) ----

const MAX_KEYS = 5000;
const buckets = new Map(); // `${route}:${ip}` -> ascending hit timestamps (ms)

const ROUTE_WINDOWS = {
  book: [
    { max: 5, windowMs: 60_000 },
    { max: 20, windowMs: 3_600_000 },
  ],
  'check-email': [{ max: 30, windowMs: 60_000 }],
  freebusy: [{ max: 60, windowMs: 60_000 }],
};

/** Drops the ~10% oldest-looking buckets so the Map can't grow unbounded. */
function pruneMapIfFull() {
  if (buckets.size < MAX_KEYS) return;
  const entries = [...buckets.entries()].sort((a, b) => (a[1][0] || 0) - (b[1][0] || 0));
  for (const [key] of entries.slice(0, Math.ceil(MAX_KEYS * 0.1))) buckets.delete(key);
}

/**
 * Checks + records one hit for `route`/`ip` against ROUTE_WINDOWS[route].
 * `now` is injectable (defaults to Date.now()) so tests can fake the clock.
 * Returns { allowed: true } or { allowed: false, retryAfterSec }.
 */
export function checkBurstLimit(route, ip, now = Date.now()) {
  const windows = ROUTE_WINDOWS[route];
  if (!windows) return { allowed: true };

  const key = `${route}:${ip}`;
  let hits = buckets.get(key);
  if (!hits) {
    pruneMapIfFull();
    hits = [];
    buckets.set(key, hits);
  }

  const maxWindowMs = Math.max(...windows.map((w) => w.windowMs));
  while (hits.length && now - hits[0] > maxWindowMs) hits.shift();

  for (const w of windows) {
    const inWindow = hits.filter((t) => now - t <= w.windowMs);
    if (inWindow.length >= w.max) {
      const retryAfterSec = Math.max(1, Math.ceil((w.windowMs - (now - inWindow[0])) / 1000));
      return { allowed: false, retryAfterSec };
    }
  }

  hits.push(now);
  return { allowed: true };
}

/**
 * Applies the burst limit for `route`. If exceeded, writes the 429 response
 * (with a Retry-After header, seconds) and returns true so the caller can
 * `return` immediately. Returns false (nothing written) when under the limit.
 * `now` is only for tests — production callers omit it.
 */
export function enforceBurstLimit(req, res, route, now) {
  const ip = getClientIp(req);
  const result = checkBurstLimit(route, ip, now);
  if (!result.allowed) {
    res.setHeader('Retry-After', String(result.retryAfterSec));
    res.status(429).json({ error: 'rate_limited' });
    return true;
  }
  return false;
}

/** Test-only: clears all burst-limit state. Never called from production code. */
// Per-slot lock: two requests for the same slot on the same instance can't both pass the
// free/busy check before either event exists. Best-effort (per instance), like the limiter.
const slotLocks = new Set();
export function lockSlot(key) {
  if (slotLocks.has(key)) return null;
  slotLocks.add(key);
  return () => slotLocks.delete(key);
}

export function _resetBurstLimitsForTests() {
  buckets.clear();
}
