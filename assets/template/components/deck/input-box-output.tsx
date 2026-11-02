"use client";

// Meaning: "put the raw stuff in, get the finished thing out" (AI, automation, any "it just does it").
// On `active` the inputs fly into the box one by one, the box works for a moment, and the output
// card comes out on the other side.

const ITEM = 44;
const GAP = 10;

export function InputBoxOutput({ inputs, output, boxLabel, active }: { inputs: string[]; output: string; boxLabel: string; active: boolean }) {
  const height = inputs.length * (ITEM + GAP) - GAP;
  const done = 500 + inputs.length * 220 + 900;
  return (
    <div className="ibo" data-active={active || undefined} style={{ height: Math.max(height, 160), "--done": `${done}ms` } as React.CSSProperties}>
      <div className="ibo__inputs">
        {inputs.map((input, i) => {
          const dy = height / 2 - (i * (ITEM + GAP) + ITEM / 2);
          return <span key={input} className="ibo__in" style={{ "--dy": `${dy}px`, transitionDelay: `${500 + i * 220}ms` } as React.CSSProperties}>{input}</span>;
        })}
      </div>
      <div className="ibo__box"><span>{boxLabel}</span></div>
      <div className="ibo__out"><span className="deck-card">{output}</span></div>
    </div>
  );
}
