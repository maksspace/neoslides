"use client";

import { formatDay } from "@/components/leave-status";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { currentPersona, demo, isoDay, personas, useDemo } from "@/lib/demo-store";
import { cn } from "@/lib/utils";

const DAYS = 28;

export default function TeamPage() {
  const state = useDemo()!;
  const persona = currentPersona(state);
  const days = Array.from({ length: DAYS }, (_, i) => isoDay(i + 1));
  const pending = state.requests.filter((request) => request.status === "pending");
  const offOn = (personaId: string, day: string) =>
    state.requests.find((r) => r.personaId === personaId && r.status !== "declined" && r.from <= day && r.to >= day);

  if (!persona.manager) {
    return <p className="text-sm text-muted-foreground">Only the team lead sees this page. Switch to “Oliver Kim” at the top right.</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Payments team</h1>

      <Card data-demo="approvals">
        <CardHeader>
          <CardTitle>Waiting for you</CardTitle>
          <CardDescription>Only what the rule couldn’t approve by itself.</CardDescription>
        </CardHeader>
        <CardContent>
          {pending.length ? (
            <ul className="divide-y">
              {pending.map((request) => {
                const who = personas.find((item) => item.id === request.personaId)!;
                return (
                  <li key={request.id} className="flex flex-wrap items-center gap-3 py-3 text-sm">
                    <span className="font-medium">{who.name}</span>
                    <span>{formatDay(request.from)} — {formatDay(request.to)} · {request.days} days</span>
                    {request.reason && <Badge variant="outline">{request.reason}</Badge>}
                    <div className="ml-auto flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => demo.decide(request.id, false)}>Decline</Button>
                      <Button size="sm" onClick={() => demo.decide(request.id, true)}>Approve</Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">All clear. The rule handled the rest.</p>
          )}
        </CardContent>
      </Card>

      <Card data-demo="team-calendar">
        <CardHeader>
          <CardTitle>Who’s off when</CardTitle>
          <CardDescription>Next four weeks</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-0.5 text-xs">
            <thead>
              <tr>
                <th className="w-32" />
                {days.map((day) => <th key={day} className="font-normal text-muted-foreground">{Number(day.slice(8))}</th>)}
              </tr>
            </thead>
            <tbody>
              {personas.map((item) => (
                <tr key={item.id}>
                  <td className="pr-2 whitespace-nowrap">{item.name}</td>
                  {days.map((day) => {
                    const off = offOn(item.id, day);
                    return (
                      <td
                        key={day}
                        title={off ? `${item.name}: ${formatDay(off.from)} — ${formatDay(off.to)}` : undefined}
                        className={cn("h-6 min-w-5 rounded-sm bg-muted", off && (off.status === "pending" ? "bg-amber-400/70" : "bg-primary"))}
                      />
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-3 flex gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><i className="size-3 rounded-sm bg-primary" />Time off</span>
            <span className="flex items-center gap-1.5"><i className="size-3 rounded-sm bg-amber-400/70" />Pending</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
