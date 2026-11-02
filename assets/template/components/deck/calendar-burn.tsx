"use client";

import { CountUp } from "./count-up";

// Meaning: "this is how long people wait". Calendar days get crossed out one by one, weekends
// included, while the count of lost days ticks up.

export function CalendarBurn({ days = 28, crossed, active, weekdays, countLabel, startDay = 0 }: { days?: number; crossed: number; active: boolean; weekdays: string[]; countLabel: string; startDay?: number }) {
  const step = Math.min(120, 2200 / Math.max(crossed, 1));
  return (
    <div className="calendar" data-active={active || undefined}>
      <div className="calendar__grid">
        {weekdays.map((day) => <span key={day} className="calendar__head">{day}</span>)}
        {Array.from({ length: startDay }, (_, i) => <span key={`pad-${i}`} />)}
        {Array.from({ length: days }, (_, i) => (
          <span key={i} className="calendar__day" data-weekend={(i + startDay) % 7 >= 5 || undefined} data-cross={i < crossed || undefined} style={{ "--d": `${i * step}ms` } as React.CSSProperties}>
            {i + 1}
          </span>
        ))}
      </div>
      <p className="calendar__count"><CountUp value={active ? crossed : 0} duration={crossed * step} /> {countLabel}</p>
    </div>
  );
}
