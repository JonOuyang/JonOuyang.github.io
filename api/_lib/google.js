/**
 * api/_lib/google.js — Google Calendar access for the booking backend.
 *
 * Auth: a single OAuth refresh token for the hub account, jonsouyang@ucla.edu, scoped
 * to calendar.freebusy + calendar.events. The other two calendars (gmail, google.com)
 * share "free/busy only" with the UCLA account, so a FreeBusy query as UCLA can see
 * all three. Bookings are created on the UCLA calendar (Jonathan = organizer).
 *
 * Privacy: reads against Jonathan's calendars are limited to two shapes —
 * (1) FreeBusy (interval start/end only, never titles/attendees/descriptions)
 * and (2) events.list filtered with privateExtendedProperty to ONLY events
 * this site itself created and tagged (extendedProperties.private.src ===
 * 'jo-schedule'), and requested with fields=items(id,status) — so Google
 * itself never sends back a title/description/attendee for any event, tagged
 * or not. This file must never call events.list/events.get without both the
 * tag filter and that `fields` restriction, and must never widen `fields`.
 * events.insert is used only to WRITE a new booking (book.js).
 *
 * All times exposed to callers are decimal Pacific-Time hours (13.5 = 1:30 PM).
 */

const PT_TZ = 'America/Los_Angeles';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const FREEBUSY_URL = 'https://www.googleapis.com/calendar/v3/freeBusy';

// ---- module-scope token cache -------------------------------------------

let cachedToken = null; // { accessToken, expiresAt (ms epoch) }

export function isConfigured() {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_SECRET &&
      process.env.GOOGLE_REFRESH_TOKEN &&
      (process.env.CALENDAR_IDS || '').split(',').map((s) => s.trim()).filter(Boolean).length,
  );
}

export async function getAccessToken() {
  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt - 60_000 > now) {
    return cachedToken.accessToken;
  }

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
      grant_type: 'refresh_token',
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`google_token_refresh_failed:${res.status}:${text}`);
  }

  const data = await res.json();
  cachedToken = {
    accessToken: data.access_token,
    expiresAt: now + (data.expires_in ? data.expires_in * 1000 : 3600_000),
  };
  return cachedToken.accessToken;
}

// ---- PT <-> UTC helpers (DST-correct) -----------------------------------

/** Offset in minutes such that localTime = utcMs + offset, for `timeZone` at `utcMs`. */
function tzOffsetMinutes(utcMs, timeZone) {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const parts = Object.fromEntries(dtf.formatToParts(new Date(utcMs)).map((p) => [p.type, p.value]));
  const asUTC = Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute, +parts.second);
  return (asUTC - utcMs) / 60_000;
}

/** UTC ms instant for local wall-clock y-m-d hh:mm:ss in `timeZone`. Resolves DST by re-checking the offset at the guessed instant. */
function zonedTimeToUtcMs(y, m, d, hh, mm, ss, timeZone) {
  const guessMs = Date.UTC(y, m - 1, d, hh, mm, ss);
  const offset1 = tzOffsetMinutes(guessMs, timeZone);
  let utcMs = guessMs - offset1 * 60_000;
  const offset2 = tzOffsetMinutes(utcMs, timeZone);
  if (offset2 !== offset1) {
    utcMs = guessMs - offset2 * 60_000;
  }
  return utcMs;
}

function addDaysYmd(ymd, n) {
  const [y, m, d] = ymd.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + n);
  return dt.toISOString().slice(0, 10);
}

function ptDayBoundsUTCms(ymd) {
  const [y, m, d] = ymd.split('-').map(Number);
  const startMs = zonedTimeToUtcMs(y, m, d, 0, 0, 0, PT_TZ);
  const [ny, nm, nd] = addDaysYmd(ymd, 1).split('-').map(Number);
  const endMs = zonedTimeToUtcMs(ny, nm, nd, 0, 0, 0, PT_TZ);
  return [startMs, endMs];
}

/** [startISO, endISO] of a PT calendar day, DST-correct (23h/25h on transition days). */
export function ptDayBoundsUTC(ymd) {
  const [startMs, endMs] = ptDayBoundsUTCms(ymd);
  return [new Date(startMs).toISOString(), new Date(endMs).toISOString()];
}

/** UTC ms instant for a decimal PT hour (e.g. 13.5) on a given PT calendar date. */
export function ptHourToUtcMs(ymd, decimalHour) {
  const [y, m, d] = ymd.split('-').map(Number);
  const hh = Math.floor(decimalHour);
  const mm = Math.round((decimalHour - hh) * 60);
  return zonedTimeToUtcMs(y, m, d, hh, mm, 0, PT_TZ);
}

