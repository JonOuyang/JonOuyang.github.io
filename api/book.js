/**
 * POST /api/book — body: { date, start, name, email, note?, website? }
 *
 * Re-validates availability server-side (never trust the client's idea of what's
 * free) and creates a Google Calendar event with a Meet link. `website` is a
 * honeypot field: if filled in, we pretend success and do nothing.
 *
 * Privacy: reads are FreeBusy (queryBusy — interval start/end only) plus
 * events.list restricted to the site's own tagged bookings (countUpcomingByTag,
 * privateExtendedProperty + fields=items(id,status) only) for the anti-abuse
 * caps below. Never events.list/get without that tag filter, and the response
 * never echoes anything from those calendars back to the client.
 *
 * Anti-abuse: every booking this site creates is tagged
 * extendedProperties.private = { src: 'jo-schedule', eh, ih } — salted hashes
 * of the email/IP, never the raw values — so we can enforce "1 upcoming
 * booking per email" and "2 upcoming bookings per IP" against Google Calendar
 * itself (durable, no database). A best-effort in-memory burst limiter
 * (api/_lib/limits.js) additionally throttles rapid-fire requests per IP.
 */
import { checkEmail } from './_lib/email.js';
import { randomUUID } from 'node:crypto';
import { isConfigured, queryBusy, getAccessToken, ptHourToUtcMs, countUpcomingByTag } from './_lib/google.js';
import { lockSlot, emailHash, ipHash, getClientIp, enforceBurstLimit } from './_lib/limits.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SLOT = 0.5;
const MIN_LEAD_MS = 30 * 60 * 1000;

function isValidYmd(s) {
  if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const [y, m, d] = s.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

function isHalfHourSlotStart(n) {
  return Number.isFinite(n) && Math.abs(n / SLOT - Math.round(n / SLOT)) < 1e-9 && n >= 8 && n <= 23.5;
}

function parseBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string' && req.body.length) {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return {};
}

function pad2(n) {
  return String(n).padStart(2, '0');
}

function dateTimeString(ymd, decimalHour) {
  const hh = Math.floor(decimalHour);
  const mm = Math.round((decimalHour - hh) * 60);
  return `${ymd}T${pad2(hh)}:${pad2(mm)}:00`;
}

/** Number(envVar) if it's a finite non-negative number, else `fallback`. */
function envCountOr(envVar, fallback) {
  const n = Number(envVar);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method_not_allowed' });
    return;
  }

  // Burst limit first, before any other work (honeypot check included).
  if (enforceBurstLimit(req, res, 'book')) return;

  const body = parseBody(req);
  const { date, start, name, email, note, website } = body || {};

  // Honeypot: pretend success, do nothing.
  if (typeof website === 'string' && website.trim().length > 0) {
    res.status(200).json({ ok: true });
    return;
  }

  const startNum = Number(start);
  const dateOk = isValidYmd(date);
  const startOk = isHalfHourSlotStart(startNum);
  const trimmedName = typeof name === 'string' ? name.trim() : '';
  const nameOk = trimmedName.length >= 1 && name.length <= 100;
  const emailOk = typeof email === 'string' && email.length <= 200 && EMAIL_RE.test(email);
  const noteOk = note === undefined || note === null || (typeof note === 'string' && note.length <= 2000);
  // Pure input checks (no config needed) so a bad request is always 400, never
  // masked by a 503 when env vars happen to be missing too.
  const leadOk = dateOk && startOk && ptHourToUtcMs(date, startNum) - Date.now() >= MIN_LEAD_MS;

  if (!dateOk || !startOk || !nameOk || !emailOk || !noteOk || !leadOk) {
    res.status(400).json({ error: 'invalid' });
    return;
  }

  // domain can actually receive mail (typo/throwaway guard; same check the form runs live)
  const emailCheck = await checkEmail(email);
  if (!emailCheck.ok) {
    res.status(400).json({ error: 'bad_email', reason: emailCheck.reason, suggestion: emailCheck.suggestion });
    return;
  }

  if (!isConfigured()) {
    res.status(503).json({ error: 'not_configured' });
    return;
  }

  const calendarId = process.env.BOOKING_CALENDAR_ID || 'primary';
  const clientIp = getClientIp(req);
  const eHash = emailHash(email);
  const iHash = ipHash(clientIp); // computed even for 'unknown' so every event still gets tagged
  const maxPerEmail = envCountOr(process.env.MAX_UPCOMING_PER_EMAIL, 1);
  const maxPerIp = envCountOr(process.env.MAX_UPCOMING_PER_IP, 2);

  try {
    const emailCount = await countUpcomingByTag(calendarId, 'eh', eHash);
    if (emailCount >= maxPerEmail) {
      res.status(409).json({ error: 'already_booked' });
      return;
    }

    if (clientIp !== 'unknown') {
      const ipCount = await countUpcomingByTag(calendarId, 'ih', iHash);
      if (ipCount >= maxPerIp) {
        res.status(429).json({ error: 'too_many_bookings' });
        return;
      }
    }
  } catch (err) {
    // Fail closed: if we can't check the caps, don't allow unlimited bookings.
    console.error('[api/book] cap_check_failed:', err);
    res.status(502).json({ error: 'calendar_unavailable' });
    return;
  }

  const release = lockSlot(`${date}@${startNum}`);
  if (!release) {
    res.status(409).json({ error: 'slot_taken' });
    return;
  }

  try {
    const busyMap = await queryBusy(date, 1);
    const busy = busyMap[date] || [];
    const slotEnd = startNum + SLOT;
    const overlaps = busy.some((b) => startNum < b.end && slotEnd > b.start);
    if (overlaps) {
      res.status(409).json({ error: 'slot_taken' });
      return;
    }

    const accessToken = await getAccessToken();
    // The event lives on the hub account's calendar (jonsouyang@ucla.edu), so Jonathan is the
    // organizer. JONATHAN_INVITE_EMAIL optionally CCs another of his addresses.
    const extraInvite = (process.env.JONATHAN_INVITE_EMAIL || '').trim();

    const description = `${note ? `${note}\n\n` : ''}Booked via jonathanouyang.com/schedule`;

    const eventRes = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?conferenceDataVersion=1&sendUpdates=all`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          summary: `Jonathan / ${trimmedName}`,
          description,
          start: { dateTime: dateTimeString(date, startNum), timeZone: 'America/Los_Angeles' },
          end: { dateTime: dateTimeString(date, slotEnd), timeZone: 'America/Los_Angeles' },
          attendees: [
            { email, displayName: trimmedName },
            ...(extraInvite ? [{ email: extraInvite, responseStatus: 'accepted' }] : []),
          ],
          conferenceData: {
            createRequest: {
              requestId: randomUUID(),
              conferenceSolutionKey: { type: 'hangoutsMeet' },
            },
          },
          reminders: { useDefault: true },
          extendedProperties: {
            private: { src: 'jo-schedule', eh: eHash, ih: iHash },
          },
        }),
      },
    );

    if (!eventRes.ok) {
      const text = await eventRes.text().catch(() => '');
      throw new Error(`event_create_failed:${eventRes.status}:${text}`);
    }

    const event = await eventRes.json();
    const meetLink =
      event.hangoutLink ||
      (event.conferenceData?.entryPoints || []).find((e) => e.entryPointType === 'video')?.uri ||
      null;

    res.status(200).json({ ok: true, meetLink });
  } catch (err) {
    // Details (Google error text, calendar ids) stay server-side only.
    console.error('[api/book] calendar_unavailable:', err);
    res.status(502).json({ error: 'calendar_unavailable' });
  } finally {
    release();
  }
}
