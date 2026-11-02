"use client";

import type { ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AutoChecklist } from "@/components/deck/auto-checklist";
import { BalanceScale } from "@/components/deck/balance-scale";
import { BottleneckFlow } from "@/components/deck/bottleneck-flow";
import { BurnPaper } from "@/components/deck/burn-paper";
import { CalendarBurn } from "@/components/deck/calendar-burn";
import { ChaosToOrder } from "@/components/deck/chaos-to-order";
import { ChatReplay } from "@/components/deck/chat-replay";
import { CompareBars } from "@/components/deck/compare-bars";
import { CountUp } from "@/components/deck/count-up";
import { Deck, Reveal, Scene, useDeckContext, type DeckScene } from "@/components/deck/deck";
import { DominoChain } from "@/components/deck/domino-chain";
import { DotMatrix } from "@/components/deck/dot-matrix";
import { DustAway } from "@/components/deck/dust-away";
import { effects, type EffectInfo } from "@/components/deck/effects";
import { Fireworks } from "@/components/deck/fireworks";
import { FogReveal } from "@/components/deck/fog-reveal";
import { GhostCursor } from "@/components/deck/ghost-cursor";
import { GrowthLine } from "@/components/deck/growth-line";
import { InputBoxOutput } from "@/components/deck/input-box-output";
import { LayerStack } from "@/components/deck/layer-stack";
import { LeakyBucket } from "@/components/deck/leaky-bucket";
import { LightsOn } from "@/components/deck/lights-on";
import { NetworkWeave } from "@/components/deck/network-weave";
import { PaperPlane } from "@/components/deck/paper-plane";
import { ParcelPath } from "@/components/deck/parcel-path";
import { Pipeline } from "@/components/deck/pipeline";
import { Poll } from "@/components/deck/poll";
import { ProgressRing } from "@/components/deck/progress-ring";
import { Shatter } from "@/components/deck/shatter";
import { Shield } from "@/components/deck/shield";
import { SplitRace } from "@/components/deck/split-race";
import { Stamp } from "@/components/deck/stamp";
import { TimelineDraw } from "@/components/deck/timeline-draw";
import { Vortex } from "@/components/deck/vortex";
import { WallCollapse } from "@/components/deck/wall-collapse";
import { WipeCompare } from "@/components/deck/wipe-compare";
import { ZoomOut } from "@/components/deck/zoom-out";

// Developer preview of the effects library at /effects (space stage; `?stage=paper` for the light one).
// Scenes are built from the registry in components/deck/effects.ts: an index first, then one demo
// per effect. Copy is inline on purpose: this is tooling, not the talk, and it is not translated.

const steps = [
  { title: "Idea", blocker: "", fixed: "" },
  { title: "Approval", blocker: "waiting", fixed: "self-service" },
  { title: "Access", blocker: "ticket", fixed: "instant" },
  { title: "Review", blocker: "unclear rules", fixed: "one click" },
  { title: "Done", blocker: "", fixed: "" },
];
const chat = [
  { from: "Anna", text: "Hi! Who approves access to the reports?", mine: true, time: "Mon 10:02" },
  { from: "Pavel", text: "Not me, try Olga", time: "Mon 11:40" },
  { from: "Olga", text: "Fill in the form in the wiki and ping me", time: "Tue 09:15" },
  { from: "Anna", text: "Done, pinged you yesterday 🙏", mine: true, time: "Thu 16:30" },
];
const mess = [
  { label: "Invoices", group: "Money" }, { label: "Chat thread", group: "People" }, { label: "Roadmap", group: "Plans" },
  { label: "Payroll", group: "Money" }, { label: "Onboarding", group: "People" }, { label: "OKRs", group: "Plans" },
  { label: "Budget", group: "Money" }, { label: "Hiring", group: "People" }, { label: "Releases", group: "Plans" },
  { label: "Refunds", group: "Money" }, { label: "Reviews", group: "People" },
];
const checks = [{ label: "Dates are free in the team" }, { label: "Within the yearly limit" }, { label: "Two people stay on duty", fail: true }, { label: "Manager notified" }];
const ghostTargets = ["dates", "submit"];
const tools = ["Spreadsheet", "Chat", "Email", "Wiki page", "Tracker", "Calendar", "Sticky notes", "Shared drive"];

