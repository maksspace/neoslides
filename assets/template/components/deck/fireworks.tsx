"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "./motion";

// Meaning: "we did it / it's live" — a celebration for a launch or a finale. On `active` a few
// rockets rise and burst in the theme's colours, then the sky goes quiet (no endless loop).
// Projector-safe: no screen flash, sparks only.

interface Spark { x: number; y: number; vx: number; vy: number; life: number; hue: number; trail?: boolean }

export function Fireworks({ active, hue = 215, bursts = 5 }: { active: boolean; hue?: number; bursts?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!active || prefersReducedMotion()) return;
    const canvas = canvasRef.current!;
    const context = canvas.getContext("2d")!;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      canvas.width = canvas.offsetWidth * ratio;
      canvas.height = canvas.offsetHeight * ratio;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };
    resize();
    const width = () => canvas.offsetWidth;
    const height = () => canvas.offsetHeight;
    let sparks: Spark[] = [];
    let frame = 0;
    const timers: number[] = [];
    const hues = [hue, hue + 40, hue - 40, 45, 150];

    const launch = (i: number) => {
      const x = width() * (0.2 + ((i * 0.37) % 0.6));
      const peak = height() * (0.18 + ((i * 0.23) % 0.25));
      const color = hues[i % hues.length];
      // The rocket: one bright spark rising with a trail, bursting at its peak.
      const rocket: Spark = { x, y: height(), vx: 0, vy: -Math.sqrt(2 * 0.12 * (height() - peak)), life: 1, hue: color, trail: true };
      sparks.push(rocket);
    };

    const burst = (x: number, y: number, color: number) => {
      for (let k = 0; k < 90; k += 1) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 4.5 + 1;
        sparks.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: 1, hue: color + (Math.random() - 0.5) * 30 });
      }
    };

    const draw = () => {
      context.globalCompositeOperation = "destination-out";
      context.fillStyle = "rgba(0, 0, 0, .22)";
      context.fillRect(0, 0, width(), height());
      context.globalCompositeOperation = "lighter";
      const next: Spark[] = [];
      for (const spark of sparks) {
        spark.vy += spark.trail ? 0.12 : 0.06;
        spark.vx *= 0.985;
        spark.vy *= spark.trail ? 1 : 0.985;
        spark.x += spark.vx;
        spark.y += spark.vy;
        if (spark.trail) {
          if (spark.vy >= 0) {
            burst(spark.x, spark.y, spark.hue);
            continue;
          }
        } else {
          spark.life -= 0.013;
        }
        if (spark.life <= 0) continue;
        context.fillStyle = `hsla(${spark.hue}, 90%, ${spark.trail ? 85 : 65}%, ${spark.life})`;
        context.beginPath();
        context.arc(spark.x, spark.y, spark.trail ? 2.4 : 1.8, 0, Math.PI * 2);
        context.fill();
        next.push(spark);
      }
      sparks = next;
      frame = requestAnimationFrame(draw);
    };

    for (let i = 0; i < bursts; i += 1) timers.push(window.setTimeout(() => launch(i), 200 + i * 520 + (i % 2) * 140));
    frame = requestAnimationFrame(draw);
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(frame);
      timers.forEach((timer) => window.clearTimeout(timer));
      window.removeEventListener("resize", resize);
      context.clearRect(0, 0, width(), height());
    };
  }, [active, hue, bursts]);

  return <canvas ref={canvasRef} className="fireworks" aria-hidden="true" />;
}
