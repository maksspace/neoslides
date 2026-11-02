# Visuals: images, GIFs, charts, infographics

Motion is one way to explain. Often a picture, a chart or a few well-made cards explain faster. **Use them whenever they make the idea clearer or more vivid than words alone.** A talk that is only text on a dark background is a failure of imagination, not restraint.

The test is the same as for motion: what does this visual let the audience understand or feel that the sentence alone doesn't? If the answer is "nothing, it's decoration", leave it out. If it's "they'll instantly see the scale / recognise the situation / remember it", use it.

## Pick the form from the information

| The scene is about… | Best form | Example |
| --- | --- | --- |
| a few parallel points, options, principles | **cards**: icon + short title + one line | three principles, each on a card that reveals on its beat |
| one striking number | **big number** (count-up) with a comparison | "14 days" next to "1 minute" |
| numbers that compare, trend or split | **chart** (bar, line, area, donut) | requests per week before and after |
| numbers the room will ask "what if" about | **interactive chart**: slider, toggle, hover | drag team size, see hours saved |
| a mechanism, a flow, a structure | **infographic / diagram** built from SVG and cards, revealed part by part | how a request moves through the system |
| a real-world situation everyone recognises | **photo** or **GIF / short video** | an overflowing inbox, a queue at a counter |
| a concept with no photo (a feeling, a metaphor, a future) | **generated or drawn illustration** in the talk's style | "the old process is a maze" |
| the product itself | **the live prototype**, never a screenshot | |

Mix them across the talk. Cards on one scene, a chart on the next, a photo on the pain scene, a cinematic effect on the turn. Variety keeps attention; one form repeated ten times is a slide deck again.

One main visual per scene. It can be combined with motion when the motion *is* about the visual (a photo that burns, a chart whose bars race, cards that collapse into one).

## Cards and infographics

- Build them as components with the theme tokens, not as images: they stay sharp, themed and animatable.
- Icons from `lucide-react` (already in the template). One icon style per talk.
- Short: a card is a title of 2–5 words and at most one line under it.
- Reveal part by part on beats, so the presenter tells the story while it builds.

## Charts

- Use the shadcn chart component (`npx shadcn@latest add chart`, Recharts underneath) so charts pick up the theme's `--chart-*` colours. For one bar or one line, a hand-made SVG is often cleaner.
- One message per chart, said in the title ("Waiting time fell from 3 days to 4 minutes"), not "Waiting time".
- Highlight the one series or bar that matters; grey out the rest.
- Animate the data in on its beat (bars grow, line draws), not on load.
- **Interactive** when the room will want to play: a slider for an input, a toggle for before/after, hover for exact values. Keep it usable with a clicker too: the default state must already tell the story.
- **Numbers are real or labelled.** Real numbers need a source (a small caption). Invented numbers for a prototype get a visible "illustrative" label. Never present made-up data as measured.

## Photos, GIFs and video from the internet

- Only use media you're allowed to: the person's own assets, or free-licence sources (Unsplash, Pexels, Pixabay, Wikimedia Commons with a compatible licence, official GIPHY/Tenor embeds). Check the licence of each file; when unsure, don't.
- Download into `public/media/` and reference locally. Never hotlink: the talk must work offline on a conference Wi-Fi and the link must not die.
- Keep a `CREDITS.md` (file, source URL, author, licence) and show credits where the licence asks for it.
- Prefer a short muted looping `.mp4`/`.webm` over a GIF: a fraction of the size and smoother. Autoplay, `muted`, `loop`, `playsInline`.
- Compress: images ≤ 300 KB, video loops ≤ 3 MB. Size them for 1920 px wide at most.
- No logos, trademarks or recognisable people unless they are the person's own or clearly licensed for this use. No memes with unclear rights in anything public.
- Treat the picture with the talk's style (crop, duotone or tint with the theme colours, grain, rounded corners) so it belongs to the deck instead of looking pasted in.

## Generated and drawn images

- If an image-generation tool is available in the session, use it for illustrations that don't exist as photos: metaphors, scenes from the future, a mascot-free hero picture. Write the prompt from `STYLE.md` (palette, mood, medium) so every image looks like one series; generate all images of the talk in the same style.
- Without such a tool, draw it: SVG or CSS illustrations in the theme colours are often better than a stock photo anyway, and they can animate. Or ask the person for images and say exactly what each one should show.
- Save generated files in `public/media/` and note in `CREDITS.md` that they are generated.
- Generated images never stand in for real product screens, real people, real data or real customers.

## Before you show it

- Does every visual make its scene clearer or more vivid? Remove the ones that don't.
- Does it look like the same talk: same palette, same treatment, same icon style?
- Do all media load from `public/` with the network off?
- Are licences and sources in `CREDITS.md`, and is invented data labelled?
