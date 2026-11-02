import { useSyncExternalStore } from "react";

// Mock product state for the prototype. Everything lives in this browser's localStorage:
// no backend, no real integrations. Replace this file with the product's own domain.

const STORAGE_KEY = "neo-demo-state-v2";

export type PersonaId = "anna" | "oliver" | "ian" | "maria";

export interface Persona {
  id: PersonaId;
  name: string;
  role: string;
  manager: boolean;
}

export const personas: Persona[] = [
  { id: "anna", name: "Anna Reed", role: "Developer · Payments", manager: false },
  { id: "oliver", name: "Oliver Kim", role: "Team lead · Payments", manager: true },
  { id: "ian", name: "Ian Ward", role: "QA · Payments", manager: false },
  { id: "maria", name: "Maria Fox", role: "Analyst · Payments", manager: false },
];

export type LeaveStatus = "auto" | "pending" | "approved" | "declined";

export interface LeaveRequest {
  id: string;
  personaId: PersonaId;
  from: string;
  to: string;
  days: number;
  status: LeaveStatus;
  /** Why the rule did not approve it on its own. */
  reason?: string;
}

export interface DemoState {
  personaId: PersonaId;
  balance: Record<PersonaId, number>;
  requests: LeaveRequest[];
}

// The rule the prototype demonstrates: short leave with team coverage needs nobody's approval.
export const AUTO_APPROVE_DAYS = 3;
export const MIN_TEAM_ON_DUTY = 2;

const DAY = 86_400_000;
export const isoDay = (offset: number, from = new Date()) => {
  const date = new Date(from.getFullYear(), from.getMonth(), from.getDate() + offset);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};
export const countDays = (from: string, to: string) => Math.max(0, Math.round((Date.parse(to) - Date.parse(from)) / DAY) + 1);
const overlaps = (a: LeaveRequest, from: string, to: string) => a.from <= to && a.to >= from;

const seed = (): DemoState => ({
  personaId: "anna",
  balance: { anna: 14, oliver: 21, ian: 9, maria: 17 },
  requests: [
    { id: "r1", personaId: "ian", from: isoDay(9), to: isoDay(13), days: 5, status: "approved" },
    { id: "r2", personaId: "maria", from: isoDay(3), to: isoDay(4), days: 2, status: "auto" },
  ],
});

let state: DemoState | null = null;
const listeners = new Set<() => void>();

const read = (): DemoState => {
  if (state) return state;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    state = saved ? { ...seed(), ...JSON.parse(saved) } : seed();
  } catch {
    state = seed();
  }
  return state!;
};

const write = (next: DemoState) => {
  state = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Storage is a convenience; the demo still runs for this tab without it.
  }
  listeners.forEach((listener) => listener());
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

/** Current state, or `null` during server render (the product renders after mount). */
export const useDemo = () => useSyncExternalStore(subscribe, read, () => null);

export const currentPersona = (s: DemoState) => personas.find((persona) => persona.id === s.personaId)!;

/** What the rule says about a period, before anything is filed. */
export const checkPolicy = (s: DemoState, from: string, to: string) => {
  const days = countDays(from, to);
  const teamSize = personas.length;
  const away = new Set(
    s.requests
      .filter((r) => r.personaId !== s.personaId && r.status !== "declined" && overlaps(r, from, to))
      .map((r) => r.personaId),
  );
  const onDuty = teamSize - away.size - 1;
  const short = days > 0 && days <= AUTO_APPROVE_DAYS;
  const covered = onDuty >= MIN_TEAM_ON_DUTY;
  const enough = days <= s.balance[s.personaId];
  return { days, onDuty, short, covered, enough, auto: short && covered && enough };
};

export const demo = {
  switchPersona(personaId: PersonaId) {
    write({ ...read(), personaId });
  },

  requestLeave(from: string, to: string) {
    const s = read();
    const policy = checkPolicy(s, from, to);
    const reason = !policy.short ? `Longer than ${AUTO_APPROVE_DAYS} days` : !policy.covered ? "Too few people on the team for these dates" : undefined;
    const request: LeaveRequest = {
      id: `r${Date.now()}`,
      personaId: s.personaId,
      from,
      to,
      days: policy.days,
      status: policy.auto ? "auto" : "pending",
      reason,
    };
    write({
      ...s,
      requests: [...s.requests, request],
      balance: policy.auto ? { ...s.balance, [s.personaId]: s.balance[s.personaId] - policy.days } : s.balance,
    });
    return request;
  },

  decide(id: string, approve: boolean) {
    const s = read();
    const request = s.requests.find((r) => r.id === id);
    if (!request || request.status !== "pending") return;
    write({
      ...s,
      requests: s.requests.map((r) => (r.id === id ? { ...r, status: approve ? "approved" : "declined" } : r)),
      balance: approve ? { ...s.balance, [request.personaId]: s.balance[request.personaId] - request.days } : s.balance,
    });
  },

  /** A long request that needs the manager, filed for Anna if the presenter skipped that part. */
  ensurePending() {
    const s = read();
    if (s.requests.some((r) => r.status === "pending")) return;
    const reviewer = s.personaId;
    write({ ...s, personaId: "anna" });
    demo.requestLeave(isoDay(20), isoDay(26));
    write({ ...read(), personaId: reviewer });
  },

  reset() {
    write(seed());
  },
};
