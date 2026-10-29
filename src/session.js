// The game in progress plus what the result screen reports about it.
import { createGame, fromMoves, DEFAULT_SIZE } from "./game.js";

export const SESSION_VERSION = 2;
export const MAX_HINTS = 3;

export function newSession(size = DEFAULT_SIZE) {
  return {
    game: createGame(size),
    elapsed: 0,      // seconds the knight has been on the board, always tracked
    hintsUsed: 0,
    undos: 0,
    counted: false,  // whether this game has been added to stats yet
  };
}

export function serializeSession(s) {
  const { game, elapsed, hintsUsed, undos, counted } = s;
  return JSON.stringify({ version: SESSION_VERSION, size: game.size, moves: game.moves, elapsed, hintsUsed, undos, counted });
}

const isCount = n => Number.isInteger(n) && n >= 0;

// Accepts whatever was in storage and returns a valid session, upgrading old versions.
export function parseSession(raw) {
  try {
    const data = JSON.parse(raw);
    if (data?.version === 1) {
      // v1 was 8×8 only and had no timer, hint or undo tracking.
      const game = fromMoves(data.moves, 8);
      if (game) return { ...newSession(8), game, counted: data.counted === true };
    }
    if (data?.version === SESSION_VERSION) {
      const game = fromMoves(data.moves, data.size);
      if (game && isCount(data.elapsed) && isCount(data.undos)
          && isCount(data.hintsUsed) && data.hintsUsed <= MAX_HINTS) {
        const { elapsed, hintsUsed, undos } = data;
        return { game, elapsed, hintsUsed, undos, counted: data.counted === true };
      }
    }
  } catch {
    // fall through
  }
  return newSession();
}
