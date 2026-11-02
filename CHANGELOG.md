# Changelog

## Unreleased

- **`npm run share` replaces `npm run publish`.** A script named `publish` was one keystroke from `npm publish`, and npm also runs a script by that name as a lifecycle hook after publishing to the registry. The flags are unchanged: `npm run share -- --new`, `-- --delete`, `-- --logout`.

## 0.1.0: first public release

neoslides turns a product idea into a clickable Next.js prototype plus an animated in-browser talk with a live guided tour over it, in whatever visual style you ask for.

### Workflow

- **One proposal, then the build:** the skill reads the request and proposes the whole direction in one message (audience, story, key animations, live demo, style, at most three questions with defaults), then builds the prototype, the tour and the decks.
- **Style from a reference:** a link, screenshot or brand becomes `STYLE.md`, then theme tokens and a stage, checked side by side against the reference.

### Template

- **Stack:** Next.js 16, Tailwind v4, shadcn/ui, built as a static export into `out/`. `npm start` serves the build the same way the deck host does.
- **Deck engine:** scenes × beats, clicker keys, fullscreen, `?scene=last`, pluggable stages (`paper`, `space`) and themes.
- **Live tour:** spotlight, presenter panel, chapter menu and personas over the running prototype.
- **37 effects:** 13 cinematic, 9 data and 15 diagram effects, with a registry (`components/deck/effects.ts`) and a clickable `/effects` gallery on both stages.
- **Example talk:** "Away" (leave requests), in English. It is a placeholder for each new talk.

### Scripts

- **`npm run verify`:** a headless walk of the static build: every deck, every tour step (with reloads), reduced motion and phone width, with mid-animation screenshots.
- **`npm run publish`:** sign in with Google (device flow), then upload the talk to an unlisted link on `*.neoslides.app`. What the script does is in `docs/sharing.md`.

### Skill

- **References:** storytelling patterns, animation patterns by information type (including "cinematic moments"), motion method, visuals and the quality bar.
- **Install:** as a Claude Code plugin (`/plugin install neoslides@neoslides`), by cloning into `~/.claude/skills/neoslides`, or by asking Claude, using the agent-ready steps in the README.
- **CI** for the template.
