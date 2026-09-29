import React, { useMemo, useRef, useEffect, useCallback, useState } from 'react';
import { DAY_START, DAY_END, SLOT, getBusy, getDaySlots, earliestStart, isFree, useAvailability, loadRange } from './availability';
import { EASE } from './ui';
import { useTimeFormat } from './tz';

// phone sheet: list fades out under the header / footer
const FADE_MASK = {
  WebkitMaskImage: 'linear-gradient(to bottom, transparent 0, #000 14px, #000 calc(100% - 14px), transparent 100%)',
  maskImage: 'linear-gradient(to bottom, transparent 0, #000 14px, #000 calc(100% - 14px), transparent 100%)',
};
const TOTAL_ROWS = (DAY_END - DAY_START) / SLOT;

/** Current PT calendar date + decimal hour, for the "now" line. */
function ptNow() {
  const now = new Date();
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Los_Angeles',
      year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', hourCycle: 'h23',
    }).formatToParts(now).map((p) => [p.type, +p.value || p.value]),
  );
  return { y: parts.year, m: parts.month - 1, d: parts.day, decimal: parts.hour + parts.minute / 60 };
}

/**
 * DayTimeline — Google-Calendar-style single-day free/busy vertical timeline.
 * Body content only; the parent supplies the glass container / positioning / close button.
 */
