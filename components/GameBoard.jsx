'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import ChatPanel from './ChatPanel';
import RulesGuide from './RulesGuide';
import Die from './Die';
import GameTile from './GameTile';
import PlayerCard from './PlayerCard';
import TileIcon from './TileIcon';
import TitleDeed from './TitleDeed';
import TradePanel from './TradePanel';
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

// Brief "auction starting" countdown shown the moment a new auction opens —
// purely a client-side heads-up, doesn't touch the server's own bid timer.
function useAuctionAnnouncement(auctionTileIndex) {
  const [count, setCount] = useState(null);
  const announced = useRef(null);

  useEffect(() => {
    if (auctionTileIndex === undefined) {
      announced.current = null;
      return;
    }
    if (announced.current === auctionTileIndex) return;
    announced.current = auctionTileIndex;
    setCount(3);
  }, [auctionTileIndex]);

  useEffect(() => {
    if (count === null) return;
    if (count === 0) {
      const t = setTimeout(() => setCount(null), 500);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setCount((c) => c - 1), 600);
    return () => clearTimeout(t);
  }, [count]);

  return count;
}

// Shows the drawn chance/chest card for a few seconds, keyed on lastCard.at
// so a repeat draw of identical text still re-triggers the popup.
function useCardAnnouncement(lastCardAt) {
  const [visible, setVisible] = useState(false);
  const shown = useRef(null);

  useEffect(() => {
    if (!lastCardAt || shown.current === lastCardAt) return;
    shown.current = lastCardAt;
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 3500);
    return () => clearTimeout(t);
  }, [lastCardAt]);

  return visible;
}

function useVisualPlayers(serverPlayers) {
  const [visualPlayers, setVisualPlayers] = useState(serverPlayers || []);

  useEffect(() => {
    if (!serverPlayers) return;
    setVisualPlayers(current => {
      if (current.length === 0) return serverPlayers.map(p => ({ ...p, targetPosition: p.position }));
      
      const activeIds = serverPlayers.map(p => p.id);
      const filtered = current.filter(vp => activeIds.includes(vp.id));
      
      return filtered.map(vp => {
        const sp = serverPlayers.find(p => p.id === vp.id);
        if (!sp) return vp;
        return {
          ...sp,
          position: vp.position,
          targetPosition: sp.position
        };
      }).concat(
        serverPlayers
          .filter(sp => !current.some(vp => vp.id === sp.id))
          .map(sp => ({ ...sp, targetPosition: sp.position }))
      );
    });
  }, [serverPlayers]);

  useEffect(() => {
    if (!serverPlayers) return;
    const interval = setInterval(() => {
      setVisualPlayers(current => {
        let changed = false;
        const next = current.map(vp => {
          if (vp.targetPosition !== undefined && vp.position !== vp.targetPosition) {
            changed = true;
            let nextPos = vp.position;
            const distFwd = (vp.targetPosition - vp.position + 40) % 40;
            const distBwd = (vp.position - vp.targetPosition + 40) % 40;
            
            if (distBwd <= 3 && distBwd > 0) {
              nextPos = (vp.position - 1 + 40) % 40;
            } else if (distFwd > 12) {
              nextPos = vp.targetPosition;
            } else {
              nextPos = (vp.position + 1) % 40;
            }
            return { ...vp, position: nextPos, isHopping: true };
          }
          return vp.isHopping ? { ...vp, isHopping: false } : vp;
        });
        return changed ? next : current;
      });
    }, 250);
    
    return () => clearInterval(interval);
  }, [serverPlayers]);

  return visualPlayers;
}

