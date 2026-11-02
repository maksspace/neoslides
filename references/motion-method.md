# Motion method: find the metaphor, then build it

Animation in a neo-slides talk is an argument, not decoration. The test: **if you removed the animation, would the presenter need an extra sentence to explain the scene?** If not, remove it.

## 1. Find the metaphor for THIS idea

Start with `animation-patterns.md`: name the scene's information type (a number, a comparison, a share, change over time, a process, a structure, scale, pain, trust, a beginning or ending, a concept) and pick from that section. Use the brainstorm below when nothing there fits.

For each scene that needs motion, write the idea as a change: *"X was A, now it's B"* or *"many things → one thing"*. Then find a physical picture of that change. Brainstorm three, pick the one a child would get instantly.

| Idea shape | Possible pictures |
| --- | --- |
| Something slow becomes fast | a queue that flushes · a timer that shrinks · a traffic light turning green · a parcel that stops waiting |
| Many things become one | particles converging into a mark · scattered cards stacking · tangled lines straightening into one |
| One thing becomes many | a seed splitting · one card multiplying into a grid · a big bang |
| Dropping the old way | the artefact burns · crumples · gets stamped "archived" · dissolves into dust |
| Something hidden becomes visible | fog clearing · a spotlight sweeping · an X-ray layer over a screen |
| Risk / trust | a lock clicking shut · a shield absorbing hits · a checklist ticking itself |
| Cost / waste | coins draining from a jar · hours piling up as blocks · a battery emptying |
| Flow between systems | packets routing along lines · two streams merging · a broken pipe being joined |
| Choice / prioritisation | items sorting themselves · a funnel filtering · bars racing in a live poll |

Match the metaphor to the style. A calm editorial style suits ink, paper, lines and type moving; a dark tech style suits light, particles and glow. Don't put a space explosion into a pastel brand.

## 2. Build it to the bar

- **One per scene, at most.** Reveals (staggered fade-up) are typography, not an effect.
- **Driven by a beat or by entering the scene**, through a prop (`open`, `fast`, `burning`, `active`), never by a free-running loop the presenter can't control. A short build-up timer (≤ 5 s) is fine when the presenter just waits for it.
- **Two-state effects** (before/after) take a two-beat scene; copy for both states lives in `story.ts`.
- **Tech:** canvas for many particles (`requestAnimationFrame`, `devicePixelRatio` capped at 2, cleanup on unmount); CSS or the Web Animations API for a few elements; SVG for lines and shapes. Use no new dependency unless it clearly earns its weight (e.g. a physics or path library for one hero moment).
- **Colour:** theme tokens (`var(--primary)`, `--chart-*`) or the theme hue (`useDeckContext().hue`). Keep good/bad/warn green/red/amber, because they carry meaning.
- **Reduced motion:** skip the movement and show the end state.
- **Projector-safe:** at most one full-screen flash, peak below full white, fading over ≥ ~1 s; never more than 3 flashes per second.
- Put the one-sentence meaning as the first comment in the component, like the starter effects do.

## 3. The effects library (reuse when the idea matches)

37 ready effects ship in `components/deck/`. The source of truth is the registry `components/deck/effects.ts`: each entry has the component, its kind (cinematic / data / diagram), the information types it shows, its one-sentence meaning and its trigger prop. `/effects` (space) and `/effects?stage=paper` play every one of them, and the gallery is built from the registry, so a new effect is not finished until it has a registry row and a demo there.

Reuse an effect only when its meaning is your scene's idea; restyle it through theme tokens and copy, not by forking. `animation-patterns.md` maps information types to these effects and to recipes that don't have a component yet.

When you build a new effect for a talk and it's reusable, add it to the registry and the gallery, and mention it in the hand-over.
