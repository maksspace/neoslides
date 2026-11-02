"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ui } from "@/lib/story";
import { tourSteps } from "@/lib/tour";
import { useTour } from "./tour-provider";

// Presenter guide over the live product: a spotlight on the step's `data-demo` hook and a panel
// with what to say and what to click. The spotlight never takes pointer events, so the presenter
// clicks the real UI through it. No effects here: the product is the show.

interface Rect { top: number; left: number; width: number; height: number }

const PADDING = 8;

export function DemoGuide() {
  const tour = useTour();
  const router = useRouter();
  const pathname = usePathname();
  const [rect, setRect] = useState<Rect | null>(null);
  const [chaptersOpen, setChaptersOpen] = useState(false);
  const scrolledFor = useRef(-1);
  const step = tourSteps[tour.index];
  const visible = tour.active && pathname.startsWith("/product") && Boolean(step);

  const chapters = useMemo(() => tourSteps.reduce<{ name: string; start: number }[]>((list, item, i) => {
    if (!list.some((chapter) => chapter.name === item.chapter)) list.push({ name: item.chapter, start: i });
    return list;
  }, []), []);
  const chapterIndex = chapters.findIndex((chapter) => chapter.name === step?.chapter);

  // The target may render late (route change, a dialog the presenter opens), so it is tracked every frame.
  useEffect(() => {
    if (!visible || !step?.target) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- clearing the spotlight when there is nothing to track
      setRect(null);
      return;
    }
    let frame = 0;
    const track = () => {
      frame = requestAnimationFrame(track);
      const element = [...document.querySelectorAll<HTMLElement>(`[data-demo="${step.target}"]`)].find((item) => item.offsetParent !== null);
      if (!element) {
        setRect((current) => (current ? null : current));
        return;
      }
      if (scrolledFor.current !== tour.index) {
        scrolledFor.current = tour.index;
        element.scrollIntoView({ block: "center", behavior: "smooth" });
      }
      const box = element.getBoundingClientRect();
      const next = { top: box.top, left: box.left, width: box.width, height: box.height };
      setRect((current) => (current && (Object.keys(next) as (keyof Rect)[]).every((key) => Math.abs(next[key] - current[key]) <= 0.5) ? current : next));
    };
    frame = requestAnimationFrame(track);
    return () => cancelAnimationFrame(frame);
  }, [visible, step?.target, tour.index]);

  useEffect(() => {
    if (!visible) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable='true'], [role='combobox'], [role='listbox']")) return;
      if (event.key === "ArrowRight" || event.key === "PageDown") tour.next();
      else if (event.key === "ArrowLeft" || event.key === "PageUp") tour.previous();
      // "р" is H on the Russian layout.
      else if (event.key.toLowerCase() === "h" || event.key.toLowerCase() === "р") tour.toggleCollapsed();
      else return;
      event.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [visible, tour]);

  if (!visible) return null;

  // The panel keeps clear of the spotlight by docking on the opposite side.
  const side = rect && rect.left + rect.width / 2 > window.innerWidth / 2 ? "left" : "right";
  const jump = (index: number) => {
    setChaptersOpen(false);
    tour.goTo(index);
  };

  return (
    <>
      {rect && (
        <div
          className="spotlight"
          aria-hidden="true"
          style={{ top: rect.top - PADDING, left: rect.left - PADDING, width: rect.width + PADDING * 2, height: rect.height + PADDING * 2 }}
        />
      )}

      {tour.collapsed ? (
        <aside className="guide-pill" data-side={side} aria-label="Tour">
          <button type="button" aria-label={ui.back} onClick={tour.previous}>‹</button>
          <button type="button" className="guide-pill__label" onClick={tour.toggleCollapsed}><span className="guide-pill__dot" />{tour.index + 1} / {tour.total} · {step.chapter}</button>
          <button type="button" aria-label={ui.next} onClick={tour.next}>›</button>
        </aside>
      ) : (
        <aside className="guide" data-side={side} data-target={step.target} aria-live="polite" aria-label="Tour">
          <header className="guide__header">
            <button type="button" className="guide__chapter" aria-expanded={chaptersOpen} onClick={() => setChaptersOpen(!chaptersOpen)}>
              <span className="guide__chapter-number">{chapterIndex + 1}</span>{step.chapter}<span className="guide__caret">▾</span>
            </button>
            <span className="guide__counter">{tour.index + 1} / {tour.total}</span>
            <button type="button" className="guide__icon" title={ui.collapse} onClick={tour.toggleCollapsed}>–</button>
            <button type="button" className="guide__icon" title={ui.closeGuide} onClick={tour.stop}>×</button>
          </header>

          {chaptersOpen && (
            <div className="guide__chapters">
              {chapters.map((chapter, i) => (
                <button key={chapter.name} type="button" data-active={i === chapterIndex || undefined} onClick={() => jump(chapter.start)}>
                  <span>{i + 1}</span>{chapter.name}
                </button>
              ))}
              <button type="button" onClick={() => { setChaptersOpen(false); tour.stop(); router.push("/vision"); }}><span>★</span>{ui.vision}</button>
              <button type="button" onClick={() => { setChaptersOpen(false); tour.start(0, true); }}><span>↺</span>{ui.restart}</button>
            </div>
          )}

          <div key={tour.index} className="guide__body">
            <h2>{step.title}</h2>
            <p>{step.text}</p>
            {step.hint && <p className="guide__hint"><span>{ui.presenter}</span>{step.hint}</p>}
          </div>

          <footer className="guide__footer">
            <div className="guide__progress" aria-hidden="true">
              {tourSteps.map((item, i) => (
                <i key={i} data-done={i < tour.index || undefined} data-current={i === tour.index || undefined} data-boundary={(i > 0 && item.chapter !== tourSteps[i - 1].chapter) || undefined} />
              ))}
            </div>
            <div className="guide__actions">
              <button type="button" className="guide__button" onClick={tour.previous}>← {ui.back}</button>
              <button type="button" className="guide__button guide__button--primary" onClick={tour.next}>{tour.isLast ? ui.toFinale : ui.next} →</button>
            </div>
          </footer>
        </aside>
      )}
    </>
  );
}
