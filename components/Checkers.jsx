'use client';
import { useEffect, useMemo, useState } from 'react';
import { getLegalMoves, applyMove, SIZE } from '../lib/checkers.js';

// Recursively finds every square reachable by continuing a forced multi-jump
// from `from`, so the whole capture line is visible before the first hop is
// clicked — not just the immediate landing square.
function captureChainPreview(board, color, from, allowBackCapture) {
  const hops = getLegalMoves(board, color, allowBackCapture)
    .filter((m) => m.isCapture && m.from.r === from.r && m.from.c === from.c);
  const squares = [];
  for (const hop of hops) {
    squares.push(hop.to);
    squares.push(...captureChainPreview(applyMove(board, hop), color, hop.to, allowBackCapture));
  }
  return squares;
}

// Board/turn/chainFrom are authoritative server state (see useCheckersSocket);
// this component only computes which destinations to highlight and reports
// the player's intended move via onMove — the server validates and applies it.
export default function Checkers({ board, turn, chainFrom, myColor, allowBackCapture, onMove }) {
  const [selected, setSelected] = useState(chainFrom || null);
  useEffect(() => setSelected(chainFrom || null), [board, chainFrom]);

  const isMyTurn = myColor === turn;
  const legalMoves = useMemo(() => {
    if (!isMyTurn) return [];
    const all = getLegalMoves(board, turn, allowBackCapture);
    return chainFrom ? all.filter((m) => m.from.r === chainFrom.r && m.from.c === chainFrom.c) : all;
  }, [board, turn, chainFrom, isMyTurn, allowBackCapture]);

  const movesFromSelected = selected
    ? legalMoves.filter((m) => m.from.r === selected.r && m.from.c === selected.c)
    : [];
  const selectablePieces = new Set(legalMoves.map((m) => `${m.from.r},${m.from.c}`));

  const chainPreview = useMemo(() => {
    if (!isMyTurn || !selected) return [];
    return captureChainPreview(board, turn, selected, allowBackCapture);
  }, [board, turn, selected, isMyTurn, allowBackCapture]);
  const destKeys = new Set(movesFromSelected.map((m) => `${m.to.r},${m.to.c}`));
  const chainPreviewKeys = new Set(chainPreview.map((s) => `${s.r},${s.c}`));

  // Black's home row starts at the top of the underlying board array; flip
  // the render order so each player's own pieces sit at the bottom of their
  // screen, like sitting across a physical board rather than staring at the
  // back of it. White's perspective is already the board's natural order.
  const flipped = myColor === 'black';
  const indexes = [...Array(SIZE).keys()];
  const rows = flipped ? [...indexes].reverse() : indexes;
  const cols = flipped ? [...indexes].reverse() : indexes;

  function onCellClick(r, c) {
    if (!isMyTurn) return;
    const dest = movesFromSelected.find((m) => m.to.r === r && m.to.c === c);
    if (dest) {
      onMove(dest.from, dest.to);
      return;
    }
    if (chainFrom) return; // mid multi-jump: only the highlighted destinations are clickable
    const piece = board[r][c];
    if (piece && piece.color === turn && selectablePieces.has(`${r},${c}`)) {
      setSelected({ r, c });
    } else {
      setSelected(null);
    }
  }

  return (
    <div
      className="grid overflow-hidden rounded-lg border border-[var(--th-line)] shadow-2xl"
      style={{ gridTemplateColumns: `repeat(${SIZE}, minmax(0, 1fr))`, width: 'min(94vw, 720px)', aspectRatio: '1 / 1' }}
    >
      {rows.map((r) =>
        cols.map((c) => {
          const piece = board[r][c];
          const dark = (r + c) % 2 === 1;
          const isSelected = selected && selected.r === r && selected.c === c;
          const isDest = destKeys.has(`${r},${c}`);
          const isFurtherHop = !isDest && chainPreviewKeys.has(`${r},${c}`);
          const isPickable = isMyTurn && !chainFrom && piece && piece.color === turn && selectablePieces.has(`${r},${c}`);
          return (
            <button
              key={`${r}-${c}`}
              type="button"
              onClick={() => onCellClick(r, c)}
              className="relative flex items-center justify-center"
              style={{ background: dark ? '#3b2a1a' : '#e8d9b5' }}
            >
              {isDest && <span className="absolute h-1/4 w-1/4 rounded-full bg-gold/70" />}
              {isFurtherHop && <span className="absolute h-[15%] w-[15%] rounded-full border-2 border-gold/60 bg-gold/20" />}
              {piece && (
                <span
                  className={`flex h-[80%] w-[80%] items-center justify-center rounded-full border-2 transition ${
                    isSelected ? 'ring-4 ring-gold ring-offset-2 ring-offset-[#3b2a1a]' : ''
                  } ${isPickable ? 'cursor-pointer' : ''}`}
                  style={
                    piece.color === 'black'
                      ? {
                          backgroundImage:
                            'radial-gradient(circle at 35% 28%, rgba(255,255,255,0.18), transparent 45%),' +
                            'repeating-radial-gradient(circle at 50% 50%, #3a3a3a 0px, #3a3a3a 4px, #161616 4px, #161616 8px)',
                          borderColor: '#000',
                          boxShadow:
                            'inset 0 3px 5px rgba(255,255,255,0.15), inset 0 -5px 10px rgba(0,0,0,0.7), 0 4px 8px rgba(0,0,0,0.55)',
                        }
                      : {
                          backgroundImage:
                            'radial-gradient(circle at 35% 28%, rgba(255,255,255,0.55), transparent 45%),' +
                            'repeating-radial-gradient(circle at 50% 50%, #fdf6e3 0px, #fdf6e3 4px, #ddc99a 4px, #ddc99a 8px)',
                          borderColor: '#8a7550',
                          boxShadow:
                            'inset 0 3px 5px rgba(255,255,255,0.6), inset 0 -5px 10px rgba(120,95,55,0.45), 0 4px 8px rgba(0,0,0,0.35)',
                        }
                  }
                >
                  {piece.king && <span className="text-2xl text-gold drop-shadow">♛</span>}
                </span>
              )}
            </button>
          );
        }),
      )}
    </div>
  );
}
