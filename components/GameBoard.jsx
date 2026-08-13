'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import GameTile from './GameTile';
import PlayerCard from './PlayerCard';
import TileIcon from './TileIcon';
import TitleDeed from './TitleDeed';
import { TILES, GROUP_COLORS } from '../lib/board';
import { useGameStore } from '../store/gameStore';
import { useGameSocket } from '../hooks/useGameSocket';

// Map ring index (0..39, clockwise from bottom-right) to an 11x11 CSS grid cell.
// Corners: 0 = GO (bottom-right), 10 = Jail (bottom-left),
// 20 = Free Parking (top-left), 30 = Go To Jail (top-right).
function gridPos(i) {
  if (i <= 10) return { row: 11, col: 11 - i };    // bottom, right → left
  if (i <= 20) return { row: 21 - i, col: 1 };     // left, bottom → top
  if (i <= 30) return { row: 1, col: i - 19 };     // top, left → right
  return { row: i - 29, col: 11 };                 // right, top → bottom
}

// Which board edge a tile sits on — controls where its color band faces.
function sideOf(i) {
  if (i <= 10) return 'bottom';
  if (i <= 20) return 'left';
  if (i <= 30) return 'top';
  return 'right';
}

// Real die face: 3x3 pip grid, positions indexed 0-8 left-to-right, top-to-bottom.
const PIPS = {
  1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8],
};

function Die({ n }) {
  return (
    <div className="grid h-12 w-12 grid-cols-3 grid-rows-3 place-items-center rounded-lg border border-ink/20 bg-white p-1.5 shadow-md">
      {Array.from({ length: 9 }, (_, i) => (
        <span key={i} className={`h-[7px] w-[7px] rounded-full ${PIPS[n].includes(i) ? 'bg-ink' : ''}`} />
      ))}
    </div>
  );
}

function Countdown({ endsAt }) {
  const [left, setLeft] = useState(endsAt - Date.now());
  useEffect(() => {
    const t = setInterval(() => setLeft(endsAt - Date.now()), 250);
    return () => clearInterval(t);
  }, [endsAt]);
  return <span className="font-mono font-bold">{Math.max(0, Math.ceil(left / 1000))}წმ</span>;
}

const LOG_STYLE = {
  rent: 'text-amber-300', buy: 'text-emerald-300', build: 'text-teal-300',
  bad: 'text-red-300', good: 'text-emerald-300', auction: 'text-gold',
  card: 'text-sky-300', win: 'text-gold font-bold', jail: 'text-violet-300',
  roll: 'text-parchment/60', info: 'text-parchment/50',
};

