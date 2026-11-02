# Storytelling: derive the structure from the idea

There is no default arc. Start from **the one thought the audience should leave with**, then pick or combine the patterns below to get them there. Most talks still have three movements: *why this matters → see it working → what happens next*, with the live tour as the middle. Everything else is a choice.

## Step 1: the takeaway

Write one sentence: *"After this talk, they believe ___ and will ___."* Every scene must move the audience toward that sentence. Cut scenes that don't.

## Step 2: pick a pattern (or mix two)

| Pattern | Use when | Shape |
| --- | --- | --- |
| **Problem → solution** | The pain is widely felt and recognisable | pain artefact → root cause → the turn → tour → next |
| **Before / after** | The change is easy to see side by side | today's flow → same flow with the product (two-beat scene) → tour → next |
| **User journey** | One person's task makes the value concrete | meet the person → their obstacles → the same task in the product (tour) → what changes for them |
| **Origin → future** | History explains why now (platforms, reorgs) | where we came from → what grew → where it hurts → the turn → tour → vision |
| **Launch / announcement** | The product exists or is about to | the promise in one line → three things it does (each shown live) → how to start |
| **Proposal / ask** | You need a decision or budget | the cost of doing nothing → the option → proof (tour) → the ask, explicitly |
| **Case / numbers** | You have real evidence (never invent it) | the situation → what we tried → the result → what we'll do next |
| **Explainer** | The audience needs to understand a concept first | the simplest version → add one layer per scene → tour to show it real |

Short talk (5 min): 3–5 scenes + 3 tour steps. Long talk (20 min): 8–12 scenes + 6–8 tour steps. A tour is the default, but if the product is a single screen, a scene can embed it instead.

## Step 3: write the scene table

| # | Scene | Feynman sentence | Beats | Visual (cards / chart / image / diagram, see `visuals.md`) | Motion (and what it means) |
| --- | --- | --- | --- | --- | --- |

- **Feynman sentence first**: one sentence a child would understand. The scene title is usually that sentence, shortened.
- **Beats** are clicks inside a scene. Use a second beat for a reveal that *changes the meaning* (before → after, closed → open, question → answer).
- **Motion** comes from `motion-method.md`. Most scenes need none beyond reveals.

## Writing rules

- One scene, one idea. If it needs "and", split it or cut half.
- Titles are short (≤ 8 words per line); the accent line lands the point. Leads ≤ 2 sentences. What the presenter says goes in their head, not on screen.
- Use the audience's own words for pain. Paraphrase real messages and label them as paraphrased.
- Own your part in the problem when it's true. It earns the turn.
- No numbers you can't back. A prototype has no metrics; say "prototype".
- Tour `text` is for the audience (why this screen matters); `hint` is for the presenter (what to click).
- End with something the room does: a question, a poll, a next step, a channel.

## Bridges between story and product

- The scene before the tour has a button that starts it (`tour.start(0, true)` resets the demo data).
- The last tour step's "next" opens the next deck; "back" from the first step returns to `/intro?scene=last`.
- Rename or add decks freely: `/intro` and `/vision` are just the template's names. A talk can be one deck plus a tour, or three decks.
