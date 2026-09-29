/**
 * tz.js — show Jonathan's Pacific-Time slots in the visitor's own time zone.
 *
 * Everything internal stays "PT day + decimal PT hour" (that's what the calendar API,
 * the sky and the timeline geometry use). Only the *labels* go through here.
 * Days stay Jonathan's days; a label that lands on the visitor's next/previous
 * calendar day gets a "+1" / "−1" suffix.
 */
import { createContext, useContext } from 'react';

export const PT = 'America/Los_Angeles';

// ?tz=Europe/London overrides the detected zone (handy for testing)
const validZone = (tz) => {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: tz });
    return true;
  } catch {
    return false;
  }
};
const override = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('tz');
export const VISITOR_TZ = (override && validZone(override) && override) || Intl.DateTimeFormat().resolvedOptions().timeZone || PT;

/** minutes that `tz` is ahead of UTC at instant `ms` */
function offsetMin(tz, ms) {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', {
      timeZone: tz, hourCycle: 'h23',
      year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric',
    }).formatToParts(new Date(ms)).map((x) => [x.type, +x.value]),
  );
  return (Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) - ms) / 60000;
}

/** PT calendar day (a Date whose y/m/d are the PT date) + decimal PT hour → real instant (ms) */
export function ptInstant(day, hour) {
  const naive = Date.UTC(day.getFullYear(), day.getMonth(), day.getDate()) + Math.round(hour * 60) * 60000;
  // two passes so hours right next to a DST switch land correctly
  let ms = naive - offsetMin(PT, naive) * 60000;
  ms = naive - offsetMin(PT, ms) * 60000;
  return ms;
}

const ymdIn = (tz, ms) => new Intl.DateTimeFormat('en-CA', { timeZone: tz }).format(new Date(ms)); // YYYY-MM-DD

/** "3:00 PM", "3 PM" (compact), or with "+1" if it's the next day for the viewer */
function timeLabel(tz, ms, { compact = false, dayOf } = {}) {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: 'numeric', minute: '2-digit' }).formatToParts(new Date(ms));
  const get = (t) => parts.find((p) => p.type === t)?.value;
  const min = get('minute');
  let s = compact && min === '00' ? `${get('hour')} ${get('dayPeriod')}` : `${get('hour')}:${min} ${get('dayPeriod')}`;
  if (dayOf) {
    const diff = Math.round((Date.parse(ymdIn(tz, ms)) - Date.parse(ymdIn(PT, dayOf))) / 86400000);
    if (diff) s += diff > 0 ? ` +${diff}` : ` −${-diff}`;
  }
  return s;
}

/** "EDT", "BST", "IST"… falling back to "London time" when no nice abbreviation exists */
export function zoneAbbr(tz, ms = Date.now()) {
  const name = (locale) =>
    new Intl.DateTimeFormat(locale, { timeZone: tz, timeZoneName: 'short' })
      .formatToParts(new Date(ms))
      .find((p) => p.type === 'timeZoneName')?.value;
  for (const locale of ['en-US', 'en-GB', 'en-IN', 'en-AU']) {
    const n = name(locale);
    if (n && !/^(GMT|UTC)[+−-]/.test(n)) return n;
  }
  return `${tz.split('/').pop().replace(/_/g, ' ')} time`;
}

/** Does the visitor's clock read the same as PT (e.g. they're in LA, Vancouver, Seattle)? */
export const sameAsPT = (tz, ms = Date.now()) => offsetMin(tz, ms) === offsetMin(PT, ms);

const tailOf = (s) => s.slice(s.indexOf(' ')); // " PM" or " AM +1"

/**
 * Formatter bound to a display zone. All inputs are (PT day, decimal PT hour).
 *  time(day, h)         "12:00 PM" (+1 if next day for the viewer)
 *  hour(day, h)         compact gutter label "12 PM" / "12:30 PM"
 *  range(day, h, len)   "12:00 – 12:30 PM"
 *  date(day, h)         the viewer's calendar date for that slot, e.g. "Tue, Sep 29"
 *  zone                 "EDT"
 */
export function makeFormatter(tz) {
  // noDay: drop the "+1" (use where the viewer's own date is shown right next to it)
  const time = (day, h, { noDay = false } = {}) =>
    timeLabel(tz, ptInstant(day, h), { dayOf: noDay ? null : ptInstant(day, 12) });
  return {
    tz,
    isPT: sameAsPT(tz),
    zone: zoneAbbr(tz),
    time,
    hour: (day, h) => timeLabel(tz, ptInstant(day, h), { compact: true }),
    range(day, h, len = 0.5, opts) {
      const a = time(day, h, opts);
      let b = time(day, h + len, opts);
      // a slot ending exactly at midnight belongs to the day it started on
      if (b.startsWith('12:00 AM') && tailOf(b) !== tailOf(a)) b = `12:00 AM${tailOf(a).replace(/^ [AP]M/, '')}`;
      // "12:00 – 12:30 PM" when both ends share AM/PM and day; otherwise spell both out
      return tailOf(a) === tailOf(b) ? `${a.slice(0, a.indexOf(' '))} – ${b}` : `${a} – ${b}`;
    },
    /** big-clock digits: "2:30" (no AM/PM, no day marker) */
    clock: (day, h) => time(day, h, { noDay: true }).replace(/ [AP]M$/, ''),
    /** "Wednesday, September 30" — the viewer's date at that moment */
    longDate: (day, h) =>
      new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'long', month: 'long', day: 'numeric' }).format(new Date(ptInstant(day, h))),
    date: (day, h) =>
      new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'short', month: 'short', day: 'numeric' }).format(new Date(ptInstant(day, h))),
  };
}

export const TimeFormatContext = createContext(makeFormatter(PT));
export const useTimeFormat = () => useContext(TimeFormatContext);
