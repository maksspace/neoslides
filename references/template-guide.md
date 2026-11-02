# Template guide

`assets/template/` is a runnable Next.js 16 app (App Router, TypeScript, Tailwind v4, shadcn/ui base-nova). It builds as a **static export** (`output: "export"`): `npm run build` writes plain files to `out/`, `npm start` serves them, and `npm run publish` uploads them to a link on neoslides.app. So no server code: no route handlers, server actions, `cookies()`/`headers()`, middleware or `next/image` optimisation; all state is client-side. Anything reading search params on the client renders inside `<Suspense>` (see `app/intro/page.tsx`).

**Engine** (keep, extend): `components/deck/*`, `components/tour/*`, `components/theme-switch.tsx`, `lib/themes.ts`, `app/deck.css`, `app/themes.css`.
**Example content** (replace): `lib/story.ts`, `lib/tour.ts`, `lib/demo-store.ts`, `lib/look.ts` values, `decks/*`, `app/product/**`, `components/leave-status.tsx`.

## File map

```
app/
  layout.tsx            theme boot script (no flash), <TourProvider>, <DemoGuide>
  page.tsx              start screen: Presentation / Open product / Effects library
  intro/, vision/       routes for the example decks (rename or add freely)
  effects/              /effects (?stage=paper): preview of the starter effects (delete when not needed)
  product/layout.tsx    product shell: prototype banner, nav, theme + persona switch
  product/**/page.tsx   prototype screens (replace)
  globals.css           shadcn tokens, font variables, imports of the CSS below
  themes.css            theme presets as html[data-theme] blocks (+ dark variants)
  deck.css              deck shell, stages, scene typography, reveals, effect styles
components/
  deck/deck.tsx         <Deck scenes stage>, <Scene>, <Reveal>, useDeckContext()
  deck/use-deck.ts      scenes × beats, keys, fullscreen, ?scene=last
  deck/stages.tsx       stage backdrops (space, paper) and their tone
  deck/star-field.tsx   bang + collapse (canvas; space stage)
  deck/burn-paper.tsx   burn any block away (canvas mask)
  deck/bottleneck-flow.tsx  funnel queue (canvas)
  deck/parcel-path.tsx  parcel with blockers (Web Animations API)
  deck/poll.tsx         live poll (localStorage)
  deck/effects.ts       registry: every effect's meaning, kind, info type, trigger (gallery is built from it)
  deck/*.tsx            the effects (one file each, meaning in the first comment): shatter, dust-away,
                        wall-collapse, vortex, paper-plane, domino-chain, lights-on, fireworks, count-up,
                        progress-ring, compare-bars, split-race, dot-matrix, growth-line, timeline-draw,
                        calendar-burn, zoom-out, chaos-to-order, network-weave, layer-stack, pipeline,
                        input-box-output, chat-replay, leaky-bucket, stamp, fog-reveal, auto-checklist,
                        shield, balance-scale, wipe-compare, ghost-cursor
  deck/motion.css       styles for those effects;  deck/motion.ts  reduced-motion + seeded random helpers
  tour/                 tour state + spotlight/presenter panel
scripts/
  verify.mjs            npm run verify: headless walk of decks, tour, reduced motion, phone; ./verify
  serve.mjs             npm start: serves ./out the way the deck host does
  publish.mjs           npm run publish: sign in, build, upload ./out, print the link (.neoslides.json keeps it)
decks/
  intro-deck.tsx, vision-deck.tsx   example talk (user-journey arc)
  effects-deck.tsx      effects gallery: index + one demo per registry entry
  decks.css             scene-specific layout
lib/
  look.ts               which theme and stage the talk uses
  story.ts              all deck copy + chrome labels + product name/lang
  tour.ts               tour steps
  demo-store.ts         mock state (useSyncExternalStore + localStorage), personas, rules
  themes.ts             theme list (id, label, hue for canvas effects)
```

## Recipes

