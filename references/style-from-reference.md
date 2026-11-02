# Style from a reference

The person may say "make it look like this" and give a link, a screenshot, a Figma frame, a brand guide, or just words ("like an Apple keynote", "like a Notion doc"). Your job is to **capture the style faithfully** — palette, typography, shape, texture, motion character, layout rhythm — and apply it to both the decks and the prototype. Copy the style, not the identity.

## 1. Capture

**A link.** Open it in the browser at 1280×800. Take screenshots of the hero, one content section and one UI-heavy section. Then run `scripts/extract-style.js` in the page (paste its contents into the browser JavaScript tool). It returns weighted tokens: background/text/border colours, font stacks, heading typography (family · weight · size · tracking · line height), font sizes, radii, shadows, gradients, and any CSS custom properties on `:root`. Those custom properties are often the site's own design tokens, so prefer them when they exist.

**An image / screenshot / Figma export.** Look at it carefully and write down the same things by eye: the background and surface colours, text colours, one or two accents, heading versus body type (serif/sans/mono, weight, tracking, case), corner radius, borders versus shadows, density, textures. If Figma access is available, read the variables and text styles from the frame instead of guessing.

**Words only.** Translate them into the same list and show the person 2–3 concrete options (screenshots of presets or a quick scene) before committing.

## 2. Write a style brief

Save it as `STYLE.md` in the project. Keep it short and concrete:

```
Mood: calm · precise · premium              Tone: light
Palette: bg #F8FAFD · surface #FFFFFF · text #061B31 · muted #50617A ·
         accent #533AFD · accent-2 #F44BCC · border #E5EDF5
Type: headings = geometric grotesk, weight 300, tracking -0.02em, sentence case
      body = same family 16/1.5 · mono = system mono
      free substitute: Inter (licensed font not available)
Shape: radius 4–6px · hairline borders · soft long shadows (0 30px 60px -10px)
Texture: large soft radial gradients behind hero areas; no grain
Motion: slow and smooth (600–900 ms, ease-out), no bounce
Signature details: gradient mesh in the hero; thin-weight huge headings; uppercase eyebrow? no
```

## 3. Map it onto the template

1. **Theme tokens.** In `app/themes.css`, add `html[data-theme="reference"] { … }` with the shadcn variables (`--background`, `--foreground`, `--card`, `--primary`, `--muted-foreground`, `--border`, `--radius`, `--chart-1..3`, …) and a dark variant `html[data-theme="reference"] .dark, html[data-theme="reference"].dark { … }`. Any CSS colour format works (hex, rgb, oklch).
2. **Fonts.** Set `--app-font-sans`, `--app-font-heading`, `--app-font-mono`. Use the reference font only if it's free (Google Fonts via `next/font/google`, which needs network access at build time) or the person supplies a licensed file; otherwise pick the closest free equivalent and note it in `STYLE.md`.
3. **Deck typography.** Tune `--deck-title-weight`, `--deck-title-tracking`, `--deck-em-style` (e.g. `italic`) and `--deck-em-fill` (a gradient, or `linear-gradient(var(--primary), var(--primary))` for a solid accent) in the theme block.
4. **Stage.** Choose `look.stage` in `lib/look.ts`: `paper` (theme background, calm) or `space` (dark sky, glow). If the reference has a signature backdrop (gradient mesh, grain, grid, photo, big shapes), add a new stage: extend `DeckStage` and `StageBackdrop` in `components/deck/stages.tsx` and add a `.deck[data-stage="…"]` block in `app/deck.css`.
5. **Theme list.** Add `{ id: "reference", label, hue }` to `lib/themes.ts` (`hue` ≈ the accent's hue, for canvas effects) and set `look.theme = "reference"`.
6. **Motion character.** Adjust reveal timing in `app/deck.css` (`.reveal` transition, `--i` stagger) to match: snappy brands get shorter, crisper motion; calm brands slower ease-out. Choose effect metaphors that fit the style (see `motion-method.md`).
7. **Product UI.** shadcn components pick up the tokens automatically. Adjust component variants only where the reference clearly differs (e.g. pill buttons, borderless cards).

## 4. Compare side by side

Screenshot the reference, a deck scene and a product screen at the same size and look at them together. Write down the three biggest differences (usually type weight and tracking, background texture, and spacing density), fix them, and repeat once. Then show the person the comparison and ask whether it's right before writing the rest of the talk.

## Boundaries

- Capture the style: colour, type feel, shape, rhythm, texture. Don't copy the identity: no logos, brand names, mascots, illustrations, photos or icon sets lifted from the reference, and no proprietary font files without a licence.
- If the reference is the person's own company brand, using it fully is fine.
- Never present the prototype as another company's product, and never mimic a real organisation's sign-in or payment screens.
