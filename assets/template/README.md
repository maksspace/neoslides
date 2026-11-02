# neo-slides demo

A clickable product prototype plus an in-browser presentation with a live guided tour over it.
Generated from the `neo-slides` skill template. The example story and style are placeholders: each talk gets its own. **Prototype only:** all data is mock state in
this browser's localStorage; nothing talks to real systems.

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # must pass before the talk; writes the static talk to ./out
npm start          # serves ./out exactly as it will be published
npm run verify     # headless walk of the whole talk; screenshots in ./verify
npm run publish    # sign in once with Google, upload, print a shareable link
```

## Sharing a link

`npm run publish` builds the talk and uploads it to a random, unlisted link like `https://k7f3x9q2ab.neoslides.app/`. The first time it prints a sign-in link: open it, sign in with Google and approve the code. Re-running it updates the same link (kept in `.neoslides.json`); `-- --new` makes a new one, `-- --delete` takes it down, `-- --logout` forgets the token. Anyone with the link can open the talk, so don't publish anything confidential.

## Routes

| Route | What it is |
| --- | --- |
| `/` | Start screen: open the presentation or the product |
| `/effects` | Preview of the starter effects library on the dark stage; `/effects?stage=paper` on the light one (not part of the talk) |
| `/intro` | Deck, part 1 (example: meet Anna → the form burns → her path today vs with Away). Last beat starts the tour |
| `/product/*` | The prototype. The tour panel appears here while the tour is active |
| `/vision` | Deck, part 2 (example: what's next + poll → finale). Opened after the last tour step |

`?scene=last` opens a deck on its last scene (used by "back" from the tour).

## Presenter keys

- Deck: `→` / `Space` / `Enter` / `PageDown` next beat, `←` / `PageUp` back, `F` fullscreen, `Esc` to the product. Clicking empty space also advances. Clickers send PageUp/PageDown, so they work out of the box.
- Tour: `→` / `←` next / previous step, `H` collapse the panel. Keys are ignored while typing in a field.

## Where to change things

| You want to change | Edit |
| --- | --- |
| Any words in the decks, chrome labels, product name | `lib/story.ts` (the only copy file) |
| Scene order, beats, which effect plays | `decks/intro-deck.tsx`, `decks/vision-deck.tsx` |
| Scene layout styles | `decks/decks.css` |
| Tour steps (text, hints, persona, route, spotlight target) | `lib/tour.ts` |
| Mock data, personas, business rule | `lib/demo-store.ts` |
| Product screens | `app/product/**` (shadcn/ui components in `components/ui`) |
| Look and feel | `lib/look.ts` (theme + stage), `app/themes.css` (tokens), `components/deck/stages.tsx` (backdrops) |

Effects live in `components/deck/`, one file each, with its meaning in the first comment. The registry `components/deck/effects.ts` lists all 37 (meaning, kind, information type, trigger prop); the `/effects` gallery is built from it. Styles: `components/deck/motion.css` and `app/deck.css`.
The deck engine is `components/deck/deck.tsx` + `use-deck.ts`; the tour is `components/tour/`.
