'use client';
import { TILES, GROUP_COLORS, rentFor } from '../lib/board';

const NEUTRAL = '#5c5148'; // rails and utilities have no colour group
const LADDER = ['ქირა', '1 სახლი', '2 სახლი', '3 სახლი', '4 სახლი', 'სასტუმრო'];

function Row({ label, value, highlight }) {
  return (
    <div className={`flex justify-between gap-2 ${highlight ? 'rounded bg-gold/30 px-1 font-bold' : ''}`}>
      <span className="truncate text-ink/60">{label}</span>
      <span className="shrink-0 font-mono">{value}</span>
    </div>
  );
}

// One title deed, used both for the street in play (full) and for the
// holdings listed on each player card (compact).
export default function TitleDeed({ index, room, compact = false, onClick }) {
  const tile = TILES[index];
  if (!tile?.price) return null;

  const houses = room.houses?.[index] || 0;
  const owner = room.players.find((p) => p.id === room.properties[index]);
  // Guard on `owner` first: with no owner every group tile is undefined and
  // the comparison would pass vacuously, doubling rent on unowned streets.
  const ownsAll =
    !!owner && !!tile.group &&
    TILES.every((t, i) => t.group !== tile.group || room.properties[i] === owner.id);
  const currentRent = owner ? rentFor(room, index) : null;

  return (
    <div
      onClick={onClick}
      className={`w-full overflow-hidden rounded-md border border-ink/30 bg-white shadow-lg ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div
        className="px-2 py-1 text-center"
        style={{ background: tile.group ? GROUP_COLORS[tile.group] : NEUTRAL }}
      >
        <div
          className={`text-[10px] font-bold leading-tight ${tile.group ? 'text-ink' : 'text-white'}`}
        >
          {tile.name}
        </div>
      </div>

      <div className="px-2 py-1 text-[9px] text-ink">
        <Row label="ფასი" value={`₾${tile.price}`} />

        {compact ? (
          <Row
            label={houses === 5 ? 'სასტუმრო' : houses > 0 ? `${houses} სახლი` : 'ქირა'}
            value={currentRent !== null ? `₾${currentRent}` : '—'}
            highlight
          />
        ) : tile.group ? (
          <>
            {LADDER.map((label, h) => (
              <Row
                key={h}
                label={label}
                value={`₾${h === 0 && ownsAll ? tile.rent[0] * 2 : tile.rent[h]}`}
                highlight={h === houses}
              />
            ))}
            <div className="mt-1 border-t border-ink/10 pt-1">
              <Row label="სახლი" value={`₾${tile.houseCost}`} />
              <Row label="იპოთეკა" value={`₾${tile.mortgage}`} />
            </div>
          </>
        ) : (
          <>
            {tile.type === 'rail' ? (
              [1, 2, 3, 4].map((n) => (
                <Row key={n} label={`${n} სადგური`} value={`₾${25 * 2 ** (n - 1)}`} />
              ))
            ) : (
              <>
                <Row label="1 კომუნალური" value="კამათელი ×4" />
                <Row label="2 კომუნალური" value="კამათელი ×10" />
              </>
            )}
            <div className="mt-1 border-t border-ink/10 pt-1">
              <Row label="იპოთეკა" value={`₾${tile.mortgage}`} />
            </div>
          </>
        )}

        {!compact && owner && (
          <div className="mt-1 flex items-center gap-1 border-t border-ink/10 pt-1">
            <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: owner.color }} />
            <span className="truncate text-[8px]">{owner.name}</span>
          </div>
        )}
      </div>

      {houses > 0 && (
        <div className="flex justify-center gap-px bg-ink/5 py-0.5">
          {houses === 5 ? (
            <span className="h-[7px] w-[11px] rounded-[1px] bg-[#c0392b]" />
          ) : (
            Array.from({ length: houses }, (_, k) => (
              <span key={k} className="h-[7px] w-[7px] rounded-[1px] bg-[#1e7a3c]" />
            ))
          )}
        </div>
      )}
    </div>
  );
}
