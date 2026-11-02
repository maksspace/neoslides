"use client";

import { createContext, useContext, useMemo, useState, type CSSProperties, type ElementType, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { look } from "@/lib/look";
import { product, ui } from "@/lib/story";
import { themeHue } from "@/lib/themes";
import { StageBackdrop, stageTone, type DeckStage } from "./stages";
import { useDeck } from "./use-deck";

export interface DeckScene {
  id: string;
  /** Clicks inside the scene before moving on (default 1). */
  beats?: number;
  /** What the sky does when the scene opens (space stage only): the big bang, or everything collapsing into `data-collapse-target`. */
  sky?: "bang" | "collapse";
  /** Return JSX only; put hooks in components rendered from here. */
  render: (props: { beat: number }) => ReactNode;
}

interface DeckProps {
  label: string;
  scenes: DeckScene[];
  startAtEnd?: boolean;
  /** Called after the last beat of the last scene. */
  onFinish: () => void;
  /** Called on "back" from the first scene. */
  onBack?: () => void;
  /** Where Esc and × lead. */
  exitTo?: string;
  /** Backdrop and tone; defaults to `look.stage`. */
  stage?: DeckStage;
}

const DeckContext = createContext<{ next: () => void; goTo: (scene: number) => void; hue: number }>({ next: () => undefined, goTo: () => undefined, hue: 215 });
export const useDeckContext = () => useContext(DeckContext);

export function Deck({ label, scenes, startAtEnd, onFinish, onBack, exitTo = "/product", stage = look.stage }: DeckProps) {
  const router = useRouter();
  const beats = useMemo(() => scenes.map((scene) => scene.beats ?? 1), [scenes]);
  const { scene, beat, next, previous, goTo, toggleFullscreen, exit } = useDeck(beats, { startAtEnd, onFinish, onBack, onExit: () => router.push(exitTo) });
  // Canvas effects follow the active theme. Read once on the client; it never reaches the DOM, so no hydration mismatch.
  const [hue] = useState(() => (typeof document === "undefined" ? 215 : themeHue(document.documentElement.dataset.theme)));
  const current = scenes[scene];

  const onSelf = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) next();
  };

  return (
    <DeckContext.Provider value={{ next, goTo, hue }}>
      <div className={`deck ${stageTone[stage] === "dark" ? "dark" : ""}`} data-stage={stage} onClick={onSelf}>
        <StageBackdrop stage={stage} effect={current.sky} playKey={current.id} hue={hue} progress={scene / Math.max(scenes.length - 1, 1)} />

        <header className="deck__top">
          <span className="deck__brand"><span className="deck__mark">{product.mark}</span>{product.name}</span>
          <span className="deck__label">{label}</span>
          <div className="deck__tools">
            <button type="button" title={ui.fullscreen} onClick={toggleFullscreen}>⤢</button>
            <button type="button" title={ui.exit} onClick={exit}>×</button>
          </div>
        </header>

        <main className="deck__stage" onClick={onSelf}>
          <div key={current.id} className="deck__scene" onClick={onSelf}>{current.render({ beat })}</div>
        </main>

        <footer className="deck__bottom">
          <button type="button" className="deck__nav" aria-label={ui.back} disabled={scene === 0 && !onBack} onClick={previous}>←</button>
          <div className="deck__dots">
            {scenes.map((item, i) => (
              <button key={item.id} type="button" data-active={i === scene || undefined} data-seen={i < scene || undefined} aria-label={`${ui.scene} ${i + 1}`} onClick={() => goTo(i)} />
            ))}
          </div>
          <button type="button" className="deck__nav" aria-label={ui.next} onClick={next}>→</button>
        </footer>
      </div>
    </DeckContext.Provider>
  );
}

/**
 * One scene's layout. Children marked with <Reveal> fade up in order each time the scene mounts
 * (CSS only, see app/deck.css). Clicking empty space inside the scene advances.
 */
export function Scene({ center, className, children }: { center?: boolean; className?: string; children: ReactNode }) {
  const { next } = useDeckContext();
  return (
    <section className={`scene ${center ? "scene--center" : ""} ${className ?? ""}`} onClick={(event) => event.target === event.currentTarget && next()}>
      {children}
    </section>
  );
}

type RevealProps = {
  /** Stagger position: each step is 90 ms later. */
  i?: number;
  /** Hold the element hidden until this is true (e.g. `beat >= 1`). */
  when?: boolean;
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  [key: `data-${string}`]: unknown;
};

export function Reveal({ i = 0, when = true, as: Tag = "div", className, style, children, ...rest }: RevealProps) {
  return (
    <Tag className={`reveal ${className ?? ""}`} data-hold={when ? undefined : true} style={{ "--i": i, ...style } as CSSProperties} {...rest}>
      {children}
    </Tag>
  );
}
