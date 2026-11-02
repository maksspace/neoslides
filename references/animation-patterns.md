# Animation patterns: pick the picture from the information

Use this catalogue when a scene needs motion. It's organised by **what kind of information the scene carries**, because that, not taste, decides the best picture. `motion-method.md` explains the method; this file is the menu of proven pictures and how to build each one.

## How to choose (do this per scene)

1. **Name the information type.** Write the scene's Feynman sentence, then ask what it really is: a number? a comparison? a change over time? a process? a structure? a cause and effect? a risk? a feeling? Use the section headings below.
2. **List 2–3 candidate patterns** from that section. Read each one's "use when" and "avoid when".
3. **Pick by three filters, in this order:**
   - *Truth*: does the picture match the data honestly? (Don't animate a 5% change as a dramatic collapse; don't draw a trend from two points.)
   - *Instant read*: would someone at the back of the room get it without the presenter talking?
   - *Style fit*: does it suit the look? (Editorial/paper → ink, lines, type, paper objects. Tech/dark → light, particles, glow. Playful brand → bounce, squash, colour. Corporate/calm → slow fades, clean bars.)
4. **Prefer the plainer picture** when two fit equally well. A count-up that lands beats a particle storm that impresses.
5. **Write the motion row** of the scene table: pattern, what state A and state B are, which beat flips it, and the one-sentence meaning.

Ready-made components (in `components/deck/`, listed in the registry `components/deck/effects.ts`, previewed at `/effects` and `/effects?stage=paper`) are marked **[component]**. Everything else is a recipe: build it fresh for the talk, following the rules in `motion-method.md`. Copy for all labels goes in `story.ts`.

---

## 0. Cinematic moments: the scenes people retell afterwards

These are the signature shots of a talk: one big, physical, instantly readable picture of the story's turning point. A talk usually has **one or two**, placed where the old way dies or the product appears. Pick by the *verb* of the turning point:

| The turning point is… | Effect | Picture |
| --- | --- | --- |
| we **drop** the old way | **Burn** [component `BurnPaper`] | the artefact (chat, form, spreadsheet) burns away |
| we **break** the status quo | **Shatter** [component `Shatter`] | cracks run out, the block bursts into glass shards |
| the old thing **stops existing**, quietly | **Dust away** [component `DustAway`] | it crumbles into dust and drifts off on the wind |
| we **remove a barrier** between people | **Wall collapse** [component `WallCollapse`] | bricks tumble, the two sides move in and connect |
| we **unblock** a choke point | **Bottleneck** [component `BottleneckFlow`] | the neck widens and the queue flushes |
| we **clear the path** | **Parcel on a path** [component `ParcelPath`] | red blockers turn green and the parcel flies through |
| many tools **become one** | **Vortex** [component `Vortex`] (any stage) or **Collapse** [`StarField` sky] (space) | everything spirals into the centre; the product is born there |
| it **just goes**, no chasing | **Paper plane** [component `PaperPlane`] | the form folds into a plane and flies to "Delivered ✓" |
| one action **triggers** everything | **Domino chain** [component `DominoChain`] | tiles knock each other down; the result lights up |
| it **spreads** across the company | **Lights on** [component `LightsOn`] | a night city lights up window by window, beat by beat |
| it **began** here | **Big bang** [`StarField` sky `bang`] | flash, stars burst, chips fly out |
| it's **live** / we did it | **Fireworks** [component `Fireworks`] | rockets rise and burst, then quiet |

Rules for cinematic moments: give each its own scene with a two-beat setup (show the thing first, then destroy / transform it on the click); keep the headline short ("Broken. Good riddance."); don't stack two in a row; the artefact being destroyed should be something the audience recognises from their own work.

## 1. One number that matters

| Pattern | Picture | Use when | Build |
| --- | --- | --- | --- |
| **Count-up** [component `CountUp`] | the number ticks up (or down) and lands | the number *is* the headline: "2 hours", "$1.2M", "40 000 users" | `<CountUp value from suffix decimals />`; change `value` on a beat to replay from the old number |
| **Odometer** | digits roll like a car meter | a running total that keeps growing; mechanical/retro styles | one column per digit, `translateY(-n × 1em)` with a long ease |
| **Number + unit swap** | "14 days" counts down, then the unit flips to "hours" | the improvement is in orders of magnitude | `CountUp` plus a held `Reveal` for the new unit |
| **Big number, tiny context** | huge number, then a small line underneath reframes it ("…of which 30% is waiting") | the number needs one qualifier to be honest | number reveals first, qualifier on the next beat |

