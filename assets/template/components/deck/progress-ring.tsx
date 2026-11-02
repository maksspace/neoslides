"use client";

import { CountUp } from "./count-up";

// Meaning: "how far we are toward the goal". A ring fills to `value` percent with the number in the middle.

export function ProgressRing({ value, active, label, size = 260 }: { value: number; active: boolean; label?: string; size?: number }) {
  const shown = active ? value : 0;
  return (
    <div className="progress-ring" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" aria-hidden="true">
        <circle className="progress-ring__track" cx={50} cy={50} r={44} />
        <circle className="progress-ring__fill" cx={50} cy={50} r={44} pathLength={100} style={{ strokeDashoffset: 100 - shown }} />
      </svg>
      <div className="progress-ring__text">
        <strong><CountUp value={shown} duration={1600} suffix="%" /></strong>
        {label && <small>{label}</small>}
      </div>
    </div>
  );
}