export default function GameBoard() {
  const room = useGameStore((s) => s.room);
  const myId = useGameStore((s) => s.myId);
  const connected = useGameStore((s) => s.connected);
  const { rollDice, buyProperty, endTurn, placeBid, buildHouse, payJailFine } = useGameSocket();

  if (!room) return null;

  const me = room.players.find((p) => p.id === myId);
  const turnPlayer = room.players[room.turn];
  const isMyTurn = turnPlayer?.id === myId && room.status === 'playing' && !room.auction;
  const tile = me && TILES[me.position];
  const inJail = isMyTurn && me?.inJail;
  const onUnowned = isMyTurn && room.hasRolled && !me?.inJail && !!tile?.price && !room.properties[me.position];
  const canBuy = onUnowned && me.cash >= tile.price;
  const deedIndex = room.auction ? room.auction.tileIndex : turnPlayer?.position;

  // Buildable streets: mine, full color set, under hotel cap, built evenly, affordable.
  // Server re-validates all of this — this only decides what to show.
  const buildable = isMyTurn && me && !me.bankrupt
    ? TILES.map((t, i) => ({ t, i })).filter(({ t, i }) => {
        if (t.type !== 'property' || room.properties[i] !== myId) return false;
        const group = TILES.map((tt, ii) => (tt.group === t.group ? ii : -1)).filter((x) => x >= 0);
        if (!group.every((ii) => room.properties[ii] === myId)) return false;
        const h = room.houses?.[i] || 0;
        if (h >= 5) return false;
        const minH = Math.min(...group.map((ii) => room.houses?.[ii] || 0));
        return h <= minH && me.cash >= t.houseCost;
      })
    : [];

  return (
    <div className="flex min-h-screen flex-wrap items-start justify-center gap-4 p-4">
      {/* Without this the board just stops responding to clicks with no explanation */}
      {!connected && (
        <div className="fixed inset-x-0 top-0 z-50 bg-red-600 px-4 py-2 text-center text-sm font-bold text-white shadow-lg">
          კავშირი გაწყდა — ხელახლა დაკავშირება…
        </div>
      )}

      {/* LEFT — chronicle */}
      <aside className="w-56 shrink-0 rounded-xl border border-white/10 bg-white/5 p-3">
        <div className="mb-2 text-[10px] uppercase tracking-widest text-parchment/50">ქრონიკა</div>
        <div className="flex max-h-[80vh] flex-col gap-1 overflow-y-auto pr-1">
          {room.log?.length ? (
            room.log.map((e, i) => (
              <div key={e.at + '-' + i} className={`text-[11px] leading-snug ${LOG_STYLE[e.kind] || LOG_STYLE.info}`}>
                {e.text}
              </div>
            ))
          ) : (
            <div className="text-[11px] text-parchment/40">ჯერ არაფერი მომხდარა</div>
          )}
        </div>
      </aside>

      {/* CENTER — board */}
      <div
        className="grid aspect-square w-[min(86vh,800px)] shrink-0 gap-px rounded-lg border-[7px] border-[#0d0908] bg-ink/40 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] outline outline-1 outline-gold/25"
        style={{
          // Printed-board proportions: big square corners, narrow edge tiles
          gridTemplateColumns: '1.55fr repeat(9, 1fr) 1.55fr',
          gridTemplateRows: '1.55fr repeat(9, 1fr) 1.55fr',
        }}
      >
        {TILES.map((t, i) => {
          const { row, col } = gridPos(i);
          return (
            <GameTile
              key={i}
              tile={t}
              side={sideOf(i)}
              houses={room.houses?.[i] || 0}
              ownerColor={room.players.find((p) => p.id === room.properties[i])?.color}
              players={room.players.filter((p) => !p.bankrupt && p.position === i)}
              style={{ gridRow: row, gridColumn: col }}
            />
          );
        })}

        {/* Center: board-colored like the real thing, diagonal brand banner */}
        <div className="relative col-start-2 col-end-11 row-start-2 row-end-11 overflow-hidden bg-parchment">
          {/* paper grain + vignette so the field isn't a flat fill */}
          <div
            className="pointer-events-none absolute inset-0 opacity-50"
            style={{
              backgroundImage:
                'radial-gradient(circle at 20% 25%, rgba(0,0,0,.05) 0 1px, transparent 1px), radial-gradient(circle at 70% 65%, rgba(0,0,0,.04) 0 1px, transparent 1px)',
              backgroundSize: '13px 13px, 17px 17px',
            }}
          />
          <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_70px_rgba(42,32,24,0.22)]" />

          <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-[40deg]">
            <div className="rounded-sm border-y-4 border-gold/80 bg-felt px-16 py-3.5 shadow-2xl">
              <span className="whitespace-nowrap font-display text-[42px] font-bold leading-none tracking-wide text-gold">
                მონოპოლია
              </span>
            </div>
          </div>

          {/* Title deed of whatever is in play right now */}
          {deedIndex !== undefined && (
            <div className="absolute left-4 top-4 z-10 w-40">
              <TitleDeed index={deedIndex} room={room} />
            </div>
          )}

          {room.lastCard && !room.auction && (
            <div className="absolute right-4 top-4 z-10 flex max-w-[42%] items-start gap-2 rounded-md border border-ink/20 bg-white/85 px-3 py-2 text-[11px] text-ink shadow-lg">
              <TileIcon name="chest" className="mt-px h-4 w-4 shrink-0 text-ink/60" />
              <span>
                <span className="font-bold">{room.lastCard.player}</span> · {room.lastCard.text}
              </span>
            </div>
          )}

          <div className="absolute bottom-4 right-4 z-10 flex flex-col items-end gap-3">
            {room.dice && (
              <motion.div
                key={room.dice.join('-') + room.turn + (room.hasRolled ? 'r' : '')}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                className="flex gap-2.5"
              >
                <Die n={room.dice[0]} />
                <Die n={room.dice[1]} />
              </motion.div>
            )}

            {room.auction ? (
              <div className="w-60 rounded-lg border-2 border-gold bg-white/90 p-3 text-ink shadow-2xl">
                <div className="text-xs font-bold">🔨 აუქციონი · {TILES[room.auction.tileIndex].name}</div>
                <div className="mt-1 text-sm">
                  {room.auction.bidderId ? (
                    <>
                      <span className="font-mono font-bold">₾{room.auction.bid}</span>
                      {' — '}
                      {room.players.find((p) => p.id === room.auction.bidderId)?.name}
                    </>
                  ) : (
                    <span className="text-ink/60">ბიდი ჯერ არ არის</span>
                  )}
                  {' · '}
                  <Countdown endsAt={room.auction.endsAt} />
                </div>
                {me && !me.bankrupt && (
                  <div className="mt-2 flex gap-1.5">
                    {[10, 50, 100].map((inc) => {
                      const next = room.auction.bid + inc;
                      return (
                        <button
                          key={inc}
                          disabled={next > me.cash}
                          onClick={() => placeBid(next)}
                          className="flex-1 rounded bg-gold px-2 py-1 text-xs font-bold text-ink shadow transition hover:bg-[#e0b95c] disabled:opacity-40"
                        >
                          +₾{inc}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="rounded-full bg-ink/10 px-3 py-1 text-sm text-ink/80">
                  სვლაა: <span className="font-bold text-ink">{turnPlayer?.name} {turnPlayer?.token}</span>
                </div>

                {inJail && (
                  <div className="rounded-lg border border-violet-500/40 bg-violet-50 px-3 py-1.5 text-xs text-ink shadow">
                    🚔 ციხეში ხარ · მცდელობა {me.jailRolls}/3
                  </div>
                )}

                {isMyTurn && (
                  <div className="flex flex-wrap justify-end gap-2">
                    {!room.hasRolled && inJail && me.cash >= 50 && (
                      <button onClick={payJailFine} className="rounded-lg bg-felt px-5 py-2.5 font-bold text-parchment shadow-lg transition hover:opacity-90">
                        გადაიხადე ₾50
                      </button>
                    )}
                    {!room.hasRolled && (
                      <button onClick={rollDice} className="rounded-lg bg-gold px-5 py-2.5 font-bold text-ink shadow-lg transition hover:bg-[#e0b95c]">
                        {inJail ? 'სცადე დუბლი' : 'კამათლის გაგორება'}
                      </button>
                    )}
                    {canBuy && (
                      <button onClick={buyProperty} className="rounded-lg bg-felt px-5 py-2.5 font-bold text-parchment shadow-lg transition hover:opacity-90">
                        ყიდვა · ₾{tile.price}
                      </button>
                    )}
                    {room.hasRolled && (
                      <button onClick={endTurn} className="rounded-lg border border-ink/30 bg-white/70 px-5 py-2.5 font-bold text-ink transition hover:bg-white">
                        {onUnowned ? '🔨 აუქციონზე' : room.rollAgain ? 'დუბლი — კიდევ გააგორე' : 'სვლის დასრულება'}
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {room.status === 'finished' && (
            <div className="absolute inset-0 z-20 grid place-items-center bg-black/50">
              <div className="rounded-xl border-2 border-gold bg-felt px-8 py-5 text-center font-display text-2xl font-bold text-gold shadow-2xl">
                🏆 გამარჯვებულია {room.players.find((p) => p.id === room.winnerId)?.name}!
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT — players and their holdings */}
      <aside className="flex w-64 shrink-0 flex-col gap-3">
        {room.players.map((p) => (
          <PlayerCard
            key={p.id}
            player={p}
            room={room}
            isActive={p.id === turnPlayer?.id}
            isMe={p.id === myId}
            owned={Object.entries(room.properties)
              .filter(([, ownerId]) => ownerId === p.id)
              .map(([i]) => Number(i))
              .sort((a, b) => a - b)}
          />
        ))}

        {buildable.length > 0 && (
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="mb-2 text-[10px] uppercase tracking-widest text-parchment/50">მშენებლობა</div>
            <div className="flex flex-col gap-1.5">
              {buildable.map(({ t, i }) => (
                <button
                  key={i}
                  onClick={() => buildHouse(i)}
                  className="flex items-center justify-between gap-2 rounded-lg border border-white/10 bg-black/20 px-2.5 py-1.5 text-left text-xs text-parchment transition hover:border-gold/50"
                >
                  <span className="flex min-w-0 items-center gap-1.5">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: GROUP_COLORS[t.group] }} />
                    <span className="truncate">{t.name}</span>
                  </span>
                  <span className="shrink-0 font-mono text-gold">
                    {(room.houses?.[i] || 0) === 4 ? 'სასტ.' : '+სახლი'} ₾{t.houseCost}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
