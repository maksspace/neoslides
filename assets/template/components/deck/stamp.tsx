"use client";

import type { ReactNode } from "react";

// Meaning: "a hard stop" (rejected, waiting, archived) or a decisive verdict (approved). On
// `active` a rubber stamp slams onto the document and the page jolts.

export function Stamp({ text, active, tone = "bad", children }: { text: string; active: boolean; tone?: "bad" | "good" | "ink"; children: ReactNode }) {
  return (
    <div className="stamp" data-active={active || undefined} data-tone={tone}>
      <div className="stamp__page">{children}</div>
      <span className="stamp__mark" aria-hidden={!active}>{text}</span>
    </div>
  );
}
