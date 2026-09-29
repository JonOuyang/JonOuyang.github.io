/**
 * timeVideoMapping.js
 * 
 * Maps 24-hour decimal time to video timestamps (0.0s - 10.0s) for the 4K SF Golden Gate timelapse.
 */

/** Current time in San Francisco (PT), e.g. { decimal: 15.7, formatted: "3:42 PM" } */
export function getPTTime() {
  const now = new Date();
  const formatted = now.toLocaleTimeString('en-US', {
    timeZone: 'America/Los_Angeles',
    hour: 'numeric',
    minute: '2-digit',
  });
  const [h, m] = now
    .toLocaleTimeString('en-GB', { timeZone: 'America/Los_Angeles', hour: '2-digit', minute: '2-digit' })
    .split(':')
    .map(Number);
  return { decimal: h + m / 60, formatted };
}

/**
 * Hour of day (PT, 0–24) → timelapse second. Keyframes were picked from a contact sheet of
 * the clip (1.9 s pre-dawn, 2.3 s low morning sun, 4.6 s high noon, 8.0 s sun on the
 * horizon, 9.3 s twilight, 9.65 s+ night). Between keyframes it's linear; the sky's own
 * easing smooths the rest. Keep within the extracted frame range (skyFrames FIRST_SEC…).
 */
const KEYS = [
  [0, 9.9], // midnight: night
  [5, 9.95], // deep night until just before dawn
  [5.01, 1.9], // (wraps to the clip's pre-dawn; only ever seen as the idle "now" sky)
  [7, 2.15], // dawn
  [8, 2.3], // low morning sun
  [10, 3.4],
  [12, 4.6], // high noon
  [15, 6.2],
  [17, 7.2], // golden hour
  [18.5, 8.0], // sun on the horizon
  [19.25, 8.7], // dusk
  [20, 9.3], // twilight
  [21, 9.65], // night
  [24, 9.9], // midnight
];

export function hourToVideoTime(hour) {
  const h = ((hour % 24) + 24) % 24;
  for (let i = 1; i < KEYS.length; i++) {
    const [h1, v1] = KEYS[i];
    if (h <= h1) {
      const [h0, v0] = KEYS[i - 1];
      return v0 + ((h - h0) / (h1 - h0)) * (v1 - v0);
    }
  }
  return KEYS[KEYS.length - 1][1];
}

/** Decimal hour → "3:05 PM" (wraps past 24, never shows ":60") */
export function formatHour(decimalHour) {
  const total = ((Math.round(decimalHour * 60) % 1440) + 1440) % 1440;
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
}
