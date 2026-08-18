// Georgian/Russian draughts rules: mandatory captures, multi-jump, kinging,
// and flying kings (a crowned piece slides any distance along a diagonal,
// and can capture an enemy piece from a distance too, landing anywhere
// beyond it). allowBackCapture is a lobby-chosen variant on top of that: a
// man still can't move backward, but it can jump backward over an enemy piece.
export const SIZE = 8;

const DIRS = {
  black: [[1, -1], [1, 1]],
  white: [[-1, -1], [-1, 1]],
};
const KING_DIRS = [[-1, -1], [-1, 1], [1, -1], [1, 1]];

export function createInitialBoard() {
  const board = Array.from({ length: SIZE }, () => Array(SIZE).fill(null));
  for (let r = 0; r < SIZE; r += 1) {
    for (let c = 0; c < SIZE; c += 1) {
      if ((r + c) % 2 !== 1) continue;
      if (r < 3) board[r][c] = { color: 'black', king: false };
      else if (r > 4) board[r][c] = { color: 'white', king: false };
    }
  }
  return board;
}

const inBounds = (r, c) => r >= 0 && r < SIZE && c >= 0 && c < SIZE;

function manMoves(board, r, c, piece, allowBackCapture) {
  const moveDirs = DIRS[piece.color];
  const captureDirs = allowBackCapture ? KING_DIRS : DIRS[piece.color];

  const simple = [];
  for (const [dr, dc] of moveDirs) {
    const nr = r + dr;
    const nc = c + dc;
    if (inBounds(nr, nc) && !board[nr][nc]) {
      simple.push({ from: { r, c }, to: { r: nr, c: nc }, isCapture: false, captured: null });
    }
  }

  const captures = [];
  for (const [dr, dc] of captureDirs) {
    const nr = r + dr;
    const nc = c + dc;
    if (!inBounds(nr, nc) || !board[nr][nc] || board[nr][nc].color === piece.color) continue;
    const jr = r + dr * 2;
    const jc = c + dc * 2;
    if (inBounds(jr, jc) && !board[jr][jc]) {
      captures.push({ from: { r, c }, to: { r: jr, c: jc }, isCapture: true, captured: { r: nr, c: nc } });
    }
  }
  return { simple, captures };
}

// Slides along each diagonal for simple moves; for captures, slides over any
// number of empty squares, then — on meeting exactly one enemy piece with an
// empty square right behind it — offers every empty square beyond it as a
// possible landing spot.
function kingMoves(board, r, c, color) {
  const simple = [];
  const captures = [];
  for (const [dr, dc] of KING_DIRS) {
    let nr = r + dr;
    let nc = c + dc;
    while (inBounds(nr, nc) && !board[nr][nc]) {
      simple.push({ from: { r, c }, to: { r: nr, c: nc }, isCapture: false, captured: null });
      nr += dr;
      nc += dc;
    }
    if (inBounds(nr, nc) && board[nr][nc].color !== color) {
      const captured = { r: nr, c: nc };
      let lr = nr + dr;
      let lc = nc + dc;
      while (inBounds(lr, lc) && !board[lr][lc]) {
        captures.push({ from: { r, c }, to: { r: lr, c: lc }, isCapture: true, captured });
        lr += dr;
        lc += dc;
      }
    }
  }
  return { simple, captures };
}

function movesForPiece(board, r, c, allowBackCapture) {
  const piece = board[r][c];
  return piece.king ? kingMoves(board, r, c, piece.color) : manMoves(board, r, c, piece, allowBackCapture);
}

// Mandatory-capture rule: if any piece of `color` can capture, only capture moves are legal.
export function getLegalMoves(board, color, allowBackCapture = false) {
  const simple = [];
  const captures = [];
  for (let r = 0; r < SIZE; r += 1) {
    for (let c = 0; c < SIZE; c += 1) {
      const piece = board[r][c];
      if (!piece || piece.color !== color) continue;
      const found = movesForPiece(board, r, c, allowBackCapture);
      simple.push(...found.simple);
      captures.push(...found.captures);
    }
  }
  return captures.length ? captures : simple;
}

export function hasAnyCaptureFrom(board, r, c, allowBackCapture = false) {
  const piece = board[r][c];
  if (!piece) return false;
  return movesForPiece(board, r, c, allowBackCapture).captures.length > 0;
}

export function applyMove(board, move) {
  const next = board.map((row) => row.slice());
  const piece = { ...next[move.from.r][move.from.c] };
  next[move.from.r][move.from.c] = null;
  if (move.isCapture) next[move.captured.r][move.captured.c] = null;
  if ((piece.color === 'black' && move.to.r === SIZE - 1) || (piece.color === 'white' && move.to.r === 0)) {
    piece.king = true;
  }
  next[move.to.r][move.to.c] = piece;
  return next;
}
