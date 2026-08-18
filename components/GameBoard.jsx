'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import ChatPanel from './ChatPanel';
import RulesGuide from './RulesGuide';
import ThemePicker from './ThemePicker';
import Die from './Die';
import GameTile from './GameTile';
import PaymentModal from './PaymentModal';
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

// Themed rather than fixed Tailwind shades: the log has to stay readable on a
// parchment or snowfield backdrop as well as on near-black.
const LOG_STYLE = {
  rent: 'text-[var(--th-rent)]', buy: 'text-[var(--th-buy)]', build: 'text-[var(--th-build)]',
  bad: 'text-[var(--th-danger)]', good: 'text-[var(--th-buy)]', auction: 'text-gold',
  card: 'text-[var(--th-card)]', win: 'text-gold font-bold', jail: 'text-[var(--th-jail)]',
  roll: 'text-parchment/60', info: 'text-parchment/50',
};

// Below lg there's no room for the two side columns, so the same panels move
// into a tab strip under the board. Ordered by how often you reach for them.
const TABS = [
  { key: 'players', icon: '👤', label: 'მოთამაშეები' },
  { key: 'trade', icon: '🤝', label: 'ვაჭრობა' },
  { key: 'log', icon: '📜', label: 'ქრონიკა' },
  { key: 'chat', icon: '💬', label: 'ჩატი' },
];

function Chronicle({ log }) {
  return (
    <div className="rounded-xl border border-[var(--th-line)] bg-[var(--th-panel)] p-3">
      <div className="mb-2 text-[10px] uppercase tracking-widest text-parchment/50">ქრონიკა</div>
      <div className="scroll-thin flex max-h-64 flex-col gap-1 overflow-y-auto pr-1">
        {log?.length ? (
          log.map((e, i) => (
            <div key={e.at + '-' + i} className={`text-[11px] leading-snug ${LOG_STYLE[e.kind] || LOG_STYLE.info}`}>
              {e.text}
            </div>
          ))
        ) : (
          <div className="text-[11px] text-parchment/55">ჯერ არაფერი მომხდარა</div>
        )}
      </div>
    </div>
  );
}

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

