import assert from 'node:assert';
import { createInitialBoard, getLegalMoves, applyMove, hasAnyCaptureFrom } from '../lib/checkers.js';

// Initial position: black has 7 simple moves, no captures.
{
  const board = createInitialBoard();
  const moves = getLegalMoves(board, 'black');
  assert.strictEqual(moves.length, 7);
  assert.ok(moves.every((m) => !m.isCapture));
}

// Mandatory capture: if a capture exists, non-capture moves must not be offered.
{
  const board = createInitialBoard();
  board[2][1] = null;
  board[3][2] = { color: 'white', king: false }; // white piece adjacent to a black one
  const moves = getLegalMoves(board, 'black');
  assert.ok(moves.length > 0);
  assert.ok(moves.every((m) => m.isCapture));
  const jump = moves.find((m) => m.from.r === 2 && m.from.c === 3);
  assert.deepStrictEqual(jump.to, { r: 4, c: 1 });
  const after = applyMove(board, jump);
  assert.strictEqual(after[3][2], null); // captured piece removed
  assert.strictEqual(after[2][3], null); // origin cleared
  assert.ok(after[4][1] && after[4][1].color === 'black');
}

// Kinging: a black piece reaching the last row becomes a king.
{
  const board = Array.from({ length: 8 }, () => Array(8).fill(null));
  board[6][1] = { color: 'black', king: false };
  const moves = getLegalMoves(board, 'black');
  const toLastRow = moves.find((m) => m.to.r === 7);
  const after = applyMove(board, toLastRow);
  assert.strictEqual(after[7][toLastRow.to.c].king, true);
}

// hasAnyCaptureFrom used for multi-jump continuation.
{
  const board = Array.from({ length: 8 }, () => Array(8).fill(null));
  board[2][3] = { color: 'black', king: false };
  board[3][4] = { color: 'white', king: false };
  board[5][6] = { color: 'white', king: false };
  assert.strictEqual(hasAnyCaptureFrom(board, 2, 3), true);
  const after = applyMove(board, { from: { r: 2, c: 3 }, to: { r: 4, c: 5 }, isCapture: true, captured: { r: 3, c: 4 } });
  assert.strictEqual(hasAnyCaptureFrom(after, 4, 5), true);
}

// Backward capture: a black man can jump an enemy piece behind it only when
// allowBackCapture is on; off by default (standard American rules).
{
  const board = Array.from({ length: 8 }, () => Array(8).fill(null));
  board[4][3] = { color: 'black', king: false };
  board[3][2] = { color: 'white', king: false }; // behind the black man (toward row 0)

  const offMoves = getLegalMoves(board, 'black', false);
  assert.ok(offMoves.every((m) => !m.isCapture));

  const onMoves = getLegalMoves(board, 'black', true);
  const backJump = onMoves.find((m) => m.isCapture && m.to.r === 2 && m.to.c === 1);
  assert.ok(backJump);
  const after = applyMove(board, backJump);
  assert.strictEqual(after[3][2], null);
}

console.log('checkers selftest: OK');
