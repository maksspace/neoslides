"use client";

import { useEffect, useState } from "react";
import { prefersReducedMotion } from "./motion";

// Meaning: "this is what it looks like today" — the real artefact, replayed. Messages arrive one
// by one with a typing indicator, so the audience lives through the wait instead of hearing about it.

export interface ChatMessage {
  from: string;
  text: string;
  /** Right-hand bubble (the person we follow). */
  mine?: boolean;
  /** Optional time stamp; long gaps are part of the story ("next day 10:40"). */
  time?: string;
}

export function ChatReplay({ messages, active = true, pace = 1100 }: { messages: ChatMessage[]; active?: boolean; pace?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!active) return;
    const timers: number[] = [];
    if (prefersReducedMotion()) {
      timers.push(window.setTimeout(() => setCount(messages.length), 0));
    } else {
      messages.forEach((_, i) => timers.push(window.setTimeout(() => setCount(i + 1), 500 + i * pace)));
    }
    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      setCount(0);
    };
  }, [active, messages, pace]);

  const typing = active && count < messages.length ? messages[count] : null;
  return (
    <div className="chat">
      {messages.slice(0, count).map((message, i) => (
        <div key={i} className="chat__msg" data-mine={message.mine || undefined}>
          <span className="chat__meta">{message.from}{message.time && ` · ${message.time}`}</span>
          <p>{message.text}</p>
        </div>
      ))}
      {typing && (
        <div className="chat__msg chat__msg--typing" data-mine={typing.mine || undefined} aria-hidden="true">
          <span className="chat__meta">{typing.from}</span>
          <p><i /><i /><i /></p>
        </div>
      )}
    </div>
  );
}
