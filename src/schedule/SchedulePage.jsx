import React, { useState, useRef, useEffect, useLayoutEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import BookingCalendar from './BookingCalendar';
import DayTimeline from './DayTimeline';
import DetailsStep from './DetailsStep';
import { isFree, getDaySlots, SLOT, useAvailability } from './availability';
import { FONT, GLASS, EASE } from './ui';
import { PT, VISITOR_TZ, makeFormatter, TimeFormatContext } from './tz';
import { getPTTime, hourToVideoTime, formatHour } from './timeVideoMapping';
import { createSky } from './skyFrames';
import './schedule.css';

const VISITOR_FMT = makeFormatter(VISITOR_TZ);
const ptToday = () => {
  const [y, m, d] = new Intl.DateTimeFormat('en-CA', { timeZone: PT }).format(new Date()).split('-').map(Number);
  return new Date(y, m - 1, d);
};
// Sky easing: duration grows a little with distance (video seconds jumped), in seconds
const EASE_MIN = 0.22;
const EASE_PER_SEC = 0.05;
const EASE_MAX = 0.55;
// shell height while the day timeline is open: tall enough for comfy rows, never taller than the window
const OPEN_H = 'min(760px, calc(100dvh - 120px))';

const CloseIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <path d="M2.5 2.5l7 7M9.5 2.5l-7 7" />
  </svg>
);

/**
 * SchedulePage — booking over a San Francisco day-to-night timelapse.
 *
 * Pick a day → Jonathan's free/busy for that day grows out of the card (desktop)
 * or slides up as a sheet (phones). Hovering a free slot previews that hour in the
 * sky; clicking picks it. With nothing picked, the sky shows SF's real time now.
 */
