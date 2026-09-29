/**
 * GET /api/check-email?email=… → { ok, reason?, suggestion? }  (see _lib/email.js)
 * Used by the booking form to flag typos before submitting. /api/book re-checks.
 */
import { checkEmail } from './_lib/email.js';
import { enforceBurstLimit } from './_lib/limits.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'method_not_allowed' });
  if (enforceBurstLimit(req, res, 'check-email')) return;
  const result = await checkEmail(req.query?.email);
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json(result);
}
