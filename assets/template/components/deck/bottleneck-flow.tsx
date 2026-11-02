"use client";

import { useEffect, useRef } from "react";

// Meaning: "one narrow place slows everyone down", then "we removed it".
// Requests flow left to right through one neck. While it is closed they pile up in a queue
// and turn red; when `open` flips, the neck widens and the queue flushes through.

export interface FlowLabels {
  from: string;
  neck: string;
  neckOpen: string;
  to: string;
  queue: string;
}

interface Dot { x: number; y: number; state: "approach" | "queued" | "through"; targetY: number; hue: number; alpha: number }

const SPACING = 11;
const GOOD = "60, 207, 142";
const BAD = "255, 107, 107";

export function BottleneckFlow({ open, labels, hue = 215, className, style }: { open: boolean; labels: FlowLabels; hue?: number; className?: string; style?: React.CSSProperties }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const openRef = useRef(open);
  useEffect(() => {
    openRef.current = open;
  }, [open]);

  useEffect(() => {
    const canvas = canvasRef.current!;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let dots: Dot[] = [];
    let frame = 0;
    let width = 0;
    let height = 0;
    let gap = 14;
    let lastSpawn = 0;
    let lastRelease = 0;

    const neckX = () => width * 0.56;
    // Half-height of the funnel at x: wide at the edges, `gap` at the neck.
    const halfAt = (x: number) => {
      const distance = Math.min(Math.abs(x - neckX()) / (x < neckX() ? neckX() : width - neckX()), 1);
      const curve = distance * distance * (3 - 2 * distance);
      return gap / 2 + (height / 2 - 8 - gap / 2) * curve;
    };

    // Queue slots are packed in columns in front of the neck, as wide as the funnel allows.
    const slot = (index: number) => {
      let column = 0;
      let left = index;
      while (column < 60) {
        const x = neckX() - 16 - column * SPACING;
        const capacity = Math.max(1, Math.floor((halfAt(x) * 2 - 6) / SPACING));
        if (left < capacity) return { x, y: height / 2 + (left - (capacity - 1) / 2) * SPACING };
        left -= capacity;
        column += 1;
      }
      return { x: 0, y: height / 2 };
    };

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      canvas.getContext("2d")?.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const drawWalls = (context: CanvasRenderingContext2D, isOpen: boolean) => {
      const color = isOpen ? GOOD : BAD;
      for (const side of [-1, 1]) {
        context.beginPath();
        for (let x = 0; x <= width; x += 6) {
          const y = height / 2 + side * halfAt(x);
          if (x === 0) context.moveTo(x, y);
          else context.lineTo(x, y);
        }
        const gradient = context.createLinearGradient(0, 0, width, 0);
        gradient.addColorStop(0, "rgba(255, 255, 255, .06)");
        gradient.addColorStop(0.56, `rgba(${color}, .9)`);
        gradient.addColorStop(1, "rgba(255, 255, 255, .06)");
        context.strokeStyle = gradient;
        context.lineWidth = 2;
        context.shadowColor = `rgba(${color}, .8)`;
        context.shadowBlur = 12;
        context.stroke();
        context.shadowBlur = 0;
      }
    };

    const step = (now: number) => {
      frame = requestAnimationFrame(step);
      const context = canvas.getContext("2d");
      if (!context || !width) return;
      const isOpen = openRef.current;
      context.clearRect(0, 0, width, height);

      // The neck eases open or shut.
      gap += ((isOpen ? height * 0.78 : 14) - gap) * 0.06;
      drawWalls(context, isOpen);

      const queued = dots.filter((dot) => dot.state === "queued");
      if (now - lastSpawn > (isOpen ? 90 : 150) && queued.length < 140) {
        lastSpawn = now;
        const y = 14 + Math.random() * (height - 28);
        dots.push({ x: -6, y, state: "approach", targetY: y, hue: hue - 15 + Math.random() * 30, alpha: 1 });
      }
      // Closed: one request gets through now and then. Open: everything flows.
      if (queued.length && now - lastRelease > (isOpen ? 25 : 950)) {
        lastRelease = now;
        queued[0].state = "through";
        queued[0].targetY = height / 2 + (Math.random() - 0.5) * (height - 40);
      }

      let index = 0;
      for (const dot of dots) {
        const half = halfAt(dot.x) - 5;
        const clamp = (y: number) => Math.max(height / 2 - half, Math.min(height / 2 + half, y));
        if (dot.state === "approach") {
          dot.x += isOpen ? 4.2 : 2.6;
          dot.y += (clamp(dot.targetY) - dot.y) * 0.08;
          if (!isOpen && dot.x >= slot(queued.length).x) dot.state = "queued";
          else if (isOpen && dot.x >= neckX() - 20) dot.state = "through";
        } else if (dot.state === "queued") {
          const place = slot(index);
          index += 1;
          dot.x += (place.x - dot.x) * 0.18;
          dot.y += (place.y - dot.y) * 0.18;
        } else {
          dot.x += isOpen ? 5 : 3.2;
          dot.y += (clamp(dot.x < neckX() + 30 ? height / 2 : dot.targetY) - dot.y) * 0.1;
          if (dot.x > width * 0.85) dot.alpha -= 0.05;
        }

        // Waiting requests heat up from the theme colour to red.
        const colour = dot.state === "through" ? (isOpen ? "#5ff0a8" : `hsl(${hue} 100% 80%)`) : dot.state === "queued" ? `hsl(${5 + Math.random() * 6} 95% 64%)` : `hsl(${dot.hue} 100% 70%)`;
        context.globalAlpha = Math.max(dot.alpha, 0);
        context.fillStyle = colour;
        context.shadowColor = colour;
        context.shadowBlur = 8;
        context.beginPath();
        context.arc(dot.x, dot.y, 3.4, 0, Math.PI * 2);
        context.fill();
      }
      context.shadowBlur = 0;
      context.globalAlpha = 1;
      dots = dots.filter((dot) => dot.alpha > 0 && dot.x < width + 10);

      // Queue counter under the neck.
      const waiting = dots.filter((dot) => dot.state === "queued").length;
      if (waiting) {
        context.fillStyle = isOpen ? "#8ee8bd" : "#ff9d9d";
        context.font = "600 13px system-ui, sans-serif";
        context.textAlign = "right";
        context.fillText(`${labels.queue}: ${waiting}`, neckX() - 16, height - 6);
      }
    };

    resize();
    window.addEventListener("resize", resize);
    frame = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
    };
  }, [hue, labels.queue]);

  return (
    <div className={`flow ${className ?? ""}`} style={style}>
      <canvas ref={canvasRef} className="flow__canvas" aria-hidden="true" />
      <span className="flow__label flow__label--from">{labels.from}</span>
      <span className="flow__label flow__label--neck" data-open={open || undefined}>{open ? labels.neckOpen : labels.neck}</span>
      <span className="flow__label flow__label--to">{labels.to}</span>
    </div>
  );
}
