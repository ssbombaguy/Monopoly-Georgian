'use client';
import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore } from '../../../store/gameStore';
import { useGameSocket } from '../../../hooks/useGameSocket';
import { useAuthStore } from '../../../store/authStore';
import { TOKENS } from '../../../lib/board';
import GameBoard from '../../../components/GameBoard';
import AuthPanel from '../../../components/AuthPanel';
import RulesGuide from '../../../components/RulesGuide';
import Die from '../../../components/Die';

const DEFAULT_SETTINGS = { startCash: 1500, goSalary: 200, jailFine: 50, auctionSeconds: 8 };

const SETTINGS_FIELDS = [
  { key: 'startCash', icon: '💰', label: 'საწყისი ფული', min: 500, max: 5000, step: 100, prefix: '₾' },
  { key: 'goSalary', icon: '🚀', label: 'ხელფასი დაწყებაზე', min: 0, max: 1000, step: 50, prefix: '₾' },
  { key: 'jailFine', icon: '🚔', label: 'ციხის ჯარიმა', min: 0, max: 500, step: 25, prefix: '₾' },
  { key: 'auctionSeconds', icon: '🔨', label: 'აუქციონის დრო', min: 5, max: 60, step: 5, suffix: 'წმ' },
];

// Host-only ruleset editor. Local draft so typing doesn't fight the
// server round-trip; "შენახვა" commits everything at once.
function LobbySettings({ settings, isHost, updateSettings }) {
  const [draft, setDraft] = useState(settings ?? DEFAULT_SETTINGS);
  const saved = settings ?? DEFAULT_SETTINGS;
  const dirty = SETTINGS_FIELDS.some((f) => Number(draft[f.key]) !== Number(saved[f.key]));

  if (!isHost) {
    return (
      <div className="mb-6 rounded-xl border border-white/10 bg-black/20 p-4">
        <div className="mb-3 text-xs uppercase tracking-widest text-parchment/40">მოდები</div>
        <div className="grid grid-cols-2 gap-2.5">
          {SETTINGS_FIELDS.map((f) => (
            <div key={f.key} className="flex items-center gap-2 rounded-lg bg-white/5 px-2.5 py-2">
              <span className="text-base leading-none">{f.icon}</span>
              <div className="min-w-0 leading-tight">
                <div className="truncate text-[10px] text-parchment/45">{f.label}</div>
                <div className="font-mono text-sm font-bold text-parchment">
                  {f.prefix}{saved[f.key]}{f.suffix}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 rounded-xl border border-white/10 bg-black/20 p-4">
      <div className="mb-3 text-xs uppercase tracking-widest text-parchment/40">მოდები</div>
      <div className="grid grid-cols-2 gap-2.5">
        {SETTINGS_FIELDS.map((f) => (
          <label
            key={f.key}
            className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-2.5 py-2 transition focus-within:border-gold/60"
          >
            <span className="text-base leading-none">{f.icon}</span>
            <div className="min-w-0 flex-1 leading-tight">
              <div className="truncate text-[10px] text-parchment/45">{f.label}</div>
              <div className="flex items-baseline gap-1">
                {f.prefix && <span className="text-parchment/40">{f.prefix}</span>}
                <input
                  type="number"
                  value={draft[f.key]}
                  min={f.min}
                  max={f.max}
                  step={f.step}
                  onChange={(e) => setDraft({ ...draft, [f.key]: e.target.value })}
                  className="w-full min-w-0 bg-transparent font-mono text-sm font-bold text-parchment focus:outline-none"
                />
                {f.suffix && <span className="text-parchment/40">{f.suffix}</span>}
              </div>
            </div>
          </label>
        ))}
      </div>
      <button
        onClick={() => updateSettings(draft)}
        disabled={!dirty}
        className={`mt-3 w-full rounded-lg py-2 text-xs font-bold transition ${
          dirty
            ? 'bg-gold text-ink hover:bg-[#e0b95c]'
            : 'border border-white/10 text-parchment/30'
        }`}
      >
        {dirty ? 'შენახვა' : 'შენახულია ✓'}
      </button>
    </div>
  );
}

export default function RoomPage({ params }) {
  const router = useRouter();
  const { code } = use(params);
  const room = useGameStore((s) => s.room);
  const myId = useGameStore((s) => s.myId);
  const error = useGameStore((s) => s.error);
  const setRoom = useGameStore((s) => s.setRoom);
  const { joinRoom, pickToken, toggleReady, startGame, updateSettings, rollStartOrder, leaveRoom } = useGameSocket();
  const user = useAuthStore((s) => s.user);
  const [name, setName] = useState('');
  const effectiveName = user?.username || name;

  const leave = () => {
    leaveRoom();
    setRoom(null);
    router.push('/monopoly');
  };

  // Opened a shared link directly — join with a name first.
  if (!room) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 p-6">
          <h1 className="mb-4 font-display text-2xl font-bold text-parchment">ოთახი {code}</h1>
          <AuthPanel />
          {!user && (
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="თქვენი სახელი"
              maxLength={20}
              className="mb-3 w-full rounded-lg border border-white/15 bg-black/30 p-2.5 text-parchment placeholder:text-parchment/30 focus:border-gold focus:outline-none"
            />
          )}
          <button
            onClick={() => effectiveName.trim() && joinRoom(code, effectiveName)}
            disabled={!effectiveName.trim()}
            className="w-full rounded-lg bg-gold p-3 font-bold text-ink transition hover:bg-[#e0b95c] disabled:opacity-40"
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
            <div>
              <h1 className="font-display text-2xl font-bold text-parchment">ლობი</h1>
              <div className="mt-1.5">
                <RulesGuide />
              </div>
            </div>
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

          <LobbySettings settings={room.settings} isHost={isHost} updateSettings={updateSettings} />

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
          <button
            onClick={leave}
            className="mt-3 w-full rounded-lg border border-parchment/20 p-2.5 text-sm font-semibold text-parchment/60 transition hover:border-parchment/40 hover:bg-white/5 hover:text-parchment"
          >
            ოთახის დატოვება
          </button>
          {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
        </div>
      </main>
    );
  }

  if (room.status === 'rolling') {
    const canRoll = room.startRoll?.pending.includes(myId);
    const stillWaiting = room.players.filter((p) => room.startRoll?.pending.includes(p.id));
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
          <h1 className="font-display text-2xl font-bold text-parchment">ვინ დაიწყებს?</h1>
          <p className="mt-1 text-sm text-parchment/50">ყველა აგდებს კამათელს — მაღალი ჯამი იწყებს</p>

          <ul className="mt-6 space-y-2 text-left">
            {room.players.map((p) => {
              const roll = room.startRoll?.rolls[p.id];
              const waiting = room.startRoll?.pending.includes(p.id);
              return (
                <li key={p.id} className="flex items-center gap-3 rounded-lg border border-white/10 bg-black/20 p-2.5">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-base" style={{ background: p.color }}>
                    {p.token}
                  </span>
                  <span className="min-w-0 flex-1 truncate font-semibold text-parchment">{p.name}</span>
                  {roll ? (
                    <span className="flex shrink-0 items-center gap-2">
                      <Die n={roll.d1} />
                      <Die n={roll.d2} />
                      <span className="font-mono text-lg font-bold text-gold">{roll.sum}</span>
                    </span>
                  ) : waiting ? (
                    <span className="shrink-0 text-xs text-parchment/40">ელოდება…</span>
                  ) : (
                    <span className="shrink-0 text-xs text-parchment/30">—</span>
                  )}
                </li>
              );
            })}
          </ul>

          {canRoll ? (
            <button
              onClick={rollStartOrder}
              className="mt-6 w-full rounded-lg bg-gold p-3 font-bold text-ink shadow-lg transition hover:bg-[#e0b95c]"
            >
              კამათლის გაგორება
            </button>
          ) : (
            <p className="mt-6 text-sm text-parchment/50">
              {stillWaiting.length > 0 ? `ველოდებით: ${stillWaiting.map((p) => p.name).join(', ')}` : 'ითვლება შედეგი…'}
            </p>
          )}
          <button
            onClick={leave}
            className="mt-3 w-full rounded-lg border border-parchment/20 p-2.5 text-sm font-semibold text-parchment/60 transition hover:border-parchment/40 hover:bg-white/5 hover:text-parchment"
          >
            ოთახის დატოვება
          </button>
        </div>
      </main>
    );
  }

  return <GameBoard />;
}