export default function SchedulePage() {
  const [pickedTime, setPickedTime] = useState(null); // decimal hour PT, or null
  const [selectedDate, setSelectedDate] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false); // mobile only
  const [step, setStep] = useState('pick'); // 'pick' | 'details'
  const [stepAnim, setStepAnim] = useState('');
  const [ptNow, setPtNow] = useState(() => getPTTime());
  const [videoReady, setVideoReady] = useState(false);

  const canvasRef = useRef(null);
  const hiRef = useRef(null);
  const sky = useRef(null);
  // Big clock: shown in the display zone (visitor's, or PT if toggled); the small
  // "San Francisco · 9:00 AM" line explains the sky, which always follows PT.
  const clockRef = useRef(null);
  const clockDateRef = useRef(null);
  const sfTimeRef = useRef(null);
  const clockDay = useRef(ptToday()); // PT day the clock refers to
  // Timeline/summary labels: visitor's zone by default, PT on request
  const [showPT, setShowPT] = useState(false);
  const fmt = useMemo(
    () => ({ ...makeFormatter(showPT ? PT : VISITOR_TZ), visitorIsPT: VISITOR_FMT.isPT, showPT, setShowPT }),
    [showPT],
  );
  const fmtRef = useRef(fmt);
  fmtRef.current = fmt;

  // Written straight to the DOM (called every animation frame while scrubbing)
  const lastPainted = useRef(null);
  const paintClock = useCallback((d) => {
    lastPainted.current = d;
    const f = fmtRef.current, day = clockDay.current;
    if (clockRef.current) clockRef.current.textContent = f.clock(day, d);
    if (clockDateRef.current) clockDateRef.current.textContent = f.longDate(day, d);
    if (sfTimeRef.current) sfTimeRef.current.textContent = f.isPT ? '' : ` · ${formatHour(d)}`;
  }, []);
  const target = useRef(hourToVideoTime(getPTTime().decimal));
  // what the sky rests on when nothing is hovered: the picked slot, else SF right now
  const restTime = useRef(getPTTime().decimal);
  restTime.current = pickedTime ?? ptNow.decimal;

  useEffect(() => {
    const id = setInterval(() => setPtNow(getPTTime()), 15000);
    return () => clearInterval(id);
  }, []);

  // Sky follows `target` along a cubic Bézier/Hermite ease: every move starts on the very
  // next frame, ramps up, and settles with zero velocity. Retargeting mid-move (the mouse
  // keeps going) starts the new curve from the current position AND velocity, so it never
  // restarts its ramp or jerks. Loop stops once settled, so the page idles.
  const raf = useRef(0);
  const shown = useRef(target.current); // video seconds on screen
  const curve = useRef(null); // { p0, v0, p1, t0, T } — v0 in video-sec per sec

  const sampleCurve = (c, now) => {
    const s = Math.min(1, (now - c.t0) / 1000 / c.T);
    const s2 = s * s, s3 = s2 * s;
    const p = (2 * s3 - 3 * s2 + 1) * c.p0 + (s3 - 2 * s2 + s) * c.T * c.v0 + (-2 * s3 + 3 * s2) * c.p1;
    const v = ((6 * s2 - 6 * s) * c.p0 + (3 * s2 - 4 * s + 1) * c.T * c.v0 + (-6 * s2 + 6 * s) * c.p1) / c.T;
    return { p, v: s >= 1 ? 0 : v, done: s >= 1 };
  };

  const chase = useCallback(() => {
    const now = performance.now();
    const goal = target.current;
    const cur = curve.current ? sampleCurve(curve.current, now) : { p: shown.current, v: 0 };
    if (curve.current && curve.current.p1 === goal) return; // already heading there
    const dist = Math.abs(goal - cur.p);
    curve.current = { p0: cur.p, v0: cur.v, p1: goal, t0: now, T: Math.min(EASE_MAX, EASE_MIN + dist * EASE_PER_SEC) };
    sky.current?.prefetch(goal); // sharp destination frame loads while we're still moving

    if (raf.current) return; // loop already running; it picks up the new curve
    const tick = (t) => {
      const c = curve.current;
      const { p, done } = sampleCurve(c, t);
      shown.current = p;
      sky.current?.set(p);
      if (done) {
        curve.current = null;
        raf.current = 0;
        return;
      }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    sky.current = createSky(canvasRef.current, hiRef.current, { startSec: shown.current, onFirstFrame: () => setVideoReady(true) });
    if (import.meta.env.DEV) window.__sky = sky.current; // for scratchpad perf tests
    return () => {
      cancelAnimationFrame(raf.current);
      raf.current = 0; // or the next mount thinks a loop is still running and never starts one
      curve.current = null;
      sky.current.destroy();
    };
  }, []);

  // Scrub: no React state, just move the sky target and the big clock text.
  const handleScrub = useCallback((d) => {
    target.current = hourToVideoTime(d);
    paintClock(d);
    chase();
  }, [chase]);

  const handlePick = useCallback((d) => {
    setPickedTime(d);
    handleScrub(d);
    setTimeout(() => setSheetOpen(false), 280); // phones: let the tap register, then drop the sheet
  }, [handleScrub]);

  // Timeline hover: preview a slot, or fall back to the resting time when the pointer leaves
  const hovering = useRef(false);
  const handlePreview = useCallback((d) => {
    hovering.current = d != null;
    handleScrub(d ?? restTime.current);
  }, [handleScrub]);

  const handleSelectDate = (date) => {
    setSelectedDate(date);
    setSheetOpen(true);
    // a picked time only survives a day change if it's still open on the new day
    if (pickedTime != null && !isFree(date, pickedTime)) {
      setPickedTime(null);
      handleScrub(ptNow.decimal);
    }
  };

  const goStep = (next) => {
    setStepAnim(next === 'details' ? 'sch-push' : 'sch-pop');
    setStep(next);
  };

  useEffect(() => {
    if (!sheetOpen) return;
    const onKey = (e) => e.key === 'Escape' && setSheetOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [sheetOpen]);

  const ready = selectedDate && pickedTime != null && isFree(selectedDate, pickedTime);
  const { version: availVersion } = useAvailability();
  const openCount = useMemo(
    () => (selectedDate ? getDaySlots(selectedDate).filter((s) => s.free).length : 0),
    [selectedDate, availVersion],
  );
  const timeLabel = pickedTime != null && selectedDate ? fmt.time(selectedDate, pickedTime, { noDay: true }) : '';
  const dateShort =
    selectedDate && pickedTime != null
      ? fmt.date(selectedDate, pickedTime)
      : selectedDate?.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  clockDay.current = selectedDate ?? ptToday();
  // repaint when the resting time, day or display zone changes (mid-hover: keep the hovered time)
  useLayoutEffect(() => {
    paintClock(hovering.current && lastPainted.current != null ? lastPainted.current : pickedTime ?? ptNow.decimal);
  }, [pickedTime, ptNow, selectedDate, fmt, paintClock]);
  const sidebarOpen = !!selectedDate;
  const lastDate = useRef(null);
  if (selectedDate) lastDate.current = selectedDate;
  const shownDate = selectedDate ?? lastDate.current;

  // idle sky follows the real clock
  useEffect(() => {
    if (pickedTime == null && !hovering.current) handleScrub(ptNow.decimal);
  }, [ptNow, pickedTime, handleScrub]);

  const closeDay = () => {
    setSelectedDate(null);
    setPickedTime(null);
    if (step === 'details') goStep('pick');
  };

  return (
    <TimeFormatContext.Provider value={fmt}>
    <div className="relative min-h-[100dvh] w-full bg-black text-white antialiased" style={{ fontFamily: FONT }}>
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <canvas
          ref={canvasRef}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${videoReady ? 'opacity-100' : 'opacity-0'}`}
        />
        {/* sharp resting frame(s), faded in by skyFrames when the sky stops */}
        <div ref={hiRef} className="absolute inset-0" style={{ opacity: 0 }}>
          <img alt="" className="absolute inset-0 w-full h-full object-cover" />
          <img alt="" className="absolute inset-0 w-full h-full object-cover" />
        </div>
        {/* light scrims only where text sits */}
        <div className="absolute inset-y-0 left-0 w-full md:w-[60%] bg-gradient-to-r from-black/30 via-black/10 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/25 to-transparent" />
      </div>

      {/* Top bar */}
      <header className="relative z-20 flex items-center justify-between px-4 sm:px-10 pt-5">
        <Link
          to="/"
          className="flex items-center gap-1.5 h-9 pl-3 pr-4 rounded-full text-[14px] font-medium text-white/90 hover:text-white transition-colors"
          style={GLASS}
        >
          <svg width="8" height="13" viewBox="0 0 8 13" fill="none" aria-hidden="true">
            <path d="M6.5 1.5l-5 5 5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Home
        </Link>

      </header>

      {/* Big lock-screen clock, follows the wheel/timeline live */}
      <div
        className={`${sidebarOpen ? 'hidden xl:block' : 'hidden lg:block'} fixed top-24 z-10 text-right pointer-events-none [text-shadow:0_2px_24px_rgba(0,0,0,0.25)]`}
        style={{ right: 48 }}
      >
        {/* text is painted by paintClock(), not React, so scrubbing never re-renders */}
        <div ref={clockDateRef} className="text-[22px] font-semibold text-white/90" />
        <div ref={clockRef} className="text-[156px] leading-[0.9] font-semibold tracking-[-0.045em] tabular-nums text-white/95" />
        <div className="mt-3 flex items-center justify-end gap-2 text-[17px] font-semibold text-white/90 tabular-nums">
          <span className="w-1.5 h-1.5 rounded-full bg-[#30D158]" />
          <span>
            San Francisco<span ref={sfTimeRef} className="text-white/65" />
          </span>
        </div>
      </div>

      {/* Left panel */}
      <main className="relative z-10 px-4 sm:px-10 py-6 sm:py-8">
        {/* One glass shell: booking card + (desktop) free/busy extension that grows out of its right edge */}
        <div
          className="flex w-full max-w-[380px] lg:max-w-none lg:w-max mx-auto sm:mx-0 rounded-[30px] overflow-hidden"
          style={{ ...GLASS, '--open-h': sidebarOpen ? OPEN_H : '0px' }}
        >
        <section
          className="w-full lg:w-[380px] shrink-0 p-5 sm:p-6 flex flex-col lg:min-h-[var(--open-h)]"
          style={{ transition: `min-height 560ms ${EASE}` }}
        >
          {step === 'pick' ? (
            <div key="pick" className={`${stepAnim} flex-1 flex flex-col`}>
              <p className="text-[13px] font-medium text-white/55">30 min · Google Meet</p>
              <h1 className="mt-0.5 text-[28px] leading-tight font-bold tracking-[-0.02em]">Book a time</h1>
              <p className="mt-1 text-[15px] text-white/60">
                {!selectedDate ? 'Pick a day to see when Jonathan is free.' : 'Pick an open time.'}
              </p>

              <div className="mt-5">
                <BookingCalendar selectedDate={selectedDate} onSelectDate={handleSelectDate} />
              </div>

              {/* phones: reopen the free/busy sheet */}
              {selectedDate && (
                <button
                  type="button"
                  onClick={() => setSheetOpen(true)}
                  className="lg:hidden mt-3 w-full flex items-center justify-between h-11 px-4 rounded-xl bg-white/[0.07] text-[15px] active:bg-white/[0.12] transition-colors"
                >
                  <span>Jonathan's day</span>
                  <span className="flex items-center gap-2 text-white/55">
                    {openCount} open
                    <svg width="7" height="12" viewBox="0 0 8 13" fill="none" aria-hidden="true">
                      <path d="M1.5 1.5l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </button>
              )}

              {/* pinned to the bottom of the card */}
              <div className="mt-auto pt-5">
                {pickedTime != null && selectedDate && (
                  <div className="mb-3 flex items-center justify-between rounded-2xl bg-white/[0.06] px-4 py-3">
                    <div>
                      <div className="text-[13px] text-white/55">{dateShort}</div>
                      <div className="text-[17px] font-semibold tabular-nums">{fmt.range(selectedDate, pickedTime, SLOT, { noDay: true })}</div>
                    </div>
                    <span className="text-[13px] text-white/45">{fmt.isPT ? 'Pacific Time' : fmt.zone}</span>
                  </div>
                )}
                <button
                  type="button"
                  disabled={!ready}
                  onClick={() => goStep('details')}
                  className="w-full h-[50px] rounded-full bg-white text-black text-[16px] font-semibold hover:bg-white/90 active:scale-[0.98] transition disabled:bg-white/15 disabled:text-white/45 disabled:active:scale-100"
                >
                  {!selectedDate ? 'Pick a day' : ready ? 'Continue' : 'Pick a time'}
                </button>
              </div>
            </div>
          ) : (
            <div key="details" className={`${stepAnim} flex-1`}>
              <DetailsStep date={selectedDate} decimalHour={pickedTime} timeLabel={timeLabel} onBack={() => goStep('pick')} />
            </div>
          )}
        </section>

        <aside
          className="hidden lg:block relative shrink-0 overflow-hidden"
          style={{ width: sidebarOpen ? 360 : 0, transition: `width 560ms ${EASE}` }}
          aria-hidden={!sidebarOpen}
        >
          <div
            className="absolute inset-y-0 left-0 w-[360px] flex flex-col p-5 border-l border-white/10"
            style={{
              opacity: sidebarOpen ? 1 : 0,
              transform: sidebarOpen ? 'none' : 'translateX(-24px)',
              transition: `opacity 360ms ${EASE} ${sidebarOpen ? '140ms' : '0ms'}, transform 560ms ${EASE}`,
            }}
          >
            {shownDate && (
              <>
                <button
                  type="button"
                  aria-label="Close"
                  onClick={closeDay}
                  className="absolute top-5 right-5 z-10 w-[30px] h-[30px] grid place-items-center rounded-full bg-white/10 hover:bg-white/15 text-white/70 hover:text-white transition-colors"
                >
                  <CloseIcon />
                </button>
                <div className="flex-1 min-h-0">
                  <DayTimeline date={shownDate} selected={pickedTime} onPreview={handlePreview} onSelect={handlePick} variant="side" />
                </div>
              </>
            )}
          </div>
        </aside>
        </div>
      </main>

      {/* Phones: free/busy bottom sheet */}
      <div className="lg:hidden">
        <div
          className={`fixed inset-0 z-30 bg-black/30 transition-opacity duration-300 ${sheetOpen && selectedDate ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          onClick={() => setSheetOpen(false)}
        />
        <div
          className="fixed inset-x-0 bottom-0 z-40 h-[72dvh] flex flex-col rounded-t-[28px] px-5 pb-[max(20px,env(safe-area-inset-bottom))]"
          style={{
            ...GLASS,
            background: 'rgba(24, 24, 27, 0.78)',
            transform: sheetOpen && selectedDate ? 'none' : 'translateY(105%)',
            transition: `transform 480ms ${EASE}`,
          }}
          aria-hidden={!sheetOpen}
        >
          <div className="flex items-center justify-between pt-2 pb-2">
            <span className="w-12" />
            <span className="w-9 h-[5px] rounded-full bg-white/25" />
            <button type="button" onClick={() => setSheetOpen(false)} className="w-12 text-right text-[16px] font-semibold text-white">
              Done
            </button>
          </div>
          {selectedDate && (
            <div className="flex-1 min-h-0">
              <DayTimeline date={selectedDate} selected={pickedTime} onPreview={handlePreview} onSelect={handlePick} variant="sheet" />
            </div>
          )}
        </div>
      </div>
    </div>
    </TimeFormatContext.Provider>
  );
}
