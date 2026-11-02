"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { demo } from "@/lib/demo-store";
import { tourSteps } from "@/lib/tour";

// The presenter tour over the live product. Each step switches persona, prepares the data and
// opens its route, so any step can be opened directly (chapter menu, back from the vision deck).

const STORAGE_KEY = "neo-tour-v1";

interface TourState {
  active: boolean;
  index: number;
  collapsed: boolean;
}

interface TourApi extends TourState {
  total: number;
  isLast: boolean;
  start: (index?: number, fresh?: boolean) => void;
  stop: () => void;
  goTo: (index: number) => void;
  next: () => void;
  previous: () => void;
  toggleCollapsed: () => void;
}

const TourContext = createContext<TourApi | null>(null);

export const useTour = () => {
  const api = useContext(TourContext);
  if (!api) throw new Error("useTour must be used inside <TourProvider>");
  return api;
};

export function TourProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [state, setState] = useState<TourState>({ active: false, index: 0, collapsed: false });

  // Resume where the presenter left off (reloads happen during talks).
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
      // eslint-disable-next-line react-hooks/set-state-in-effect -- storage is only readable after mount
      setState((value) => ({ ...value, ...saved }));
    } catch {
      // Nothing saved: start fresh.
    }
  }, []);

  const update = useCallback((patch: Partial<TourState>) => {
    setState((value) => {
      const next = { ...value, ...patch };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Presentation state is a convenience; the tour still works without storage.
      }
      return next;
    });
  }, []);

  const goTo = useCallback((index: number) => {
    const safe = Math.max(0, Math.min(index, tourSteps.length - 1));
    const step = tourSteps[safe];
    update({ index: safe, active: true });
    if (step.as) demo.switchPersona(step.as);
    try {
      step.prepare?.();
    } catch {
      // Preparation only smooths the scenario; the presenter can still continue by hand.
    }
    if (window.location.pathname !== step.route) router.push(step.route);
  }, [router, update]);

  const api = useMemo<TourApi>(() => ({
    ...state,
    total: tourSteps.length,
    isLast: state.index === tourSteps.length - 1,
    start: (index = 0, fresh = false) => {
      if (fresh) demo.reset();
      update({ collapsed: false });
      goTo(index);
    },
    stop: () => update({ active: false }),
    goTo,
    next: () => {
      if (state.index >= tourSteps.length - 1) {
        update({ active: false });
        router.push("/vision");
      } else goTo(state.index + 1);
    },
    previous: () => {
      if (state.index === 0) {
        update({ active: false });
        router.push("/intro?scene=last");
      } else goTo(state.index - 1);
    },
    toggleCollapsed: () => update({ collapsed: !state.collapsed }),
  }), [state, goTo, update, router]);

  // Leaving the product for a deck hides the guide without losing the place in the tour.
  // Only a move out of the product counts: starting the tour from a deck must not stop it.
  const previousPath = useRef(pathname);
  useEffect(() => {
    const left = previousPath.current.startsWith("/product") && !pathname.startsWith("/product");
    previousPath.current = pathname;
    if (left) update({ active: false });
  }, [pathname, update]);

  return <TourContext.Provider value={api}>{children}</TourContext.Provider>;
}
