'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGameSocket } from '../hooks/useGameSocket';
import { useGameStore } from '../store/gameStore';

export default function Home() {
  const router = useRouter();
  const { createRoom, joinRoom } = useGameSocket();
  const room = useGameStore((s) => s.room);
  const error = useGameStore((s) => s.error);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');

  // Server confirmed create/join by sending ROOM_STATE — go to the room page.
  useEffect(() => {
    if (room) router.push(`/room/${room.code}`);
  }, [room, router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-6">
      <div className="text-center">
        <div className="text-xs uppercase tracking-[0.4em] text-gold/70">ქართული სუფრის თამაში</div>
        <h1 className="mt-3 font-display text-6xl font-bold text-parchment">მონოპოლია</h1>
        <div className="mx-auto mt-5 h-px w-24 bg-gold/50" />
      </div>

      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 p-6">
        <label className="text-xs text-parchment/60">თქვენი სახელი</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="მაგ. ნიკა"
          maxLength={20}
          className="mb-4 mt-1 w-full rounded-lg border border-white/15 bg-black/30 p-2.5 text-parchment placeholder:text-parchment/30 focus:border-gold focus:outline-none"
        />

        <button
          onClick={() => name.trim() && createRoom(name)}
          className="w-full rounded-lg bg-gold p-3 font-bold text-ink transition hover:bg-[#e0b95c]"
        >
          ოთახის შექმნა
        </button>

        <div className="my-4 flex items-center gap-3 text-[10px] uppercase tracking-widest text-parchment/40">
          <span className="h-px flex-1 bg-white/10" />
          ან
          <span className="h-px flex-1 bg-white/10" />
        </div>

        <div className="flex gap-2">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="კოდი"
            maxLength={4}
            className="w-24 rounded-lg border border-white/15 bg-black/30 p-2.5 text-center font-mono uppercase text-parchment placeholder:text-parchment/30 focus:border-gold focus:outline-none"
          />
          <button
            onClick={() => name.trim() && code.trim() && joinRoom(code, name)}
            className="flex-1 rounded-lg border border-gold/40 p-2.5 font-bold text-gold transition hover:bg-gold/10"
          >
            შეერთება
          </button>
        </div>

        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
      </div>
    </main>
  );
}
