'use client';
import { motion } from 'framer-motion';
import TileIcon from './TileIcon';
import { GROUP_COLORS } from '../lib/board';

const CORNERS = new Set(['go', 'jail', 'parking', 'gotojail']);

// Houses sit on the color band, like the real plastic ones.
const HOUSE_POS = {
  bottom: 'left-1/2 top-0 -translate-x-1/2 flex-row',
  top: 'left-1/2 bottom-0 -translate-x-1/2 flex-row',
  left: 'right-0 top-1/2 -translate-y-1/2 flex-col',
  right: 'left-0 top-1/2 -translate-y-1/2 flex-col',
};

export default function GameTile({ tile, side, houses = 0, ownerColor, players, style }) {
  const vertical = side === 'left' || side === 'right';
  const isCorner = CORNERS.has(tile.type);
  // Center of the board is up/left of bottom+right tiles, so the color band
  // and the owner strip sit on opposite edges depending on which side we're on.
  const bandFirst = side === 'bottom' || side === 'right';

  const band = tile.group && (
    <div
      className={`shrink-0 border-ink/25 ${vertical ? 'w-[7px] border-x' : 'h-[7px] border-y'}`}
      style={{ background: GROUP_COLORS[tile.group] }}
    />
  );

  const ownerStrip = ownerColor && (
    <div className={`shrink-0 ${vertical ? 'w-[4px]' : 'h-[4px]'}`} style={{ background: ownerColor }} />
  );

  let content;
  if (isCorner) {
    content = (
      <div className="flex min-w-0 flex-1 flex-col items-center justify-center gap-1 p-1 text-center">
        <TileIcon name={tile.icon} className="h-7 w-7 text-ink/80" />
        <span className="text-[8px] font-bold leading-[1.05] tracking-tight">{tile.name}</span>
      </div>
    );
  } else if (tile.group) {
    content = (
      <div className="flex min-w-0 flex-1 flex-col justify-between p-[3px]">
        <span className="text-center text-[8px] font-semibold leading-[1.1] tracking-tight">{tile.name}</span>
        <span className="text-center font-mono text-[8px] font-bold text-ink/65">₾{tile.price}</span>
      </div>
    );
  } else {
    content = (
      <div className="flex min-w-0 flex-1 flex-col items-center justify-center gap-[3px] p-[3px] text-center">
        <TileIcon name={tile.icon} className="h-[18px] w-[18px] text-ink/75" />
        <span className="text-[7.5px] font-semibold leading-[1.05] tracking-tight">{tile.name}</span>
        {tile.price && <span className="font-mono text-[7.5px] text-ink/60">₾{tile.price}</span>}
        {tile.amount && <span className="font-mono text-[7.5px] text-ink/60">₾{tile.amount}</span>}
      </div>
    );
  }

  return (
    <div
      style={style}
      className={`relative flex overflow-hidden bg-parchment text-ink ${vertical ? 'flex-row' : 'flex-col'}`}
    >
      {/* owned tiles get a wash of the owner's color so holdings read at a glance */}
      {ownerColor && (
        <div className="pointer-events-none absolute inset-0" style={{ background: ownerColor, opacity: 0.14 }} />
      )}

      {bandFirst ? band : ownerStrip}
      {content}
      {bandFirst ? ownerStrip : band}

      {/* Houses/hotel rendered on the color band */}
      {houses > 0 && tile.group && (
        <div className={`absolute z-10 flex gap-px ${HOUSE_POS[side]}`}>
          {houses === 5 ? (
            <span className="h-[7px] w-[11px] rounded-[1px] border border-white/80 bg-[#c0392b] shadow" />
          ) : (
            Array.from({ length: houses }, (_, k) => (
              <span key={k} className="h-[7px] w-[7px] rounded-[1px] border border-white/80 bg-[#1e7a3c] shadow" />
            ))
          )}
        </div>
      )}

      {/* Player tokens: layoutId lets Framer Motion animate the token
          across grid cells when position changes in state */}
      <div className="absolute bottom-px left-px z-20 flex flex-wrap gap-px">
        {players.map((p) => (
          <motion.span
            key={p.id}
            layoutId={`token-${p.id}`}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="grid h-4 w-4 place-items-center rounded-full text-[10px] leading-none ring-1 ring-white/80"
            style={{ background: p.color }}
          >
            {p.token}
          </motion.span>
        ))}
      </div>
    </div>
  );
}
