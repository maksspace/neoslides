"use client";

import { seeded } from "./motion";

// Meaning: "a mess becomes a system". Tiles lie scattered and tilted; on `ordered` they fly into
// place: into one tidy grid, or, with `groups`, sorted into labelled columns.

export interface ChaosItem {
  label: string;
  /** Column it sorts into when `groups` is given. */
  group?: string;
}

export function ChaosToOrder({ items, ordered, groups, height = 320 }: { items: ChaosItem[]; ordered: boolean; groups?: string[]; height?: number }) {
  const columns = groups?.length ?? Math.ceil(Math.sqrt(items.length * 1.8));
  const rowsPerColumn = new Map<string, number>();
  const tileHeight = 44;
  const top = groups ? 40 : 0;

  return (
    <div className="chaos" data-ordered={ordered || undefined} style={{ height }}>
      {groups?.map((group, column) => (
        <span key={group} className="chaos__group" style={{ left: `${(column / columns) * 100}%`, width: `${100 / columns}%` }}>{group}</span>
      ))}
      {items.map((item, i) => {
        let column = i % columns;
        let row = Math.floor(i / columns);
        if (groups && item.group) {
          column = Math.max(groups.indexOf(item.group), 0);
          row = rowsPerColumn.get(item.group) ?? 0;
          rowsPerColumn.set(item.group, row + 1);
        }
        const place = ordered
          ? { left: `calc(${(column / columns) * 100}% + 6px)`, top: `${top + row * (tileHeight + 10)}px`, rotate: "0deg" }
          : { left: `calc(${seeded(i, 3) * (1 - 1 / columns) * 100}% + 6px)`, top: `${seeded(i, 7) * (height - tileHeight)}px`, rotate: `${(seeded(i, 11) - 0.5) * 34}deg` };
        return (
          <span
            key={item.label}
            className="chaos__tile"
            style={{ ...place, width: `calc(${100 / columns}% - 12px)`, height: tileHeight, transitionDelay: `${(ordered ? i : items.length - i) * 45}ms` }}
          >
            {item.label}
          </span>
        );
      })}
    </div>
  );
}
