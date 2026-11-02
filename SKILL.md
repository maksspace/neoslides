---
name: neoslides
description: Turn a product idea into (1) a clickable Next.js demo prototype and (2) an animated, interactive in-browser presentation with a guided live tour over that prototype, instead of a slide deck, in whatever visual style the person asks for (including copying the style of a site, screenshot or brand they reference). Use when someone wants to pitch, present, demo or "make slides" for a product idea, internal tool or feature, wants a demo POC plus presentation, or mentions neoslides.
---

# neoslides

You make two things from one idea, in one Next.js app:

1. **The prototype**: a small, clickable product with local mock state. It's what the audience remembers.
2. **The talk**: in-browser story scenes with meaning-bearing motion, handing over to a **live guided tour** of the prototype and back.

Every talk is designed fresh: **its structure comes from the idea, its look from the person's reference, its motion from metaphors for its own scenes.** The template gives you the engine, not the content.

The skill grew out of one live product talk that worked very well. Read `references/quality-bar.md` first. It explains what to carry over (the principles and the craft) and what not to (that talk's arc, effects and space look).

## What the template gives you

`assets/template/`: Next.js 16 App Router, TypeScript, Tailwind v4, shadcn/ui. Reusable engine:

- **Deck**: scenes × beats, staggered reveals, clicker and keyboard control, fullscreen, `?scene=last`.
- **Stages**: pluggable backdrops (`paper`, `space`) chosen in `lib/look.ts`; add your own.
- **Themes**: shadcn tokens with presets in `app/themes.css`, deck typography tokens, a theme switch.
- **Tour**: spotlight on `data-demo` hooks, presenter panel, chapter menu, persona switch, `prepare()` per step.
- **Effects library**: 37 meaning-bearing effects, listed with their meaning and information type in `components/deck/effects.ts`: cinematic moments (big bang, burn, shatter, dust, wall collapse, bottleneck, parcel path, vortex, paper plane, domino chain, city lights, fireworks, collapse), data (count-up, progress ring, compare bars, race, dot matrix, growth line, timeline, calendar, zoom out) and diagrams (chaos → order, network → hub, layer stack, pipeline, input → output, chat replay, leaky bucket, stamp, fog, checklist, shield, balance scale, wipe, poll, ghost cursor). Preview them at `/effects` and `/effects?stage=paper`.
- **An example talk** ("Away", leave requests; user-journey arc, editorial paper style). It shows the shape of the files only. Replace all of it.

## Non-negotiables

- **Mock is never presented as real.** No real integrations, production services or credentials. The prototype banner stays on every product screen. If the idea depends on another system, mock it and say so on screen.
- **One idea per scene; at most one meaning-bearing animation.** If you can't say what an animation *means* in one sentence, cut it.
- **Feynman rule.** Every scene can be explained in one sentence a child would understand. Write that sentence first.
- **Copy lives in `lib/story.ts` and `lib/tour.ts`; style lives in `lib/look.ts` + `app/themes.css`.** Layout files contain no prose and no one-off colours.
- **Show, don't only tell.** Where a picture, chart, GIF, infographic or a set of cards explains faster or makes the idea more vivid than text, use it (`references/visuals.md`). Media are licensed, stored locally and credited; invented numbers are labelled as illustrative.
- **No effects inside the live tour.** The product is the show.
- **Copy a style, not an identity.** No logos, brand names, lifted illustrations or unlicensed fonts from a reference that isn't the person's own brand.

## Workflow

Keep a task list. Each step ends with something the person can look at.

### 1. Read the request and propose the whole direction (decide first, ask second)

The person describes an idea in their own words, often briefly. **Your job is to work out what they need and propose a complete direction**, not to hand them a questionnaire. Infer everything you reasonably can from the request, the repository (if there is a product or docs), any links or images, and common sense about the audience. Then send **one message** with a short brief:

```
Audience and goal:   who's in the room, what they should believe or do afterwards
Story:               pattern (e.g. problem → solution, user journey…) and the scene list, one line each
Key moments:         the 2–4 meaning-bearing animations, each as "scene → effect → what it means"
Visuals:             where cards, charts, photos/GIFs or generated images carry a scene, and why
Live demo:           the 3–6 moments in the prototype, with personas
Style:               the look (from their reference, or the preset you picked and why)
Length, language, tone
Open questions:      only what you truly can't infer (at most 3), each with your default
```

Rules for deciding:

- **Style**: a link, screenshot or brand they gave → follow `style-from-reference.md`. No reference → choose from the audience and subject (executives / finance → calm corporate or editorial; developers / tech → dark tech; consumer / marketing → bright, playful; internal ops → clean neutral) and say why in one line. Offer one alternative in a sentence, not a menu.
- **Story**: pick the pattern from the takeaway (`storytelling.md`). A painful status quo → problem → solution or before/after; a person's task → user journey; a roadmap → origin → future; a budget ask → proposal.
- **Motion**: for each scene, name its information type and pick from `animation-patterns.md` and the registry `assets/template/components/deck/effects.ts`. Put the most cinematic effect (burn, shatter, wall, vortex, bottleneck, bang/collapse…) on the turning point of the story, where the old way dies or the product appears.
- **Language**: the language the person writes in, unless the audience obviously needs another.

If they answer "ok" or tweak a line, go. If the request is clear enough that there are no open questions, say what you're going with and start building; they can steer from the first screenshots.

### 2. Style first, if a reference was given

Follow `references/style-from-reference.md`. Open a link in the browser, run `scripts/extract-style.js` there, and look at screenshots (or study the image). Write `STYLE.md`, map it to a theme in `app/themes.css`, pick or build a stage, then compare side by side with the reference and fix the biggest differences. **Show the person one styled scene and one product screen next to their reference** before writing the whole talk; continue unless they object.

### 3. Story script

Expand the brief into the full script, following `references/storytelling.md`: start from the takeaway, choose a pattern (problem→solution, before/after, user journey, origin→future, launch, proposal, case, explainer, or a mix), then write the scene table:

| # | Scene | Feynman sentence | Beats | Visual (cards / chart / image / diagram) | Motion and its meaning |
| --- | --- | --- | --- | --- | --- |

plus the tour table: `chapter · title · what the audience hears · presenter hint · persona · route · data-demo target`.

For motion, choose per scene from what the information *is*: name its type (a number, comparison, share, trend, process, structure, scale, pain, trust, beginning/ending, concept) and pick the best picture from `references/animation-patterns.md`, filtered by truth, instant read and style fit. `references/motion-method.md` covers the method and build rules. Use a ready component when its meaning matches exactly; otherwise build the recipe fresh. Vary pictures across the talk (3–5 different patterns), and leave most scenes to reveals.

For visuals, follow `references/visuals.md`: pick the form from the information (cards for parallel points, charts for numbers, interactive charts where the room will ask "what if", photos or GIFs for situations everyone recognises, generated or drawn illustrations for concepts with no photo). Mix forms across the talk.

### 4. Scaffold

Copy `assets/template/` from this skill's own folder (where this SKILL.md lives: `~/.claude/skills/neoslides/` for a manual install, the plugin cache for a plugin install):

```bash
cp -R <skill-dir>/assets/template <target-dir>
cd <target-dir> && npm install
```

Read `references/template-guide.md` (file map, recipes, gotchas). The template's `AGENTS.md` warns that this Next.js version differs from older ones; check `node_modules/next/dist/docs/` before using unfamiliar APIs.

### 5. Build the prototype first

- Replace `lib/demo-store.ts` with the product's domain: personas, seed data, the rule or flow the talk is about, `reset()`, and idempotent `ensureX()` helpers for tour steps.
- Replace `app/product/**` with the product's screens (shadcn/ui; `npx shadcn@latest add …`). Few screens, focused on the live moments, styled by the theme.
- Put `data-demo="<hook>"` on every element a tour step spotlights.

### 6. Tour, then decks

- `lib/tour.ts`: each step sets `route`, `as`, `target` and `prepare`, so **any step opens directly** (chapter menu, reload, "back" from the next deck).
- Decks: write your own scene arrays in `decks/` (rename, add or remove decks and routes freely), copy in `lib/story.ts`, scene layout in `decks/decks.css`, new effects in `components/deck/`. Delete the example and anything in the starter library you don't use.
- Follow `references/tone-and-motion.md`.

### 7. Verify in a real browser (required)

`npm run build`, `npx eslint .` and `npm run verify` must pass. `verify` walks every deck, every tour step (with reloads), reduced motion and phone width headless, fails on console errors, missing spotlight targets and external media, and writes screenshots (including mid-animation ones) to `./verify`. Look at them; then check by eye what a script can't, at a projector-like size (≥1280×800):

- every scene and beat forwards and backwards, `?scene=last`, a hard reload on the first scene;
- every effect at the right beat, with screenshots **taken mid-animation**;
- every tour step opened from the chapter menu; the spotlight lands on the right element; the persona switches; clicks work through the spotlight;
- the prototype's interactive moments actually change state;
- side by side with the style reference;
- every image, GIF and video loads from `public/` with the network off; `CREDITS.md` lists sources and licences;
- no console errors; reduced motion (`prefers-reduced-motion: reduce`) still shows all content; phone width doesn't break.

If the in-app browser pane is hidden, animations and `requestAnimationFrame` pause, so its screenshots will lie. `npm run verify` runs its own headless Chromium and doesn't have that problem.

Report what you verified with screenshots and list what you couldn't check. Never claim an effect works without having seen it.

## Sharing a talk (publish, update, delete, list)

The person may ask to publish, share, update, take down or list their talks. Do it yourself with the project's share script; don't send them to a website. Everything runs from the generated project's directory.

| They ask | You run | Then |
| --- | --- | --- |
| "publish / share / give me a link" | `npm run share` | Paste the printed `https://<slug>.neoslides.app/` link back to them. |
| "update it" after changes | `npm run share` | Same link, new version. |
| "a new link, keep the old one" | `npm run share -- --new` | |
| "take it down / delete it" | `npm run share -- --delete` | Deletes the deck in this project's `.neoslides.json`. |
| "what have I published?" | `npm run share -- --list` | Every deck on the account; this project's is marked `→`. |
| "which account am I on?" | `npm run share -- --whoami` | |
| "sign out / forget the token" | `npm run share -- --logout` | |

How sign-in works, and what you must do during it:

- The first run prints a sign-in link and a code and tries to open the browser. **Only the person can complete it** (Google sign-in in their browser). Run the command so you can read its output while it waits (it polls for up to 15 minutes), show them the link and the code, and tell them to approve it; then relay the result. Never ask for, paste or store the token yourself: it stays in `~/.config/neoslides/credentials.json`.
- Later runs reuse the saved token. On `401` the script signs in again by itself.
- In CI, or when the person wants a non-interactive run, they create a personal token at `https://neoslides.dev/account` and set `NEOSLIDES_TOKEN`.

What to tell them when you hand over a link: it is unlisted but public (anyone with the link can open it, so no confidential content); re-running `npm run share` updates it; their decks are also manageable at `https://neoslides.dev/account`.

Failures the script reports in plain words (fix, then re-run): the build failed; the zip is over 25 MB (compress media in `public/`); over 20 decks (delete one with `--list` + `--delete` in that project, or on the account page); rate-limited (wait the printed number of seconds). `docs/sharing.md` has the full contract if something else comes back.

## Hand-over

Tell the person: how to run it (`npm run dev`), the presenter keys (template README), where to edit words (`lib/story.ts`, `lib/tour.ts`) and style (`lib/look.ts`, `app/themes.css`, `STYLE.md`), that it's a prototype with mock data, to rehearse once end to end using the chapter menu, and that `npm run share` (or asking you) turns it into a link.