Avoid animating numbers that the audience must compare with each other: use a comparison pattern instead.

## 2. Comparison: before / after, us / them, A / B

| Pattern | Picture | Use when | Build |
| --- | --- | --- | --- |
| **Compare bars** [component `CompareBars`] | red bars slide to green new values, old length stays as a dashed ghost | 2–5 measures change at once | `<CompareBars rows after />` |
| **Wipe compare** [component `WipeCompare`] | "after" wipes over "before" behind a moving divider | the same screen, document or process looks different | `<WipeCompare after before={…}>{after}</WipeCompare>`; keep both layers the same layout |
| **Split race** [component `SplitRace`] | two lanes run the same task side by side; one finishes early | speed or effort difference between two ways | `<SplitRace lanes active />`; durations proportional to the real difference where possible |
| **Balance scale** [component `BalanceScale`] | weights drop on pans; the beam swings | a trade-off: costs vs gains, risk vs reward | `<BalanceScale left right showRight />`; one item = one weight |
| **Stack heights** | two piles of blocks (hours, tickets, money) build side by side | totals made of many small units | blocks fall in with staggered `transform`; same block size on both sides |
| **Ghost overlay** | the old shape stays as a faint outline under the new one | the change is in shape (a curve, a funnel, a layout) | duplicate the element, fade one to 20 % with a dashed stroke |

Keep good/bad as green/red. Never compare on different scales.

## 3. Share and proportion

| Pattern | Picture | Use when | Build |
| --- | --- | --- | --- |
| **Dot matrix** [component `DotMatrix`] | 100 dots, 30 light up one by one | "3 of every 10", people or cases rather than abstract % | `<DotMatrix total highlight active tone />` |
| **People row** | a row of person icons, some change colour | the share is about humans and the room should feel it | the same as dot matrix with person glyphs (inline SVG) |
| **Progress ring** [component `ProgressRing`] | a ring fills to the percentage with the number inside | a goal or capacity ("72 % migrated") | `<ProgressRing value active label />` |
| **Filling vessel** | a glass or battery fills to the level | a capacity or a goal ("we're at 70 % of the target") | SVG `clipPath` rect rising, or `stroke-dashoffset` on a ring |
| **Pie that splits** | one circle slices into labelled parts | at most 3–4 parts of one whole | SVG arcs with `stroke-dasharray`, each drawn in sequence |

Avoid pies with more than four slices; use bars.

## 4. Change over time

| Pattern | Picture | Use when | Build |
| --- | --- | --- | --- |
| **Growth line** [component `GrowthLine`] | the line draws left to right and ends on its value; an optional dashed baseline shows "without us" | a trend over 6+ points | `<GrowthLine points baseline labels active suffix />` |
| **Timeline** [component `TimelineDraw`] | a line fills through milestones, one per beat; the current one pulses | a roadmap, a history, phases of a rollout | `<TimelineDraw milestones progress={beat} />` |
| **Calendar burn** [component `CalendarBurn`] | days on a calendar cross out one by one | waiting time, deadlines, "this took 3 weeks" | `<CalendarBurn days crossed active weekdays countLabel />` |
| **Clock spin** | clock hands whirl forwards, then stop | time passing or saved; works with a count-up next to it | rotate hands with the Web Animations API; one revolution per "hour" |
| **Before/after timelines** | two stacked timelines, the second is visibly shorter | the same process, faster | two `TimelineDraw`s with the same scale, second on the next beat |

## 5. Process and flow

| Pattern | Picture | Use when | Build |
| --- | --- | --- | --- |
| **Parcel on a path** [component `ParcelPath`] | a parcel hits red blockers and waits; then flies through green steps | a process with specific blockers that the product removes | `<ParcelPath steps fast />` |
| **Bottleneck** [component `BottleneckFlow`] | dots queue at a narrow neck; the neck widens and the queue flushes | one point (a team, a person, an approval) throttles everyone | `<BottleneckFlow open labels />` |
| **Pipeline** [component `Pipeline`] | an item rides a belt through stations; each station changes it | a pipeline that transforms something step by step (raw → reviewed → shipped) | `<Pipeline stations states active />` |
| **Relay / hand-off** | a baton passes between people; one drop shows where things get lost | many hand-offs between teams | avatars in a row, a dot jumps between them with arcs; on the "lost" step it falls and fades |
| **Branching paths** | one path splits into options; one lights up | a decision or a routing rule | SVG paths drawn with `stroke-dashoffset`; the chosen branch thickens |
| **Packets on a network** | small dots travel along lines between systems | data or messages flowing between systems | SVG `<circle>` with `offset-path: path(…)` animated `offset-distance` |

