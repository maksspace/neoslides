"use client";

import type { ReactNode } from "react";
import { seeded } from "./motion";

// Meaning: "it simply stops existing" (a quieter goodbye than burning). On `gone` the block
// crumbles into dust from left to right and drifts away on the wind.

const COLS = 14;
const ROWS = 9;

export function DustAway({ gone, children }: { gone: boolean; children: ReactNode }) {
  return (
    <div className="dust" data-gone={gone || undefined}>
      <div className="dust__whole">{children}</div>
      {gone && Array.from({ length: COLS * ROWS }, (_, i) => {
        const c = i % COLS;
        const r = Math.floor(i / COLS);
        const style = {
          clipPath: `inset(${(r / ROWS) * 100}% ${100 - ((c + 1) / COLS) * 100}% ${100 - ((r + 1) / ROWS) * 100}% ${(c / COLS) * 100}%)`,
          "--dx": `${80 + seeded(i, 3) * 220}px`,
          "--dy": `${-40 - seeded(i, 5) * 160}px`,
          "--rot": `${(seeded(i, 7) - 0.5) * 120}deg`,
          "--delay": `${200 + c * 90 + seeded(i, 11) * 260}ms`,
        } as React.CSSProperties;
        return <div key={i} className="dust__grain" style={style} aria-hidden="true">{children}</div>;
      })}
    </div>
  );
}
