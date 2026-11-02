"use client";

// Meaning: "we lose X on the way". Water pours into a bucket and jets out through labelled holes,
// so it never fills; on `fixed` the holes are plugged and the level rises.

export function LeakyBucket({ holes, fixed, inLabel }: { holes: string[]; fixed: boolean; inLabel: string }) {
  return (
    <div className="bucket" data-fixed={fixed || undefined}>
      <svg viewBox="0 0 520 340" role="img" aria-label={inLabel}>
        <defs>
          <clipPath id="bucket-inside"><path d="M150 90 L370 90 L345 310 L175 310 Z" /></clipPath>
        </defs>
        <text className="bucket__in-label" x={260} y={18}>{inLabel}</text>
        <line className="bucket__pour" x1={260} y1={28} x2={260} y2={200} />
        {/* Clip on a group, so the clip stays put while the water rect moves inside it. */}
        <g clipPath="url(#bucket-inside)"><rect className="bucket__water" x={140} width={240} y={0} height={340} /></g>
        <path className="bucket__body" d="M150 90 L370 90 L345 310 L175 310 Z" />
        {holes.map((hole, i) => {
          const side = i % 2 ? 1 : -1;
          const y = 270 - Math.floor(i / 2) * 60;
          const t = (y - 90) / 220;
          const x = side < 0 ? 150 + 25 * t : 370 - 25 * t;
          return (
            <g key={hole} className="bucket__hole">
              <path className="bucket__leak" d={`M${x} ${y} Q${x + side * 60} ${y - 6} ${x + side * 90} ${y + 60}`} />
              <circle className="bucket__plug" cx={x} cy={y} r={7} />
              <text className="bucket__label" x={x + side * 100} y={y + 84} textAnchor={side < 0 ? "end" : "start"}>{hole}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
