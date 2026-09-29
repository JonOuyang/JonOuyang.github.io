/**
 * Generates and triggers download of an .ics calendar invite for a booking.
 */
export function downloadICS(selectedDate, decimalHour, label) {
  if (!selectedDate) return;

  const d =
    selectedDate instanceof Date
      ? selectedDate
      : new Date(selectedDate);
  if (isNaN(d.getTime())) return;

  // Slot is in Pacific Time; emit floating local times tagged with the PT zone
  const total = Math.round((decimalHour ?? 12) * 60);
  const pad = (n) => String(n).padStart(2, '0');
  const ymd = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
  const hm = (mins) => `${pad(Math.floor(mins / 60))}${pad(mins % 60)}00`;
  const endMins = Math.min(total + 30, 24 * 60 - 1);
  const now = new Date();
  const stamp = `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}T${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}00Z`;

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Jonathan Ouyang//Schedule//EN',
    'BEGIN:VEVENT',
    `UID:${Date.now()}@jonathanouyang.com`,
    `DTSTAMP:${stamp}`,
    `DTSTART;TZID=America/Los_Angeles:${ymd}T${hm(total)}`,
    `DTEND;TZID=America/Los_Angeles:${ymd}T${hm(endMins)}`,
    'SUMMARY:Discussion with Jonathan Ouyang (PT)',
    'DESCRIPTION:30-Min Coffee / Research / DeepMind AI Exchange',
    'LOCATION:Google Meet',
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Meeting_with_Jonathan_${label ? label.replace(/[: ]/g, '_') : 'Slot'}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}