function Card({ title, lines, tone }: { title: string; lines: string[]; tone?: "bad" | "good" }) {
  return (
    <div className="deck-card gallery-card" data-tone={tone}>
      <strong>{title}</strong>
      {lines.map((line) => <p key={line}>{line}</p>)}
    </div>
  );
}

const oldWay = <Card title="The old way" lines={["Ask in chat → wait → ask again", "Wait for approval", "Copy into a spreadsheet"]} tone="bad" />;

// What each effect looks like in a scene: the headline (per beat), how many beats, and the demo.
interface Demo {
  beats?: number;
  title: (beat: number) => string;
  layout?: "split" | "center" | "stack";
  render: (beat: number) => ReactNode;
}

const demos: Record<string, Demo> = {
  bang: { title: () => "It all started here.", layout: "center", render: () => null },
  burn: { beats: 2, layout: "split", title: () => "We are dropping the old way.", render: (beat) => <BurnPaper burning={beat >= 1}>{oldWay}</BurnPaper> },
  shatter: { beats: 2, layout: "split", title: (beat) => (beat ? "Broken. Good riddance." : "The process everyone works around."), render: (beat) => <Shatter shattered={beat >= 1}>{oldWay}</Shatter> },
  dust: { beats: 2, layout: "split", title: (beat) => (beat ? "And it's gone." : "The weekly status report."), render: (beat) => <DustAway gone={beat >= 1}><Card title="Weekly status report" lines={["12 slides", "4 hours to assemble", "Read by nobody"]} /></DustAway> },
  wall: { beats: 2, title: (beat) => (beat ? "Now they talk directly." : "A wall between sales and engineering."), layout: "center", render: (beat) => <WallCollapse down={beat >= 1} left="Sales" right="Engineering" joinLabel="One shared board" bricks={["Tickets", "Hand-offs", "Email", "Specs", "Waiting", "Meetings", "Approvals", "Status calls", "Docs"]} /> },
  bottleneck: { beats: 2, title: (beat) => (beat ? "Self-service: the queue flushes." : "One narrow place slows everyone down."), render: (beat) => <BottleneckFlowDemo open={beat >= 1} /> },
  parcel: { beats: 2, title: (beat) => (beat ? "Now it is one straight path." : "Today every step blocks you."), render: (beat) => <ParcelPath steps={steps} fast={beat >= 1} waitingLabel="waiting…" /> },
  vortex: { beats: 2, layout: "center", title: (beat) => (beat ? "All of it, in one place." : "Eight tools for one job."), render: (beat) => <Vortex items={tools} active={beat >= 1}><span className="finale__mark">A</span></Vortex> },
  plane: { beats: 2, layout: "split", title: (beat) => (beat ? "Sent. Nobody to chase." : "Fill in, print, carry it to HR?"), render: (beat) => <PaperPlane sent={beat >= 1} deliveredLabel="Delivered to manager ✓"><Card title="Leave request" lines={["12–14 March", "Reason: family trip", "Signature: ________"]} /></PaperPlane> },
  domino: { beats: 2, layout: "center", title: () => "One click sets everything in motion.", render: (beat) => <DominoChain active={beat >= 1} steps={["Request", "Rules check", "Approve", "Calendar", "Payroll"]} result="Done in 2 min" /> },
  lights: { beats: 3, layout: "center", title: (beat) => ["Started with one pilot team.", "Then the whole department.", "Now the whole company."][beat], render: (beat) => <LightsOn lit={[0.08, 0.4, 1][beat]} countTotal={120} countLabel="teams on board" /> },
  fireworks: { beats: 2, layout: "center", title: (beat) => (beat ? "It's live." : "Launch day."), render: (beat) => <FireworksDemo active={beat >= 1} /> },
  collapse: { title: () => "Everything comes together into one thing.", layout: "center", render: () => null },
  count: { beats: 2, layout: "center", title: () => "The number itself is the point.", render: (beat) => <span className="gallery-big"><CountUp value={beat ? 2 : 14} suffix={beat ? " hours" : " days"} /></span> },
  ring: { beats: 2, layout: "split", title: () => "We're most of the way there.", render: (beat) => <ProgressRing value={72} active={beat >= 1} label="of teams migrated" /> },
  bars: { beats: 2, title: () => "This is how much it shrinks.", render: (beat) => <CompareBars after={beat >= 1} rows={[{ label: "Time to approve", before: 72, after: 4, unit: "h" }, { label: "People involved", before: 6, after: 1 }, { label: "Messages sent", before: 23, after: 2 }]} /> },
  race: { beats: 2, title: () => "Same request. Two ways.", render: (beat) => <SplitRace active={beat >= 1} lanes={[{ label: "Today", time: "3 days", duration: 4200, tone: "bad" }, { label: "With Away", time: "2 min", duration: 700, tone: "good" }]} /> },
  dots: { beats: 2, layout: "split", title: () => "Three in every ten requests get lost.", render: (beat) => <DotMatrix total={100} highlight={30} active={beat >= 1} tone="bad" columns={10} /> },
  growth: { beats: 2, title: () => "Since launch, the trend only goes one way.", render: (beat) => <GrowthLine active={beat >= 1} points={[12, 14, 19, 26, 34, 47, 61, 78]} baseline={[12, 13, 13, 14, 15, 15, 16, 16]} labels={["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"]} suffix="%" /> },
  timeline: { beats: 4, title: () => "Where we are, and what comes next.", render: (beat) => <TimelineDraw progress={beat} milestones={[{ when: "Q1", title: "Prototype" }, { when: "Q2", title: "Pilot with one team" }, { when: "Q3", title: "Whole company" }, { when: "Q4", title: "Partners" }]} /> },
  calendar: { beats: 2, layout: "split", title: () => "This is how long a simple request waits.", render: (beat) => <CalendarBurn active={beat >= 1} days={30} crossed={17} startDay={2} weekdays={["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"]} countLabel="days waiting" /> },
  zoom: { beats: 2, title: (beat) => (beat ? "And there are a hundred like her every week." : "This is Anna's request."), render: (beat) => <ZoomOut out={beat >= 1} countLabel="requests a week"><Card title="Anna · access to reports" lines={["Asked 4 days ago", "3 people involved", "Still waiting"]} /></ZoomOut> },
  chaos: { beats: 2, title: (beat) => (beat ? "Now everything has its place." : "Everything is everywhere."), render: (beat) => <ChaosToOrder items={mess} groups={["Money", "People", "Plans"]} ordered={beat >= 1} /> },
  weave: { beats: 2, layout: "center", title: (beat) => (beat ? "One hub, one link each." : "Every system wired to every other."), render: (beat) => <NetworkWeave nodes={["CRM", "Billing", "Support", "Analytics", "Mail", "HR"]} hub={beat >= 1} hubLabel="Hub" linksLabel="integrations to maintain" /> },
  layers: { beats: 2, layout: "split", title: (beat) => (beat ? "Three layers, one job each." : "What's inside?"), render: (beat) => <LayerStack exploded={beat >= 1} layers={[{ label: "Interface", note: "what people click" }, { label: "Rules engine", note: "policies, limits" }, { label: "Data", note: "people, teams, calendars" }]} /> },
  pipeline: { beats: 2, title: () => "Each step makes it better.", render: (beat) => <Pipeline active={beat >= 1} stations={["Draft", "Checked", "Approved", "Scheduled"]} states={["rough idea", "rules ✓", "manager ✓", "in calendar"]} /> },
  ibo: { beats: 2, layout: "center", title: () => "Throw in the mess, get the answer.", render: (beat) => <InputBoxOutput active={beat >= 1} inputs={["Chat export", "Spreadsheet", "Calendar", "Policy PDF"]} boxLabel="Away" output="Approved: 12–14 March" /> },
  chat: { layout: "split", title: () => "This is how it looks today.", render: () => <ChatReplay messages={chat} /> },
  bucket: { beats: 2, layout: "split", title: (beat) => (beat ? "Holes plugged. It finally fills up." : "We lose requests on the way."), render: (beat) => <LeakyBucket fixed={beat >= 1} inLabel="Incoming requests" holes={["Lost in chat", "Forgotten", "Wrong person", "Expired"]} /> },
  stamp: { beats: 2, layout: "split", title: (beat) => (beat ? "Rejected. Again." : "Your request, after 9 days."), render: (beat) => <Stamp active={beat >= 1} text="Rejected"><Card title="Leave request" lines={["12–14 March", "Submitted 9 days ago", "Reason: missing signature"]} /></Stamp> },
  fog: { beats: 2, layout: "split", title: () => "What nobody could see becomes visible.", render: (beat) => <FogReveal clear={beat >= 1} hiddenLabel="Where did the week go?"><CompareBars after={false} rows={[{ label: "Meetings", before: 14, after: 14, unit: "h" }, { label: "Waiting", before: 11, after: 11, unit: "h" }, { label: "Real work", before: 9, after: 9, unit: "h" }]} /></FogReveal> },
  checks: { beats: 2, layout: "split", title: () => "The system checks it for you.", render: (beat) => <AutoChecklist items={checks} active={beat >= 1} verdict="Needs a manager: the team would be short-staffed" /> },
  shield: { beats: 2, title: (beat) => (beat ? "Now every mistake bounces off." : "Every mistake lands on payroll."), render: (beat) => <Shield active={beat >= 1} core="Payroll" shieldLabel="Rules" threats={["Overlapping dates", "Over the limit", "No approver", "Wrong team"]} /> },
  scale: { beats: 2, layout: "center", title: (beat) => (beat ? "The gains clearly outweigh the cost." : "Yes, it costs something."), render: (beat) => <BalanceScale left={{ label: "Costs", items: ["2 sprints", "Migration"] }} right={{ label: "Gains", items: ["−6 h a week", "No lost requests", "Audit trail", "Happier team"] }} showRight={beat >= 1} /> },
  wipe: { beats: 2, layout: "split", title: () => "The same screen, before and after.", render: (beat) => <WipeCompare after={beat >= 1} beforeLabel="Before" afterLabel="After" before={<Card tone="bad" title="Leave request" lines={["Print the form", "Sign at HR", "Wait for the manager", "Status: unknown"]} />}><Card tone="good" title="Leave request" lines={["Pick the dates", "Rules checked instantly", "Approved in 2 hours", "Status: approved ✓"]} /></WipeCompare> },
  poll: { layout: "split", title: () => "Your voice decides what's next.", render: () => <Poll question="What should we build next?" topics={["Mobile app", "Slack bot", "Payroll sync"]} hint="Click to vote" resetLabel="Reset" /> },
  ghost: { beats: 2, layout: "split", title: () => "Two clicks. That's the whole flow.", render: (beat) => <GhostDemo active={beat >= 1} /> },
};

