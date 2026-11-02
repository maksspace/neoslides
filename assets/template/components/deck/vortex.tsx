"use client";

import type { ReactNode } from "react";
import { seeded } from "./motion";

// Meaning: "all of these get swallowed by one thing" (tabs, spreadsheets, chats → one product).
// The items float scattered; on `active` they spiral into the centre and the product (children)
// is born from the point they vanished into. Works on any stage, unlike the sky collapse.

export function Vortex({ items, active, children }: { items: string[]; active: boolean; children: ReactNode }) {
  return (
    <div className="vortex" data-active={active || undefined}>
      {items.map((item, i) => {
        const angle = (i / items.length) * 360 + seeded(i, 3) * 30;
        const radius = 150 + seeded(i, 5) * 80;
        const style = { "--a": `${angle}deg`, "--r": `${radius}px`, "--delay": `${seeded(i, 7) * 500}ms`, "--f": `${seeded(i, 9) * 3}s` } as React.CSSProperties;
        return <span key={item} className="vortex__item" style={style}><span>{item}</span></span>;
      })}
      <span className="vortex__core" aria-hidden="true" />
      <div className="vortex__result">{children}</div>
    </div>
  );
}
