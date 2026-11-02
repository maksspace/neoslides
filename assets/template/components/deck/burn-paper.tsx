"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

// Meaning: "we are dropping the old way". Burns its content away like paper: a noisy front
// spreads from the lower right corner, chars the surface ahead of it, glows on the edge and
// sheds embers and smoke. Set `burning` to start; set it back to false to restore the content.

const CELL = 4;
const DURATION = 3400;
const CHAR = 0.07;
const GLOW = 0.035;
// The flame canvas reaches above the block so embers and smoke can rise.
const PAD = { x: 60, top: 220, bottom: 40 };

interface Particle { x: number; y: number; vx: number; vy: number; life: number; size: number; smoke: boolean }

// Smooth value noise, a few octaves, so the front is ragged rather than round.
const makeNoise = () => {
  const seed = Array.from({ length: 256 }, () => Math.random());
  const at = (x: number, y: number) => seed[((x * 73856093) ^ (y * 19349663)) & 255];
  const smooth = (t: number) => t * t * (3 - 2 * t);
  const layer = (x: number, y: number) => {
    const ix = Math.floor(x);
    const iy = Math.floor(y);
    const fx = smooth(x - ix);
    const fy = smooth(y - iy);
    const top = at(ix, iy) * (1 - fx) + at(ix + 1, iy) * fx;
    const bottom = at(ix, iy + 1) * (1 - fx) + at(ix + 1, iy + 1) * fx;
    return top * (1 - fy) + bottom * fy;
  };
  return (x: number, y: number) => layer(x / 9, y / 9) * 0.55 + layer(x / 4, y / 4) * 0.3 + layer(x / 1.6, y / 1.6) * 0.15;
};

export function BurnPaper({ burning, className, style, children }: { burning: boolean; className?: string; style?: React.CSSProperties; children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const fire = useRef<HTMLCanvasElement>(null);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const element = root.current;
    const flame = fire.current;
    const surface = content.current;
    if (!element || !flame || !surface) return;
    let frame = 0;

    const setMask = (url: string) => {
      const value = url ? `url(${url})` : "";
      surface.style.maskImage = value;
      surface.style.webkitMaskImage = value;
      surface.style.maskSize = url ? "100% 100%" : "";
      surface.style.webkitMaskSize = url ? "100% 100%" : "";
    };

    if (!burning) {
      setMask("");
      flame.getContext("2d")?.clearRect(0, 0, flame.width, flame.height);
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // No fire: the block simply fades out.
      frame = requestAnimationFrame(() => setGone(true));
      return () => {
        cancelAnimationFrame(frame);
        setGone(false);
      };
    }

    const noise = makeNoise();
    const width = element.clientWidth;
    const height = element.clientHeight;
    const columns = Math.ceil(width / CELL);
    const rows = Math.ceil(height / CELL);

    // When each cell catches fire, 0..1: distance from the lower right corner plus noise.
    const burnAt = new Float32Array(columns * rows);
    let latest = 0;
    for (let row = 0; row < rows; row += 1) {
      for (let column = 0; column < columns; column += 1) {
        const distance = Math.hypot(columns - column, (rows - row) * 1.15) / Math.hypot(columns, rows * 1.15);
        const value = distance * 0.72 + noise(column, row) * 0.38;
        burnAt[row * columns + column] = value;
        latest = Math.max(latest, value);
      }
    }
    for (let i = 0; i < burnAt.length; i += 1) burnAt[i] /= latest;

    const maskCanvas = document.createElement("canvas");
    maskCanvas.width = columns;
    maskCanvas.height = rows;
    const maskContext = maskCanvas.getContext("2d")!;
    const maskPixels = maskContext.createImageData(columns, rows);

    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    flame.width = (width + PAD.x * 2) * ratio;
    flame.height = (height + PAD.top + PAD.bottom) * ratio;
    const context = flame.getContext("2d")!;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);

    let particles: Particle[] = [];
    const start = performance.now();

    const step = (now: number) => {
      frame = requestAnimationFrame(step);
      // The front runs a little past 1 so the last edge glow can burn out.
      const front = ((now - start) / DURATION) * (1 + GLOW * 2);
      context.clearRect(0, 0, width + PAD.x * 2, height + PAD.top + PAD.bottom);
      context.save();
      context.translate(PAD.x, PAD.top);

      for (let row = 0; row < rows; row += 1) {
        for (let column = 0; column < columns; column += 1) {
          const index = row * columns + column;
          const lead = burnAt[index] - front;
          maskPixels.data[index * 4 + 3] = lead > 0 ? 255 : 0;
          const x = column * CELL;
          const y = row * CELL;
          if (lead > 0 && lead < CHAR) {
            // Scorch: the paper browns and blackens just ahead of the flame.
            const heat = 1 - lead / CHAR;
            context.fillStyle = `rgba(${40 + heat * 30}, ${18 + heat * 6}, 6, ${heat * 0.92})`;
            context.fillRect(x, y, CELL, CELL);
          } else if (lead <= 0 && lead > -GLOW) {
            // The burning edge itself.
            const heat = 1 + lead / GLOW;
            context.fillStyle = `rgba(255, ${120 + heat * 110}, ${40 + heat * 80}, ${heat})`;
            context.shadowColor = "#ff7a1a";
            context.shadowBlur = 14;
            context.fillRect(x - 1, y - 1, CELL + 2, CELL + 2);
            context.shadowBlur = 0;
            if (Math.random() < 0.03) particles.push({ x: x + CELL / 2, y, vx: (Math.random() - 0.5) * 0.8, vy: -0.6 - Math.random() * 1.6, life: 1, size: Math.random() * 2 + 0.8, smoke: false });
            if (Math.random() < 0.004) particles.push({ x: x + CELL / 2, y, vx: (Math.random() - 0.5) * 0.4, vy: -0.4 - Math.random() * 0.6, life: 1, size: 8 + Math.random() * 10, smoke: true });
          }
        }
      }

      for (const particle of particles) {
        particle.x += particle.vx + Math.sin((now + particle.y * 8) / 300) * 0.25;
        particle.y += particle.vy;
        particle.life -= particle.smoke ? 0.008 : 0.016;
        if (particle.smoke) {
          particle.size += 0.25;
          context.globalAlpha = Math.max(particle.life, 0) * 0.07;
          context.fillStyle = "#6b6f7a";
        } else {
          context.globalAlpha = Math.max(particle.life, 0);
          context.fillStyle = particle.life > 0.5 ? "#ffd27a" : "#ff6a1a";
        }
        context.beginPath();
        context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        context.fill();
      }
      context.globalAlpha = 1;
      particles = particles.filter((particle) => particle.life > 0);
      context.restore();

      maskContext.putImageData(maskPixels, 0, 0);
      setMask(maskCanvas.toDataURL());

      if (front > 1 + GLOW && !particles.length) {
        setGone(true);
        cancelAnimationFrame(frame);
      }
    };
    frame = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(frame);
      setGone(false);
    };
  }, [burning]);

  return (
    <div ref={root} className={`burn ${gone ? "burn--gone" : ""} ${className ?? ""}`} style={style}>
      <div ref={content} className="burn__content">{children}</div>
      <canvas ref={fire} className="burn__fire" aria-hidden="true" />
    </div>
  );
}
