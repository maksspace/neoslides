# Changelog

## Unreleased

- **Static by default:** the template builds as a static export into `out/`; `npm start` serves it like the deck host, and `npm run verify` checks that build.
- **`npm run publish`:** device-flow sign-in with Google, then uploads the talk to an unlisted link on `*.neoslides.app`. Contract in `docs/publish-api.md`.
- **Install by asking Claude:** README has steps written for AI agents.

## 0.1.0: first public release

- **Workflow:** the skill reads the request and proposes the whole direction in one message (audience, story, key animations, live demo, style, at most three questions with defaults), then builds the prototype, the tour and the decks.
- **Style from a reference:** a link, screenshot or brand → `STYLE.md` → theme tokens and a stage, compared side by side with the reference.
- **Template:** Next.js 16, Tailwind v4, shadcn/ui. It includes the deck engine (scenes × beats, clicker keys, fullscreen, `?scene=last`), pluggable stages (`paper`, `space`), themes, and the live tour (spotlight, presenter panel, chapter menu, personas).
- **37 effects** with a registry (`components/deck/effects.ts`) and a clickable `/effects` gallery on both stages: 13 cinematic, 9 data and 15 diagram effects.
- **`npm run verify`:** a headless walk of every deck, every tour step (with reloads), reduced motion and phone width, with mid-animation screenshots.
- **References:** storytelling patterns, animation patterns by information type (including "cinematic moments"), motion method, visuals, quality bar.
- **Plugin packaging** (`.claude-plugin/`) and CI.
- The example talk ("Away", leave requests) is in English.
