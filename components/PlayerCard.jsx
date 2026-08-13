'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import TitleDeed from './TitleDeed';

export default function PlayerCard({ player, isActive, isMe, owned = [], room }) {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <motion.div
      animate={{ scale: isActive ? 1.02 : 1 }}
      className={`rounded-xl border p-3 ${
        isActive
          ? 'border-gold bg-gold/10 shadow-[0_0_20px_rgba(212,169,75,0.15)]'
          : 'border-white/10 bg-white/5'
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
        {isActive && <span className="ml-auto shrink-0 text-[10px] uppercase tracking-widest text-gold">სვლა</span>}
      </div>

      <div className="mt-2 flex items-baseline gap-2">
        <span className="font-mono text-xl text-parchment">
          {player.bankrupt ? 'გაკოტრდა' : `₾${player.cash.toLocaleString('ka-GE')}`}
        </span>
        {player.inJail && <span className="text-[10px] text-violet-300">🚔 ციხეში {player.jailRolls}/3</span>}
      </div>

      {owned.length > 0 && (
        <div className="mt-2 border-t border-white/10 pt-2">
          <div className="mb-1.5 flex justify-between text-[9px] uppercase tracking-wider text-parchment/40">
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
  );
}
