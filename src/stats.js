// Lifetime stats, kept per board size. A game is counted once, even if the player undoes and
// finishes it again; replaying it can still raise the best score or lower the best time.
import { SIZES } from "./game.js";

export const STATS_VERSION = 2;

function emptySizeStats() {
  return { bestScore: 0, bestTime: null, gamesPlayed: 0, toursCompleted: 0 };
}

export function emptyStats() {
  return { version: STATS_VERSION, sizes: Object.fromEntries(SIZES.map(s => [s, emptySizeStats()])) };
}

export function sizeStats(stats, size) {
  return stats.sizes[size] ?? emptySizeStats();
}

// `time` is the elapsed seconds, or null when the game wasn't timed.
export function recordGame(stats, { size, score, won, time, alreadyCounted }) {
  const s = sizeStats(stats, size);
  const newTime = won && time !== null;
  return {
    version: STATS_VERSION,
    sizes: {
      ...stats.sizes,
      [size]: {
        bestScore: Math.max(s.bestScore, score),
        bestTime: newTime && (s.bestTime === null || time < s.bestTime) ? time : s.bestTime,
        gamesPlayed: s.gamesPlayed + (alreadyCounted ? 0 : 1),
        toursCompleted: s.toursCompleted + (won && !alreadyCounted ? 1 : 0),
      },
    },
  };
}

const isCount = n => Number.isInteger(n) && n >= 0;

function validSizeStats(s) {
  return isCount(s?.bestScore) && isCount(s.gamesPlayed) && isCount(s.toursCompleted)
    && (s.bestTime === null || isCount(s.bestTime));
}

// Accepts whatever was in storage and returns valid stats, upgrading old versions.
export function parseStats(raw) {
  try {
    const data = JSON.parse(raw);
    if (data?.version === STATS_VERSION && SIZES.every(n => validSizeStats(data.sizes?.[n]))) {
      return data;
    }
    if (data?.version === 1 && validSizeStats({ ...data, bestTime: null })) {
      // v1 only had the 8×8 board.
      const stats = emptyStats();
      const { bestScore, gamesPlayed, toursCompleted } = data;
      stats.sizes[8] = { bestScore, bestTime: null, gamesPlayed, toursCompleted };
      return stats;
    }
  } catch {
    // fall through
  }
  return emptyStats();
}
