"use client";

// Meaning: "same task, two ways: one finishes long before the other". Lanes start together on
// `active`; each fills over its own duration and shows its finish time when it gets there.

export interface RaceLane {
  label: string;
  /** What the finish shows, e.g. "3 days". */
  time: string;
  /** Animation length in ms, proportional to the real difference where possible. */
  duration: number;
  tone?: "good" | "bad";
}

export function SplitRace({ lanes, active }: { lanes: RaceLane[]; active: boolean }) {
  return (
    <div className="race" data-active={active || undefined}>
      {lanes.map((lane, i) => (
        <div key={lane.label} className="race__lane reveal" data-tone={lane.tone} style={{ "--i": i + 2, "--d": `${lane.duration}ms` } as React.CSSProperties}>
          <span className="race__label">{lane.label}</span>
          <span className="race__track"><span className="race__fill" /><span className="race__runner" /></span>
          <strong className="race__time">{lane.time}</strong>
        </div>
      ))}
    </div>
  );
}