/** Decimal PT hour for a UTC ms instant, clipped to [0,24] against the day's own bounds (so an instant exactly at the next day's start reads as 24, not 0). */
function clipToDecimalHour(ms, dayStartMs, dayEndMs) {
  if (ms <= dayStartMs) return 0;
  if (ms >= dayEndMs) return 24;
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', {
      timeZone: PT_TZ,
      hourCycle: 'h23',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
      .formatToParts(new Date(ms))
      .map((p) => [p.type, p.value]),
  );
  return +parts.hour + +parts.minute / 60 + +parts.second / 3600;
}

function mergeIntervals(intervals) {
  const sorted = [...intervals].sort((a, b) => a[0] - b[0]);
  const merged = [];
  for (const [s, e] of sorted) {
    const last = merged[merged.length - 1];
    if (last && s <= last[1]) {
      last[1] = Math.max(last[1], e);
    } else {
      merged.push([s, e]);
    }
  }
  return merged;
}

/**
 * One FreeBusy POST covering `days` PT calendar days starting `startYmd`, across
 * all CALENDAR_IDS. Throws (with calendar ids/reasons in the message, server-log
 * only) if any calendar comes back with `errors` or is missing from the response
 * — silently dropping a calendar would show Jonathan as free when he isn't.
 *
 * Returns { 'YYYY-MM-DD': [{start,end}] } in decimal PT hours, one entry per day
 * (including empty arrays for free days), merged and sorted.
 */
export async function queryBusy(startYmd, days) {
  const calendarIds = (process.env.CALENDAR_IDS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const accessToken = await getAccessToken();
  const [timeMin] = ptDayBoundsUTC(startYmd);
  const lastYmd = addDaysYmd(startYmd, days - 1);
  const [, timeMax] = ptDayBoundsUTC(lastYmd);

  const res = await fetch(FREEBUSY_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      timeMin,
      timeMax,
      timeZone: PT_TZ,
      items: calendarIds.map((id) => ({ id })),
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`freebusy_request_failed:${res.status}:${text}`);
  }

  const data = await res.json();
  const calendars = data.calendars || {};

  const failed = [];
  const allBusy = [];
  for (const id of calendarIds) {
    const cal = calendars[id];
    if (!cal) {
      failed.push(`${id}: missing from freeBusy response`);
      continue;
    }
    if (cal.errors && cal.errors.length) {
      failed.push(`${id}: ${cal.errors.map((e) => e.reason).join(',')}`);
      continue;
    }
    for (const b of cal.busy || []) {
      allBusy.push([Date.parse(b.start), Date.parse(b.end)]);
    }
  }

  if (failed.length) {
    throw new Error(`freebusy_calendar_errors: ${failed.join('; ')}`);
  }

  const merged = mergeIntervals(allBusy);

  const result = {};
  for (let i = 0; i < days; i += 1) {
    const ymd = addDaysYmd(startYmd, i);
    const [dayStartMs, dayEndMs] = ptDayBoundsUTCms(ymd);

    const dayIntervals = [];
    for (const [s, e] of merged) {
      const overlapStart = Math.max(s, dayStartMs);
      const overlapEnd = Math.min(e, dayEndMs);
      if (overlapStart < overlapEnd) {
        dayIntervals.push([
          clipToDecimalHour(overlapStart, dayStartMs, dayEndMs),
          clipToDecimalHour(overlapEnd, dayStartMs, dayEndMs),
        ]);
      }
    }

    result[ymd] = mergeIntervals(dayIntervals).map(([start, end]) => ({ start, end }));
  }

  return result;
}

// ---- anti-abuse cap check (tagged events.list only) ----------------------

/**
 * Counts non-cancelled upcoming events on `calendarId` tagged with
 * extendedProperties.private[field] === value — used only for this site's
 * own anti-abuse caps (1 upcoming booking per email, 2 per IP; see
 * api/_lib/limits.js and api/book.js).
 *
 * Privacy: privateExtendedProperty restricts the query to events THIS SITE
 * tagged at creation time, and fields=items(id,status) means Google itself
 * never returns a title/description/attendee — not even for our own tagged
 * events, let alone any of Jonathan's other events. Never widen `fields` or
 * drop the tag filter here.
 */
export async function countUpcomingByTag(calendarId, field, value) {
  const accessToken = await getAccessToken();
  const params = new URLSearchParams({
    privateExtendedProperty: `${field}=${value}`,
    timeMin: new Date().toISOString(),
    singleEvents: 'true',
    showDeleted: 'false',
    maxResults: '5',
    fields: 'items(id,status)',
  });

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?${params.toString()}`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`events_list_failed:${res.status}:${text}`);
  }

  const data = await res.json();
  const items = data.items || [];
  return items.filter((it) => it.status !== 'cancelled').length;
}