function BottleneckFlowDemo({ open }: { open: boolean }) {
  const { hue } = useDeckContext();
  return <BottleneckFlow open={open} hue={hue} labels={{ from: "Requests", neck: "One team", neckOpen: "Self-service", to: "Done", queue: "queued" }} />;
}

function FireworksDemo({ active }: { active: boolean }) {
  const { hue } = useDeckContext();
  return <Fireworks active={active} hue={hue} />;
}

function GhostDemo({ active }: { active: boolean }) {
  return (
    <GhostCursor targets={ghostTargets} active={active} tag="Illustration">
      {(step) => (
        <div className="deck-card gallery-card gallery-mock">
          <strong>New leave request</strong>
          <span className="gallery-mock__field" data-ghost="dates" data-filled={step >= 1 || undefined}>{step >= 1 ? "12–14 March" : "Pick dates…"}</span>
          <span className="gallery-mock__button" data-ghost="submit" data-done={step >= 2 || undefined}>{step >= 2 ? "Approved ✓" : "Send"}</span>
        </div>
      )}
    </GhostCursor>
  );
}

function Caption({ info, title }: { info: EffectInfo; title: string }) {
  return (
    <>
      <Reveal as="span" className="scene__eyebrow">{info.kind} · {info.component}</Reveal>
      <Reveal as="h1" i={1} className="scene__title">{title}</Reveal>
      <Reveal as="p" i={2} className="scene__note">Means: {info.meaning} · trigger: {info.trigger} · shows: {info.shows.join(", ")}</Reveal>
    </>
  );
}

