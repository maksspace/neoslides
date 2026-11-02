"use client";

import type { ReactNode } from "react";

// Meaning: "the same thing, before and after". The "after" layer wipes over the "before" layer
// left to right behind a moving divider; both layers keep the same layout so the change is the story.

export function WipeCompare({ after, before, children, beforeLabel, afterLabel }: { after: boolean; before: ReactNode; children: ReactNode; beforeLabel?: string; afterLabel?: string }) {
  return (
    <div className="wipe" data-after={after || undefined}>
      <div className="wipe__layer wipe__before">{before}{beforeLabel && <span className="wipe__tag">{beforeLabel}</span>}</div>
      <div className="wipe__layer wipe__after">{children}{afterLabel && <span className="wipe__tag">{afterLabel}</span>}</div>
      <span className="wipe__divider" aria-hidden="true" />
    </div>
  );
}
