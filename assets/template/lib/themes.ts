// Ready-made looks. Each id matches an `html[data-theme="…"]` block in app/themes.css.
// These are starting points; a style copied from the person's reference becomes a new entry.
// `hue` tints the canvas effects (stars, sparks) so they match the theme's primary colour.
// To add a theme: put its variables into app/themes.css under a new `html[data-theme="my-theme"]`
// block (and its dark variant), then list it here.

export interface ThemeOption {
  id: string;
  label: string;
  hue: number;
}

export const themes: ThemeOption[] = [
  { id: "editorial", label: "Editorial", hue: 30 },
  { id: "ocean", label: "Ocean", hue: 215 },
  { id: "violet", label: "Violet", hue: 270 },
  { id: "emerald", label: "Emerald", hue: 155 },
  { id: "amber", label: "Amber", hue: 38 },
  { id: "neutral", label: "Neutral (shadcn)", hue: 220 },
];

export const THEME_KEY = "neo-theme";
export const MODE_KEY = "neo-mode";

export const themeHue = (id?: string) => themes.find((theme) => theme.id === id)?.hue ?? 215;

// Runs before paint (see app/layout.tsx) so the saved theme never flashes.
export const themeBootScript = (fallback: string) => `
try {
  var root = document.documentElement;
  root.dataset.theme = localStorage.getItem("${THEME_KEY}") || "${fallback}";
  if (localStorage.getItem("${MODE_KEY}") === "dark") root.classList.add("dark");
} catch (e) {
  document.documentElement.dataset.theme = "${fallback}";
}`;