const chips = ["Teams", "Brands", "Users", "Markets", "Partners", "Apps"];

function effectScene(info: EffectInfo): DeckScene {
  const demo = demos[info.id];
  if (info.id === "bang") {
    return {
      id: info.id,
      sky: "bang",
      render: () => (
        <Scene center className="bang">
          <div className="bang__orbit" aria-hidden="true">
            {chips.map((name, i) => {
              const angle = (i / chips.length) * Math.PI * 2 - Math.PI / 2;
              const style = { "--dx": `${Math.cos(angle) * (38 + (i % 2) * 5)}vw`, "--dy": `${Math.sin(angle) * 40}vh`, "--d": `${600 + i * 60}ms`, "--f": `${i * 0.7}s` } as React.CSSProperties;
              return <span key={name} className="bang__chip" style={style}>{name}</span>;
            })}
          </div>
          <Caption info={info} title={demo.title(0)} />
        </Scene>
      ),
    };
  }
  if (info.id === "collapse") {
    return {
      id: info.id,
      sky: "collapse",
      render: () => (
        <Scene center className="gallery-collapse">
          <span className="finale-mark" data-collapse-target>N</span>
          <Caption info={info} title={demo.title(0)} />
        </Scene>
      ),
    };
  }
  return {
    id: info.id,
    beats: demo.beats,
    render: ({ beat }) => {
      const body = <Reveal i={3} className={demo.layout === "center" ? "gallery-wide" : undefined}>{demo.render(beat)}</Reveal>;
      if (demo.layout === "split") {
        return (
          <Scene className="gallery-split">
            <div className="gallery-split__copy"><Caption info={info} title={demo.title(beat)} /></div>
            {body}
          </Scene>
        );
      }
      return (
        <Scene center={demo.layout === "center"}>
          <Caption info={info} title={demo.title(beat)} />
          {body}
        </Scene>
      );
    },
  };
}

