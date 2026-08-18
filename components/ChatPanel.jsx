'use client';
import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { useGameSocket } from '../hooks/useGameSocket';

export default function ChatPanel() {
  const room = useGameStore((s) => s.room);
  const myId = useGameStore((s) => s.myId);
  const { sendChat } = useGameSocket();
  const [text, setText] = useState('');

  const chat = room?.chat ?? [];

  const submit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    sendChat(text);
    setText('');
  };

  return (
    <div className="flex flex-col rounded-xl border border-[var(--th-line)] bg-[var(--th-panel)] p-3">
      <div className="mb-2 text-[10px] uppercase tracking-widest text-parchment/50">ჩატი</div>
      {/* chat is newest-first; flex-col-reverse flips it so newest sits at the
          bottom and the scroll position naturally starts pinned there. */}
      <div className="scroll-thin flex h-40 flex-col-reverse gap-2 overflow-y-auto pr-1">
        {chat.length ? (
          chat.map((m, i) => (
            <div key={m.at + '-' + i} className="text-xs leading-snug">
              <span className={`font-bold ${m.id === myId ? 'text-gold' : 'text-parchment/70'}`}>{m.name}</span>
              <span className="text-parchment/55"> · </span>
              <span className="break-words text-parchment/80">{m.text}</span>
            </div>
          ))
        ) : (
          <div className="grid h-full place-items-center text-center text-xs text-parchment/55">
            ჯერ არაფერი დაწერილა
          </div>
        )}
      </div>
      <form onSubmit={submit} className="mt-2 flex gap-1.5">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="მესიჯი..."
          maxLength={300}
          className="min-w-0 flex-1 rounded-lg border border-[var(--th-line-hi)] bg-[var(--th-sunken-hi)] px-2.5 py-2 text-xs text-parchment placeholder:text-parchment/55 focus:border-gold focus:outline-none"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="grid shrink-0 place-items-center rounded-lg bg-gold px-2.5 text-[var(--th-on-accent)] transition hover:brightness-110 disabled:opacity-40"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
            <path d="M3.4 20.6 21 12 3.4 3.4 3 10l12 2-12 2z" />
          </svg>
        </button>
      </form>
    </div>
  );
}
