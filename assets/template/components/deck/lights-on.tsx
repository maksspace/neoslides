"use client";

import { CountUp } from "./count-up";
import { seeded } from "./motion";

// Meaning: "it spreads": adoption across teams, offices, users. A dark skyline lights up window
// by window in a wave from the first building. `lit` is the share of windows on (0–1), so beats
// can grow it: a pilot, then a department, then everyone.

const BUILDINGS = 11;

export function LightsOn({ lit, countTotal, countLabel }: { lit: number; countTotal?: number; countLabel?: string }) {
  const towers = Array.from({ length: BUILDINGS }, (_, b) => ({ floors: 4 + Math.floor(seeded(b, 3) * 7), cols: 2 + Math.floor(seeded(b, 5) * 3) }));
  const windows = towers.flatMap((tower, b) => Array.from({ length: tower.floors * tower.cols }, (_, w) => ({ b, w })));
  // Order of lighting: outwards from the first building, with a little randomness.
  const order = windows.map((item, i) => ({ i, rank: item.b + seeded(i, 7) * 2.5 })).sort((a, z) => a.rank - z.rank);
  const rankOf = new Map(order.map((item, position) => [item.i, position]));
  const onCount = Math.round(lit * windows.length);
  let index = 0;

  return (
    <div className="city">
      <div className="city__skyline">
        {towers.map((tower, b) => (
          <div key={b} className="city__tower" style={{ gridTemplateColumns: `repeat(${tower.cols}, 1fr)`, paddingBottom: 8 }}>
            {Array.from({ length: tower.floors * tower.cols }, () => {
              const position = rankOf.get(index) ?? 0;
              index += 1;
              const on = position < onCount;
              return <span key={index} className="city__window" data-on={on || undefined} style={{ transitionDelay: on ? `${position * 14}ms` : "0ms" }} />;
            })}
          </div>
        ))}
      </div>
      {countLabel && countTotal !== undefined && <p className="city__count"><CountUp value={Math.round(lit * countTotal)} duration={1400} /> {countLabel}</p>}
    </div>
  );
}
