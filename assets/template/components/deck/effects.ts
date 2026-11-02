// Registry of the deck effects: what each one MEANS and what kind of information it shows.
// The /effects gallery is built from this list (scene ids match `id`), and the skill reads it to
// pick an effect for a scene. Add a row when you add an effect; keep `meaning` to one sentence.

export type EffectKind = "cinematic" | "data" | "diagram";

export type InfoType =
  | "beginning" | "ending" | "dropping the old way" | "breaking barriers" | "consolidation" | "spread"
  | "number" | "comparison" | "share" | "trend" | "time" | "process" | "structure" | "scale" | "pain" | "trust" | "trade-off" | "flow";

export interface EffectInfo {
  id: string;
  component: string;
  kind: EffectKind;
  shows: InfoType[];
  meaning: string;
  trigger: string;
  /** Needs the dark "space" stage (sky effects). */
  spaceOnly?: boolean;
}

export const effects: EffectInfo[] = [
  // Cinematic: one big, instantly readable moment. Save for turning points.
  { id: "bang", component: "StarField sky=\"bang\"", kind: "cinematic", shows: ["beginning"], meaning: "It all started here; something big was born.", trigger: "entering the scene", spaceOnly: true },
  { id: "burn", component: "BurnPaper", kind: "cinematic", shows: ["dropping the old way"], meaning: "We are dropping the old way for good.", trigger: "burning" },
  { id: "shatter", component: "Shatter", kind: "cinematic", shows: ["dropping the old way", "breaking barriers"], meaning: "We are breaking it: the old process, the status quo.", trigger: "shattered" },
  { id: "dust", component: "DustAway", kind: "cinematic", shows: ["dropping the old way"], meaning: "It simply stops existing.", trigger: "gone" },
  { id: "wall", component: "WallCollapse", kind: "cinematic", shows: ["breaking barriers"], meaning: "The wall between them is gone; they connect directly.", trigger: "down" },
  { id: "bottleneck", component: "BottleneckFlow", kind: "cinematic", shows: ["process", "flow"], meaning: "One narrow place slows everyone down; we removed it.", trigger: "open" },
  { id: "parcel", component: "ParcelPath", kind: "cinematic", shows: ["process"], meaning: "Every step blocks you today; now it is one straight path.", trigger: "fast" },
  { id: "vortex", component: "Vortex", kind: "cinematic", shows: ["consolidation"], meaning: "All of these get swallowed by one product.", trigger: "active" },
  { id: "plane", component: "PaperPlane", kind: "cinematic", shows: ["process", "flow"], meaning: "Sent instantly; no more chasing.", trigger: "sent" },
  { id: "domino", component: "DominoChain", kind: "cinematic", shows: ["process"], meaning: "One action sets everything else in motion.", trigger: "active" },
  { id: "lights", component: "LightsOn", kind: "cinematic", shows: ["spread", "scale"], meaning: "It spreads, team by team, until the whole company is lit.", trigger: "lit (0–1)" },
  { id: "fireworks", component: "Fireworks", kind: "cinematic", shows: ["ending", "beginning"], meaning: "We did it; it's live.", trigger: "active" },
  { id: "collapse", component: "StarField sky=\"collapse\"", kind: "cinematic", shows: ["ending", "consolidation"], meaning: "Everything comes together into one thing.", trigger: "entering the scene", spaceOnly: true },
  // Data: make a number, a share or a change countable.
  { id: "count", component: "CountUp", kind: "data", shows: ["number"], meaning: "The number itself is the point.", trigger: "value" },
  { id: "ring", component: "ProgressRing", kind: "data", shows: ["number", "share"], meaning: "How far we are toward the goal.", trigger: "active" },
  { id: "bars", component: "CompareBars", kind: "data", shows: ["comparison"], meaning: "This is how much it shrinks or grows.", trigger: "after" },
  { id: "race", component: "SplitRace", kind: "data", shows: ["comparison", "time"], meaning: "Same task, two ways: one finishes long before the other.", trigger: "active" },
  { id: "dots", component: "DotMatrix", kind: "data", shows: ["share"], meaning: "N out of every M.", trigger: "active" },
  { id: "growth", component: "GrowthLine", kind: "data", shows: ["trend"], meaning: "The trend, against a baseline without us.", trigger: "active" },
  { id: "timeline", component: "TimelineDraw", kind: "data", shows: ["time"], meaning: "Where we are, and what comes next.", trigger: "progress (beat)" },
  { id: "calendar", component: "CalendarBurn", kind: "data", shows: ["time", "pain"], meaning: "This is how long people wait.", trigger: "active" },
  { id: "zoom", component: "ZoomOut", kind: "data", shows: ["scale"], meaning: "It isn't one case; it's hundreds.", trigger: "out" },
  // Diagram: explain how something works or is organised.
  { id: "chaos", component: "ChaosToOrder", kind: "diagram", shows: ["structure"], meaning: "A mess becomes a system.", trigger: "ordered" },
  { id: "weave", component: "NetworkWeave", kind: "diagram", shows: ["structure", "consolidation"], meaning: "Everyone wired to everyone becomes one hub.", trigger: "hub" },
  { id: "layers", component: "LayerStack", kind: "diagram", shows: ["structure"], meaning: "This is what it's made of.", trigger: "exploded" },
  { id: "pipeline", component: "Pipeline", kind: "diagram", shows: ["process"], meaning: "Each step turns it into something better.", trigger: "active" },
  { id: "ibo", component: "InputBoxOutput", kind: "diagram", shows: ["process"], meaning: "Put the raw stuff in, get the finished thing out.", trigger: "active" },
  { id: "chat", component: "ChatReplay", kind: "diagram", shows: ["pain"], meaning: "This is what it looks like today.", trigger: "active" },
  { id: "bucket", component: "LeakyBucket", kind: "diagram", shows: ["pain"], meaning: "We lose this much on the way; then the holes are plugged.", trigger: "fixed" },
  { id: "stamp", component: "Stamp", kind: "diagram", shows: ["pain", "dropping the old way"], meaning: "A hard stop (or a decisive verdict).", trigger: "active" },
  { id: "fog", component: "FogReveal", kind: "diagram", shows: ["trust"], meaning: "What nobody could see becomes visible.", trigger: "clear" },
  { id: "checks", component: "AutoChecklist", kind: "diagram", shows: ["trust"], meaning: "The system checks it for you and catches the problem.", trigger: "active" },
  { id: "shield", component: "Shield", kind: "diagram", shows: ["trust"], meaning: "It protects you: threats bounce off.", trigger: "active" },
  { id: "scale", component: "BalanceScale", kind: "diagram", shows: ["trade-off"], meaning: "The gains outweigh the cost.", trigger: "showRight" },
  { id: "wipe", component: "WipeCompare", kind: "diagram", shows: ["comparison"], meaning: "The same screen, before and after.", trigger: "after" },
  { id: "poll", component: "Poll", kind: "diagram", shows: ["ending"], meaning: "Your voice decides what comes next.", trigger: "clicks" },
  { id: "ghost", component: "GhostCursor", kind: "diagram", shows: ["process"], meaning: "Watch how short the flow is (an illustration, not the live product).", trigger: "active" },
];
