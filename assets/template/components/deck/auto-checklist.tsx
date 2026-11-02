"use client";

import { useEffect, useState } from "react";
import { prefersReducedMotion } from "./motion";

// Meaning: "the system checks it for you". On `active` the items are checked one by one: a short
// spinner, then a green tick, or a red cross for an item marked `fail` (the rule catching a problem).

export interface CheckItem {
  label: string;
  fail?: boolean;
}

export function AutoChecklist({ items, active, verdict }: { items: CheckItem[]; active: boolean; verdict?: string }) {
  const [done, setDone] = useState(0);

  useEffect(() => {
    if (!active) return;
    const timers: number[] = [];
    const pace = prefersReducedMotion() ? 0 : 650;
    items.forEach((_, i) => timers.push(window.setTimeout(() => setDone(i + 1), 400 + i * pace)));
    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      setDone(0);
    };
  }, [active, items]);

  const failed = items.slice(0, done).some((item) => item.fail);
  return (
    <div className="checks">
      <ul>
        {items.map((item, i) => {
          const state = i < done ? (item.fail ? "fail" : "pass") : active && i === done ? "checking" : "idle";
          return (
            <li key={item.label} className="checks__item" data-state={state}>
              <span className="checks__mark" aria-hidden="true">
                {state === "pass" && <svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" pathLength={1} /></svg>}
                {state === "fail" && <svg viewBox="0 0 24 24"><path d="M7 7l10 10M17 7L7 17" pathLength={1} /></svg>}
              </span>
              {item.label}
            </li>
          );
        })}
      </ul>
      {verdict && <p className="checks__verdict" data-show={done === items.length || undefined} data-fail={failed || undefined}>{verdict}</p>}
    </div>
  );
}
