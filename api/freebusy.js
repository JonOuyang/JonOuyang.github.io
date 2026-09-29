/**
 * GET /api/freebusy?start=YYYY-MM-DD&days=N
 *
 * Returns merged busy intervals (decimal PT hours) for `days` PT calendar days
 * starting at `start`, combining Jonathan's 3 Google calendars via one FreeBusy
 * request. Never returns event titles/details — FreeBusy only gives intervals
 * anyway.
 */
import { isConfigured, queryBusy } from './_lib/google.js';
import { enforceBurstLimit } from './_lib/limits.js';

function isValidYmd(s) {
  if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const [y, m, d] = s.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

export default async function handler(req, res) {
  if (enforceBurstLimit(req, res, 'freebusy')) return;

  const query = req.query || {};
  const start = query.start;
  const days = Number(query.days);

  if (!isValidYmd(start) || !Number.isInteger(days) || days < 1 || days > 62) {
    res.status(400).json({ error: 'bad_request' });
    return;
  }

  if (!isConfigured()) {
    res.status(503).json({ error: 'not_configured' });
    return;
  }

  try {
    const daysMap = await queryBusy(start, days);
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');
    res.status(200).json({ tz: 'America/Los_Angeles', days: daysMap });
  } catch (err) {
    // Details (calendar ids, Google error text) stay server-side only.
    console.error('[api/freebusy] calendar_unavailable:', err);
    res.status(502).json({ error: 'calendar_unavailable' });
  }
}
