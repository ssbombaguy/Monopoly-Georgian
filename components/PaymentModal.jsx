'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TILES, GROUP_COLORS } from '../lib/board';
import { useGameStore } from '../store/gameStore';
import { useGameSocket } from '../hooks/useGameSocket';

const NEUTRAL = '#5c5148'; // rails and utilities have no colour group

// Milliseconds left on the server's deadline. Polled rather than counted down
// locally so a re-render (or a tab that was throttled in the background) still
// lands on the real remaining time.
function useTimeLeft(endsAt) {
  const [left, setLeft] = useState(() => Math.max(0, (endsAt ?? 0) - Date.now()));
  useEffect(() => {
    if (!endsAt) return undefined;
    setLeft(Math.max(0, endsAt - Date.now()));
    const t = setInterval(() => setLeft(Math.max(0, endsAt - Date.now())), 100);
    return () => clearInterval(t);
  }, [endsAt]);
  return left;
}

// Everything the player can turn into cash right now, cheapest sacrifice
// first. Mirrors the server's rules: houses sell for half, evenly across the
// set (so only the tallest streets are sellable), and a street has to be
// clear of houses before it can be mortgaged.
function raiseOptions(room, playerId) {
  const options = [];
  for (const key of Object.keys(room.properties)) {
    if (room.properties[key] !== playerId) continue;
    const index = Number(key);
    const tile = TILES[index];
    const houses = room.houses?.[index] || 0;

    if (houses > 0) {
      const group = TILES.map((t, i) => (t.group === tile.group ? i : -1)).filter((i) => i >= 0);
      const tallest = Math.max(...group.map((i) => room.houses?.[i] || 0));
      if (houses < tallest) continue; // sell evenly — the server would reject this one
      options.push({
        index, tile, kind: 'house',
        gain: Math.floor(tile.houseCost / 2),
        action: houses === 5 ? 'სასტუმროს გაყიდვა' : 'სახლის გაყიდვა',
      });
    } else if (!room.mortgaged?.[index]) {
      options.push({ index, tile, kind: 'mortgage', gain: tile.mortgage, action: 'დაგირავება' });
    }
  }
  return options.sort((a, b) => a.gain - b.gain);
}

