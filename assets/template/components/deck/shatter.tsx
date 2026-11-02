"use client";

import type { ReactNode } from "react";
import { seeded } from "./motion";

// Meaning: "we are breaking it" (the old process, the wall between teams, the status quo).
// On `shattered` cracks run out from the impact point, then the block bursts into glass shards
// that fly outwards and fall. Works on any block: a card, a screenshot, a chat.

const COLS = 5;
const ROWS = 4;

// A jittered grid of points; each cell becomes two triangular shards.
const point = (c: number, r: number) => {
  const edge = c === 0 || r === 0 || c === COLS || r === ROWS;
  const jitter = (salt: number) => (edge ? 0 : (seeded(c * 31 + r * 7, salt) - 0.5) * 0.7);
  return { x: ((c + jitter(3)) / COLS) * 100, y: ((r + jitter(5)) / ROWS) * 100 };
};

const shards = (() => {
  const list: { x: number; y: number }[][] = [];
  for (let r = 0; r < ROWS; r += 1) {
    for (let c = 0; c < COLS; c += 1) {
      const a = point(c, r);
      const b = point(c + 1, r);
      const d = point(c, r + 1);
      const e = point(c + 1, r + 1);
      list.push([a, b, e], [a, e, d]);
    }
  }
  return list;
})();

export function Shatter({ shattered, children, impact = { x: 50, y: 45 } }: { shattered: boolean; children: ReactNode; impact?: { x: number; y: number } }) {
  return (
    <div className="shatter" data-shattered={shattered || undefined}>
      <div className="shatter__whole">{children}</div>
      {shattered && (
        <>
          <svg className="shatter__cracks" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            {shards.filter((_, i) => i % 3 === 0).map((shard, i) => (
              <path key={i} d={`M${impact.x} ${impact.y} L${shard[1].x} ${shard[1].y} L${shard[2].x} ${shard[2].y}`} pathLength={1} />
            ))}
          </svg>
          {shards.map((shard, i) => {
            const cx = (shard[0].x + shard[1].x + shard[2].x) / 3;
            const cy = (shard[0].y + shard[1].y + shard[2].y) / 3;
            const angle = Math.atan2(cy - impact.y, cx - impact.x);
            const force = 120 + seeded(i, 13) * 260;
            const style = {
              clipPath: `polygon(${shard.map((p) => `${p.x}% ${p.y}%`).join(", ")})`,
              transformOrigin: `${cx}% ${cy}%`,
              "--dx": `${Math.cos(angle) * force}px`,
              "--dy": `${Math.sin(angle) * force * 0.6 - 60}px`,
              "--fall": `${380 + seeded(i, 17) * 260}px`,
              "--rot": `${(seeded(i, 19) - 0.5) * 540}deg`,
              "--delay": `${350 + Math.hypot(cx - impact.x, cy - impact.y) * 4}ms`,
            } as React.CSSProperties;
            return <div key={i} className="shatter__shard" style={style} aria-hidden="true">{children}</div>;
          })}
        </>
      )}
    </div>
  );
}
