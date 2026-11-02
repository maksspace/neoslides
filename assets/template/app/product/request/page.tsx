"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2Icon, CircleAlertIcon, UserCheckIcon } from "lucide-react";
import { formatDay, LeaveStatusBadge } from "@/components/leave-status";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AUTO_APPROVE_DAYS, checkPolicy, demo, isoDay, MIN_TEAM_ON_DUTY, useDemo, type LeaveRequest } from "@/lib/demo-store";
import { cn } from "@/lib/utils";

function Rule({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <li className={cn("flex items-start gap-2 text-sm", ok ? "text-foreground" : "text-muted-foreground")}>
      {ok ? <CheckCircle2Icon className="mt-0.5 size-4 shrink-0 text-emerald-600" /> : <CircleAlertIcon className="mt-0.5 size-4 shrink-0 text-amber-600" />}
      {children}
    </li>
  );
}

export default function RequestPage() {
  const state = useDemo()!;
  const [from, setFrom] = useState(() => isoDay(14));
  const [to, setTo] = useState(() => isoDay(16));
  const [filed, setFiled] = useState<LeaveRequest | null>(null);
  const policy = checkPolicy(state, from, to);

  if (filed) {
    return (
      <Card className="mx-auto max-w-lg text-center">
        <CardHeader>
          <CardTitle className="text-xl">{filed.status === "auto" ? "Done. Enjoy your time off!" : "Sent to your team lead"}</CardTitle>
          <CardDescription>{formatDay(filed.from)} — {formatDay(filed.to)} · {filed.days} days</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <LeaveStatusBadge status={filed.status} />
          {filed.reason && <p className="text-sm text-muted-foreground">Reason: {filed.reason}</p>}
          <div className="flex gap-2">
            <Link href="/product" className={buttonVariants({ variant: "outline" })}>Back to my time off</Link>
            <Button onClick={() => setFiled(null)}>Another request</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <Card data-demo="request-form">
        <CardHeader>
          <CardTitle className="text-xl">New request</CardTitle>
          <CardDescription>Just the dates. Away checks everything else.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="from">From</Label>
              <Input id="from" type="date" value={from} min={isoDay(1)} onChange={(event) => setFrom(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="to">To</Label>
              <Input id="to" type="date" value={to} min={from} onChange={(event) => setTo(event.target.value)} />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">{policy.days} days · {state.balance[state.personaId]} left</p>
          <Button size="lg" disabled={!policy.days || !policy.enough} onClick={() => setFiled(demo.requestLeave(from, to))}>
            {policy.auto ? "Send: approved instantly" : "Send to team lead"}
          </Button>
        </CardContent>
      </Card>

      <Card data-demo="policy-check" className={cn("transition-colors", policy.auto ? "ring-emerald-500/50" : "ring-amber-500/50")}>
        <CardHeader>
          <CardDescription>Team rule</CardDescription>
          <CardTitle className="flex items-center gap-2">
            {policy.auto ? <><CheckCircle2Icon className="size-5 text-emerald-600" />Approved automatically</> : <><UserCheckIcon className="size-5 text-amber-600" />Needs the team lead</>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <Rule ok={policy.short}>At most {AUTO_APPROVE_DAYS} days in a row</Rule>
            <Rule ok={policy.covered}>At least {MIN_TEAM_ON_DUTY} people stay on duty (now {policy.onDuty})</Rule>
            <Rule ok={policy.enough}>Enough days left</Rule>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