## 6. Structure and organisation

| Pattern | Picture | Use when | Build |
| --- | --- | --- | --- |
| **Chaos to order** [component `ChaosToOrder`] | scattered, tilted tiles fly into a grid or labelled columns | "a mess becomes a system", sorting, categorising | `<ChaosToOrder items groups ordered />` |
| **Network weave** [component `NetworkWeave`] | a tangle of red point-to-point links becomes clean spokes to one hub | integrations, communication overload, "one platform" | `<NetworkWeave nodes hub hubLabel linksLabel />` |
| **Layer stack** [component `LayerStack`] | layers lift apart in 3D to show the architecture | explaining what sits on top of what (UI / API / data) | `<LayerStack layers exploded />` |
| **Tree grows** | a root node sprouts branches level by level | hierarchy, permissions, an org chart | nested lists; branches drawn as SVG paths per level, one level per beat |
| **Puzzle fit** | pieces slide in and lock together | parts that only work together; "the missing piece" | absolutely positioned pieces with a final snap (slight overshoot easing) |
| **Magnet pull** | scattered things are pulled into one place | consolidation: "everything in one place" | like chaos-to-order with all targets at one point; the starter `StarField` collapse does this in the sky |

## 7. Scale and magnitude

| Pattern | Picture | Use when | Build |
| --- | --- | --- | --- |
| **Zoom out** [component `ZoomOut`] | one story card shrinks into one cell of a grid full of copies | "it isn't one case, it's hundreds" | `<ZoomOut out countLabel>{one story}</ZoomOut>` |
| **Powers of ten** | the view zooms out in steps: one person → a team → the company | showing reach or blast radius | nested boxes; scale the outer wrapper down by ×3 per beat |
| **Pile up** | items rain down and pile until they fill the screen | volume that overwhelms (tickets, emails, requests) | canvas or many absolutely positioned elements with a gravity-like ease; cap at ~150 elements |
| **Ruler / size compare** | two objects next to a ruler; one is tiny | a dramatic size difference that numbers don't convey | SVG with a scale bar; the big object grows from the small one |

## 8. Before the problem is solved: friction, waste, pain

| Pattern | Picture | Use when | Build |
| --- | --- | --- | --- |
| **Chat replay** [component `ChatReplay`] | a real-looking thread arrives message by message, with days between them | the pain lives in chats, emails or tickets | `<ChatReplay messages pace />`; time stamps carry the wait |
| **Burn** [component `BurnPaper`] | the old artefact burns away | dropping the old way, decisively | `<BurnPaper burning>{artefact}</BurnPaper>` |
| **Tab explosion** | browser tabs or windows multiply across the screen | context switching, too many tools | many small window cards popping in with stagger and slight rotation |
| **Leaky bucket** [component `LeakyBucket`] | water jets out of labelled holes; plugged, it fills | lost leads, money, requests; "we lose X on the way" | `<LeakyBucket holes fixed inLabel />` |
| **Tangle** | a line gets knotted as more steps are added | complexity that grew over time | an SVG path whose `d` morphs to a messier curve (interpolate points) |
| **Stamp** [component `Stamp`] | a big "REJECTED" / "WAIT" / "ARCHIVED" stamp slams onto a document | bureaucracy, a hard stop, retiring something | `<Stamp text active tone>{document}</Stamp>` |

Show pain once, briefly; the relief afterwards is the point.

## 9. Trust, safety, control

