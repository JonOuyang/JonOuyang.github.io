/**
 * Free email sanity check (no paid API): syntax, typo'd popular domains, throwaway
 * domains, and whether the domain can receive mail at all (MX, falling back to A/AAAA
 * per RFC 5321). It can't prove a specific inbox exists — no free check can; big
 * providers deliberately hide that — but it catches the common real-world mistakes.
 */
import { promises as dns } from 'node:dns';

const SYNTAX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const POPULAR = [
  'gmail.com', 'googlemail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'live.com',
  'icloud.com', 'me.com', 'aol.com', 'proton.me', 'protonmail.com', 'ucla.edu', 'g.ucla.edu',
  'berkeley.edu', 'stanford.edu', 'usc.edu', 'mit.edu', 'google.com', 'microsoft.com',
];

const DISPOSABLE = new Set([
  'mailinator.com', 'guerrillamail.com', 'guerrillamail.net', '10minutemail.com', 'tempmail.com',
  'temp-mail.org', 'yopmail.com', 'trashmail.com', 'getnada.com', 'sharklasers.com',
  'dispostable.com', 'maildrop.cc', 'throwawaymail.com', 'fakeinbox.com', 'mailnesia.com',
]);

function distance(a, b) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}

const withTimeout = (p, ms) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))]);

async function domainReceivesMail(domain) {
  try {
    const mx = await withTimeout(dns.resolveMx(domain), 2500);
    if (mx.length) return true;
  } catch (e) {
    if (e.message === 'timeout') return null; // DNS hiccup: don't block the user
    if (!['ENOTFOUND', 'ENODATA', 'ESERVFAIL', 'ENONAME'].includes(e.code)) return null;
  }
  try {
    const a = await withTimeout(dns.resolve(domain), 2500);
    return a.length > 0;
  } catch (e) {
    return e.message === 'timeout' ? null : false;
  }
}

/**
 * → { ok: true } or { ok: false, reason: 'syntax' | 'disposable' | 'no_domain', suggestion? }
 * `suggestion` is a corrected full address when the domain looks like a typo of a popular one.
 */
export async function checkEmail(raw) {
  const email = String(raw || '').trim();
  if (email.length > 200 || !SYNTAX.test(email)) return { ok: false, reason: 'syntax' };
  const [local, domainRaw] = [email.slice(0, email.lastIndexOf('@')), email.slice(email.lastIndexOf('@') + 1)];
  const domain = domainRaw.toLowerCase();

  let suggestion;
  if (!POPULAR.includes(domain)) {
    const near = POPULAR.map((p) => [p, distance(domain, p)]).sort((a, b) => a[1] - b[1])[0];
    if (near && near[1] > 0 && near[1] <= 2) suggestion = `${local}@${near[0]}`;
  }
  if (DISPOSABLE.has(domain)) return { ok: false, reason: 'disposable' };

  const receives = await domainReceivesMail(domain);
  if (receives === false) return { ok: false, reason: 'no_domain', ...(suggestion && { suggestion }) };
  return { ok: true, ...(suggestion && { suggestion }) }; // real domain, but maybe still a typo (e.g. gmai.com parked)
}
