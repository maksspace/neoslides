"use client";

// Meaning: "N out of every M" — a share made countable. `total` dots; on `active` the first
// `highlight` light up one by one, so "3 of 10" reads as people, not as a percentage.

export function DotMatrix({ total = 100, highlight, active, columns = 20, tone = "accent" }: { total?: number; highlight: number; active: boolean; columns?: number; tone?: "accent" | "good" | "bad" }) {
  const step = Math.min(40, 1400 / Math.max(highlight, 1));
  return (
    <div className="dots" data-active={active || undefined} data-tone={tone} style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className="dots__dot" data-on={i < highlight || undefined} style={{ transitionDelay: i < highlight ? `${i * step}ms` : "0ms" }} />
      ))}
    </div>
  );
}
