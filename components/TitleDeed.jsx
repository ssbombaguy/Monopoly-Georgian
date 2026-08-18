'use client';
import { TILES, GROUP_COLORS, rentFor } from '../lib/board';
import { useGameStore } from '../store/gameStore';
import { useGameSocket } from '../hooks/useGameSocket';

const NEUTRAL = '#5c5148'; // rails and utilities have no colour group
const LADDER = ['ქირა', '1 სახლი', '2 სახლი', '3 სახლი', '4 სახლი', 'სასტუმრო'];
const DARK_GROUPS = new Set(['brown', 'darkblue', 'green', 'red']);

function Row({ label, value, highlight }) {
  return (
    <div className={`flex justify-between gap-2 ${highlight ? 'rounded bg-gold/30 px-1.5 py-0.5 font-bold' : ''}`}>
      <span className="truncate text-ink/60">{label}</span>
      <span className="shrink-0 font-mono">{value}</span>
    </div>
  );
}

// One title deed, used both for the street in play (full) and for the
// holdings listed on each player card (compact).
export default function TitleDeed({ index, room, compact = false, onClick }) {
  const myId = useGameStore((s) => s.myId);
  const { mortgageProperty, unmortgageProperty, sellHouse } = useGameSocket();

  const tile = TILES[index];
  if (!tile?.price) return null;

  const houses = room.houses?.[index] || 0;
  const mortgaged = !!room.mortgaged?.[index];
  const owner = room.players.find((p) => p.id === room.properties[index]);
  // Guard on `owner` first: with no owner every group tile is undefined and
  // the comparison would pass vacuously, doubling rent on unowned streets.
  const ownsAll =
    !!owner && !!tile.group &&
    TILES.every((t, i) => t.group !== tile.group || room.properties[i] === owner.id);
  const currentRent = owner ? rentFor(room, index) : null;
  const unmortgageCost = Math.ceil(tile.mortgage * 1.1);
  // Houses sell back at half price, and only off the tallest street in the
  // set — the build-evenly rule in reverse, matching what the server accepts.
  const canSellHouse =
    houses > 0 &&
    houses >= Math.max(...TILES.map((t, i) => (t.group === tile.group ? room.houses?.[i] || 0 : 0)));
  // Paying down a debt is the one thing that still works mid-charge; buying
  // deeds back is not, so don't offer a button the server will refuse.
  const owingMoney = room.pendingPayment?.playerId === myId;

  return (
    <div
      onClick={onClick}
      className={`w-full overflow-hidden rounded-md border border-ink/30 bg-[var(--bd-card)] shadow-lg ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div
        className={`${compact ? 'px-2 py-1 text-center' : 'px-3 py-1.5 text-center'} ${mortgaged ? 'opacity-50' : ''}`}
        style={{ background: tile.group ? GROUP_COLORS[tile.group] : NEUTRAL }}
      >
        <div
          className={`font-bold leading-tight ${compact ? 'text-[10px]' : 'text-xs'} ${!tile.group || DARK_GROUPS.has(tile.group) ? 'text-white' : 'text-[#1c1917]'}`}
        >
          {tile.name}{mortgaged ? ' · დაგირავებული' : ''}
        </div>
      </div>

      <div className={`text-ink space-y-0.5 ${compact ? 'px-2 py-1 text-[10px]' : 'px-3 py-2 text-xs'}`}>
        <Row label="ფასი" value={`₾${tile.price}`} />

        {compact ? (
          <Row
            label={mortgaged ? 'დაგირავებული' : houses === 5 ? 'სასტუმრო' : houses > 0 ? `${houses} სახლი` : 'ქირა'}
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
          <div className="mt-1 flex items-center gap-1.5 border-t border-ink/10 pt-1.5">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: owner.color }} />
            <span className="truncate text-[10px]">{owner.name}</span>
          </div>
        )}

        {!compact && owner?.id === myId && (
          <div className="mt-1.5 flex flex-col gap-1">
            {canSellHouse && (
              <button
                onClick={(e) => { e.stopPropagation(); sellHouse(index); }}
                className="w-full rounded bg-ink/10 py-1 text-[10px] font-bold text-ink transition hover:bg-ink/20"
              >
                {houses === 5 ? 'სასტუმროს გაყიდვა' : 'სახლის გაყიდვა'} · +₾{Math.floor(tile.houseCost / 2)}
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (mortgaged) unmortgageProperty(index);
                else mortgageProperty(index);
              }}
              disabled={mortgaged ? owingMoney : houses > 0}
              className="w-full rounded bg-ink/10 py-1 text-[10px] font-bold text-ink transition hover:bg-ink/20 disabled:opacity-30 disabled:hover:bg-ink/10"
            >
              {mortgaged ? `გამოსყიდვა · ₾${unmortgageCost}` : `დაგირავება · +₾${tile.mortgage}`}
            </button>
          </div>
        )}
      </div>

      {houses > 0 && (
        <div className="flex justify-center gap-1 bg-ink/5 py-1">
          {houses === 5 ? (
            <span className="h-2.5 w-4 rounded-[1px] bg-[#c0392b]" />
          ) : (
            Array.from({ length: houses }, (_, k) => (
              <span key={k} className="h-2.5 w-2.5 rounded-[1px] bg-[#1e7a3c]" />
            ))
          )}
        </div>
      )}
    </div>
  );
}