export default function DayTimeline({ date, selected, onPreview, onSelect, variant = 'side', active = true }) {
  const isSheet = variant === 'sheet';
  const fmt = useTimeFormat(); // labels in the viewer's zone (or PT); geometry stays PT
  // half-hour-offset zones (India, Adelaide…) get "8:30 PM" gutter labels, which need more room
  const wideLabels = fmt.hour(date, DAY_START).includes(':');
  const GUTTER_W = (isSheet ? 48 : 40) + (wideLabels ? 14 : 0);
  const scrollRef = useRef(null);

  // Side variant fits the whole day into whatever height the card gives it (no scrolling);
  // the phone sheet keeps fixed touch-sized rows and scrolls.
  const [fitH, setFitH] = useState(0);
  useEffect(() => {
    if (isSheet || !scrollRef.current) return;
    const el = scrollRef.current;
    const ro = new ResizeObserver(() => setFitH(el.clientHeight - 8)); // 8px keeps the last hour label clear
    ro.observe(el);
    return () => ro.disconnect();
  }, [isSheet]);
  // Phone sheet = iOS-picker style: a fixed reading line at the middle of the list; the time under it
  // drives the sky. Half a viewport of padding above/below lets every time reach the line, so the
  // time at the line is simply scrollTop / trackHeight (independent of the padding).
  const [padH, setPadH] = useState(0);
  useEffect(() => {
    if (!isSheet || !scrollRef.current) return;
    const el = scrollRef.current;
    const ro = new ResizeObserver(() => setPadH(Math.round(el.clientHeight / 2)));
    ro.observe(el);
    return () => ro.disconnect();
  }, [isSheet]);
  const ROW_H = isSheet ? 44 : Math.max(12, fitH / TOTAL_ROWS);
  const trackHeight = ROW_H * TOTAL_ROWS;

  const key = date ? `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}` : '';
  const { version, error } = useAvailability(); // re-render when calendar data lands
  const daySlots = useMemo(() => getDaySlots(date), [key, version]);
  const busyOrNull = useMemo(() => getBusy(date), [key, version]);
  const loading = busyOrNull == null;
  const busy = busyOrNull ?? [];
  const earliest = useMemo(() => earliestStart(date), [key]);

  const freeSlots = useMemo(() => daySlots.filter((s) => s.free), [daySlots]);
  const freeN = freeSlots.length;

  let secondary;
  if (loading && error) {
    secondary = (
      <>
        Couldn't load Jonathan's calendar.{' '}
        <button type="button" className="underline text-white/80 hover:text-white" onClick={() => loadRange(date, 42, { force: true })}>
          Try again
        </button>
      </>
    );
  } else if (loading) {
    secondary = 'Checking Jonathan’s calendar…';
  } else if (freeN > 0) {
    secondary = `${freeN} time${freeN === 1 ? '' : 's'} available`;
  } else if (daySlots.every((s) => s.reason === 'past')) {
    secondary = 'No times left today';
  } else {
    secondary = 'Fully booked';
  }

  const yFor = useCallback((t) => ((t - DAY_START) / (DAY_END - DAY_START)) * trackHeight, [trackHeight]);

  const hourTicks = useMemo(() => {
    const ticks = [];
    for (let h = DAY_START; h <= DAY_END; h += 1) ticks.push(h);
    return ticks;
  }, []);

  const scrolledKey = useRef(null);
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (isSheet && !padH) return; // wait until the padding exists, or the scroll gets clamped
    if (isSheet && scrolledKey.current === key) return;
    scrolledKey.current = key;
    const target = selected != null ? selected : (freeSlots[0]?.start ?? DAY_START);
    // sheet: the reading line sits on the top edge of the block (= its start time)
    el.scrollTop = isSheet ? yFor(target) : Math.max(0, yFor(target) - el.clientHeight / 2 + ROW_H / 2);
    if (isSheet && activeRef.current) previewAt(target);
    // Only when the day changes — not on every `selected` change (that just glides in place).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, padH]);

  // Mouse over any part of the track (busy included) scrubs the sky to the time under the
  // cursor. Written straight to the DOM: no React render per pointermove.
  const cursorRef = useRef(null);
  const cursorLabelRef = useRef(null);
  const cursorT = useRef(null);
  const previewAt = useCallback(
    (t) => {
      t = Math.min(Math.max(t, DAY_START), DAY_END);
      cursorT.current = t;
      onPreview?.(t);
      const c = cursorRef.current;
      if (c) {
        if (!isSheet) {
          c.style.opacity = '1';
          c.style.transform = `translateY(${yFor(t)}px)`;
        }
        cursorLabelRef.current.textContent = fmt.time(date, Math.round(t * 12) / 12); // 5-min steps
      }
    },
    [onPreview, yFor, fmt, date, isSheet],
  );

  const handleTrackMove = useCallback(
    (e) => {
      if (e.pointerType !== 'mouse') return;
      const rect = e.currentTarget.getBoundingClientRect();
      previewAt(DAY_START + ((e.clientY - rect.top) / trackHeight) * (DAY_END - DAY_START));
    },
    [previewAt, trackHeight],
  );

  // Phone sheet: scrolling moves the sky. Passive listener, straight to refs/DOM (zero React renders).
  const activeRef = useRef(active);
  activeRef.current = active;
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !isSheet) return;
    const timeAtLine = () => DAY_START + (el.scrollTop / trackHeight) * (DAY_END - DAY_START);
    const onScroll = () => activeRef.current && previewAt(timeAtLine());
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [isSheet, previewAt, trackHeight]);
  // sheet (re)opened: the sky picks up whatever is under the line
  useEffect(() => {
    const el = scrollRef.current;
    if (!isSheet || !active || !el || !padH) return;
    previewAt(DAY_START + (el.scrollTop / trackHeight) * (DAY_END - DAY_START));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  // Mouse wheel / trackpad over the track scrubs time live (the timeline itself never scrolls)
  const trackRef = useRef(null);
  useEffect(() => {
    const el = trackRef.current;
    if (!el || isSheet) return;
    const onWheel = (e) => {
      e.preventDefault();
      const px = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
      const from = cursorT.current ?? selected ?? DAY_START;
      previewAt(from + (px / trackHeight) * (DAY_END - DAY_START) * 0.5);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [isSheet, previewAt, selected, trackHeight]);

  const handleLeave = useCallback(() => {
    cursorT.current = null;
    onPreview?.(null);
    if (cursorRef.current) cursorRef.current.style.opacity = '0';
  }, [onPreview]);

  const activate = useCallback(
    (start) => {
      if (isSheet) {
        onPreview?.(start);
        const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
        scrollRef.current?.scrollTo({ top: yFor(start), behavior: reduce ? 'auto' : 'smooth' }); // line onto the block's start
      }
      onSelect?.(start);
    },
    [isSheet, onPreview, onSelect, yFor],
  );

  const now = ptNow();
  const today = date && date.getFullYear() === now.y && date.getMonth() === now.m && date.getDate() === now.d;
  const showNowLine = today && now.decimal >= DAY_START && now.decimal <= DAY_END;

  // times outside the timeline (e.g. 2 AM from the wheel) get no block at all
  const inRange = selected != null && selected >= DAY_START && selected + SLOT <= DAY_END;
  const selectedFree = selected != null && isFree(date, selected);
  const selectedTop = selected != null ? Math.min(Math.max(yFor(selected), 0), trackHeight - ROW_H) : 0;

  return (
    <div className="h-full flex flex-col" style={{ fontVariantNumeric: 'tabular-nums' }}>
      {/* Header */}
      <div className="shrink-0 px-1">
        <div className={`text-[13px] font-semibold uppercase tracking-wide text-white/55 ${isSheet ? '[@media(max-height:700px)]:hidden' : ''}`}>
          {date.toLocaleDateString('en-US', { weekday: 'long' })}
        </div>
        <div className={`mt-0.5 font-semibold tracking-tight text-white ${isSheet ? 'text-[20px]' : 'text-[22px]'}`}>
          {date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
        </div>
        <div className="mt-1 text-[13px] text-white/55">{secondary}</div>
        {!fmt.visitorIsPT && (
          <div className="mt-0.5 text-[12px] text-white/45">
            Times in {fmt.zone}
            {' · '}
            <button type="button" onClick={() => fmt.setShowPT(!fmt.showPT)} className="text-white/70 hover:text-white underline-offset-2 hover:underline max-lg:py-2.5 max-lg:-my-2.5">
              {fmt.showPT ? 'Show my time' : 'Show in PT'}
            </button>
          </div>
        )}
      </div>

      <div className={`h-px bg-white/10 shrink-0 ${isSheet ? 'mt-2 mb-0' : 'my-3'}`} />

      {/* Timeline */}
      <div className="relative flex-1 min-h-0" style={isSheet ? FADE_MASK : undefined}>
      {/* sheet: fixed reading line; the sky shows the time under it */}
      {isSheet && (
        <div ref={cursorRef} className="absolute inset-x-0 top-1/2 z-30 pointer-events-none">
          <div className="absolute left-0 right-0 h-px bg-white/60" />
          <span
            ref={cursorLabelRef}
            className="absolute -top-[10px] right-1 px-2 rounded-md bg-black/60 text-[12px] leading-[20px] font-medium text-white tabular-nums"
          />
        </div>
      )}
      <div
        ref={scrollRef}
        onPointerLeave={isSheet ? undefined : handleLeave}
        className={`h-full tabular-nums ${isSheet ? 'overflow-y-auto overscroll-contain sch-noscrollbar' : 'overflow-hidden'}`}
      >
        <div className="relative flex" style={{ height: trackHeight, ...(isSheet ? { marginTop: padH, marginBottom: padH } : null) }}>
          {/* Hour gutter */}
          <div className="relative shrink-0" style={{ width: GUTTER_W }}>
            {hourTicks.map((h) => (
              <div
                key={h}
                className={`absolute right-2 text-[11px] tabular-nums whitespace-nowrap ${h < earliest ? 'text-white/20' : 'text-white/40'}`}
                style={{ top: Math.min(Math.max(yFor(h) - 6, 0), trackHeight - 12) }}
              >
                {fmt.hour(date, h)}
              </div>
            ))}
          </div>

          {/* Track */}
          <div ref={trackRef} className="relative flex-1 border-l border-white/[0.06]" onPointerMove={handleTrackMove}>
            {/* Hairlines */}
            {hourTicks.map((h) => (
              <div key={h} className="absolute left-0 right-0 h-px bg-white/[0.07]" style={{ top: yFor(h) }} />
            ))}

            {/* Loading: a soft pulse over the track until the day's free/busy arrives */}
            {loading && !error && <div className="absolute inset-x-1 inset-y-0 rounded-lg bg-white/[0.05] animate-pulse" />}

            {/* Cursor line: follows the mouse, shows the time the sky is at */}
            {!isSheet && <div
              ref={cursorRef}
              className="absolute left-0 right-0 top-0 z-20 pointer-events-none opacity-0 transition-opacity duration-150"
              style={{ willChange: 'transform' }}
            >
              <div className="absolute left-0 right-0 h-px bg-white/50" />
              <span
                ref={cursorLabelRef}
                className="absolute -top-[9px] right-1 px-1.5 rounded-md bg-black/60 text-[11px] leading-[18px] font-medium text-white tabular-nums"
              />
            </div>}

            {/* Busy blocks (merged) */}
            {busy.map((b) => {
              const start = Math.max(b.start, DAY_START);
              const end = Math.min(b.end, DAY_END);
              if (end <= start) return null;
              const top = yFor(start);
              const height = yFor(end) - yFor(start);
              const coveredBySelected =
                inRange && !selectedFree && selected < end && selected + SLOT > start;
              const showLabel = (end - start > SLOT || isSheet) && !coveredBySelected;
              return (
                <div
                  key={`busy-${b.start}`}
                  className="absolute left-1 right-1 rounded-lg overflow-hidden bg-white/[0.06]"
                  style={{
                    top,
                    height,
                    backgroundImage:
                      'repeating-linear-gradient(45deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 7px)',
                  }}
                >
                  {showLabel && (
                    <span className="absolute top-1 left-2 text-[12px] text-white/40 whitespace-nowrap">Busy</span>
                  )}
                </div>
              );
            })}

            {/* Free slots */}
            {freeSlots.map((slot) => (
              <button
                key={slot.start}
                type="button"
                onFocus={() => onPreview?.(slot.start)}
                onClick={() => activate(slot.start)}
                style={{ top: yFor(slot.start) + 1, height: ROW_H - 2, transitionTimingFunction: EASE }}
                className="group absolute left-1 right-1 rounded-lg border border-white/[0.06] bg-transparent
                  flex items-center justify-center overflow-hidden
                  transition-all duration-200 outline-none
                  hover:bg-white/[0.12] hover:scale-[1.02]
                  focus-visible:bg-white/[0.12] focus-visible:scale-[1.02]"
              >
                <span
                  className={`text-[13px] font-medium text-white tabular-nums transition-opacity duration-200 ${
                    isSheet ? 'opacity-30' : 'opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100'
                  }`}
                >
                  {fmt.range(date, slot.start)}
                </span>
              </button>
            ))}

            {/* Now line */}
            {showNowLine && (
              <>
                <div className="absolute left-0 right-0 h-px bg-white/70 z-20" style={{ top: yFor(now.decimal) }} />
                <div
                  className="absolute w-1.5 h-1.5 rounded-full bg-white/70 z-20"
                  style={{ top: yFor(now.decimal) - 3, left: -3 }}
                />
              </>
            )}

            {/* Selected block */}
            {inRange && (
              <div
                className={`absolute left-1 right-1 rounded-lg z-10 flex items-center justify-center px-2
                  transition-[top] duration-300
                  ${selectedFree ? 'bg-white text-black shadow-lg shadow-black/30' : 'border border-white/60 bg-transparent text-white'}`}
                style={{ top: selectedTop, height: ROW_H, transitionTimingFunction: EASE }}
              >
                <span className="text-[13px] font-semibold tabular-nums truncate">
                  {fmt.range(date, selected)}
                  {!selectedFree && ' · Busy'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
