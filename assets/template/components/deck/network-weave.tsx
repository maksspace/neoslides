"use client";

import { CountUp } from "./count-up";
import { seeded } from "./motion";

// Meaning: "everyone wired to everyone" → "one hub in the middle". With `hub` off, every pair of
// systems has its own tangled red link; with `hub` on, the tangle fades and each system gets one
// clean line to the centre. The link count ticks down with it.

const W = 640;
const H = 380;

export function NetworkWeave({ nodes, hub, hubLabel, linksLabel }: { nodes: string[]; hub: boolean; hubLabel: string; linksLabel: string }) {
  const points = nodes.map((_, i) => {
    const angle = (i / nodes.length) * Math.PI * 2 - Math.PI / 2;
    return { x: W / 2 + Math.cos(angle) * 250, y: H / 2 + Math.sin(angle) * 145 };
  });
  const pairs: [number, number][] = [];
  points.forEach((_, a) => points.forEach((__, b) => b > a && pairs.push([a, b])));

  return (
    <div className="weave" data-hub={hub || undefined}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={hub ? hubLabel : linksLabel}>
        {pairs.map(([a, b], i) => {
          const from = points[a];
          const to = points[b];
          // A bent control point makes the mesh look tangled rather than geometric.
          const cx = (from.x + to.x) / 2 + (seeded(i, 5) - 0.5) * 160;
          const cy = (from.y + to.y) / 2 + (seeded(i, 9) - 0.5) * 120;
          return <path key={`${a}-${b}`} className="weave__mesh" d={`M${from.x} ${from.y} Q${cx} ${cy} ${to.x} ${to.y}`} style={{ transitionDelay: `${i * 15}ms` }} />;
        })}
        {points.map((point, i) => (
          <line key={i} className="weave__spoke" x1={W / 2} y1={H / 2} x2={point.x} y2={point.y} pathLength={1} style={{ transitionDelay: `${400 + i * 90}ms` }} />
        ))}
        <g className="weave__hub">
          <circle cx={W / 2} cy={H / 2} r={34} />
          <text x={W / 2} y={H / 2 + 5}>{hubLabel}</text>
        </g>
        {points.map((point, i) => (
          <g key={nodes[i]} className="weave__node">
            <circle cx={point.x} cy={point.y} r={9} />
            <text x={point.x} y={point.y + (point.y > H / 2 ? 30 : -18)}>{nodes[i]}</text>
          </g>
        ))}
      </svg>
      <p className="weave__count"><CountUp value={hub ? nodes.length : pairs.length} from={pairs.length} duration={1200} /> {linksLabel}</p>
    </div>
  );
}
