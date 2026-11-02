"use client";

import { useEffect, useState } from "react";
import { prefersReducedMotion } from "./motion";

// Meaning: "each step turns it into something better". An item rides through the stations;
// at each one it changes (its label becomes `states[i]`) and the station lights up.

export function Pipeline({ stations, states, active, pace = 1000 }: { stations: string[]; states: string[]; active: boolean; pace?: number }) {
  const [step, setStep] = useState(-1);

  useEffect(() => {
    if (!active) return;
    const timers: number[] = [];
    const wait = prefersReducedMotion() ? 0 : pace;
    stations.forEach((_, i) => timers.push(window.setTimeout(() => setStep(i), 300 + i * wait)));
    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      setStep(-1);
    };
  }, [active, stations, pace]);

  const at = Math.max(step, 0);
  return (
    <div className="pipe" style={{ "--n": stations.length } as React.CSSProperties}>
      <div className="pipe__belt" />
      {stations.map((station, i) => (
        <div key={station} className="pipe__station" data-done={i <= step || undefined} style={{ left: `${((i + 0.5) / stations.length) * 100}%` }}>
          <span className="pipe__gate" />
          <small>{station}</small>
        </div>
      ))}
      <span className="pipe__item" data-moving={step >= 0 || undefined} style={{ left: `${((at + 0.5) / stations.length) * 100}%` }}>
        <span key={at} className="pipe__label">{step < 0 ? states[0] : states[at]}</span>
      </span>
    </div>
  );
}
