"use client";

import { CountUp } from "./count-up";

// Meaning: "the trend": a line draws itself left to right and ends on the number that matters.
// Optional `baseline` points draw first as a dashed grey line ("without us") for contrast.

const W = 640;
const H = 260;
const PAD = 16;

const toPath = (values: number[], max: number) =>
  values.map((value, i) => `${i ? "L" : "M"}${PAD + (i / (values.length - 1)) * (W - PAD * 2)} ${H - PAD - (value / max) * (H - PAD * 2)}`).join(" ");

export function GrowthLine({ points, baseline, labels, active, suffix = "" }: { points: number[]; baseline?: number[]; labels?: string[]; active: boolean; suffix?: string }) {
  const max = Math.max(...points, ...(baseline ?? [])) * 1.1;
  const line = toPath(points, max);
  const last = points[points.length - 1];
  const end = { x: W - PAD, y: H - PAD - (last / max) * (H - PAD * 2) };
  return (
    <div className="growth" data-active={active || undefined}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={labels?.join(", ")}>
        {[0.25, 0.5, 0.75].map((y) => <line key={y} className="growth__grid" x1={PAD} x2={W - PAD} y1={PAD + y * (H - PAD * 2)} y2={PAD + y * (H - PAD * 2)} />)}
        {baseline && <path className="growth__baseline" d={toPath(baseline, max)} pathLength={1} />}
        <path className="growth__area" d={`${line} L${W - PAD} ${H - PAD} L${PAD} ${H - PAD} Z`} />
        <path className="growth__line" d={line} pathLength={1} />
        <circle className="growth__end" cx={end.x} cy={end.y} r={7} />
      </svg>
      <strong className="growth__value" style={{ top: `${(end.y / H) * 100}%` }}><CountUp value={active ? last : points[0]} from={points[0]} duration={1800} suffix={suffix} /></strong>
      {labels && <div className="growth__labels">{labels.map((label) => <span key={label}>{label}</span>)}</div>}
    </div>
  );
}
