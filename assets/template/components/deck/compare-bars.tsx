"use client";

import { CountUp } from "./count-up";

// Meaning: "this is how much it shrinks (or grows)". Each row is one measure; the bars show the
// "before" values in red, and on `after` they slide to the new values and turn green.

export interface BarRow {
  label: string;
  before: number;
  after: number;
  unit?: string;
}

export function CompareBars({ rows, after, max }: { rows: BarRow[]; after: boolean; max?: number }) {
  const top = max ?? Math.max(...rows.flatMap((row) => [row.before, row.after]));
  return (
    <div className="bars" data-after={after || undefined}>
      {rows.map((row, i) => {
        const value = after ? row.after : row.before;
        return (
          <div key={row.label} className="bars__row reveal" style={{ "--i": i + 2 } as React.CSSProperties}>
            <span className="bars__label">{row.label}</span>
            <span className="bars__track">
              {/* The "before" value stays as a ghost so the audience sees the size of the change. */}
              <span className="bars__ghost" style={{ width: `${(row.before / top) * 100}%` }} />
              <span className="bars__fill" style={{ width: `${(value / top) * 100}%`, transitionDelay: `${i * 120}ms` }} />
            </span>
            <strong className="bars__value"><CountUp value={value} from={row.before} suffix={row.unit ? ` ${row.unit}` : ""} /></strong>
          </div>
        );
      })}
    </div>
  );
}
