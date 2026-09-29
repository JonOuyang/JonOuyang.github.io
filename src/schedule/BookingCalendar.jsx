import React, { useState, useMemo, useEffect } from 'react';
import { freeCount, loadRange, useAvailability } from './availability';

const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

const sameDay = (a, b) =>
  a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

const Chevron = ({ dir }) => (
  <svg width="10" height="16" viewBox="0 0 10 16" fill="none" aria-hidden="true">
    <path
      d={dir === 'left' ? 'M8 2L2 8l6 6' : 'M2 2l6 6-6 6'}
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/** BookingCalendar — iOS-style month grid. Past and fully booked days are disabled. */
export default function BookingCalendar({ selectedDate, onSelectDate }) {
  const [view, setView] = useState(() => {
    const d = selectedDate ?? new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const year = view.getFullYear();
  const month = view.getMonth();

  // fetch Jonathan's free/busy for the visible month (cached; days load in the background)
  useAvailability();
  useEffect(() => {
    loadRange(new Date(year, month, 1), new Date(year, month + 1, 0).getDate());
  }, [year, month]);

  const today = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }, []);

  const cells = useMemo(() => {
    const lead = new Date(year, month, 1).getDay();
    const days = new Date(year, month + 1, 0).getDate();
    return [
      ...Array(lead).fill(null),
      ...Array.from({ length: days }, (_, i) => new Date(year, month, i + 1)),
    ];
  }, [year, month]);

  const canGoBack = new Date(year, month, 1) > today;

  return (
    <div className="select-none">
      <div className="flex items-center justify-between mb-3 pl-1">
        <h3 className="text-[17px] font-semibold tracking-[-0.01em] text-white">
          {view.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h3>
        <div className="flex items-center">
          <button
            type="button"
            aria-label="Previous month"
            disabled={!canGoBack}
            onClick={() => setView(new Date(year, month - 1, 1))}
            className="w-9 h-9 grid place-items-center rounded-full text-white/90 hover:bg-white/10 disabled:text-white/20 disabled:hover:bg-transparent transition-colors"
          >
            <Chevron dir="left" />
          </button>
          <button
            type="button"
            aria-label="Next month"
            onClick={() => setView(new Date(year, month + 1, 1))}
            className="w-9 h-9 grid place-items-center rounded-full text-white/90 hover:bg-white/10 transition-colors"
          >
            <Chevron dir="right" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((d) => (
          <div key={d} className="text-center text-[11px] font-semibold tracking-wide text-white/40">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-0.5">
        {cells.map((date, i) => {
          if (!date) return <div key={i} />;
          const selected = sameDay(date, selectedDate);
          const isToday = sameDay(date, today);
          const past = date < today || freeCount(date) === 0; // null (still loading) stays clickable
          return (
            <button
              key={i}
              type="button"
              disabled={past}
              onClick={() => onSelectDate?.(date)}
              className={`mx-auto w-10 h-10 grid place-items-center rounded-full text-[17px] tabular-nums transition-colors duration-150
                ${selected
                  ? 'bg-white text-black font-semibold'
                  : past
                    ? 'text-white/25 cursor-default'
                    : `text-white hover:bg-white/10 ${isToday ? 'font-semibold' : ''}`}`}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
