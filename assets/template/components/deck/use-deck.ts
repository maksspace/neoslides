"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Scene navigation for a deck. Each scene has a number of beats (reveals inside the scene);
 * "next" plays the beats before moving to the next scene. Keys cover presenter clickers:
 * →/PageDown/Space/Enter advance, ←/PageUp/Backspace go back, F toggles fullscreen, Esc exits.
 */
export const useDeck = (beats: number[], options: { startAtEnd?: boolean; onFinish: () => void; onBack?: () => void; onExit: () => void }) => {
  const last = beats.length - 1;
  const [position, setPosition] = useState(() => (options.startAtEnd ? { scene: last, beat: beats[last] - 1 } : { scene: 0, beat: 0 }));
  const latest = useRef({ position, beats, options });
  useEffect(() => {
    latest.current = { position, beats, options };
  });

  const next = useCallback(() => {
    const { position: { scene, beat }, beats: list, options: opts } = latest.current;
    if (beat < list[scene] - 1) setPosition({ scene, beat: beat + 1 });
    else if (scene < list.length - 1) setPosition({ scene: scene + 1, beat: 0 });
    else opts.onFinish();
  }, []);

  const previous = useCallback(() => {
    const { position: { scene, beat }, beats: list, options: opts } = latest.current;
    if (beat > 0) setPosition({ scene, beat: beat - 1 });
    else if (scene > 0) setPosition({ scene: scene - 1, beat: list[scene - 1] - 1 });
    else opts.onBack?.();
  }, []);

  const goTo = useCallback((scene: number) => setPosition({ scene, beat: 0 }), []);

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void document.documentElement.requestFullscreen?.();
  }, []);

  const exit = useCallback(() => {
    if (document.fullscreenElement) void document.exitFullscreen();
    latest.current.options.onExit();
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target instanceof Element ? event.target : null;
      if (target?.closest("input, textarea, select, [contenteditable='true']")) return;
      const key = event.key.toLowerCase();
      // Space and Enter on a focused button belong to the button.
      if ((key === " " || key === "enter") && target?.closest("button")) return;
      if (["arrowright", "pagedown", " ", "enter"].includes(key)) next();
      else if (["arrowleft", "pageup", "backspace"].includes(key)) previous();
      else if (key === "f") toggleFullscreen();
      else if (key === "escape" && !document.fullscreenElement) exit();
      else return;
      event.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, previous, toggleFullscreen, exit]);

  return { ...position, next, previous, goTo, toggleFullscreen, exit };
};
