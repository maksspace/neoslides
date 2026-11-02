"use client";

// Meaning: "this is what it's made of": the architecture. A tilted stack of plates lies closed;
// on `exploded` the layers lift apart so each one can be named, top layer first in the list.

export interface Layer {
  label: string;
  note?: string;
}

export function LayerStack({ layers, exploded }: { layers: Layer[]; exploded: boolean }) {
  const count = layers.length;
  return (
    <div className="layers" data-exploded={exploded || undefined} style={{ height: 180 + count * 70 }}>
      <div className="layers__scene">
        {layers.map((layer, i) => {
          const level = count - 1 - i;
          return (
            <div key={layer.label} className="layers__plate" style={{ "--z": `${level * (exploded ? 78 : 10)}px`, "--l": level, transitionDelay: `${(exploded ? level : count - level) * 80}ms` } as React.CSSProperties}>
              <strong>{layer.label}</strong>
              {layer.note && <small>{layer.note}</small>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
