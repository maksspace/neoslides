"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { prefersReducedMotion } from "./motion";

// Meaning: "watch how short the flow is" — a cursor clicks through a mock screen on its own.
// Deck scenes only: the live tour shows the real prototype. Children render per step, and every
// element the cursor visits carries `data-ghost="<key>"`. The `tag` stays on screen so nobody
// mistakes the illustration for a live system.

const pause = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

export function GhostCursor({ targets, active, tag, children }: { targets: string[]; active: boolean; tag: string; children: (step: number) => ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const cursor = useRef<HTMLSpanElement>(null);
  const [step, setStep] = useState(0);
  const [click, setClick] = useState<{ x: number; y: number; n: number } | null>(null);

  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    const element = cursor.current;
    const run = async () => {
      await pause(500);
      for (let i = 0; i < targets.length; i += 1) {
        const box = root.current?.querySelector<HTMLElement>(`[data-ghost="${targets[i]}"]`);
        if (cancelled || !box || !element || !root.current) return;
        const origin = root.current.getBoundingClientRect();
        const rect = box.getBoundingClientRect();
        const x = rect.left - origin.left + rect.width / 2;
        const y = rect.top - origin.top + rect.height / 2;
        const from = element.style.transform || "translate(20px, 20px)";
        const to = `translate(${x}px, ${y}px)`;
        if (!prefersReducedMotion()) await element.animate([{ transform: from }, { transform: to }], { duration: 750, easing: "cubic-bezier(.5, 0, .2, 1)", fill: "forwards" }).finished.catch(() => undefined);
        if (cancelled) return;
        element.style.transform = to;
        setClick({ x, y, n: i });
        await pause(250);
        if (cancelled) return;
        setStep(i + 1);
        await pause(700);
      }
    };
    void run();
    return () => {
      cancelled = true;
      element?.getAnimations().forEach((animation) => animation.cancel());
      if (element) element.style.transform = "";
      setStep(0);
      setClick(null);
    };
  }, [active, targets]);

  return (
    <div ref={root} className="ghost">
      {children(step)}
      {click && <span key={click.n} className="ghost__ripple" style={{ left: click.x, top: click.y }} />}
      <span ref={cursor} className="ghost__cursor" aria-hidden="true">
        <svg viewBox="0 0 24 24"><path d="M4 3l7 18 2.5-7.5L21 11z" /></svg>
      </span>
      <span className="ghost__tag">{tag}</span>
    </div>
  );
}
