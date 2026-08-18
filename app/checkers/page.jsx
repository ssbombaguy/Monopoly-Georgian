'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCheckersSocket } from '../../hooks/useCheckersSocket';
import { useCheckersStore } from '../../store/checkersStore';
import { useAuthStore } from '../../store/authStore';
import AuthPanel from '../../components/AuthPanel';

export default function CheckersLobby() {
  const router = useRouter();
  const { createRoom, joinRoom } = useCheckersSocket();
  const room = useCheckersStore((s) => s.room);
  const error = useCheckersStore((s) => s.error);
  const user = useAuthStore((s) => s.user);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const effectiveName = user?.username || name;

  useEffect(() => {
    if (room) router.push(`/checkers-room/${room.code}`);
  }, [room, router]);

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center gap-8 p-6">
      <Link
        href="/"
        className="absolute left-4 top-4 flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-parchment/55 transition hover:bg-[var(--th-panel)] hover:text-parchment/80"
      >
        ← მთავარი
      </Link>
      <div className="text-center">
        <div className="text-xs uppercase tracking-[0.4em] text-gold/70">მინი თამაში</div>
        <h1 className="mt-3 font-display text-4xl font-bold text-parchment sm:text-6xl">შაშკი</h1>
        <div className="mx-auto mt-5 h-px w-24 bg-gold/50" />
      </div>

      <div className="w-full max-w-sm rounded-2xl border border-[var(--th-line)] bg-[var(--th-panel)] p-6">
        <AuthPanel />

        {!user && (
          <>
            <label className="text-xs text-parchment/60">თქვენი სახელი</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="მაგ. ნიკა"
              maxLength={20}
              className="mb-4 mt-1 w-full rounded-lg border border-[var(--th-line-hi)] bg-[var(--th-sunken-hi)] p-2.5 text-parchment placeholder:text-parchment/55 focus:border-gold focus:outline-none"
            />
          </>
        )}

        <button
          onClick={() => effectiveName.trim() && createRoom(effectiveName)}
          disabled={!effectiveName.trim()}
          className="w-full rounded-lg bg-gold p-3 font-bold text-[var(--th-on-accent)] transition hover:brightness-110 disabled:opacity-40"
        >
          ოთახის შექმნა
        </button>

        <div className="my-4 flex items-center gap-3 text-[10px] uppercase tracking-widest text-parchment/55">
          <span className="h-px flex-1 bg-[var(--th-panel-hi)]" />
          ან
          <span className="h-px flex-1 bg-[var(--th-panel-hi)]" />
        </div>

        <div className="flex gap-2">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="კოდი"
            maxLength={4}
            className="w-24 rounded-lg border border-[var(--th-line-hi)] bg-[var(--th-sunken-hi)] p-2.5 text-center font-mono uppercase text-parchment placeholder:text-parchment/55 focus:border-gold focus:outline-none"
          />
          <button
            onClick={() => effectiveName.trim() && code.trim() && joinRoom(code, effectiveName)}
            disabled={!effectiveName.trim()}
            className="flex-1 rounded-lg border border-gold/40 p-2.5 font-bold text-gold transition hover:bg-gold/10 disabled:opacity-40"
          >
            შეერთება
          </button>
        </div>

        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
      </div>
    </main>
  );
}
