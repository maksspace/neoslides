"use client";

import { useEffect, useState } from "react";

// A live-room poll. Votes are kept in this browser only: it is a show of hands on the
// presenter's screen, not a survey. Say so if anyone asks.

const VOTES_KEY = "neo-demo-votes";

export function Poll({ question, topics, hint, resetLabel }: { question: string; topics: string[]; hint: string; resetLabel: string }) {
  const [votes, setVotes] = useState<Record<string, number>>({});

  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- storage is only readable after mount
      setVotes(JSON.parse(localStorage.getItem(VOTES_KEY) ?? "{}"));
    } catch {
      // No saved votes: start from zero.
    }
  }, []);

  const save = (next: Record<string, number>) => {
    setVotes(next);
    try {
      localStorage.setItem(VOTES_KEY, JSON.stringify(next));
    } catch {
      // Losing votes on reload is acceptable for a live-room toy.
    }
  };
  const top = Math.max(1, ...topics.map((topic) => votes[topic] ?? 0));

  return (
    <div className="deck-card poll" onClick={(event) => event.stopPropagation()}>
      <p className="poll__title">{question}</p>
      {topics.map((topic) => (
        <button key={topic} type="button" className="poll__option" onClick={() => save({ ...votes, [topic]: (votes[topic] ?? 0) + 1 })}>
          <span className="poll__bar" style={{ width: `${((votes[topic] ?? 0) / top) * 100}%` }} />
          <span className="poll__label">{topic}</span>
          <span className="poll__count">{votes[topic] ?? 0}</span>
        </button>
      ))}
      <div className="poll__footer">
        <span>{hint}</span>
        <button type="button" onClick={() => save({})}>{resetLabel}</button>
      </div>
    </div>
  );
}
