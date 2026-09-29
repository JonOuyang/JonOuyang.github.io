import React, { useState, useEffect, useRef } from 'react';
import { downloadICS } from './ics';
import { ymd, refreshDay } from './availability';
import { useTimeFormat } from './tz';

export default function DetailsStep({ date, decimalHour, timeLabel, onBack }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [error, setError] = useState(null);
  const [meetLink, setMeetLink] = useState(null);
  const [website, setWebsite] = useState(''); // honeypot: humans never see or fill it
  // live email check: { ok, reason?, suggestion? } from /api/check-email (null = not checked yet)
  const [emailCheck, setEmailCheck] = useState(null);
  const checkSeq = useRef(0);

  const fmt = useTimeFormat();
  const nameInputRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    // touch devices: don't pop the keyboard (and shove the layout) the moment the step opens
    if (window.matchMedia('(hover: hover)').matches) nameInputRef.current?.focus({ preventScroll: true });
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const dateObj =
    date instanceof Date
      ? date
      : date
      ? new Date(date)
      : null;

  // the viewer's calendar date for this slot (can be the day after Jonathan's for far-east visitors)
  const dateFormatted = dateObj && decimalHour != null ? fmt.date(dateObj, decimalHour) : '';
  const timeShown = timeLabel ? `${timeLabel} ${fmt.zone}` : '';

  const runEmailCheck = async (value) => {
    const v = value.trim();
    if (!v) return setEmailCheck(null);
    const seq = ++checkSeq.current;
    try {
      const r = await fetch(`/api/check-email?email=${encodeURIComponent(v)}`);
      const body = await r.json();
      const result = r.ok ? body : null; // rate-limited/down → skip the live check, the server re-checks anyway
      if (seq === checkSeq.current) setEmailCheck(result);
      return result;
    } catch {
      if (seq === checkSeq.current) setEmailCheck(null); // offline etc.: don't block
      return null;
    }
  };

  // re-check shortly after typing stops (only once something was flagged, so we don't nag mid-typing)
  useEffect(() => {
    if (!emailCheck || emailCheck.ok) return;
    const id = setTimeout(() => runEmailCheck(email), 500);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email]);

  const emailProblem =
    emailCheck && !emailCheck.ok
      ? { syntax: 'That doesn’t look like an email address.', disposable: 'Please use a real email address.', no_domain: 'This email domain doesn’t exist.' }[emailCheck.reason]
      : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || isSubmitting) return;
    const check = await runEmailCheck(email);
    if (check && !check.ok) return; // red message is showing
    setIsSubmitting(true);
    setError(null);
    try {
      const r = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: ymd(dateObj), start: decimalHour, name, email, note, website }),
      });
      const body = await r.json().catch(() => ({}));
      if (r.status === 503 && body.error === 'not_configured' && import.meta.env.DEV) {
        // dev without Google credentials: pretend it worked so the flow can be tested
        await new Promise((res) => (timerRef.current = setTimeout(res, 600)));
        setIsConfirmed(true);
        return;
      }
      if (r.status === 409) {
        setError('Someone just grabbed that time. Go back and pick another one.');
        refreshDay(dateObj);
        return;
      }
      if (body.error === 'already_booked') {
        setError('You already have a meeting booked with Jonathan. Check your inbox for the invite (reply there to reschedule).');
        return;
      }
      if (body.error === 'too_many_bookings' || body.error === 'rate_limited') {
        setError('Too many booking attempts from your network. Please try again later.');
        return;
      }
      if (body.error === 'bad_email') {
        setEmailCheck({ ok: false, reason: body.reason, suggestion: body.suggestion });
        return;
      }
      if (!r.ok) {
        setError(r.status === 400 ? 'Double-check your name and email.' : 'Something went wrong on our end. Please try again.');
        return;
      }
      setMeetLink(body.meetLink ?? null);
      setIsConfirmed(true);
      refreshDay(dateObj); // that slot is taken now
    } catch {
      setError('Couldn’t reach the server. Check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isConfirmed) {
    return (
      <div className="flex flex-col items-center text-center pt-2 pb-1">
        <div className="w-[56px] h-[56px] rounded-full bg-white/10 flex items-center justify-center text-white">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <h2 className="text-[22px] font-semibold tracking-tight text-white mt-4">
          You're all set
        </h2>

        <p className="text-[14px] text-white/55 mt-2 leading-relaxed">
          {dateFormatted} at {timeShown} is booked. A calendar invite{meetLink ? ' with a Google Meet link' : ''} is on
          its way to {email}.
        </p>

        <div className="flex gap-3 w-full mt-6">
          {meetLink ? (
            <a
              href={meetLink}
              target="_blank"
              rel="noreferrer"
              className="flex-1 h-11 grid place-items-center rounded-full bg-white/10 hover:bg-white/15 active:scale-[0.98] text-white text-[15px] font-medium transition"
            >
              Meet link
            </a>
          ) : (
            <button
              type="button"
              onClick={() => downloadICS(date, decimalHour, timeLabel)}
              className="flex-1 h-11 rounded-full bg-white/10 hover:bg-white/15 active:scale-[0.98] text-white text-[15px] font-medium transition"
            >
              Add to Calendar
            </button>
          )}
          <button
            type="button"
            onClick={onBack}
            className="flex-1 h-11 rounded-full bg-white hover:bg-white/90 active:scale-[0.98] text-black text-[15px] font-semibold transition"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex items-center">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-[15px] text-white/80 hover:text-white transition-colors max-lg:h-11 max-lg:pr-4 max-lg:-my-2"
        >
          <svg
            width="8"
            height="13"
            viewBox="0 0 8 13"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M6.5 1.5l-5 5 5 5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Back
        </button>
      </div>

      <div>
        <p className="text-[13px] text-white/55">30 min · Google Meet</p>
        <h2 className="mt-0.5 text-[28px] leading-tight font-bold tracking-[-0.02em]">
          Your details
        </h2>
      </div>

      {/* Summary: iOS inset grouped list */}
      <div className="rounded-2xl bg-white/[0.06] overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 text-[14px]">
          <span className="text-white/55">Date</span>
          <span className="text-white font-medium">{dateFormatted}</span>
        </div>
        <div className="h-px bg-white/[0.08] ml-4" />
        <div className="flex items-center justify-between px-4 py-3 text-[14px]">
          <span className="text-white/55">Time</span>
          <span className="text-white font-medium">
            {timeShown}
          </span>
        </div>
      </div>

      {/* Inputs: iOS inset grouped list */}
      <div className="rounded-2xl bg-white/[0.06] overflow-hidden">
        <input
          ref={nameInputRef}
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          className="w-full bg-transparent px-4 py-3 text-[16px] lg:text-[15px] text-white placeholder-white/35 outline-none border-0"
        />
        <div className="h-px bg-white/[0.08] ml-4" />
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={(e) => runEmailCheck(e.target.value)}
          aria-invalid={!!emailProblem}
          placeholder="Email"
          className="w-full bg-transparent px-4 py-3 text-[16px] lg:text-[15px] text-white placeholder-white/35 outline-none border-0"
        />
        <div className="h-px bg-white/[0.08] ml-4" />
        <textarea
          rows={4}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="What would you like to talk about? (optional)"
          className="w-full bg-transparent px-4 py-3 text-[16px] lg:text-[15px] text-white placeholder-white/35 outline-none border-0 resize-none"
        />
      </div>

      {/* honeypot for bots: off-screen, not focusable, ignored by humans */}
      <input
        type="text"
        name="website"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute -left-[9999px] w-px h-px opacity-0"
      />

      {(emailProblem || emailCheck?.suggestion) && (
        <div className="-mt-2 px-1 text-[13px] leading-snug" role={emailProblem ? 'alert' : undefined}>
          {emailProblem && <span className="text-[#FF453A]">{emailProblem} </span>}
          {emailCheck?.suggestion && (
            <button
              type="button"
              onClick={() => {
                setEmail(emailCheck.suggestion);
                setEmailCheck({ ok: true });
              }}
              className="text-white/75 hover:text-white"
            >
              Did you mean <span className="underline underline-offset-2">{emailCheck.suggestion}</span>?
            </button>
          )}
        </div>
      )}

      {error && <p className="text-[14px] text-white/80 -mb-1 px-1" role="alert">{error}</p>}

      {/* Primary button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-[50px] rounded-full bg-white text-black text-[16px] font-semibold hover:bg-white/90 active:scale-[0.98] transition disabled:opacity-50"
      >
        {isSubmitting ? 'Booking…' : 'Confirm'}
      </button>
    </form>
  );
}
