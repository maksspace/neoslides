"use client";

// Meaning: "where we are, and what comes next". A line draws through the milestones up to
// `progress` (an index, usually the beat); passed ones fill in, the current one pulses.

export interface Milestone {
  when: string;
  title: string;
}

export function TimelineDraw({ milestones, progress }: { milestones: Milestone[]; progress: number }) {
  const last = milestones.length - 1;
  const fill = Math.max(0, Math.min(progress, last)) / Math.max(last, 1);
  return (
    <ol className="timeline" style={{ gridTemplateColumns: `repeat(${milestones.length}, minmax(0, 1fr))`, "--fill": fill } as React.CSSProperties}>
      <span className="timeline__track" aria-hidden="true"><span className="timeline__fill" /></span>
      {milestones.map((item, i) => (
        <li key={item.title} className="timeline__item reveal" data-state={i < progress ? "past" : i === progress ? "now" : "future"} style={{ "--i": i + 2, "--s": i } as React.CSSProperties}>
          <span className="timeline__dot" />
          <small>{item.when}</small>
          <strong>{item.title}</strong>
        </li>
      ))}
    </ol>
  );
}
