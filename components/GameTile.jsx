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

const HOUSE_ROTATION = {
  bottom: '',
  top: 'rotate-180',
  left: 'rotate-90',
  right: '-rotate-90',
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
  if (tile.type === 'go') {
    content = (
      <div className="relative flex h-full w-full items-center justify-center overflow-hidden text-ink">
        <div 
          className="absolute flex flex-col text-center font-sans leading-[1.1]"
          style={{ 
            transform: 'translate(-50%, -50%) rotate(-45deg)', 
            left: '30%', 
            top: '32%' 
          }}
        >
          <span className="text-[7.5px] font-bold tracking-tight">აიღე</span>
          <span className="text-[7.5px] font-bold tracking-tight">₾200 ხელფასი</span>
          <span className="text-[7.5px] font-bold tracking-tight">გავლისას</span>
        </div>
        
        <div 
          className="absolute text-[48px] font-black leading-none text-[#ed1b24]" 
          style={{ 
            WebkitTextStroke: '2px #000', 
            paintOrder: 'stroke fill',
            fontFamily: 'sans-serif',
            transform: 'translate(-50%, -50%) rotate(-45deg)',
            left: '52%',
            top: '56%',
            letterSpacing: '-2px'
          }}
        >
          GO
        </div>
        
        <div className="absolute bottom-1.5 left-0 right-0 w-full px-1.5">
          <svg viewBox="0 0 100 24" className="h-auto w-full drop-shadow-[0_1.5px_0_rgba(0,0,0,1)]">
            <path 
              d="M 4,12 L 20,2 L 20,7.5 L 98,7.5 L 84,12 L 98,16.5 L 20,16.5 L 20,22 Z" 
              fill="#ed1b24" 
              stroke="#000" 
              strokeWidth="2.5"
              strokeLinejoin="miter"
            />
          </svg>
        </div>
      </div>
    );
  } else if (tile.type === 'parking') {
    content = (
      <div className="relative flex h-full w-full items-center justify-center overflow-hidden text-ink">
        <div 
          className="absolute text-[7.5px] font-black tracking-widest text-[#0c4a8a]"
          style={{ 
            transform: 'translate(-50%, -50%) rotate(-45deg)', 
            left: '24%', 
            top: '24%' 
          }}
        >
          უფასო
        </div>
        
        <div 
          className="absolute"
          style={{ 
            transform: 'translate(-50%, -50%) rotate(-45deg)', 
            left: '50%', 
            top: '50%',
            width: '60%',
            height: '60%'
          }}
        >
          <svg viewBox="0 0 100 100" className="h-[85%] w-[85%] drop-shadow-[0_4px_3px_rgba(0,0,0,0.7)]">
            <g stroke="#171717" strokeWidth="3.5" strokeLinejoin="round" strokeLinecap="round">
              {/* Spare Tire on Back */}
              <path d="M 12 55 C -2 55, -2 35, 12 35 Z" fill="#171717" />
              <path d="M 12 50 C 5 50, 5 40, 12 40 Z" fill="#f8fafc" />

              {/* Main Body Curve */}
              <path d="M 12 65 L 12 45 C 12 30 25 35 30 25 L 43 15 L 60 15 C 75 15 80 35 90 45 L 90 65 Z" fill="#e11d48" />

              {/* Fenders */}
              <path d="M 6 65 C 6 45 44 45 44 65 Z" fill="#be123c" />
              <path d="M 56 65 C 56 45 94 45 94 65 Z" fill="#be123c" />

              {/* Chassis / Running Board */}
              <path d="M 15 65 L 85 65" strokeWidth="5" />

              {/* Bumpers */}
              <path d="M 3 65 L 12 65" stroke="#cbd5e1" strokeWidth="6" />
              <path d="M 88 65 L 97 65" stroke="#cbd5e1" strokeWidth="6" />

              {/* Windows */}
              <path d="M 32 40 L 41 20 L 49 20 L 49 40 Z" fill="#e0f2fe" />
              <path d="M 53 40 L 53 20 L 61 20 L 73 40 Z" fill="#e0f2fe" />

              {/* Tail light */}
              <circle cx="12" cy="48" r="3" fill="#f87171" strokeWidth="2" />
              
              {/* Headlight */}
              <circle cx="89" cy="48" r="4.5" fill="#fef08a" strokeWidth="2" />

              {/* Wheels */}
              <circle cx="25" cy="65" r="13" fill="#171717" />
              <circle cx="25" cy="65" r="5" fill="#f8fafc" strokeWidth="2" />
              <circle cx="75" cy="65" r="13" fill="#171717" />
              <circle cx="75" cy="65" r="5" fill="#f8fafc" strokeWidth="2" />
            </g>
          </svg>
        </div>

        <div 
          className="absolute text-[7.5px] font-black tracking-widest text-[#0c4a8a]"
          style={{ 
            transform: 'translate(-50%, -50%) rotate(-45deg)', 
            left: '76%', 
            top: '76%' 
          }}
        >
          პარკინგი
        </div>
      </div>
    );
  } else if (tile.type === 'gotojail') {
    content = (
      <div className="relative flex h-full w-full items-center justify-center overflow-hidden text-ink">
        <div 
          className="absolute text-[8.5px] font-black tracking-widest text-[#222]"
          style={{ transform: 'translate(-50%, -50%) rotate(-45deg)', left: '23%', top: '23%' }}
        >
          წადი
        </div>
        
        <div 
          className="absolute"
          style={{ transform: 'translate(-50%, -50%) rotate(-45deg)', left: '50%', top: '50%', width: '70%', height: '70%' }}
        >
          <TileIcon name="police" className="h-full w-full drop-shadow-[0_1px_0_rgba(0,0,0,0.5)]" />
        </div>

        <div 
          className="absolute text-[8.5px] font-black tracking-widest text-[#222]"
          style={{ transform: 'translate(-50%, -50%) rotate(-45deg)', left: '77%', top: '77%' }}
        >
          ციხეში
        </div>
      </div>
    );
  } else if (tile.type === 'jail') {
    content = (
      <div className="relative flex h-full w-full items-center justify-center overflow-hidden text-ink">
        <div 
          className="absolute text-[8px] font-black tracking-widest text-[#222]"
          style={{ transform: 'translate(-50%, -50%) rotate(-45deg)', left: '20%', top: '20%' }}
        >
          ციხე
        </div>
        
        <div 
          className="absolute flex items-center justify-center border-[2.5px] border-[#222] bg-[#f97316]"
          style={{ transform: 'translate(-50%, -50%) rotate(-45deg)', left: '50%', top: '50%', width: '55%', height: '55%' }}
        >
          <TileIcon name="jail" className="h-full w-full bg-[#f8fafc]" />
        </div>

        <div 
          className="absolute text-[7px] font-black tracking-widest text-[#222]"
          style={{ transform: 'translate(-50%, -50%) rotate(-45deg)', left: '80%', top: '80%' }}
        >
          სტუმრად
        </div>
      </div>
    );
  } else if (isCorner) {
    content = (
      <div className="flex min-w-0 flex-1 flex-col items-center justify-center gap-1 p-1 text-center">
        <TileIcon name={tile.icon} className="h-7 w-7 text-ink/80" />
        <span className="text-[8px] font-bold leading-[1.05] tracking-tight">{tile.name}</span>
      </div>
    );
  } else if (tile.group) {
    content = (
      <div className="flex min-w-0 flex-1 flex-col justify-between p-[3px]">
        <span className="font-display text-center text-[8px] font-bold leading-[1.1] tracking-tight">{tile.name}</span>
        <span className="text-center font-mono text-[8px] font-bold text-ink/65">₾{tile.price}</span>
      </div>
    );
  } else {
    content = (
      <div className="flex min-w-0 flex-1 flex-col items-center justify-center gap-0 p-px text-center">
        <TileIcon name={tile.icon} className="h-[42px] w-[42px] text-ink/85 drop-shadow-sm" />
        <span className="font-display text-[7.5px] font-bold leading-[1] tracking-tight">{tile.name}</span>
        {tile.price && <span className="font-mono text-[7px] font-semibold text-ink/70">₾{tile.price}</span>}
        {tile.amount && <span className="font-mono text-[7px] font-semibold text-ink/70">₾{tile.amount}</span>}
      </div>
    );
  }

  return (
    <div
      style={style}
      className={`relative flex overflow-hidden text-ink ${vertical ? 'flex-row' : 'flex-col'} ${tile.type === 'go' ? 'bg-[#dce9de]' : tile.type === 'parking' ? 'bg-[#f4f7f0]' : tile.type === 'gotojail' ? 'bg-[#cbe8d5]' : tile.type === 'jail' ? 'bg-orange-100' : 'bg-parchment'}`}
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
        <div className={`absolute z-10 flex gap-[2px] ${HOUSE_POS[side]}`}>
          {houses === 5 ? (
            <svg viewBox="0 0 18 12" className={`w-[20px] h-[14px] overflow-visible drop-shadow-[0_2.5px_2px_rgba(0,0,0,0.9)] ${HOUSE_ROTATION[side]}`}>
              <path d="M 13.5,1 L 13.5,4 L 15.5,4 L 15.5,1 Z" fill="#e11d48" stroke="#4c0519" strokeWidth="1" strokeLinejoin="round"/>
              <path d="M 1.5,5 L 1.5,11 L 16.5,11 L 16.5,5 L 9,1 Z" fill="#e11d48" stroke="#4c0519" strokeWidth="1" strokeLinejoin="round"/>
              <rect x="3.5" y="6.5" width="2.5" height="2.5" fill="#4c0519" />
              <rect x="7.75" y="6.5" width="2.5" height="2.5" fill="#4c0519" />
              <rect x="12" y="6.5" width="2.5" height="2.5" fill="#4c0519" />
            </svg>
          ) : (
            Array.from({ length: houses }, (_, k) => (
              <svg key={k} viewBox="0 0 12 12" className={`w-[14px] h-[14px] overflow-visible drop-shadow-[0_2.5px_2px_rgba(0,0,0,0.9)] ${HOUSE_ROTATION[side]}`}>
                <path d="M 1.5,6 L 1.5,11 L 10.5,11 L 10.5,6 L 6,1.5 Z" fill="#16a34a" stroke="#064e3b" strokeWidth="1" strokeLinejoin="round"/>
                <rect x="4.5" y="7" width="3" height="3" fill="#064e3b" />
              </svg>
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
            animate={p.isHopping ? { y: [0, -15, 0] } : { y: 0 }}
            transition={{ 
              layout: { type: 'spring', stiffness: 300, damping: 25 },
              y: { duration: 0.25 } 
            }}
            className="grid h-4 w-4 place-items-center rounded-full text-[10px] leading-none ring-1 ring-white/80 shadow-md"
            style={{ background: p.color }}
          >
            {p.token}
          </motion.span>
        ))}
      </div>
    </div>
  );
}
