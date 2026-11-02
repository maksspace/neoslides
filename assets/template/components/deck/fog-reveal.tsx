"use client";

import type { ReactNode } from "react";

// Meaning: "what nobody could see becomes visible". The content sits under a frosted fog with a
// question on it; on `clear` the fog sweeps away left to right and the content sharpens.

export function FogReveal({ clear, hiddenLabel, children }: { clear: boolean; hiddenLabel?: string; children: ReactNode }) {
  return (
    <div className="fog" data-clear={clear || undefined}>
      <div className="fog__content">{children}</div>
      <div className="fog__veil" aria-hidden="true" />
      {hiddenLabel && <span className="fog__label" aria-hidden={clear}>{hiddenLabel}</span>}
    </div>
  );
}
