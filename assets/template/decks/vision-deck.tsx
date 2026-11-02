"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Deck, Reveal, Scene, type DeckScene } from "@/components/deck/deck";
import { Poll } from "@/components/deck/poll";
import { useTour } from "@/components/tour/tour-provider";
import { product, vision } from "@/lib/story";

// Example talk, part 2 (after the live tour). Feynman sentences:
// next   — "This is version one, and you decide what comes next." (poll)
// finale — "Away: one day off, no paperwork."
// No big effect at the end: on a calm paper stage the finale is typography.

function Finale() {
  const router = useRouter();
  const { finale } = vision;
  return (
    <Scene center className="finale">
      <Reveal as="span" className="finale__mark">{product.mark}</Reveal>
      <Reveal as="h1" i={2} className="scene__title">{finale.title}<em>.</em></Reveal>
      <Reveal as="p" i={4} className="scene__lead">{finale.lead}</Reveal>
      <Reveal i={6} className="finale__actions">
        <button type="button" className="deck-ghost" onClick={() => router.push("/product")}>{finale.product}</button>
        <button type="button" className="deck-ghost" onClick={() => router.push("/intro")}>{finale.again}</button>
      </Reveal>
    </Scene>
  );
}

const scenes: DeckScene[] = [
  {
    id: "next",
    render: () => {
      const { next } = vision;
      return (
        <Scene className="together">
          <div className="together__copy">
            <Reveal as="span" className="scene__eyebrow">{next.eyebrow}</Reveal>
            <Reveal as="h1" i={1} className="scene__title">{next.title}<br /><em>{next.accent}</em></Reveal>
            <Reveal as="p" i={2} className="scene__lead">{next.lead}</Reveal>
            <Reveal as="p" i={3} className="together__channel">{next.channel}</Reveal>
          </div>
          <Reveal i={2}>
            <Poll question={next.question} topics={next.topics} hint={next.hint} resetLabel={next.reset} />
          </Reveal>
        </Scene>
      );
    },
  },
  { id: "finale", render: () => <Finale /> },
];

export function VisionDeck() {
  // `?scene=last` opens the last scene.
  const startAtEnd = useSearchParams().get("scene") === "last";
  const tour = useTour();
  const router = useRouter();
  // Back from the first scene returns to the last tour step.
  return <Deck label={vision.label} scenes={scenes} startAtEnd={startAtEnd} onFinish={() => router.push("/product")} onBack={() => tour.start(tour.total - 1)} />;
}
