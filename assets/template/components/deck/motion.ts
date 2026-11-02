// Small helpers shared by the deck effects.

export const prefersReducedMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Deterministic pseudo-random number in [0, 1) for index `i`, so layouts match on every render. */
export const seeded = (i: number, salt = 1) => {
  const x = Math.sin((i + 1) * 12.9898 * salt + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
};