// A charge nobody at this screen owes — a one-line note so the board doesn't
// look frozen for no reason, without stealing focus from the other players.
function Bystander({ debtor, creditor, pending }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-12 z-40 flex justify-center px-4">
      <motion.div
        initial={{ y: -12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="rounded-full border border-gold/40 bg-[var(--th-modal)]/95 px-4 py-2 text-sm text-parchment shadow-xl"
      >
        <span className="font-semibold" style={{ color: debtor.color }}>
          {debtor.token} {debtor.name}
        </span>
        {pending.mode === 'raise' ? (
          <> ეძებს ₾{pending.amount}-ს — {pending.label}</>
        ) : (
          <> იხდის ₾{pending.amount}-ს{creditor ? ` — ${creditor.name}` : ''}</>
        )}
      </motion.div>
    </div>
  );
}

// The pay prompt. Rent used to be taken out of your wallet the instant you
// landed, and falling short bankrupted you on the spot — this is the stop
// between the two: pay when you're ready (or let the countdown do it), and
// if you're short, sell your way out instead of losing everything.
export default function PaymentModal() {
  const room = useGameStore((s) => s.room);
  const myId = useGameStore((s) => s.myId);
  const { payDebt, sellHouse, mortgageProperty, surrender } = useGameSocket();
  const [confirmingGiveUp, setConfirmingGiveUp] = useState(false);

  const pending = room?.pendingPayment;
  const msLeft = useTimeLeft(pending?.endsAt);

  // Anything the player raised in the meantime closed the give-up prompt's
  // reason for existing — don't leave it hanging over a solvent player.
  useEffect(() => {
    if (pending?.mode !== 'raise') setConfirmingGiveUp(false);
  }, [pending?.mode]);

  if (!room || !pending) return null;
  const debtor = room.players.find((p) => p.id === pending.playerId);
  if (!debtor) return null;
  const creditor = pending.toId ? room.players.find((p) => p.id === pending.toId) : null;

  if (pending.playerId !== myId) {
    return <Bystander debtor={debtor} creditor={creditor} pending={pending} />;
  }

  const shortfall = Math.max(0, pending.amount - debtor.cash);
  const raising = pending.mode === 'raise';
  const options = raising ? raiseOptions(room, myId) : [];
  // Cash plus every asset still sellable — if that can't cover it, no amount
  // of clicking will, and the honest move is to say so.
  const hopeless = raising && debtor.cash + (pending.liquid ?? 0) < pending.amount;

  const windowSeconds = (raising ? room.settings?.raiseCashSeconds : room.settings?.autoPaySeconds) || 1;
  const fraction = pending.endsAt ? Math.min(1, msLeft / (windowSeconds * 1000)) : 0;
  const seconds = Math.ceil(msLeft / 1000);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-[2px]">
      <motion.div
        key={pending.at}
        initial={{ scale: 0.9, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 18, stiffness: 240 }}
        className={`scroll-thin max-h-[92svh] w-full max-w-md overflow-y-auto rounded-2xl border-2 bg-[var(--th-modal)] shadow-2xl ${
          raising ? 'border-red-500/60' : 'border-gold'
        }`}
      >
        <div className={`px-5 py-3 ${raising ? 'bg-red-500/15' : 'bg-gold/15'}`}>
          <div className="text-[10px] uppercase tracking-widest text-parchment/50">
            {raising ? 'არასაკმარისი თანხა' : creditor ? 'ქირის გადახდა' : 'გადასახადი'}
          </div>
          <div className="mt-0.5 font-display text-lg font-bold text-parchment">
            {pending.label}
            {creditor && (
              <span className="ml-2 text-sm font-semibold" style={{ color: creditor.color }}>
                → {creditor.token} {creditor.name}
              </span>
            )}
          </div>
        </div>

        <div className="px-5 pt-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-parchment/55">თანხა</div>
              <div className={`font-mono text-4xl font-bold ${raising ? 'text-[var(--th-danger)]' : 'text-gold'}`}>
                ₾{pending.amount.toLocaleString('ka-GE')}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-widest text-parchment/55">შენი ბალანსი</div>
              <div className="font-mono text-xl text-parchment">
                ₾{debtor.cash.toLocaleString('ka-GE')}
              </div>
              {shortfall > 0 && (
                <div className="font-mono text-xs text-[var(--th-danger)]">გაკლია ₾{shortfall.toLocaleString('ka-GE')}</div>
              )}
            </div>
          </div>

          {pending.endsAt && (
            <div className="mt-4">
              <div className="mb-1 flex justify-between text-[11px] text-parchment/50">
                <span>
                  {raising
                    ? 'დრო თანხის მოსაძიებლად'
                    : `ავტომატური გადახდა ${seconds}წმ-ში`}
                </span>
                {raising && <span className="font-mono font-bold text-[var(--th-danger)]">{seconds}წმ</span>}
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-[var(--th-panel-hi)]">
                <div
                  className={`h-full rounded-full transition-[width] duration-100 ease-linear ${
                    raising ? 'bg-red-400' : 'bg-gold'
                  }`}
                  style={{ width: `${fraction * 100}%` }}
                />
              </div>
            </div>
          )}

          {!pending.endsAt && !raising && (
            <p className="mt-4 text-xs text-parchment/50">
              ავტომატური გადახდა გამორთულია — დააჭირე ღილაკს.
            </p>
          )}

          {raising && (
            <div className="mt-4">
              <p className="text-xs text-parchment/60">
                {hopeless
                  ? 'ვერაფრით ვერ დაფარავ ამ თანხას — შეგიძლია ვაჭრობა სცადო ან დანებდე.'
                  : 'გაყიდე სახლები ან დააგირავე ქონება. ვაჭრობაც ღიაა.'}
              </p>

              {options.length > 0 && (
                <div className="mt-2.5 flex max-h-52 flex-col gap-1.5 overflow-y-auto pr-1">
                  {options.map((o) => (
                    <button
                      key={`${o.kind}-${o.index}`}
                      onClick={() => (o.kind === 'house' ? sellHouse(o.index) : mortgageProperty(o.index))}
                      className="flex min-h-11 items-center justify-between gap-2 rounded-lg border border-[var(--th-line)] bg-[var(--th-sunken-hi)] px-2.5 py-2 text-left text-xs text-parchment transition hover:border-gold/60 hover:bg-black/50"
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-sm"
                          style={{ background: o.tile.group ? GROUP_COLORS[o.tile.group] : NEUTRAL }}
                        />
                        <span className="truncate">{o.tile.name}</span>
                        <span className="shrink-0 text-parchment/55">· {o.action}</span>
                      </span>
                      <span className="shrink-0 font-mono font-bold text-emerald-300">
                        +₾{o.gain}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Pinned to the bottom of the card's own scroll area: on a landscape
              phone the raise-cash list is taller than the screen, and the pay
              button must never be something you have to go looking for. */}
          <div className="sticky bottom-0 -mx-5 mt-5 flex gap-2.5 border-t border-[var(--th-line)] bg-[var(--th-modal)] px-5 pb-4 pt-3">
            {raising ? (
              <button
                onClick={() => setConfirmingGiveUp(true)}
                className={`min-h-12 rounded-lg border border-red-500/40 px-4 py-3 font-bold text-[var(--th-danger)] transition hover:bg-red-500/15 ${
                  hopeless ? 'flex-1' : ''
                }`}
              >
                დანებება
              </button>
            ) : null}
            <button
              onClick={payDebt}
              disabled={shortfall > 0}
              className="min-h-12 flex-1 rounded-lg bg-gold px-4 py-3 font-bold text-[var(--th-on-accent)] shadow-lg transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-30"
            >
              გადახდა · ₾{pending.amount.toLocaleString('ka-GE')}
            </button>
          </div>
        </div>
      </motion.div>

      {confirmingGiveUp && (
        <div
          className="fixed inset-0 z-[60] grid place-items-center bg-black/80 p-4"
          onClick={() => setConfirmingGiveUp(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl border border-red-500/30 bg-[var(--th-modal)] p-6 shadow-2xl"
          >
            <h2 className="font-display text-xl font-bold text-parchment">დანებება?</h2>
            <p className="mt-2 text-sm text-parchment/60">
              {creditor
                ? `${creditor.name} აიღებს დარჩენილ ₾${debtor.cash.toLocaleString('ka-GE')}-ს, `
                : ''}
              შენი მთელი ქონება აუქციონზე გავა.
            </p>
            <div className="mt-5 flex gap-2.5">
              <button
                onClick={() => setConfirmingGiveUp(false)}
                className="flex-1 rounded-lg border border-[var(--th-line-hi)] py-2.5 font-bold text-parchment/70 transition hover:bg-[var(--th-panel)]"
              >
                გაუქმება
              </button>
              <button
                onClick={() => { setConfirmingGiveUp(false); surrender(); }}
                className="flex-1 rounded-lg bg-red-500/90 py-2.5 font-bold text-white transition hover:bg-red-500"
              >
                დანებება
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
