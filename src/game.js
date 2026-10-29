export const SIZES = [5, 6, 7, 8];
export const DEFAULT_SIZE = 8;

const KNIGHT_MOVES = [
  [2, 1], [1, 2], [-1, 2], [-2, 1],
  [-2, -1], [-1, -2], [1, -2], [2, -1],
];

// board[y][x] holds the move number that visited the square, or -1 if unvisited.
// y = 0 is the top rank, as drawn on screen.
export function createGame(size = DEFAULT_SIZE) {
  return {
    size,
    board: Array.from({ length: size }, () => Array(size).fill(-1)),
    knight: null,
    moves: [],
  };
}

function isFree(game, x, y) {
  return x >= 0 && x < game.size && y >= 0 && y < game.size && game.board[y][x] === -1;
}

export function getLegalMoves(game) {
  if (!game.knight) return [];
  const [x, y] = game.knight;
  return KNIGHT_MOVES
    .map(([dx, dy]) => [x + dx, y + dy])
    .filter(([nx, ny]) => isFree(game, nx, ny));
}

export function isLegalMove(game, x, y) {
  return getLegalMoves(game).some(([mx, my]) => mx === x && my === y);
}

function visit(game, x, y) {
  const board = game.board.map(row => [...row]);
  board[y][x] = game.moves.length;
  return { size: game.size, board, knight: [x, y], moves: [...game.moves, [x, y]] };
}

export function start(x, y, size = DEFAULT_SIZE) {
  return visit(createGame(size), x, y);
}

// Returns the new game, or null if the move is not legal.
export function move(game, x, y) {
  return isLegalMove(game, x, y) ? visit(game, x, y) : null;
}

// Steps back one move; undoing the starting square returns to an empty board.
export function undo(game) {
  if (game.moves.length <= 1) return createGame(game.size);
  const [x, y] = game.moves.at(-1);
  const board = game.board.map(row => [...row]);
  board[y][x] = -1;
  const moves = game.moves.slice(0, -1);
  return { size: game.size, board, knight: moves.at(-1), moves };
}

// Warnsdorff's rule: suggest the legal move with the fewest onward moves.
export function getHint(game) {
  let best = null;
  let bestCount = Infinity;
  for (const [x, y] of getLegalMoves(game)) {
    const count = getLegalMoves(visit(game, x, y)).length;
    if (count < bestCount) {
      best = [x, y];
      bestCount = count;
    }
  }
  return best;
}

// Rebuilds a game from saved moves, or returns null if they don't form a legal tour.
export function fromMoves(moves, size = DEFAULT_SIZE) {
  if (!SIZES.includes(size) || !Array.isArray(moves)) return null;
  let game = createGame(size);
  for (const square of moves) {
    if (!Array.isArray(square) || square.length !== 2 || !square.every(Number.isInteger)) return null;
    const [x, y] = square;
    if (!game.knight) {
      if (!isFree(game, x, y)) return null;
      game = start(x, y, size);
    } else {
      game = move(game, x, y);
      if (!game) return null;
    }
  }
  return game;
}

export function getScore(game) {
  return game.moves.length;
}

export function getTotal(game) {
  return game.size * game.size;
}

export function getStatus(game) {
  if (!game.knight) return "idle";
  if (game.moves.length === getTotal(game)) return "won";
  if (getLegalMoves(game).length === 0) return "stuck";
  return "playing";
}

export function toNotation(x, y, size = DEFAULT_SIZE) {
  return "abcdefgh"[x] + (size - y);
}
