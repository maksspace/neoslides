# Contributing

Thanks for helping! The most useful contributions are new **effects**, new **stages** (backdrops), new **story patterns**, and fixes found while preparing a real talk.

## Setup

```bash
git clone https://github.com/maksspace/neo-slides
cd neo-slides/assets/template
npm install
npm run dev            # http://localhost:3000, /effects for the gallery
```

To try your changes as a skill, symlink the clone: `ln -s "$PWD/../.." ~/.claude/skills/neo-slides` (run from `assets/template`).

## Before you open a PR

From `assets/template`:

```bash
npx eslint .
npm run build
npm run verify -- --effects   # walks the example talk and the whole gallery; screenshots in ./verify
```

CI runs the same three. Attach a few screenshots or a GIF from `./verify` for anything visual.

## Adding an effect

An effect is not finished until every box is ticked:

- [ ] **It means something.** You can state its meaning in one sentence a child would understand ("the old process breaks apart"). If you can't, it's decoration: don't add it.
- [ ] **It isn't a duplicate.** No existing effect in `components/deck/effects.ts` already says the same thing.
- [ ] One file in `components/deck/`, starting with a one-line comment giving the meaning.
- [ ] Driven by a prop (`active`, `open`, `after`…), so the presenter controls when it plays, and replays when the prop toggles.
- [ ] Colours come from theme tokens or `useDeckContext().hue`. It works on both the `space` and `paper` stages, or it is marked `spaceOnly`.
- [ ] Styles go in `components/deck/motion.css`. Class names don't collide with Tailwind utilities (`ring`, `shadow`, `grow`…).
- [ ] **Reduced motion:** with `prefers-reduced-motion: reduce` it shows its end state, and no content is lost.
- [ ] **Phone:** no horizontal scroll at 375 px.
- [ ] Randomness is deterministic (`seeded()` from `motion.ts`), so screenshots are stable.
- [ ] A row in `components/deck/effects.ts` (id, kind, what information it shows, meaning, trigger).
- [ ] A demo in `decks/effects-deck.tsx`, which puts it in the `/effects` gallery.
- [ ] If it's a new picture for a kind of information, a line in `references/animation-patterns.md`.
- [ ] Listed in the effects bullet of `SKILL.md`, and the count updated there and in `README.md`.

## Adding a stage

Add it to `DeckStage`, `stageTone` and `StageBackdrop` in `components/deck/stages.tsx`, plus a `.deck[data-stage="…"]` block in `app/deck.css` that sets `--deck-card`, `--deck-good-text` and `--deck-bad-text`. Check every effect on it in the gallery.

## Changing the skill text

`SKILL.md` and `references/` are instructions for Claude. Keep them short, concrete and in the imperative. Each rule should say *why*, so the model can judge edge cases. Test a change by running the skill on a fresh idea end to end, and say in the PR what you tried.

## Ground rules

- Mocked behaviour is never presented as a real integration, in the template or in examples.
- No third-party logos, brand assets or unlicensed fonts or media in the repo.
- Two-space indentation; match the surrounding code.