### A scene

```tsx
{
  id: "why",            // unique; revisiting replays its sky effect
  beats: 2,             // clicks inside the scene
  sky: undefined,       // "bang" | "collapse" (space stage only)
  render: ({ beat }) => (
    <Scene>
      <Reveal as="span" className="scene__eyebrow">{copy.eyebrow}</Reveal>
      <Reveal as="h1" i={1} className="scene__title">{copy.title}<br /><em>{copy.accent}</em></Reveal>
      <Reveal i={2}><MyEffect active={beat >= 1} /></Reveal>
      <Reveal as="p" when={beat >= 1} className="scene__lead">{copy.after}</Reveal>
    </Scene>
  ),
}
```

- `render` returns JSX only; if a scene needs state or timers, render a component.
- `<Reveal i>` staggers by 90 ms per step (pure CSS animation on mount); `when={false}` holds it hidden until a beat.
- `<Scene center>` centres content; clicking empty space advances.
- A deck is `<Deck label scenes onFinish onBack stage? exitTo?>`; add a route for it like `app/intro/page.tsx`.

### A new effect

Put it in `components/deck/` (styles in `motion.css`), add a row to `effects.ts` and a demo to `decks/effects-deck.tsx`, start the file with a one-line comment giving its meaning, drive it by a prop (`active`, `open`, `fast`…), use `useDeckContext().hue` or theme tokens for colour, and handle reduced motion. See `motion-method.md`.

### A tour step

```ts
{
  chapter: "Manager", title: "One click for exceptions",
  text: "What the audience hears.", hint: "What the presenter clicks.",
  as: "oliver", route: "/product/team", target: "approvals", prepare: demo.ensurePending,
}
```

`prepare` must be idempotent and work from a fresh state.

### A style

- Theme: `html[data-theme="x"]` + dark variant in `app/themes.css`; entry in `lib/themes.ts`; `look.theme = "x"`.
- Fonts: `--app-font-sans`, `--app-font-heading`, `--app-font-mono` in the theme block.
- Deck typography: `--deck-title-weight`, `--deck-title-tracking`, `--deck-em-style`, `--deck-em-fill`.
- Stage: `look.stage`, or a new stage: add it to `DeckStage`, `stageTone` and `StageBackdrop` in `stages.tsx`, plus a `.deck[data-stage="…"]` block in `deck.css` (set `--deck-card`, `--deck-good-text`, `--deck-bad-text` for its tone).
- Full procedure: `style-from-reference.md`.

### The mock domain

Keep the shape of `lib/demo-store.ts`: `useDemo()` (returns `null` on the server; the product layout renders after mount), a `demo` object with actions, `reset()`, `ensureX()` helpers, and a versioned `STORAGE_KEY` (bump it when the state shape changes).

## Gotchas

- Next.js may keep hidden copies of earlier routes in the DOM. Query DOM hooks with a visibility check (`offsetParent !== null`), as the tour and `StarField` do.
- Don't read `localStorage` during render. Read it after mount or through `useSyncExternalStore` with a `null` server snapshot.
- Browser-only APIs (`matchMedia`, `requestAnimationFrame`, `document`) belong in effects.
- A hidden browser pane pauses `requestAnimationFrame` and CSS animations, so verify in a visible pane or headless Chromium.
- Verify with `npm run build` and `npm run verify` (`scripts/verify.mjs`), not only `npm run dev`. The tour panel exposes its step's target as `data-target`, which is how verify checks the spotlight.
- After adding a new CSS `@import` (e.g. a new effects stylesheet), delete `.next` before building: the Turbopack cache can silently keep the old CSS bundle, and the new styles go missing.
- Avoid class names that are also Tailwind utilities (`ring`, `shadow`, `border`, `grow`, `blur`, `container`…): Tailwind scans the source and styles them too.
- Unused effect components cost nothing at runtime, but delete them and their `motion.css` block before hand-over to keep the project small.
