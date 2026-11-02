# Tone, motion and honesty rules

## Motion

- **Every animation means something** (see `motion-method.md`). Decoration-only motion is cut.
- **Motion matches the style.** Its character (snappy, calm, springy, none) comes from the reference; a calm editorial look gets slow ease-outs and ink/paper metaphors, a dark tech look can carry light and particles.
- **No effects inside the live tour.** The tour layer is a spotlight with a gentle pulse and a panel. The product's own UI transitions are fine; deck effects are not.
- **Presenter controls time.** Big changes happen on a beat (a click), not on autoplay timers. Timers are allowed only for "it builds up" moments the presenter waits for (typing-in, then burn), and must finish within ~5 s.
- **Projector-safe flashes.** At most one full-screen flash per effect, peak below full white (`FLASH_PEAK = 0.85` in `star-field.tsx`), fading over ~1 s. Never more than three flashes per second anywhere (WCAG 2.3.1). Camera shake ≤ 0.7 s.
- **Contrast.** Body copy uses `--foreground`/muted tokens; check readability from the back of a room at 1280×720, on both light and dark stages (semantic green/red text has per-stage values: `--deck-good-text`, `--deck-bad-text`).
- **`prefers-reduced-motion: reduce`:** every effect must skip its motion and show its end state (starter library: bang/collapse do nothing, burn just fades the block, funnel stays static, parcel jumps to the finish, reveals appear without animation). New effects follow the same rule. Test it in the browser (DevTools → Rendering → Emulate CSS media feature).
- **Performance.** Canvas DPR capped at 2, particle counts as in the template, all loops stopped on unmount. Test on the laptop that will drive the projector.

## Tone

- Plain words, short sentences, the audience's vocabulary. No buzzwords the presenter would not say aloud.
- Warm and honest about the past ("we learned on the way"), confident about the turn, humble about the roadmap ("preliminary — let's build it with you").
- Humour is fine in a chip or an emoji inside the pain artefact; never in the principles or the tour.
- One language per talk; chrome labels in `ui` (story.ts) must match it.

## Honesty (prototype ≠ product)

- The product shows the prototype banner on every screen; do not remove it for the talk.
- Mocked behaviour is described as what the product *will* do, or as "in the prototype". Never "connected to", "live data", "integrated" for something that is mocked.
- Demo personas are fictional. Pain messages are paraphrased and labelled as such.
- The poll is local to the presenter's browser; if someone asks, say so.
- If a real integration is part of the pitch, show it as a labelled mock screen and name what it will connect to later.

## Rehearsal checklist

- Full run with a clicker (PageUp/PageDown) or arrow keys; `F` for fullscreen.
- Jump to each tour chapter from the menu; reload mid-tour (state resumes).
- "Start over with clean data" in the tour menu resets mock state before the talk.
- Know the escape hatches: `Esc` from a deck → product; `×` on the tour panel → free clicking; `?scene=last` on any deck.
