'use client';
import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { useGameSocket } from '../hooks/useGameSocket';
import { TILES } from '../lib/board';

function ownedProps(room, playerId) {
  return Object.entries(room.properties)
    .filter(([, ownerId]) => ownerId === playerId)
    .map(([i]) => Number(i))
    .filter((i) => !(room.houses?.[i] > 0)) // houses must be sold before the street trades
    .sort((a, b) => a - b);
}

function Composer({ room, myId, others, onClose }) {
  const { proposeTrade } = useGameSocket();
  const [toId, setToId] = useState(others[0]?.id ?? '');
  const [offerCash, setOfferCash] = useState(0);
  const [requestCash, setRequestCash] = useState(0);
  const [offerProps, setOfferProps] = useState([]);
  const [requestProps, setRequestProps] = useState([]);

  const me = room.players.find((p) => p.id === myId);
  const myProps = ownedProps(room, myId);
  const theirProps = toId ? ownedProps(room, toId) : [];

  const toggle = (list, setList, idx) => {
    setList(list.includes(idx) ? list.filter((i) => i !== idx) : [...list, idx]);
  };

  const submit = () => {
    proposeTrade({
      toId,
      offerCash: Number(offerCash) || 0,
      requestCash: Number(requestCash) || 0,
      offerProps,
      requestProps,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-2xl border border-gold/30 bg-[#1c1512] p-5 shadow-2xl"
      >
        <h2 className="mb-3 font-display text-lg font-bold text-parchment">ახალი ვაჭრობა</h2>

        <label className="text-xs text-parchment/50">ვის სთავაზობ</label>
        <select
          value={toId}
          onChange={(e) => { setToId(e.target.value); setRequestProps([]); }}
          className="mb-4 mt-1 w-full rounded-lg border border-white/15 bg-black/30 p-2 text-sm text-parchment focus:border-gold focus:outline-none"
        >
          {others.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="mb-1.5 text-xs font-bold text-gold">შენი შეთავაზება</div>
            <input
              type="number"
              min={0}
              max={me?.cash ?? 0}
              value={offerCash}
              onChange={(e) => setOfferCash(e.target.value)}
              placeholder="₾ ნაღდი"
              className="mb-2 w-full rounded-lg border border-white/15 bg-black/30 p-2 text-sm text-parchment focus:border-gold focus:outline-none"
            />
            <div className="max-h-40 space-y-1 overflow-y-auto pr-1">
              {myProps.map((i) => (
                <label key={i} className="flex items-center gap-1.5 text-xs text-parchment/80">
                  <input type="checkbox" checked={offerProps.includes(i)} onChange={() => toggle(offerProps, setOfferProps, i)} />
                  {TILES[i].name}
                </label>
              ))}
              {myProps.length === 0 && <div className="text-xs text-parchment/30">საკუთრება არაა</div>}
            </div>
          </div>

          <div>
            <div className="mb-1.5 text-xs font-bold text-gold">მოთხოვნა</div>
            <input
              type="number"
              min={0}
              value={requestCash}
              onChange={(e) => setRequestCash(e.target.value)}
              placeholder="₾ ნაღდი"
              className="mb-2 w-full rounded-lg border border-white/15 bg-black/30 p-2 text-sm text-parchment focus:border-gold focus:outline-none"
            />
            <div className="max-h-40 space-y-1 overflow-y-auto pr-1">
              {theirProps.map((i) => (
                <label key={i} className="flex items-center gap-1.5 text-xs text-parchment/80">
                  <input type="checkbox" checked={requestProps.includes(i)} onChange={() => toggle(requestProps, setRequestProps, i)} />
                  {TILES[i].name}
                </label>
              ))}
              {theirProps.length === 0 && <div className="text-xs text-parchment/30">საკუთრება არაა</div>}
            </div>
          </div>
        </div>

        <div className="mt-4 flex gap-2.5">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-white/15 py-2.5 font-bold text-parchment/70 transition hover:bg-white/5"
          >
            გაუქმება
          </button>
          <button
            onClick={submit}
            disabled={!toId}
            className="flex-1 rounded-lg bg-gold py-2.5 font-bold text-ink transition hover:bg-[#e0b95c] disabled:opacity-40"
          >
            გაგზავნა
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TradePanel() {
  const room = useGameStore((s) => s.room);
  const myId = useGameStore((s) => s.myId);
  const { respondTrade, cancelTrade } = useGameSocket();
  const [composing, setComposing] = useState(false);

  if (!room) return null;
  const me = room.players.find((p) => p.id === myId);
  const others = room.players.filter((p) => p.id !== myId && !p.bankrupt);
  const trades = room.trades ?? [];
  const incoming = trades.filter((t) => t.toId === myId);
  const outgoing = trades.filter((t) => t.fromId === myId);

  const describe = (t) => ({
    offer: [t.offerCash > 0 ? `₾${t.offerCash}` : null, ...t.offerProps.map((i) => TILES[i].name)].filter(Boolean).join(', ') || 'არაფერი',
    request: [t.requestCash > 0 ? `₾${t.requestCash}` : null, ...t.requestProps.map((i) => TILES[i].name)].filter(Boolean).join(', ') || 'არაფერი',
  });

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-widest text-parchment/50">ვაჭრობა</span>
        {others.length > 0 && me && !me.bankrupt && (
          <button
            onClick={() => setComposing(true)}
            className="rounded bg-gold/90 px-2 py-1 text-[10px] font-bold text-ink transition hover:bg-gold"
          >
            + ახალი
          </button>
        )}
      </div>

      {incoming.length === 0 && outgoing.length === 0 && (
        <div className="text-xs text-parchment/30">აქტიური შეთავაზება არაა</div>
      )}

      <div className="flex flex-col gap-2">
        {incoming.map((t) => {
          const { offer, request } = describe(t);
          return (
            <div key={t.id} className="rounded-lg border border-gold/30 bg-gold/5 p-2 text-xs">
              <div className="font-bold text-parchment">{t.fromName} გთავაზობს:</div>
              <div className="mt-1 text-parchment/70">იძლევა: {offer}</div>
              <div className="text-parchment/70">ითხოვს: {request}</div>
              <div className="mt-1.5 flex gap-1.5">
                <button
                  onClick={() => respondTrade(t.id, true)}
                  className="flex-1 rounded bg-gold px-2 py-1 font-bold text-ink transition hover:bg-[#e0b95c]"
                >
                  დათანხმება
                </button>
                <button
                  onClick={() => respondTrade(t.id, false)}
                  className="flex-1 rounded border border-white/15 px-2 py-1 text-parchment/70 transition hover:bg-white/5"
                >
                  უარყოფა
                </button>
              </div>
            </div>
          );
        })}
        {outgoing.map((t) => {
          const { offer, request } = describe(t);
          return (
            <div key={t.id} className="rounded-lg border border-white/10 bg-black/20 p-2 text-xs">
              <div className="font-bold text-parchment">{t.toName}-ს ელოდება პასუხს</div>
              <div className="mt-1 text-parchment/70">იძლევა: {offer}</div>
              <div className="text-parchment/70">ითხოვს: {request}</div>
              <button
                onClick={() => cancelTrade(t.id)}
                className="mt-1.5 w-full rounded border border-white/15 px-2 py-1 text-parchment/70 transition hover:bg-white/5"
              >
                გაუქმება
              </button>
            </div>
          );
        })}
      </div>

      {composing && <Composer room={room} myId={myId} others={others} onClose={() => setComposing(false)} />}
    </div>
  );
}
