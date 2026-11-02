"use client";

import { useSearchParams } from "next/navigation";
import { BurnPaper } from "@/components/deck/burn-paper";
import { Deck, Reveal, Scene, type DeckScene } from "@/components/deck/deck";
import { ParcelPath } from "@/components/deck/parcel-path";
import { useTour } from "@/components/tour/tour-provider";
import { intro } from "@/lib/story";

// Example talk, part 1 ("user journey" pattern). Feynman sentences:
// meet   — "Anna needs one day off."
// paper  — "Today that takes a paper form, and we throw it away." (burn: dropping the old way)
// path   — "Today every step waits for a person; with Away the path is straight." (parcel: blocked vs straight)
// turn   — "Let's see it live."
// Replace all of it for a new idea: the arc, the scenes and the effects come from the idea.

const scenes: DeckScene[] = [
  {
    id: "meet",
    render: () => (
      <Scene center className="meet">
        <Reveal as="span" className="scene__eyebrow">{intro.meet.eyebrow}</Reveal>
        <Reveal as="h1" i={2} className="scene__title">{intro.meet.title}<br /><em>{intro.meet.accent}</em></Reveal>
        <Reveal as="p" i={5} className="scene__lead">{intro.meet.lead}</Reveal>
        <Reveal as="p" i={9} className="meet__hint">{intro.meet.hint}</Reveal>
      </Scene>
    ),
  },
  {
    id: "paper",
    beats: 2,
    render: ({ beat }) => {
      const { paper } = intro;
      return (
        <Scene className="paper">
          <div className="paper__copy">
            <Reveal as="span" className="scene__eyebrow">{paper.eyebrow}</Reveal>
            <Reveal as="h1" i={1} className="scene__title">{paper.title}<br /><em>{paper.accent}</em></Reveal>
            <Reveal as="p" when={beat >= 1} className="scene__lead paper__after">{paper.after}</Reveal>
          </div>
          {/* The presenter burns the form on the second beat. */}
          <BurnPaper burning={beat >= 1} className="reveal" style={{ "--i": 2 } as React.CSSProperties}>
            <article className="form-sheet">
              <p className="form-sheet__to">{paper.form.to}</p>
              <h2>{paper.form.heading}</h2>
              <p className="form-sheet__body">{paper.form.body}</p>
              {paper.form.fields.map((field) => (
                <p key={field} className="form-sheet__field"><span>{field}</span><i /></p>
              ))}
            </article>
          </BurnPaper>
        </Scene>
      );
    },
  },
  {
    id: "path",
    beats: 2,
    render: ({ beat }) => {
      const { path } = intro;
      const next = beat >= 1;
      return (
        <Scene>
          <Reveal as="span" className="scene__eyebrow">{next ? path.eyebrowNext : path.eyebrow}</Reveal>
          <Reveal as="h1" i={1} className="scene__title">{next ? path.titleNext : path.title}<br /><em>{next ? path.accentNext : path.accent}</em></Reveal>
          <ParcelPath steps={path.steps} fast={next} waitingLabel={path.waiting} />
          <Reveal as="p" i={10} className="scene__lead">{next ? path.leadNext : path.lead}</Reveal>
        </Scene>
      );
    },
  },
  { id: "turn", render: () => <TurnScene /> },
];

function TurnScene() {
  const tour = useTour();
  return (
    <Scene center>
      <Reveal as="span" className="scene__eyebrow">{intro.turn.eyebrow}</Reveal>
      <Reveal as="h1" i={1} className="scene__title">{intro.turn.title}<br /><em>{intro.turn.accent}</em></Reveal>
      <Reveal i={3}>
        <button type="button" className="deck-cta" onClick={() => tour.start(0, true)}>{intro.turn.cta} <span>→</span></button>
      </Reveal>
    </Scene>
  );
}

export function IntroDeck() {
  // `?scene=last` opens the last scene: used by "back" from the first tour step.
  const startAtEnd = useSearchParams().get("scene") === "last";
  const tour = useTour();
  return <Deck label={intro.label} scenes={scenes} startAtEnd={startAtEnd} onFinish={() => tour.start(0, true)} />;
}