const kinds = [
  { kind: "cinematic", label: "Cinematic", note: "one big, instantly readable moment" },
  { kind: "data", label: "Data", note: "numbers, shares, change over time" },
  { kind: "diagram", label: "Diagram", note: "how it works, what hurts, what protects" },
] as const;

function IndexScene({ list }: { list: EffectInfo[] }) {
  const { goTo } = useDeckContext();
  const router = useRouter();
  return (
    <Scene className="gallery-index">
      <Reveal as="span" className="scene__eyebrow">Effects library · {list.length} effects</Reveal>
      <Reveal as="h1" i={1} className="scene__title">Pick the picture that says it.</Reveal>
      <div className="gallery-index__groups">
        {kinds.map((group, g) => (
          <Reveal key={group.kind} i={2 + g} className="gallery-index__group">
            <strong>{group.label}</strong>
            <small>{group.note}</small>
            <div>
              {list.filter((info) => info.kind === group.kind).map((info) => (
                <button key={info.id} type="button" title={info.meaning} onClick={() => goTo(list.indexOf(info) + 1)}>{info.component.split(" ")[0]}</button>
              ))}
            </div>
          </Reveal>
        ))}
      </div>
      <Reveal as="p" i={6} className="scene__note">
        → to walk through all of them · <button type="button" className="gallery-index__switch" onClick={() => router.push(window.location.search.includes("paper") ? "/effects" : "/effects?stage=paper")}>switch stage</button>
      </Reveal>
    </Scene>
  );
}

export function EffectsDeck() {
  const router = useRouter();
  const params = useSearchParams();
  const paper = params.get("stage") === "paper";
  // The sky effects need the space stage; on paper the gallery skips them.
  const list = effects.filter((info) => demos[info.id] && !(paper && info.spaceOnly));
  const scenes: DeckScene[] = [{ id: "index", render: () => <IndexScene list={list} /> }, ...list.map(effectScene)];
  return <Deck key={paper ? "paper" : "space"} label="Effects library" stage={paper ? "paper" : "space"} scenes={scenes} startAtEnd={params.get("scene") === "last"} exitTo="/" onFinish={() => router.push("/")} />;
}
