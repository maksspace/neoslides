import { Suspense } from "react";
import { EffectsDeck } from "@/decks/effects-deck";

// Developer preview of the starter effects library. Not part of the talk.
export default function EffectsPage() {
  return (
    <Suspense>
      <EffectsDeck />
    </Suspense>
  );
}