export default function GameBoard() {
  const router = useRouter();
  const room = useGameStore((s) => s.room);
  const myId = useGameStore((s) => s.myId);
  const connected = useGameStore((s) => s.connected);
  const setRoom = useGameStore((s) => s.setRoom);
  const { rollDice, buyProperty, endTurn, placeBid, buildHouse, payJailFine, surrender, replay } = useGameSocket();
  const auctionCountdown = useAuctionAnnouncement(room?.auction?.tileIndex);
  const cardVisible = useCardAnnouncement(room?.lastCard?.at);
  const visualPlayers = useVisualPlayers(room?.players);

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

      {/* LEFT — chronicle + chat */}
      <aside className="flex w-56 shrink-0 flex-col gap-3">
        <div className="self-start">
          <RulesGuide />
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
          <div className="mb-2 text-[10px] uppercase tracking-widest text-parchment/50">ქრონიკა</div>
          <div className="flex max-h-64 flex-col gap-1 overflow-y-auto pr-1">
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
        </div>
        <ChatPanel />
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
              players={visualPlayers.filter((p) => !p.bankrupt && p.position === i)}
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

          {/* Decks in the center */}
          {/* Community Chest - Top Left */}
          <div 
            className="pointer-events-none absolute left-[12%] top-[18%] flex aspect-[1.5] w-[26%] items-center justify-center rounded border-2 border-dashed border-ink/20"
            style={{ transform: 'rotate(-40deg)' }}
          >
            {/* The Cards themselves */}
            <div className="absolute inset-[4px] rounded bg-white shadow-[2px_2px_4px_rgba(0,0,0,0.2)]">
              <div className="flex h-full w-full flex-col items-center justify-center rounded border border-ink/10 bg-[#e0f2fe]/30">
                <TileIcon name="chest" className="h-[45%] w-[45%]" />
                <span className="mt-1.5 font-display text-[10px] font-bold tracking-widest text-ink/80">საზ. ყუთი</span>
              </div>
            </div>
            {/* Card stack underneath */}
            <div className="absolute inset-[4px] -z-10 translate-x-[2px] translate-y-[2px] rounded border border-ink/10 bg-white shadow-sm" />
            <div className="absolute inset-[4px] -z-20 translate-x-[4px] translate-y-[4px] rounded border border-ink/10 bg-white shadow-sm" />
          </div>

          {/* Chance - Bottom Right */}
          <div 
            className="pointer-events-none absolute bottom-[18%] right-[12%] flex aspect-[1.5] w-[26%] items-center justify-center rounded border-2 border-dashed border-ink/20"
            style={{ transform: 'rotate(-40deg)' }}
          >
            <div className="absolute inset-[4px] rounded bg-white shadow-[2px_2px_4px_rgba(0,0,0,0.2)]">
              <div className="flex h-full w-full flex-col items-center justify-center rounded border border-ink/10 bg-[#ffedd5]/40">
                <TileIcon name="chance" className="h-[45%] w-[45%]" />
                <span className="mt-1.5 font-display text-[10px] font-bold tracking-widest text-ink/80">შანსი</span>
              </div>
            </div>
            <div className="absolute inset-[4px] -z-10 translate-x-[2px] translate-y-[2px] rounded border border-ink/10 bg-white shadow-sm" />
            <div className="absolute inset-[4px] -z-20 translate-x-[4px] translate-y-[4px] rounded border border-ink/10 bg-white shadow-sm" />
          </div>

          {/* Title deed of whatever is in play right now */}
          {deedIndex !== undefined && (
            <div className={`absolute left-4 top-4 z-10 ${room.auction ? 'w-72' : 'w-56'}`}>
              <TitleDeed index={deedIndex} room={room} />
            </div>
          )}

          {cardVisible && room.lastCard && room.status !== 'finished' && (
            <div className="absolute inset-0 z-30 grid place-items-center bg-black/60 backdrop-blur-[1px]">
              <motion.div
                key={room.lastCard.at}
                initial={{ scale: 0.4, opacity: 0, rotateY: -110 }}
                animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                transition={{ type: 'spring', damping: 15, stiffness: 200 }}
                className={`w-72 rounded-xl border-4 p-5 text-center shadow-2xl ${
                  room.lastCard.type === 'chance'
                    ? 'border-orange-400 bg-[#fff4e0]'
                    : 'border-sky-400 bg-[#e6f4ff]'
                }`}
              >
                <TileIcon name={room.lastCard.type} className="mx-auto h-12 w-12 text-ink/60" />
                <div className="mt-2 text-xs font-bold uppercase tracking-widest text-ink/50">
                  {room.lastCard.type === 'chance' ? 'შანსი' : 'საზოგადოებრივი ყუთი'}
                </div>
                <div className="mt-3 font-display text-base font-bold leading-snug text-ink">
                  {room.lastCard.text}
                </div>
                <div className="mt-3 text-xs text-ink/50">{room.lastCard.player}</div>
              </motion.div>
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
              <div className="w-80 rounded-xl border-2 border-gold bg-white/95 p-4 text-ink shadow-2xl">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-bold">🔨 აუქციონი · {TILES[room.auction.tileIndex].name}</div>
                  <div className="shrink-0 rounded-full bg-ink/10 px-2.5 py-1 text-xs">
                    <Countdown endsAt={room.auction.endsAt} />
                  </div>
                </div>
                <div className="mt-2 text-base">
                  {room.auction.bidderId ? (
                    <>
                      <span className="font-mono text-xl font-bold">₾{room.auction.bid}</span>
                      {' — '}
                      {room.players.find((p) => p.id === room.auction.bidderId)?.name}
                    </>
                  ) : (
                    <span className="text-ink/50">ბიდი ჯერ არ არის</span>
                  )}
                </div>
                {me && !me.bankrupt && (
                  <div className="mt-3 flex gap-2">
                    {[10, 50, 100].map((inc) => {
                      const next = room.auction.bid + inc;
                      return (
                        <button
                          key={inc}
                          disabled={next > me.cash}
                          onClick={() => placeBid(next)}
                          className="flex-1 rounded-lg bg-gold px-3 py-2 text-sm font-bold text-ink shadow transition hover:bg-[#e0b95c] disabled:opacity-40"
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

          {auctionCountdown !== null && room.auction && (
            <div className="absolute inset-0 z-30 grid place-items-center bg-black/70 backdrop-blur-[2px]">
              <motion.div
                key={auctionCountdown}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center"
              >
                <div className="text-xs font-bold uppercase tracking-widest text-gold/80">🔨 აუქციონი იწყება</div>
                <div className="mt-1 font-display text-xl font-bold text-parchment">
                  {TILES[room.auction.tileIndex].name}
                </div>
                <div className="mt-3 font-mono text-7xl font-bold text-gold">
                  {auctionCountdown > 0 ? auctionCountdown : '🔨'}
                </div>
              </motion.div>
            </div>
          )}

          {room.status === 'finished' && (
            <div className="absolute inset-0 z-20 grid place-items-center bg-black/50">
              <div className="flex flex-col items-center gap-4 rounded-xl border-2 border-gold bg-felt px-8 py-6 text-center shadow-2xl">
                <div className="font-display text-2xl font-bold text-gold">
                  🏆 გამარჯვებულია {room.players.find((p) => p.id === room.winnerId)?.name}!
                </div>
                {room.hostId === myId ? (
                  <button
                    onClick={replay}
                    className="w-full rounded-lg bg-gold px-6 py-2.5 font-bold text-ink shadow-lg transition hover:bg-[#e0b95c]"
                  >
                    თავიდან დაწყება
                  </button>
                ) : (
                  <div className="text-sm text-parchment/50">ველოდებით ჰოსტს — თავიდან დაწყება ან გასვლა</div>
                )}
                <button
                  onClick={() => { setRoom(null); router.push('/monopoly'); }}
                  className="w-full rounded-lg border border-parchment/20 px-6 py-2 text-sm font-semibold text-parchment/70 transition hover:border-parchment/40 hover:bg-white/5 hover:text-parchment"
                >
                  გასვლა მთავარ გვერდზე
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT — build/trade actions first (time-sensitive on your turn),
          then the player list below so it never buries them off-screen */}
      <aside className="flex w-72 shrink-0 flex-col gap-3">
        {buildable.length > 0 && (
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="mb-2 text-[10px] uppercase tracking-widest text-parchment/50">მშენებლობა</div>
            <div className="flex flex-col gap-1.5">
              {buildable.map(({ t, i }) => {
                const h = room.houses?.[i] || 0;
                return (
                  <button
                    key={i}
                    onClick={() => buildHouse(i)}
                    className="flex items-center justify-between gap-2 rounded-lg border border-white/10 bg-black/20 px-2.5 py-1.5 text-left text-xs text-parchment transition hover:border-gold/50"
                  >
                    <span className="flex min-w-0 items-center gap-1.5">
                      <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: GROUP_COLORS[t.group] }} />
                      <span className="truncate">{t.name}</span>
                      <span className="ml-1 flex shrink-0 items-center gap-0.5" title={`${h}/4 სახლი`}>
                        {Array.from({ length: 4 }, (_, k) => (
                          <span
                            key={k}
                            className={`h-1.5 w-1.5 rounded-sm ${k < h ? 'bg-[#1e9c47]' : 'bg-white/15'}`}
                          />
                        ))}
                      </span>
                    </span>
                    <span className="shrink-0 font-mono text-gold">
                      {h === 4 ? 'სასტ.' : '+სახლი'} ₾{t.houseCost}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <TradePanel />

        {[...room.players]
          .sort((a, b) => (a.id === myId ? -1 : b.id === myId ? 1 : 0))
          .map((p) => (
          <PlayerCard
            key={p.id}
            player={p}
            room={room}
            isActive={p.id === turnPlayer?.id}
            isMe={p.id === myId}
            onSurrender={surrender}
            owned={Object.entries(room.properties)
              .filter(([, ownerId]) => ownerId === p.id)
              .map(([i]) => Number(i))
              .sort((a, b) => a - b)}
          />
        ))}
      </aside>
    </div>
  );
}
