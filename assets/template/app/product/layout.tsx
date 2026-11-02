"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FlaskConicalIcon } from "lucide-react";
import { ThemeSwitch } from "@/components/theme-switch";
import { useTour } from "@/components/tour/tour-provider";
import { currentPersona, demo, personas, useDemo, type PersonaId } from "@/lib/demo-store";
import { product, ui } from "@/lib/story";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/product", label: "My time off" },
  { href: "/product/request", label: "New request" },
  { href: "/product/team", label: "Team", managerOnly: true },
];

export default function ProductLayout({ children }: { children: React.ReactNode }) {
  const state = useDemo();
  const pathname = usePathname();
  const tour = useTour();
  // The mock state lives in localStorage, so the product renders after mount.
  if (!state) return null;
  const persona = currentPersona(state);

  return (
    <div className="min-h-screen bg-muted/40">
      {/* Never hide this: the audience must know nothing here talks to real systems. */}
      <div className="flex items-center justify-center gap-2 bg-amber-100 px-4 py-1.5 text-xs font-medium text-amber-900 dark:bg-amber-950 dark:text-amber-200">
        <FlaskConicalIcon className="size-3.5" />{ui.prototype}
      </div>
      <header className="sticky top-0 z-10 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex min-h-14 max-w-5xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-2">
          <Link href="/product" className="flex items-center gap-2 font-semibold">
            <span className="grid size-7 place-items-center rounded-md bg-primary font-mono text-sm text-primary-foreground">{product.mark}</span>
            {product.name}
          </Link>
          <nav className="hidden gap-1 sm:flex">
            {nav.filter((item) => !item.managerOnly || persona.manager).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn("rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground", pathname === item.href && "bg-muted font-medium text-foreground")}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
            {!tour.active && (
              <button type="button" onClick={() => tour.start(tour.index)} className="rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground">
                ▶ {ui.startTour}
              </button>
            )}
            <ThemeSwitch />
            <select
              data-demo="persona"
              aria-label="Demo persona"
              value={persona.id}
              onChange={(event) => demo.switchPersona(event.target.value as PersonaId)}
              className="h-8 max-w-44 rounded-md border border-input bg-background px-2 text-xs"
            >
              {personas.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.role}</option>)}
            </select>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
