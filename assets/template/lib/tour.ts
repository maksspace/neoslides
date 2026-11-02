import { demo, type PersonaId } from "./demo-store";

export interface TourStep {
  chapter: string;
  title: string;
  /** What the audience hears: the point of this screen. */
  text: string;
  /** A hint for the presenter only: what to click live. */
  hint?: string;
  route: string;
  /** Demo persona to act as on this step. */
  as?: PersonaId;
  /** `data-demo` hook to spotlight on the page. */
  target?: string;
  /** Brings the data into the state this step expects, so any step can be opened directly. */
  prepare?: () => void;
}

export const tourSteps: TourStep[] = [
  {
    chapter: "Employee",
    title: "The balance, at a glance",
    text: "Anna opens Away and sees how many days she has left. No need to ask HR.",
    as: "anna",
    route: "/product",
    target: "balance",
  },
  {
    chapter: "Employee",
    title: "A request is two dates",
    text: "Pick the dates and you're done. No free-form letters, no chat messages.",
    hint: "Set dates 2–3 days ahead; don't send yet.",
    as: "anna",
    route: "/product/request",
    target: "request-form",
  },
  {
    chapter: "Employee",
    title: "The rule decides",
    text: "Up to three days with enough people left on the team: approved instantly. Everyone can see the rule, not just HR.",
    hint: "Show how the check changes for 7 days. Then go back to 3 and click “Send”.",
    as: "anna",
    route: "/product/request",
    target: "policy-check",
  },
  {
    chapter: "Team lead",
    title: "The whole team on one screen",
    text: "Oliver sees who's off when. “Everyone's out the same day” shows up in advance, not on Monday morning.",
    as: "oliver",
    route: "/product/team",
    target: "team-calendar",
    prepare: demo.ensurePending,
  },
  {
    chapter: "Team lead",
    title: "People only for the exceptions",
    text: "The rule won't approve a long break by itself: it goes to the lead with a reason. One click instead of a thread.",
    hint: "Click “Approve” on Anna's request.",
    as: "oliver",
    route: "/product/team",
    target: "approvals",
    prepare: demo.ensurePending,
  },
];