// Live auction panel. Rendered inside the board on desktop and in the sticky
// bar on smaller screens, so it sizes off its container rather than a fixed
// width that would hang off the side of a phone.
function AuctionBox({ room, me, placeBid }) {
  return (
    <div className="w-full max-w-80 rounded-xl border-2 border-gold bg-[var(--bd-card)]/95 p-3 text-ink shadow-2xl sm:p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0 truncate text-sm font-bold">🔨 აუქციონი · {TILES[room.auction.tileIndex].name}</div>
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
                className="min-h-11 flex-1 rounded-lg bg-gold px-3 py-2 text-sm font-bold text-[var(--th-on-accent)] shadow transition hover:brightness-110 disabled:opacity-40"
              >
                +₾{inc}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// The turn's own controls. min-h-11 keeps every button at a real thumb target
// on touch without changing how they look under a mouse.
function TurnButtons({ room, me, isMyTurn, inJail, canBuy, onUnowned, tile, actions }) {
  if (!isMyTurn) return null;
  const { rollDice, buyProperty, endTurn, payJailFine } = actions;
  return (
    <div className="flex flex-wrap justify-end gap-2">
      {!room.hasRolled && inJail && me.cash >= room.settings.jailFine && (
        <button onClick={payJailFine} className="min-h-11 rounded-lg bg-felt px-4 py-2.5 text-sm font-bold text-parchment shadow-lg transition hover:opacity-90 sm:px-5 sm:text-base">
          გადაიხადე ₾{room.settings.jailFine}
        </button>
      )}
      {!room.hasRolled && (
        <button onClick={rollDice} className="min-h-11 rounded-lg bg-gold px-4 py-2.5 text-sm font-bold text-[var(--th-on-accent)] shadow-lg transition hover:brightness-110 sm:px-5 sm:text-base">
          {inJail ? 'სცადე დუბლი' : 'კამათლის გაგორება'}
        </button>
      )}
      {canBuy && (
        <button onClick={buyProperty} className="min-h-11 rounded-lg bg-felt px-4 py-2.5 text-sm font-bold text-parchment shadow-lg transition hover:opacity-90 sm:px-5 sm:text-base">
          ყიდვა · ₾{tile.price}
        </button>
      )}
      {room.hasRolled && (
        <button onClick={endTurn} className="min-h-11 rounded-lg border border-ink/30 bg-[var(--bd-card)]/85 px-4 py-2.5 text-sm font-bold text-ink transition hover:bg-[var(--bd-card)] sm:px-5 sm:text-base">
          {onUnowned ? '🔨 აუქციონზე' : room.rollAgain ? 'დუბლი — კიდევ გააგორე' : 'სვლის დასრულება'}
        </button>
      )}
    </div>
  );
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
  const [tab, setTab] = useState('players');

  if (!room) return null;

  const me = room.players.find((p) => p.id === myId);
  const turnPlayer = room.players[room.turn];
  // An open charge freezes the turn for everyone — the only moves the server
  // still accepts are the ones that settle it (see PaymentModal).
  const isMyTurn = turnPlayer?.id === myId && room.status === 'playing' && !room.auction && !room.pendingPayment;
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

  const playersPanel = (
    <>
      {buildable.length > 0 && (
        <div className="rounded-xl border border-[var(--th-line)] bg-[var(--th-panel)] p-3">
          <div className="mb-2 text-[10px] uppercase tracking-widest text-parchment/50">მშენებლობა</div>
          <div className="flex flex-col gap-1.5">
            {buildable.map(({ t, i }) => {
              const h = room.houses?.[i] || 0;
              return (
                <button
                  key={i}
                  onClick={() => buildHouse(i)}
                  className="flex min-h-11 items-center justify-between gap-2 rounded-lg border border-[var(--th-line)] bg-[var(--th-sunken)] px-2.5 py-1.5 text-left text-xs text-parchment transition hover:border-gold/50"
                >
                  <span className="flex min-w-0 items-center gap-1.5">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: GROUP_COLORS[t.group] }} />
                    <span className="truncate">{t.name}</span>
                    <span className="ml-1 flex shrink-0 items-center gap-0.5" title={`${h}/4 სახლი`}>
                      {Array.from({ length: 4 }, (_, k) => (
                        <span key={k} className={`h-1.5 w-1.5 rounded-sm ${k < h ? 'bg-[#1e9c47]' : 'bg-white/15'}`} />
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
    </>
  );

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[1700px] flex-col items-center gap-3 p-2 sm:p-3 lg:flex-row lg:items-start lg:justify-center lg:gap-4 lg:p-4">
      {/* Without this the board just stops responding to clicks with no explanation */}
      {!connected && (
        <div className="fixed inset-x-0 top-0 z-50 bg-red-600 px-4 py-2 text-center text-sm font-bold text-white shadow-lg [padding-top:max(0.5rem,env(safe-area-inset-top))]">
          კავშირი გაწყდა — ხელახლა დაკავშირება…
        </div>
      )}

      <PaymentModal />

      {/* LEFT — chronicle + chat. Below lg these move into the tab strip. */}
      <aside className="hidden w-52 shrink-0 flex-col gap-3 lg:flex xl:w-56">
        <div className="flex flex-wrap gap-2 self-start">
          <RulesGuide />
          <ThemePicker />
        </div>
        <Chronicle log={room.log} />
        <ChatPanel />
      </aside>

      {/* CENTER — board. Square, so its width is also its height: capped by the
          viewport height on desktop and by the screen width on a phone. */}
      <div
        className="@container grid aspect-square w-full max-w-[min(86svh,800px)] shrink-0 gap-px rounded-lg border-[max(0.5cqw,3px)] border-[var(--bd-frame)] bg-[var(--bd-frame)] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] outline outline-1 outline-gold/25 lg:min-w-0 lg:max-w-[min(86vh,800px)] lg:flex-1"
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
        <div className="relative col-start-2 col-end-11 row-start-2 row-end-11 overflow-hidden bg-[var(--bd-center)]">
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
            <div className="rounded-sm border-y-[max(0.5cqw,2px)] border-gold/80 bg-felt px-[8cqw] py-[1.75cqw] shadow-2xl">
              <span className="whitespace-nowrap font-display text-[5.25cqw] font-bold leading-none tracking-wide text-gold">
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
            <div className="absolute inset-[4px] rounded bg-[var(--bd-card)] shadow-[2px_2px_4px_rgba(0,0,0,0.2)]">
              <div className="flex h-full w-full flex-col items-center justify-center rounded border border-ink/10 bg-[#e0f2fe]/30">
                <TileIcon name="chest" className="h-[45%] w-[45%]" />
                <span className="mt-[0.5cqw] font-display text-[1.25cqw] font-bold tracking-widest text-ink/80">საზ. ყუთი</span>
              </div>
            </div>
            {/* Card stack underneath */}
            <div className="absolute inset-[4px] -z-10 translate-x-[2px] translate-y-[2px] rounded border border-ink/10 bg-[var(--bd-card)] shadow-sm" />
            <div className="absolute inset-[4px] -z-20 translate-x-[4px] translate-y-[4px] rounded border border-ink/10 bg-[var(--bd-card)] shadow-sm" />
          </div>

          {/* Chance - Bottom Right */}
          <div 
            className="pointer-events-none absolute bottom-[18%] right-[12%] flex aspect-[1.5] w-[26%] items-center justify-center rounded border-2 border-dashed border-ink/20"
            style={{ transform: 'rotate(-40deg)' }}
          >
            <div className="absolute inset-[4px] rounded bg-[var(--bd-card)] shadow-[2px_2px_4px_rgba(0,0,0,0.2)]">
              <div className="flex h-full w-full flex-col items-center justify-center rounded border border-ink/10 bg-[#ffedd5]/40">
                <TileIcon name="chance" className="h-[45%] w-[45%]" />
                <span className="mt-[0.5cqw] font-display text-[1.25cqw] font-bold tracking-widest text-ink/80">შანსი</span>
              </div>
            </div>
            <div className="absolute inset-[4px] -z-10 translate-x-[2px] translate-y-[2px] rounded border border-ink/10 bg-[var(--bd-card)] shadow-sm" />
            <div className="absolute inset-[4px] -z-20 translate-x-[4px] translate-y-[4px] rounded border border-ink/10 bg-[var(--bd-card)] shadow-sm" />
          </div>

          {/* Title deed of whatever is in play right now */}
          {/* Two renderings rather than a JS breakpoint: at phone size the full
              rent ladder swallows the board, so the compact deed (name, price,
              rent due) stands in. Percentage widths keep it inside the centre
              panel; the max caps land it on exactly the old 14rem/18rem. */}
          {deedIndex !== undefined && (
            <>
              <div className="absolute left-[3%] top-[3%] z-10 w-[44%] sm:hidden">
                <TitleDeed index={deedIndex} room={room} compact />
              </div>
              <div
                className={`absolute left-[2%] top-[2%] z-10 hidden sm:block ${
                  room.auction ? 'w-[52%] max-w-72' : 'w-[45%] max-w-56'
                }`}
              >
                <TitleDeed index={deedIndex} room={room} />
              </div>
            </>
          )}

          {cardVisible && room.lastCard && room.status !== 'finished' && (
            <div className="absolute inset-0 z-30 grid place-items-center bg-black/60 backdrop-blur-[1px]">
              <motion.div
                key={room.lastCard.at}
                initial={{ scale: 0.4, opacity: 0, rotateY: -110 }}
                animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                transition={{ type: 'spring', damping: 15, stiffness: 200 }}
                className={`w-[82%] max-w-72 rounded-xl border-4 p-[4%] text-center shadow-2xl sm:p-5 ${
                  room.lastCard.type === 'chance'
                    ? 'border-orange-400 bg-[var(--bd-chance)]'
                    : 'border-sky-400 bg-[var(--bd-chest)]'
                }`}
              >
                <TileIcon name={room.lastCard.type} className="mx-auto h-[7cqw] max-h-12 w-[7cqw] max-w-12 text-ink/60" />
                <div className="mt-2 text-[max(1.4cqw,9px)] font-bold uppercase tracking-widest text-ink/50 sm:text-xs">
                  {room.lastCard.type === 'chance' ? 'შანსი' : 'საზოგადოებრივი ყუთი'}
                </div>
                <div className="mt-3 font-display text-[max(2cqw,13px)] font-bold leading-snug text-ink sm:text-base">
                  {room.lastCard.text}
                </div>
                <div className="mt-3 text-[max(1.4cqw,9px)] text-ink/50 sm:text-xs">{room.lastCard.player}</div>
              </motion.div>
            </div>
          )}

          {/* Desktop only — below lg the centre panel is ~220px wide and these
              would spill over the board. The sticky bar under it takes over. */}
          <div className="absolute bottom-4 right-4 z-10 hidden flex-col items-end gap-3 lg:flex">
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
              <AuctionBox room={room} me={me} placeBid={placeBid} />
            ) : (
              <>
                <div className="rounded-full bg-ink/10 px-3 py-1 text-sm text-ink/80">
                  სვლაა: <span className="font-bold text-ink">{turnPlayer?.name} {turnPlayer?.token}</span>
                </div>

                {inJail && (
                  <div className="rounded-lg border border-violet-500/40 bg-[color-mix(in_srgb,var(--bd-card)_82%,#8b5cf6)] px-3 py-1.5 text-xs text-ink shadow">
                    🚔 ციხეში ხარ · მცდელობა {me.jailRolls}/3
                  </div>
                )}

                <TurnButtons
                  room={room} me={me} isMyTurn={isMyTurn} inJail={inJail}
                  canBuy={canBuy} onUnowned={onUnowned} tile={tile}
                  actions={{ rollDice, buyProperty, endTurn, payJailFine }}
                />
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
                <div className="text-[max(1.4cqw,10px)] font-bold uppercase tracking-widest text-gold/80 sm:text-xs">🔨 აუქციონი იწყება</div>
                <div className="mt-1 font-display text-[max(2.5cqw,14px)] font-bold text-parchment sm:text-xl">
                  {TILES[room.auction.tileIndex].name}
                </div>
                <div className="mt-3 font-mono text-[max(9cqw,44px)] font-bold leading-none text-gold">
                  {auctionCountdown > 0 ? auctionCountdown : '🔨'}
                </div>
              </motion.div>
            </div>
          )}

          {room.status === 'finished' && (
            <div className="absolute inset-0 z-20 grid place-items-center bg-black/50 p-[3%]">
              <div className="flex w-full max-w-xs flex-col items-center gap-3 rounded-xl border-2 border-gold bg-felt px-[5%] py-[4%] text-center shadow-2xl sm:gap-4">
                <div className="font-display text-[max(2.6cqw,15px)] font-bold text-gold sm:text-2xl">
                  🏆 გამარჯვებულია {room.players.find((p) => p.id === room.winnerId)?.name}!
                </div>
                {room.hostId === myId ? (
                  <button
                    onClick={replay}
                    className="min-h-11 w-full rounded-lg bg-gold px-4 py-2.5 text-sm font-bold text-[var(--th-on-accent)] shadow-lg transition hover:brightness-110 sm:text-base"
                  >
                    თავიდან დაწყება
                  </button>
                ) : (
                  <div className="text-[max(1.5cqw,11px)] text-parchment/50 sm:text-sm">ველოდებით ჰოსტს — თავიდან დაწყება ან გასვლა</div>
                )}
                <button
                  onClick={() => { setRoom(null); router.push('/monopoly'); }}
                  className="min-h-11 w-full rounded-lg border border-parchment/20 px-4 py-2 text-xs font-semibold text-parchment/70 transition hover:border-parchment/40 hover:bg-[var(--th-panel)] hover:text-parchment sm:text-sm"
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
      <aside className="hidden w-64 shrink-0 flex-col gap-3 lg:flex xl:w-72">
        <TradePanel />
        {playersPanel}
      </aside>

      {/* ---- Below lg: sticky turn bar + tabbed panels ---- */}

      {/* Fixed, not sticky: `sticky bottom-0` only stops a box going *below* the
          viewport, so scrolling down to the player cards would carry the turn
          controls off the top. The tab panel below reserves matching padding. */}
      <div className="fixed inset-x-0 bottom-0 z-30 lg:hidden">
        <div className="pb-safe mx-auto max-w-[1700px] border-t border-gold/25 bg-[var(--th-modal)]/95 px-3 pt-2.5 shadow-[0_-8px_24px_rgba(0,0,0,0.55)] backdrop-blur">
          {room.auction ? (
            <div className="flex justify-center">
              <AuctionBox room={room} me={me} placeBid={placeBid} />
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                {room.dice && (
                  <motion.div
                    key={room.dice.join('-') + room.turn + (room.hasRolled ? 'r' : '')}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className="flex shrink-0 gap-1.5"
                  >
                    <Die n={room.dice[0]} />
                    <Die n={room.dice[1]} />
                  </motion.div>
                )}
                <div className="min-w-0">
                  <div className="text-[10px] uppercase tracking-widest text-parchment/55">სვლაა</div>
                  <div className="truncate text-sm font-bold text-parchment">
                    {turnPlayer?.token} {turnPlayer?.name}
                  </div>
                  {inJail && (
                    <div className="text-[10px] text-[var(--th-jail)]">🚔 ციხეში · {me.jailRolls}/3</div>
                  )}
                </div>
              </div>
              <TurnButtons
                room={room} me={me} isMyTurn={isMyTurn} inJail={inJail}
                canBuy={canBuy} onUnowned={onUnowned} tile={tile}
                actions={{ rollDice, buyProperty, endTurn, payJailFine }}
              />
            </div>
          )}
        </div>
      </div>

      <div className="w-full lg:hidden">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <RulesGuide />
          <ThemePicker />
        </div>

        <div className="flex gap-1 rounded-xl border border-[var(--th-line)] bg-[var(--th-sunken)] p-1">
          {TABS.map((t) => {
            const active = tab === t.key;
            // Unread-ish nudge: the two tabs that change without you looking.
            const badge = t.key === 'trade'
              ? (room.trades ?? []).filter((x) => x.toId === myId).length
              : 0;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`relative flex min-h-11 flex-1 flex-col items-center justify-center gap-0.5 rounded-lg px-1 py-1.5 text-[10px] font-semibold transition ${
                  active ? 'bg-gold text-[var(--th-on-accent)]' : 'text-parchment/60 hover:bg-[var(--th-panel)]'
                }`}
              >
                <span className="text-base leading-none">{t.icon}</span>
                <span className="truncate">{t.label}</span>
                {badge > 0 && !active && (
                  <span className="absolute right-1 top-1 grid h-4 w-4 place-items-center rounded-full bg-gold text-[9px] font-bold text-[var(--th-on-accent)]">
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* One panel at a time, in a responsive grid so a tablet doesn't render
            a single 700px-wide player card. The bottom padding is the sticky
            bar's height — without it the last card can never scroll clear. */}
        <div className="mt-3 pb-28">
          {tab === 'players' && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">{playersPanel}</div>
          )}
          {tab === 'trade' && <TradePanel />}
          {tab === 'log' && <Chronicle log={room.log} />}
          {tab === 'chat' && <ChatPanel />}
        </div>
      </div>
    </div>
  );
}
