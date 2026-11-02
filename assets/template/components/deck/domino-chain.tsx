"use client";

// Meaning: "one action sets everything else in motion" (automation, a chain reaction). On `active`
// the first domino tips and knocks down the rest one by one; the last one lights up the result.

export function DominoChain({ steps, result, active }: { steps: string[]; result: string; active: boolean }) {
  return (
    <div className="domino" data-active={active || undefined} style={{ "--n": steps.length } as React.CSSProperties}>
      <div className="domino__row">
        {steps.map((step, i) => (
          <div key={step} className="domino__slot" style={{ "--d": `${300 + i * 230}ms` } as React.CSSProperties}>
            <span className="domino__tile" />
            <small>{step}</small>
          </div>
        ))}
      </div>
      <span className="domino__result" style={{ "--d": `${300 + steps.length * 230 + 100}ms` } as React.CSSProperties}>{result}</span>
    </div>
  );
}
