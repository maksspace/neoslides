"use client";

import type { ReactNode } from "react";

// Meaning: "sent — instantly, no more chasing". On `sent` the document folds away into a paper
// plane that flies off along a curve, leaving a dotted trail, and the `deliveredLabel` pops at the end.

export function PaperPlane({ sent, deliveredLabel, children }: { sent: boolean; deliveredLabel: string; children: ReactNode }) {
  return (
    <div className="plane" data-sent={sent || undefined}>
      <div className="plane__doc">{children}</div>
      <svg className="plane__trail" viewBox="0 0 600 300" preserveAspectRatio="none" aria-hidden="true">
        <path d="M150 220 C 260 260, 330 120, 430 110 S 560 40, 590 20" pathLength={1} />
      </svg>
      <span className="plane__craft" aria-hidden="true">
        <svg viewBox="0 0 48 48"><path d="M4 22 L44 6 L30 42 L24 28 Z" /><path d="M24 28 L44 6" /></svg>
      </span>
      <span className="plane__done">{deliveredLabel}</span>
    </div>
  );
}
