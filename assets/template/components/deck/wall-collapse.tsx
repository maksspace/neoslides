"use client";

import { seeded } from "./motion";

// Meaning: "the wall between them is gone" (silos, departments, a hand-off). Two sides stand
// apart behind a brick wall; on `down` the bricks tumble to the floor and the sides move in and connect.

const COLS = 3;

export function WallCollapse({ left, right, bricks, down, joinLabel }: { left: string; right: string; bricks: string[]; down: boolean; joinLabel?: string }) {
  const rows = Math.ceil(bricks.length / COLS);
  return (
    <div className="wall" data-down={down || undefined}>
      <span className="wall__side wall__side--left">{left}</span>
      <div className="wall__bricks" style={{ gridTemplateRows: `repeat(${rows}, 34px)` }}>
        {bricks.map((brick, i) => {
          const row = Math.floor(i / COLS);
          const fromTop = row;
          const style = {
            "--dx": `${(seeded(i, 3) - 0.5) * 160}px`,
            "--dy": `${(rows - row) * 38 + 30 + seeded(i, 5) * 20}px`,
            "--rot": `${(seeded(i, 7) - 0.5) * 140}deg`,
            "--delay": `${fromTop * 70 + seeded(i, 9) * 160}ms`,
            gridColumn: row % 2 && i % COLS === 0 ? "1 / span 1" : undefined,
          } as React.CSSProperties;
          return <span key={brick + i} className="wall__brick" style={style}>{brick}</span>;
        })}
      </div>
      <span className="wall__side wall__side--right">{right}</span>
      {joinLabel && <span className="wall__join">{joinLabel}</span>}
    </div>
  );
}
