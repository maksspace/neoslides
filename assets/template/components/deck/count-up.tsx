"use client";

import { useEffect, useRef, useState } from "react";
import { product } from "@/lib/story";
import { prefersReducedMotion } from "./motion";

// Meaning: "the number itself is the point". Ticks from the previous value to `value`
// (from `from` on mount), so a beat that changes the value replays the count.

interface CountUpProps {
  value: number;
  from?: number;
  /** Milliseconds for the whole count. */
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export function CountUp({ value, from = 0, duration = 1400, decimals = 0, prefix = "", suffix = "", className }: CountUpProps) {
  const [shown, setShown] = useState(from);
  const current = useRef(from);

  useEffect(() => {
    const start = current.current;
    let frame = 0;
    let began = 0;
    const tick = (now: number) => {
      if (!began) began = now;
      const t = prefersReducedMotion() ? 1 : Math.min((now - began) / duration, 1);
      // Ease out: fast at first, settling on the final number.
      const next = start + (value - start) * (1 - Math.pow(1 - t, 3));
      current.current = next;
      setShown(next);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, duration]);

  const format = new Intl.NumberFormat(product.lang, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  return <span className={`count-up ${className ?? ""}`}>{prefix}{format.format(shown)}{suffix}</span>;
}
