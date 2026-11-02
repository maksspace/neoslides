"use client";

import type { ReactNode } from "react";
import { CountUp } from "./count-up";

// Meaning: "it isn't one case — it's thousands". The scene starts on one big card (the story);
// on `out` it shrinks into a single cell of a grid that fills with copies around it.

export function ZoomOut({ out, columns = 15, rows = 7, countLabel, children }: { out: boolean; columns?: number; rows?: number; countLabel?: string; children: ReactNode }) {
  const total = columns * rows;
  const centre = { c: (columns - 1) / 2, r: (rows - 1) / 2 };
  return (
    <div className="zoom" data-out={out || undefined}>
      <div className="zoom__grid" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: total }, (_, i) => {
          const c = i % columns;
          const r = Math.floor(i / columns);
          const hero = c === Math.round(centre.c) && r === Math.round(centre.r);
          // Copies pop in as a ripple from the centre outwards.
          const distance = Math.hypot(c - centre.c, (r - centre.r) * 1.6);
          return <span key={i} className="zoom__cell" data-hero={hero || undefined} style={{ transitionDelay: out ? `${500 + distance * 70}ms` : "0ms" }} />;
        })}
      </div>
      <div className="zoom__hero">{children}</div>
      {countLabel && <p className="zoom__count"><CountUp value={out ? total : 1} from={1} duration={1600} /> {countLabel}</p>}
    </div>
  );
}
