"use client";

import { useEffect, useRef, useState } from "react";

// Meaning: "today every step blocks you; with the product you go straight through".
// A parcel travels from the first step to the last. With `fast` off it runs into every red
// blocker, bounces back and waits; with `fast` on the blockers turn green and it flies through.

export interface PathStep {
  title: string;
  /** Why this step blocks today; empty for free steps (start and finish). */
  blocker: string;
  /** What the step becomes with the product. */
  fixed: string;
}

const pause = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

export function ParcelPath({ steps, fast, waitingLabel }: { steps: PathStep[]; fast: boolean; waitingLabel: string }) {
  const list = useRef<HTMLOListElement>(null);
  const parcel = useRef<HTMLSpanElement>(null);
  const [hit, setHit] = useState(-1);
  const [arrived, setArrived] = useState(false);
  const waiting = hit >= 0;

  useEffect(() => {
    let cancelled = false;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const travel = async () => {
      setHit(-1);
      setArrived(false);
      // Let the steps reveal before the parcel sets off.
      await pause(fast ? 350 : 1500);
      const element = parcel.current;
      const root = list.current;
      if (!element || !root || cancelled) return;
      const origin = root.getBoundingClientRect();
      const points = [...root.querySelectorAll<HTMLElement>("[data-node]")].map((node) => {
        const box = node.getBoundingClientRect();
        return { x: box.left - origin.left + box.width / 2, y: box.top - origin.top + box.height / 2 };
      });
      const at = (point: { x: number; y: number }, dx = 0) => `translate(${point.x + dx}px, ${point.y}px)`;
      element.getAnimations().forEach((animation) => animation.cancel());
      element.style.opacity = "1";

      if (reducedMotion) {
        element.style.transform = at(points[points.length - 1]);
        setArrived(true);
        return;
      }
      element.style.transform = at(points[0]);

      if (fast) {
        const frames = points.map((point, index) => ({ transform: at(point), offset: index / (points.length - 1) }));
        await element.animate(frames, { duration: 1300, easing: "cubic-bezier(.5, 0, .2, 1)", fill: "forwards" }).finished.catch(() => undefined);
        if (!cancelled) setArrived(true);
        return;
      }

      for (let index = 1; index < points.length; index += 1) {
        if (cancelled) return;
        const from = points[index - 1];
        const to = points[index];
        if (!steps[index].blocker) {
          await element.animate([{ transform: at(from) }, { transform: at(to) }], { duration: 450, easing: "ease-in-out", fill: "forwards" }).finished.catch(() => undefined);
          continue;
        }
        // Run into the blocker, bounce back and wait in front of it.
        const gap = to.x > from.x ? -30 : 30;
        await element.animate([{ transform: at(from) }, { transform: at(to, gap) }, { transform: at(to, gap * 1.8) }], { duration: 650, easing: "ease-in", fill: "forwards" }).finished.catch(() => undefined);
        if (cancelled) return;
        setHit(index);
        await pause(900);
        setHit(-1);
        if (cancelled) return;
        await element.animate([{ transform: at(to, gap * 1.8) }, { transform: at(to) }], { duration: 350, easing: "ease-out", fill: "forwards" }).finished.catch(() => undefined);
      }
      if (!cancelled) setArrived(true);
    };

    void travel();
    const element = parcel.current;
    return () => {
      cancelled = true;
      element?.getAnimations().forEach((animation) => animation.cancel());
    };
  }, [fast, steps]);

  return (
    <ol ref={list} className="path" data-clear={fast || undefined} style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}>
      {steps.map((step, i) => (
        <li
          key={step.title}
          className="path__step reveal"
          data-blocked={step.blocker ? true : undefined}
          data-hit={hit === i || undefined}
          data-arrived={(arrived && i === steps.length - 1) || undefined}
          style={{ "--i": i + 2, "--s": i } as React.CSSProperties}
        >
          <span className="path__node" data-node>{i === steps.length - 1 ? "🏁" : i + 1}</span>
          <strong>{step.title}</strong>
          {step.blocker && <small>{fast ? step.fixed : step.blocker}</small>}
        </li>
      ))}
      <span ref={parcel} className="parcel" data-fast={fast || undefined} data-waiting={waiting || undefined} aria-hidden="true">
        <span className="parcel__label">{waitingLabel}</span>
      </span>
    </ol>
  );
}
