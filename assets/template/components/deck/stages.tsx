"use client";

import type { CSSProperties } from "react";
import { StarField } from "./star-field";

// A stage is the deck's backdrop and light/dark tone. It is part of the chosen style, not of the
// story: pick the one that matches the reference look, or add a new one here plus a
// `.deck[data-stage="…"]` block in app/deck.css.
//
// - space: dark sky with idle stars and a soft glow. The only stage that can play `sky` effects
//   (bang, collapse), which need a dark canvas to read.
// - paper: the theme's own background with a faint dot grid and accent wash. Calm, editorial,
//   lets typography and the product carry the talk.

export type DeckStage = "space" | "paper";

export const stageTone: Record<DeckStage, "dark" | "light"> = {
  space: "dark",
  paper: "light",
};

export function StageBackdrop({ stage, effect, playKey, hue, progress }: { stage: DeckStage; effect?: "bang" | "collapse"; playKey: string; hue: number; progress: number }) {
  const glow = { "--glow-x": `${20 + progress * 60}%` } as CSSProperties;
  if (stage === "space") {
    return (
      <>
        <StarField effect={effect} playKey={playKey} hue={hue} />
        <div className="deck__glow" style={glow} aria-hidden="true" />
      </>
    );
  }
  return <div className="deck__glow" style={glow} aria-hidden="true" />;
}
