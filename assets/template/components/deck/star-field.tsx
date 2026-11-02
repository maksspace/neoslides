"use client";

import { useEffect, useRef } from "react";

// Meaning: "everything starts here" (bang) and "everything comes together into one thing" (collapse).
// `effect` plays whenever `playKey` changes (the deck passes the scene id): "bang" explodes from the
// centre; "collapse" is the reverse, the whole sky spiralling into the element marked `data-collapse-target`.
// `hue` tints the stars and sparks to the theme's primary colour.

interface Particle { x: number; y: number; vx: number; vy: number; size: number; life: number; decay: number; hue: number; light: number }
interface Swirl { r: number; a: number; size: number; hue: number; delay: number; x: number; y: number }

// Phases of the bang, in ms from the trigger: stars fall in, then one flash and the shockwaves.
const IMPLODE_MS = 520;
const RINGS = [0, 140, 320];
const COLLAPSE_MS = 1350;
// Projector-safe: a single flash that fades over ~1 s, never a strobe, and capped below full white.
const FLASH_PEAK = 0.85;
const FLASH_MS = 1000;

export function StarField({ effect, playKey, hue = 215 }: { effect?: "bang" | "collapse"; playKey: string; hue?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engine = useRef<{ explode: () => void; gather: () => void } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let stars: Particle[] = [];
    let sparks: Particle[] = [];
    let swirl: Swirl[] = [];
    let orbiters: Swirl[] = [];
    let bangStart = -1;
    let collapseStart = -1;
    let gathered = false;
    let blasted = false;
    let frame = 0;
    let width = 0;
    let height = 0;
    let target = { x: 0, y: 0 };
    const ratio = () => Math.min(window.devicePixelRatio || 1, 2);

    const randomStar = (): Particle => ({ x: Math.random() * width, y: Math.random() * height, vx: (Math.random() - 0.5) * 0.06, vy: (Math.random() - 0.5) * 0.06, size: Math.random() * 1.3 + 0.2, life: Math.random(), decay: 0, hue, light: 85 });

    const resize = () => {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width * ratio();
      canvas.height = height * ratio();
      if (!stars.length) stars = Array.from({ length: 140 }, randomStar);
    };

    // Mostly the theme hue, some of its neighbour, a few hot golden sparks.
    const sparkHue = () => {
      const roll = Math.random();
      if (roll < 0.68) return hue - 20 + Math.random() * 40;
      if (roll < 0.9) return hue + 40 + Math.random() * 40;
      return 30 + Math.random() * 20;
    };

    const blast = () => {
      const reach = Math.hypot(width, height) / 2;
      const cx = width / 2;
      const cy = height / 2;
      // The collapsed stars are thrown out with the blast, then the sky is rebuilt.
      for (const star of stars) {
        const angle = Math.atan2(star.y - cy, star.x - cx) + (Math.random() - 0.5) * 0.4;
        const speed = (reach / 22) * (0.4 + Math.random() * 0.8);
        sparks.push({ ...star, x: cx, y: cy, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, size: star.size + 0.6, life: 1, decay: 0.004 + Math.random() * 0.004, light: 95 });
      }
      stars = [];
      for (let i = 0; i < 1500; i += 1) {
        const angle = Math.random() * Math.PI * 2;
        const speed = (Math.pow(Math.random(), 0.55) * reach) / 20 + 0.5;
        sparks.push({ x: cx, y: cy, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, size: Math.random() * 2.2 + 0.3, life: 1, decay: 0.004 + Math.random() * 0.009, hue: sparkHue(), light: 70 });
      }
    };

    const findTarget = () => {
      // Only a visible target counts: Next.js may keep hidden copies of earlier routes in the DOM.
      const element = [...document.querySelectorAll<HTMLElement>("[data-collapse-target]")].find((item) => item.offsetParent !== null);
      const box = element?.getBoundingClientRect();
      return box ? { x: box.left + box.width / 2, y: box.top + box.height / 2 } : { x: width / 2, y: height / 2 };
    };

    const explode = () => {
      if (reducedMotion) return;
      collapseStart = -1;
      bangStart = performance.now();
      blasted = false;
    };

    const gather = () => {
      if (reducedMotion) return;
      bangStart = -1;
      collapseStart = performance.now();
      gathered = false;
      target = findTarget();
      const reach = Math.hypot(width, height) / 2;
      // Every star, plus a cloud of dust, joins one spinning disc.
      const dust = Array.from({ length: 900 }, () => {
        const angle = Math.random() * Math.PI * 2;
        const radius = reach * (0.15 + Math.pow(Math.random(), 0.7) * 0.95);
        return { x: width / 2 + Math.cos(angle) * radius, y: height / 2 + Math.sin(angle) * radius, size: Math.random() * 1.6 + 0.3 };
      });
      const seeds = [...stars.map((star) => ({ x: star.x, y: star.y, size: star.size + 0.4 })), ...dust];
      swirl = seeds.map((seed) => ({ r: Math.hypot(seed.x - target.x, seed.y - target.y), a: Math.atan2(seed.y - target.y, seed.x - target.x), size: seed.size, hue: Math.random() < 0.7 ? hue - 15 + Math.random() * 30 : hue + 35 + Math.random() * 40, delay: Math.random() * 0.35, x: seed.x, y: seed.y }));
      stars = [];
      orbiters = [];
    };

    // The disc has collapsed: a ring of sparks, lingering glitter and dust orbiting the target.
    const release = () => {
      for (let i = 0; i < 700; i += 1) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 12 + Math.random() * 4;
        sparks.push({ x: target.x, y: target.y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed * 0.8, size: Math.random() * 1.6 + 0.5, life: 1, decay: 0.012 + Math.random() * 0.01, hue: sparkHue(), light: 75 });
      }
      for (let i = 0; i < 160; i += 1) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1 + Math.random() * 4;
        sparks.push({ x: target.x, y: target.y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, size: Math.random() * 1.4 + 0.4, life: 1, decay: 0.005 + Math.random() * 0.005, hue, light: 85 });
      }
      orbiters = Array.from({ length: 110 }, () => ({ r: 70 + Math.random() * 110, a: Math.random() * Math.PI * 2, size: Math.random() * 1.3 + 0.3, hue: hue - 15 + Math.random() * 60, delay: Math.random(), x: target.x, y: target.y }));
      swirl = [];
      gathered = true;
    };

    const drawCollapse = (context: CanvasRenderingContext2D, now: number) => {
      const elapsed = now - collapseStart;
      // The target mounts a moment after the collapse starts; drift onto it.
      const found = findTarget();
      target.x += (found.x - target.x) * 0.2;
      target.y += (found.y - target.y) * 0.2;
      context.globalCompositeOperation = "lighter";
      context.lineCap = "round";

      if (elapsed < COLLAPSE_MS) {
        const progress = elapsed / COLLAPSE_MS;
        for (const particle of swirl) {
          // Each particle streams in on its own schedule and spins faster as it falls.
          const local = Math.min(Math.max((progress - particle.delay) / (1 - particle.delay), 0), 1);
          particle.r *= 1 - (0.012 + Math.pow(local, 2) * 0.14);
          particle.a += 0.012 + 9 / (particle.r + 40);
          const flatten = 0.45 + (1 - local) * 0.55;
          const x = target.x + Math.cos(particle.a) * particle.r;
          const y = target.y + Math.sin(particle.a) * particle.r * flatten;
          context.globalAlpha = 0.35 + local * 0.65;
          context.strokeStyle = `hsl(${particle.hue} 100% ${70 + local * 25}%)`;
          context.lineWidth = particle.size;
          context.beginPath();
          context.moveTo(particle.x, particle.y);
          context.lineTo(x, y);
          context.stroke();
          particle.x = x;
          particle.y = y;
        }
        const core = context.createRadialGradient(target.x, target.y, 0, target.x, target.y, 8 + progress * 34);
        core.addColorStop(0, `rgba(255, 255, 255, ${progress * 0.9})`);
        core.addColorStop(0.5, `hsla(${hue}, 100%, 75%, ${progress * 0.35})`);
        core.addColorStop(1, `hsla(${hue}, 100%, 50%, 0)`);
        context.globalAlpha = 1;
        context.fillStyle = core;
        context.fillRect(0, 0, width, height);
        context.globalCompositeOperation = "source-over";
        return;
      }

      if (!gathered) release();
      const after = elapsed - COLLAPSE_MS;
      // Dust settles into a slow orbit around the target, then fades away.
      const fade = Math.min(after / 600, 1) * Math.max(0, 1 - Math.max(after - 3500, 0) / 2500);
      for (const dust of orbiters) {
        dust.a += 0.004 + 1.2 / (dust.r * 20);
        context.globalAlpha = fade * (0.35 + Math.abs(Math.sin(now / 600 + dust.delay * 6)) * 0.5);
        context.fillStyle = `hsl(${dust.hue} 100% 80%)`;
        context.beginPath();
        context.arc(target.x + Math.cos(dust.a) * dust.r * 1.6, target.y + Math.sin(dust.a) * dust.r * 0.55, dust.size, 0, Math.PI * 2);
        context.fill();
      }
      context.globalAlpha = 1;
      context.globalCompositeOperation = "source-over";
      if (after > 6000) collapseStart = -1;
    };

    const drawBang = (context: CanvasRenderingContext2D, now: number) => {
      const elapsed = now - bangStart;
      const cx = width / 2;
      const cy = height / 2;
      const reach = Math.hypot(width, height) / 2;

      if (elapsed < IMPLODE_MS) {
        // Gravity well: everything falls into a brightening point.
        const pull = elapsed / IMPLODE_MS;
        for (const star of stars) {
          star.x += (cx - star.x) * (0.04 + pull * 0.2);
          star.y += (cy - star.y) * (0.04 + pull * 0.2);
        }
        const core = context.createRadialGradient(cx, cy, 0, cx, cy, 20 + pull * 90);
        core.addColorStop(0, `rgba(255, 255, 255, ${0.4 + pull * 0.6})`);
        core.addColorStop(0.3, `hsla(${hue}, 100%, 78%, ${pull * 0.7})`);
        core.addColorStop(1, `hsla(${hue}, 100%, 50%, 0)`);
        context.fillStyle = core;
        context.fillRect(0, 0, width, height);
        return;
      }

      if (!blasted) {
        blast();
        blasted = true;
      }
      const after = elapsed - IMPLODE_MS;

      // Nebula: coloured clouds that expand and slowly fade into the background.
      const nebula = Math.max(0, 1 - after / 7000);
      if (nebula > 0) {
        const grow = Math.min(after / 1800, 1);
        [[-0.18, -0.1, hue], [0.2, 0.12, hue + 55], [0.05, -0.22, hue - 25], [-0.1, 0.2, hue + 85]].forEach(([ox, oy, tint], index) => {
          const x = cx + ox * width * grow;
          const y = cy + oy * height * grow;
          const radius = reach * (0.25 + grow * 0.45) * (1 + index * 0.08);
          const cloud = context.createRadialGradient(x, y, 0, x, y, radius);
          cloud.addColorStop(0, `hsla(${tint}, 90%, 60%, ${0.22 * nebula})`);
          cloud.addColorStop(1, `hsla(${tint}, 90%, 40%, 0)`);
          context.fillStyle = cloud;
          context.fillRect(0, 0, width, height);
        });
      }

      // Shockwaves.
      for (const delay of RINGS) {
        const t = (after - delay) / 1400;
        if (t <= 0 || t >= 1) continue;
        const radius = reach * 1.15 * (1 - Math.pow(1 - t, 3));
        context.globalAlpha = (1 - t) * 0.8;
        context.strokeStyle = delay ? `hsl(${hue} 100% 75%)` : "#ffffff";
        context.lineWidth = 2 + (1 - t) * 26;
        context.shadowColor = `hsl(${hue} 100% 60%)`;
        context.shadowBlur = 40;
        context.beginPath();
        context.arc(cx, cy, radius, 0, Math.PI * 2);
        context.stroke();
        context.shadowBlur = 0;
      }
      context.globalAlpha = 1;

      // One white-out flash.
      const flash = Math.max(0, 1 - after / FLASH_MS) * FLASH_PEAK;
      if (flash > 0) {
        const light = context.createRadialGradient(cx, cy, 0, cx, cy, reach * (0.3 + (1 - flash) * 1.4));
        light.addColorStop(0, `rgba(255, 255, 255, ${flash})`);
        light.addColorStop(0.35, `hsla(${hue}, 100%, 85%, ${flash * 0.85})`);
        light.addColorStop(1, `hsla(${hue}, 100%, 55%, ${flash * 0.25})`);
        context.fillStyle = light;
        context.fillRect(0, 0, width, height);
      }

      if (after > 9000) bangStart = -1;
    };

    const draw = (now: number) => {
      frame = requestAnimationFrame(draw);
      const context = canvas.getContext("2d");
      if (!context) return;
      context.setTransform(ratio(), 0, 0, ratio(), 0, 0);
      context.clearRect(0, 0, width, height);

      // Short camera shake right after the blast.
      const sinceBlast = bangStart >= 0 ? now - bangStart - IMPLODE_MS : -1;
      if (sinceBlast > 0 && sinceBlast < 700) {
        const strength = (1 - sinceBlast / 700) * 14;
        context.translate((Math.random() - 0.5) * strength, (Math.random() - 0.5) * strength);
      }

      for (const star of stars) {
        star.x = (star.x + star.vx + width) % width;
        star.y = (star.y + star.vy + height) % height;
        star.life += 0.004;
        context.globalAlpha = 0.25 + Math.abs(Math.sin(star.life * Math.PI)) * 0.55;
        context.fillStyle = `hsl(${hue} 80% 88%)`;
        context.fillRect(star.x, star.y, star.size, star.size);
      }

      if (bangStart >= 0) drawBang(context, now);
      if (collapseStart >= 0) drawCollapse(context, now);

      context.globalCompositeOperation = "lighter";
      context.lineCap = "round";
      for (const spark of sparks) {
        spark.x += spark.vx;
        spark.y += spark.vy;
        spark.vx *= 0.962;
        spark.vy *= 0.962;
        spark.life -= spark.decay;
        context.globalAlpha = Math.max(spark.life, 0);
        context.strokeStyle = `hsl(${spark.hue} 100% ${spark.light + spark.life * (100 - spark.light)}%)`;
        context.lineWidth = spark.size;
        // Fast sparks leave streaks.
        context.beginPath();
        context.moveTo(spark.x - spark.vx * 2.5, spark.y - spark.vy * 2.5);
        context.lineTo(spark.x, spark.y);
        context.stroke();
      }
      context.globalCompositeOperation = "source-over";

      // Slow sparks settle into the background as new stars, and the sky refills.
      for (const spark of sparks) {
        if (spark.life <= 0.35 && stars.length < 380 && Math.random() < 0.025) stars.push({ ...spark, vx: spark.vx * 0.05, vy: spark.vy * 0.05, size: Math.min(spark.size * 0.6, 1.5), hue });
      }
      if ((blasted || gathered) && stars.length < 140 && Math.random() < 0.3) stars.push(randomStar());
      sparks = sparks.filter((spark) => spark.life > 0);
      context.globalAlpha = 1;
    };

    resize();
    window.addEventListener("resize", resize);
    frame = requestAnimationFrame(draw);
    engine.current = { explode, gather };
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      engine.current = null;
    };
  }, [hue]);

  useEffect(() => {
    if (effect === "bang") engine.current?.explode();
    if (effect === "collapse") engine.current?.gather();
  }, [effect, playKey]);

  return <canvas ref={canvasRef} className="star-field" aria-hidden="true" />;
}
