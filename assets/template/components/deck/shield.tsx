"use client";

// Meaning: "it protects you". Threats fly at the thing that matters. Without the shield they hit
// it and it flinches red; with `active` a shield stands in front and every threat bounces off.

export function Shield({ core, threats, active, shieldLabel }: { core: string; threats: string[]; active: boolean; shieldLabel?: string }) {
  return (
    // Remount per state so the wave of threats replays on every beat.
    <div key={String(active)} className="shield" data-active={active || undefined} style={{ "--n": threats.length } as React.CSSProperties}>
      <span className="shield__core">{core}</span>
      <span className="shield__wall" aria-hidden={!active}>{shieldLabel}</span>
      {threats.map((threat, i) => (
        <span key={threat} className="shield__threat" style={{ "--y": `${(i - (threats.length - 1) / 2) * 52}px`, animationDelay: `${300 + i * 500}ms` } as React.CSSProperties}>{threat}</span>
      ))}
    </div>
  );
}
