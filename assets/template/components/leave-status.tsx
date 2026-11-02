import { Badge } from "@/components/ui/badge";
import type { LeaveStatus } from "@/lib/demo-store";
import { product } from "@/lib/story";

const labels: Record<LeaveStatus, { text: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  auto: { text: "Approved by rule", variant: "default" },
  approved: { text: "Approved by lead", variant: "secondary" },
  pending: { text: "Waiting for lead", variant: "outline" },
  declined: { text: "Declined", variant: "destructive" },
};

export function LeaveStatusBadge({ status }: { status: LeaveStatus }) {
  return <Badge variant={labels[status].variant}>{labels[status].text}</Badge>;
}

export const formatDay = (iso: string) => new Date(`${iso}T00:00:00`).toLocaleDateString(product.lang, { day: "numeric", month: "short" });
