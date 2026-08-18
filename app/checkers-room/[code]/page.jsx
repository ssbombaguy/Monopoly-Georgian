'use client';
import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCheckersStore } from '../../../store/checkersStore';
import { useCheckersSocket } from '../../../hooks/useCheckersSocket';
import { useAuthStore } from '../../../store/authStore';
import AuthPanel from '../../../components/AuthPanel';
import Checkers from '../../../components/Checkers';

const LABEL = { black: 'შავი', white: 'თეთრი' };

export default function CheckersRoomPage({ params }) {
  const router = useRouter();
  const { code } = use(params);
  const room = useCheckersStore((s) => s.room);
  const myId = useCheckersStore((s) => s.myId);
  const error = useCheckersStore((s) => s.error);
  const setRoom = useCheckersStore((s) => s.setRoom);
  const { joinRoom, toggleReady, startGame, move, surrender, replay, leaveRoom, updateSettings } = useCheckersSocket();
  const user = useAuthStore((s) => s.user);
  const [name, setName] = useState('');
  const effectiveName = user?.username || name;

  const leave = () => {
    leaveRoom();
    setRoom(null);
    router.push('/checkers');
  };

  // Opened a shared link directly — join with a name first.
  if (!room) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-sm rounded-2xl border border-[var(--th-line)] bg-[var(--th-panel)] p-6">
          <h1 className="mb-4 font-display text-2xl font-bold text-parchment">ოთახი {code}</h1>
          <AuthPanel />
          {!user && (
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="თქვენი სახელი"
              maxLength={20}
              className="mb-3 w-full rounded-lg border border-[var(--th-line-hi)] bg-[var(--th-sunken-hi)] p-2.5 text-parchment placeholder:text-parchment/55 focus:border-gold focus:outline-none"
            />
          )}
          <button
            onClick={() => effectiveName.trim() && joinRoom(code, effectiveName)}
            disabled={!effectiveName.trim()}
            className="w-full rounded-lg bg-gold p-3 font-bold text-[var(--th-on-accent)] transition hover:brightness-110 disabled:opacity-40"
          >
            შეერთება
          </button>
          {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
        </div>
      </main>
    );
  }

  const me = room.players.find((p) => p.id === myId);
  const isHost = room.hostId === myId;

  if (room.status === 'lobby') {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-md rounded-2xl border border-[var(--th-line)] bg-[var(--th-panel)] p-8">
          <div className="mb-6 flex items-end justify-between">
            <h1 className="font-display text-2xl font-bold text-parchment">ლობი</h1>
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-widest text-parchment/50">ოთახის კოდი</div>
              <div className="font-mono text-2xl font-bold tracking-[0.2em] text-gold">{room.code}</div>
            </div>
          </div>

          <ul className="mb-6 space-y-2">
            {room.players.map((p) => (
              <li key={p.id} className="flex items-center gap-3 rounded-lg border border-[var(--th-line)] bg-[var(--th-sunken)] p-2.5">
                <span
                  className="h-8 w-8 shrink-0 rounded-full border-2"
                  style={
                    p.color === 'black'
                      ? { background: 'radial-gradient(circle at 35% 30%, #4a4a4a, #101010)', borderColor: '#000' }
                      : { background: 'radial-gradient(circle at 35% 30%, #fff8e8, #d8c79a)', borderColor: '#8a7550' }
                  }
                />
                <span className="font-semibold text-parchment">{p.name}</span>
                <span className="text-xs text-parchment/50">({LABEL[p.color]})</span>
                {p.id === room.hostId && (
                  <span className="rounded border border-gold/40 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-gold">ჰოსტი</span>
                )}
                <span className={`ml-auto text-sm ${p.ready ? 'text-green-400' : 'text-parchment/55'}`}>
                  {p.ready ? 'მზადაა ✓' : 'ელოდება…'}
                </span>
              </li>
            ))}
            {room.players.length < 2 && (
              <li className="rounded-lg border border-dashed border-[var(--th-line)] p-2.5 text-center text-sm text-parchment/50">
                ველოდებით მეორე მოთამაშეს…
              </li>
            )}
          </ul>

          <label
            className={`mb-6 flex items-center gap-3 rounded-lg border border-[var(--th-line)] bg-[var(--th-sunken)] p-3 ${
              isHost ? 'cursor-pointer' : ''
            }`}
          >
            <input
              type="checkbox"
              checked={!!room.settings?.allowBackCapture}
              disabled={!isHost}
              onChange={(e) => updateSettings({ allowBackCapture: e.target.checked })}
              className="h-4 w-4 accent-gold disabled:opacity-50"
            />
            <span className="text-sm text-parchment/80">
              უკუსვლით აღება <span className="text-parchment/50">— ჩვეულებრივ ქვას შეუძლია მოწინააღმდეგის ქვა უკუსვლითაც აიღოს</span>
            </span>
          </label>

          <button
            onClick={toggleReady}
            className={`mb-3 w-full rounded-lg p-3 font-bold transition ${
              me?.ready
                ? 'border border-[var(--th-line-hi)] text-parchment/70 hover:bg-[var(--th-panel)]'
                : 'bg-gold text-[var(--th-on-accent)] hover:brightness-110'
            }`}
          >
            {me?.ready ? 'არ ვარ მზად' : 'მზად ვარ'}
          </button>

          {isHost && (
            <button
              onClick={startGame}
              disabled={room.players.length < 2 || !room.players.every((p) => p.ready)}
              className="w-full rounded-lg border border-gold/50 p-3 font-bold text-gold transition hover:bg-gold/10 disabled:opacity-40"
            >
              თამაშის დაწყება
            </button>
          )}
          <button
            onClick={leave}
            className="mt-3 w-full rounded-lg border border-parchment/20 p-2.5 text-sm font-semibold text-parchment/60 transition hover:border-parchment/40 hover:bg-[var(--th-panel)] hover:text-parchment"
          >
            ოთახის დატოვება
          </button>
          {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
        </div>
      </main>
    );
  }

  const opponent = room.players.find((p) => p.id !== myId);

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center gap-4 p-6">
      <Link
        href="/checkers"
        className="absolute left-4 top-4 flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-parchment/55 transition hover:bg-[var(--th-panel)] hover:text-parchment/80"
      >
        ← მთავარი
      </Link>

      <div className="text-center">
        {room.status === 'finished' ? (
          <p className="font-display text-xl font-bold text-gold">
            {room.winnerId === myId ? 'გაიმარჯვეთ!' : `${room.players.find((p) => p.id === room.winnerId)?.name ?? 'მოწინააღმდეგე'} გაიმარჯვა!`}
          </p>
        ) : (
          <p className="text-sm text-parchment/70">
            {me && (
              <>
                თქვენ: <span className="font-bold text-parchment">{LABEL[me.color]}</span> ·{' '}
              </>
            )}
            სვლა: <span className="font-bold text-parchment">{LABEL[room.turn]}</span>
            {room.turn === me?.color && <span className="ml-2 text-gold/80">— თქვენი სვლაა</span>}
            {opponent && !opponent.connected && <span className="ml-2 text-red-400/80">— {opponent.name} გათიშულია</span>}
          </p>
        )}
      </div>

      <Checkers
        board={room.board}
        turn={room.turn}
        chainFrom={room.chainFrom}
        myColor={room.status === 'playing' ? me?.color : null}
        allowBackCapture={!!room.settings?.allowBackCapture}
        onMove={(from, to) => move(from, to)}
      />

      <div className="flex gap-3">
        {room.status === 'playing' && (
          <button
            onClick={surrender}
            className="rounded-lg border border-red-400/40 px-4 py-2 text-sm font-bold text-red-400 transition hover:bg-red-400/10"
          >
            დანებება
          </button>
        )}
        {room.status === 'finished' && isHost && (
          <button
            onClick={replay}
            className="rounded-lg border border-gold/40 px-4 py-2 text-sm font-bold text-gold transition hover:bg-gold/10"
          >
            თავიდან დაწყება
          </button>
        )}
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
    </main>
  );
}
