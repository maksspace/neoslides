"use client";

import Link from "next/link";
import { CalendarPlusIcon } from "lucide-react";
import { formatDay, LeaveStatusBadge } from "@/components/leave-status";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { currentPersona, useDemo } from "@/lib/demo-store";

export default function MyLeavePage() {
  const state = useDemo()!;
  const persona = currentPersona(state);
  const mine = state.requests.filter((request) => request.personaId === persona.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Hi, {persona.name.split(" ")[0]}</h1>
        <p className="text-sm text-muted-foreground">{persona.role}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
        <Card data-demo="balance">
          <CardHeader>
            <CardDescription>Days off left</CardDescription>
            <CardTitle className="text-5xl font-bold tabular-nums">{state.balance[persona.id]}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">Updates as soon as a request is approved. No need to ask HR.</CardContent>
        </Card>
        <Link href="/product/request" className={buttonVariants({ size: "lg", className: "h-auto self-stretch px-6" })}>
          <CalendarPlusIcon /> Take time off
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>My requests</CardTitle>
        </CardHeader>
        <CardContent>
          {mine.length ? (
            <ul className="divide-y">
              {mine.map((request) => (
                <li key={request.id} className="flex items-center justify-between gap-4 py-3 text-sm">
                  <span>{formatDay(request.from)} — {formatDay(request.to)} · {request.days} days</span>
                  <LeaveStatusBadge status={request.status} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No requests yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
