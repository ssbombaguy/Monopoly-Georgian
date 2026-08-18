'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import TitleDeed from './TitleDeed';

export default function PlayerCard({ player, isActive, isMe, owned = [], room, onSurrender }) {
  const [openIndex, setOpenIndex] = useState(null);
  const [confirmingSurrender, setConfirmingSurrender] = useState(false);

  return (
    <>
    <motion.div
      animate={{ scale: isActive ? 1.02 : 1 }}
      className={`rounded-xl border p-3 ${
        isActive
          ? 'border-gold bg-[var(--th-panel)] shadow-[0_0_20px_rgba(212,169,75,0.2)] ring-1 ring-gold/30'
          : 'border-[var(--th-line)] bg-[var(--th-panel)]'
      } ${player.bankrupt ? 'opacity-40' : ''}`}
    >
      <div className="flex items-center gap-2.5">
        <span
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-base ring-1 ring-white/30"
          style={{ background: player.color }}
        >
          {player.token}
        </span>
        <span className="min-w-0 truncate font-semibold text-parchment">
          {player.name} {isMe && <span className="text-parchment/50">· მე</span>}
        </span>
        {player.connected === false && (
          <span className="shrink-0 text-[10px] text-[var(--th-rent)]" title="კავშირი გაწყდა — უბრუნდება">● კავშირი წყდება</span>
        )}
        {isActive && <span className="ml-auto shrink-0 text-[10px] uppercase tracking-widest text-gold">სვლა</span>}
      </div>

      <div className="mt-2 flex items-baseline gap-2">
        <span className="font-mono text-xl text-parchment">
          {player.bankrupt ? 'გაკოტრდა' : `₾${player.cash.toLocaleString('ka-GE')}`}
        </span>
        {player.inJail && <span className="text-[10px] text-[var(--th-jail)]">🚔 ციხეში {player.jailRolls}/3</span>}
        {isMe && !player.bankrupt && room.status === 'playing' && (
          <button
            onClick={() => setConfirmingSurrender(true)}
            className="ml-auto flex shrink-0 items-center gap-1 rounded px-1.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-parchment/55 transition hover:bg-red-500/10 hover:text-red-400"
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3" />
              <path d="M15 16l4-4-4-4" />
              <path d="M19 12H9" />
            </svg>
            დანებება
          </button>
        )}
      </div>

      {owned.length > 0 && (
        <div className="mt-2 border-t border-[var(--th-line)] pt-2">
          <div className="mb-1.5 flex justify-between text-[9px] uppercase tracking-wider text-parchment/55">
            <span>ქონება</span>
            <span>{owned.length}</span>
          </div>
          {/* Compact deeds by default; tap one to open its full rent ladder. */}
          <div className="grid max-h-72 grid-cols-2 gap-1.5 overflow-y-auto pr-0.5">
            {owned.map((i) => (
              <div key={i} className={openIndex === i ? 'col-span-2' : ''}>
                <TitleDeed
                  index={i}
                  room={room}
                  compact={openIndex !== i}
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>

    {confirmingSurrender && (
      <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4" onClick={() => setConfirmingSurrender(false)}>
        <div
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-sm rounded-2xl border border-red-500/30 bg-[var(--th-modal)] p-6 shadow-2xl"
        >
          <h2 className="font-display text-xl font-bold text-parchment">დანებება?</h2>
          <p className="mt-2 text-sm text-parchment/60">
            დარწმუნებული ხარ, რომ გინდა დანებება? შენი მთელი ქონება აუქციონზე გავა.
          </p>
          <div className="mt-5 flex gap-2.5">
            <button
              onClick={() => setConfirmingSurrender(false)}
              className="flex-1 rounded-lg border border-[var(--th-line-hi)] py-2.5 font-bold text-parchment/70 transition hover:bg-[var(--th-panel)]"
            >
              გაუქმება
            </button>
            <button
              onClick={() => { setConfirmingSurrender(false); onSurrender(); }}
              className="flex-1 rounded-lg bg-red-500/90 py-2.5 font-bold text-white transition hover:bg-red-500"
            >
              დანებება
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
