"use client";

// Meaning: "this side outweighs that one" — a trade-off. Each item is one weight; the beam tilts
// towards the heavier pan. Show the costs first, then `showRight` drops the benefits in and the
// beam swings.

export interface ScaleSide {
  label: string;
  items: string[];
}

const W = 560;
const PIVOT = { x: W / 2, y: 70 };
const ARM = 200;

export function BalanceScale({ left, right, showRight }: { left: ScaleSide; right: ScaleSide; showRight: boolean }) {
  const weight = (showRight ? right.items.length : 0) - left.items.length;
  const angle = Math.max(-14, Math.min(14, weight * 4));
  const rad = (angle * Math.PI) / 180;
  const end = (side: -1 | 1) => ({ x: PIVOT.x + side * ARM * Math.cos(rad), y: PIVOT.y + side * ARM * Math.sin(rad) });

  const pan = (side: ScaleSide, at: { x: number; y: number }, visible: boolean, key: string) => (
    <div key={key} className="scale__pan" style={{ transform: `translate(${at.x}px, ${at.y}px)` }}>
      <span className="scale__string" />
      <div className="scale__load">
        {side.items.map((item, i) => (
          <span key={item} className="scale__weight" data-in={visible || undefined} style={{ transitionDelay: `${i * 140}ms` }}>{item}</span>
        ))}
      </div>
      <span className="scale__dish" />
      <strong className="scale__label">{side.label}</strong>
    </div>
  );

  return (
    <div className="scale" style={{ width: W }}>
      <span className="scale__post" style={{ left: PIVOT.x }} />
      <span className="scale__beam" style={{ left: PIVOT.x - ARM, top: PIVOT.y, width: ARM * 2, transform: `rotate(${angle}deg)` }} />
      <span className="scale__pivot" style={{ left: PIVOT.x, top: PIVOT.y }} />
      {pan(left, end(-1), true, "left")}
      {pan(right, end(1), showRight, "right")}
    </div>
  );
}
