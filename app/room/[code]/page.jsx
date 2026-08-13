'use client';
import { use, useState } from 'react';
import { useGameStore } from '../../../store/gameStore';
import { useGameSocket } from '../../../hooks/useGameSocket';
import { TOKENS } from '../../../lib/board';
import GameBoard from '../../../components/GameBoard';

export default function RoomPage({ params }) {
  const { code } = use(params);
  const room = useGameStore((s) => s.room);
  const myId = useGameStore((s) => s.myId);
  const error = useGameStore((s) => s.error);
  const { joinRoom, pickToken, toggleReady, startGame } = useGameSocket();
  const [name, setName] = useState('');

  // Opened a shared link directly — join with a name first.
  if (!room) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 p-6">
          <h1 className="font-display text-2xl font-bold text-parchment">ოთახი {code}</h1>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="თქვენი სახელი"
            maxLength={20}
            className="mb-3 mt-4 w-full rounded-lg border border-white/15 bg-black/30 p-2.5 text-parchment placeholder:text-parchment/30 focus:border-gold focus:outline-none"
          />
          <button
            onClick={() => name.trim() && joinRoom(code, name)}
            className="w-full rounded-lg bg-gold p-3 font-bold text-ink transition hover:bg-[#e0b95c]"
          >
            შეერთება
          </button>
          {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
        </div>
      </main>
    );
  }

  if (room.status === 'lobby') {
    const me = room.players.find((p) => p.id === myId);
    const isHost = room.hostId === myId;
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8">
          <div className="mb-6 flex items-end justify-between">
            <h1 className="font-display text-2xl font-bold text-parchment">ლობი</h1>
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-widest text-parchment/50">ოთახის კოდი</div>
              <div className="font-mono text-2xl font-bold tracking-[0.2em] text-gold">{room.code}</div>
            </div>
          </div>

          <div className="mb-2 text-xs text-parchment/60">აირჩიე ფიგურა</div>
          <div className="mb-6 grid grid-cols-8 gap-1.5">
            {TOKENS.map((t) => {
              const takenBy = room.players.find((p) => p.token === t);
              const mine = takenBy?.id === myId;
              return (
                <button
                  key={t}
                  onClick={() => pickToken(t)}
                  disabled={!!takenBy && !mine}
                  className={`grid aspect-square place-items-center rounded-lg border text-xl transition ${
                    mine
                      ? 'border-gold bg-gold/20'
                      : takenBy
                        ? 'cursor-not-allowed border-white/10 opacity-30'
                        : 'border-white/10 bg-black/20 hover:border-gold/50'
                  }`}
                >
                  {t}
                </button>
              );
            })}
          </div>

          <ul className="mb-6 space-y-2">
            {room.players.map((p) => (
              <li key={p.id} className="flex items-center gap-3 rounded-lg border border-white/10 bg-black/20 p-2.5">
                <span className="grid h-8 w-8 place-items-center rounded-full text-base" style={{ background: p.color }}>
                  {p.token}
                </span>
                <span className="font-semibold text-parchment">{p.name}</span>
                {p.id === room.hostId && (
                  <span className="rounded border border-gold/40 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-gold">ჰოსტი</span>
                )}
                <span className={`ml-auto text-sm ${p.ready ? 'text-green-400' : 'text-parchment/40'}`}>
                  {p.ready ? 'მზადაა ✓' : 'ელოდება…'}
                </span>
              </li>
            ))}
          </ul>

          <button
            onClick={toggleReady}
            className={`mb-3 w-full rounded-lg p-3 font-bold transition ${
              me?.ready
                ? 'border border-white/15 text-parchment/70 hover:bg-white/5'
                : 'bg-gold text-ink hover:bg-[#e0b95c]'
            }`}
          >
            {me?.ready ? 'არ ვარ მზად' : 'მზად ვარ'}
          </button>

          {isHost && (
            <button
              onClick={startGame}
              className="w-full rounded-lg border border-gold/50 p-3 font-bold text-gold transition hover:bg-gold/10"
            >
              თამაშის დაწყება
            </button>
          )}
          {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
        </div>
      </main>
    );
  }

  return <GameBoard />;
}