| Pattern | Picture | Use when | Build |
| --- | --- | --- | --- |
| **Auto checklist** [component `AutoChecklist`] | checks tick themselves; a failing rule turns red and states the verdict | the product validates, guards or enforces rules | `<AutoChecklist items active verdict />` (mark one item `fail` to show the guard working) |
| **Shield** [component `Shield`] | threats hit the core; with the shield they bounce off | protection from mistakes, fraud, outages | `<Shield core threats active shieldLabel />` |
| **Lock click** | a padlock closes; the shackle drops | access control, secure by default | two SVG parts; the shackle translates down with a snap |
| **Audit trail** | actions leave footprints that line up into a log | traceability, "every change is recorded" | each action pops a row into a list with a time stamp; reuse chat replay styling |
| **Fog reveal** [component `FogReveal`] | a frosted fog sweeps off the content | visibility: "now you can see what was hidden" | `<FogReveal clear hiddenLabel>{content}</FogReveal>` |
| **Spotlight sweep** | a beam moves across a dark area and stops on the issue | finding the needle; monitoring; detection | a radial-gradient mask whose position animates |

## 10. Beginning, launch, togetherness, ending

| Pattern | Picture | Use when | Build |
| --- | --- | --- | --- |
| **Big bang** [`StarField` sky `bang`] | flash, stars burst, things fly out | an origin story; "everything starts here" | `sky: "bang"` (space stage) |
| **Collapse into a mark** [`StarField` sky `collapse`] | the sky pulls into one point; the mark is born | a finale; everything becomes one product | `sky: "collapse"` + `data-collapse-target` |
| **Lights on** [component `LightsOn`] | a night city lights up, beat by beat | adoption, rollout across teams | `<LightsOn lit={0.1 / 0.4 / 1} countTotal countLabel />` |
| **Seed to tree** | a dot sprouts into a branching shape | a small start that grows; a pilot that scales | SVG paths drawn in sequence by depth |
| **Ink spread** | an ink blot spreads into the title or mark | editorial/paper styles; a calm launch | a radial mask growing behind the title; or SVG turbulence filter animating `scale` |
| **Hands / pieces meet** | two halves slide together and join | a partnership, two teams, product + process | two shapes from opposite edges with a soft overshoot |
| **Live poll** [component `Poll`] | the room votes; bars race | ask the audience to decide what's next | `<Poll question topics hint resetLabel />` |

## 11. Explaining a concept

| Pattern | Picture | Use when | Build |
| --- | --- | --- | --- |
| **Build-up diagram** | the diagram appears part by part, one per beat, with labels | explaining a mechanism the audience hasn't seen | `<Reveal when={beat >= n}>` on each SVG group; no other motion |
| **Highlight the active part** | the whole diagram is visible; the current part brightens, others dim | walking through a known structure step by step | `data-active` per part, `opacity: .25` for the rest |
| **Analogy morph** | a familiar object morphs into the product's concept (a mailbox → an inbox queue) | the concept is new but resembles something everyday | crossfade two SVGs with matching positions, or morph path points |
| **Input → box → output** [component `InputBoxOutput`] | inputs fly into a box, it works, the answer comes out | AI, automation, any "it just does it" feature | `<InputBoxOutput inputs boxLabel output active />` |

## 12. Inside the product (not for the live tour)

In deck scenes only, never during the tour itself:

- **Ghost cursor** [component `GhostCursor`]: a fake cursor clicks through a mock screen to show a flow faster than live; its `tag` ("Illustration") stays on screen.
- **Typing**: a field fills itself character by character, then the result appears.
- **Notification drop**: a toast slides in at the right moment ("Approved ✓").

---

## Motion character by style

Tune the same pattern to the style chosen in `STYLE.md`:

| Style | Timing | Easing | Typical pictures |
| --- | --- | --- | --- |
| Editorial / paper | 600–1000 ms | soft ease-out, no bounce | ink, lines drawing, paper burning, type changing |
| Tech / dark | 400–800 ms | sharp ease-out | light, glow, particles, packets, grids |
| Playful / consumer | 300–600 ms | overshoot and bounce | squash and stretch, pop-ins, confetti (sparingly) |
| Corporate / calm | 500–800 ms | linear-ish ease-in-out | bars, counters, clean diagrams, fades |
| Premium / luxury | 900–1400 ms | slow, long ease-out | big type, slow reveals, very little movement |

## Combining patterns across a talk

- One meaning-bearing animation per scene; across a talk, **use 3–5 different patterns**, not one pattern everywhere, and not ten.
- Reuse a pattern on purpose to create a callback: the same `CompareBars` in the problem scene and the results scene, flipped.
- Keep the strongest effect for the turning point of the story (the moment the product appears) or the finale.
- If two neighbouring scenes both move a lot, make one of them still.
