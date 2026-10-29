import { describe, it, expect } from "vitest";
import { emptyStats, recordGame, parseStats, sizeStats, STATS_VERSION } from "../src/stats.js";

const game = (over = {}) => ({ size: 8, score: 30, won: false, time: null, alreadyCounted: false, ...over });

describe("stats", () => {
  it("starts empty for every size", () => {
    for (const n of [5, 6, 7, 8]) {
      expect(sizeStats(emptyStats(), n)).toEqual({ bestScore: 0, bestTime: null, gamesPlayed: 0, toursCompleted: 0 });
    }
  });

  it("counts a finished game for its size only", () => {
    const s = recordGame(emptyStats(), game({ size: 6, score: 20 }));
    expect(sizeStats(s, 6)).toEqual({ bestScore: 20, bestTime: null, gamesPlayed: 1, toursCompleted: 0 });
    expect(sizeStats(s, 8).gamesPlayed).toBe(0);
  });

  it("counts a completed tour and its time", () => {
    const s = recordGame(emptyStats(), game({ score: 64, won: true, time: 250 }));
    expect(sizeStats(s, 8)).toEqual({ bestScore: 64, bestTime: 250, gamesPlayed: 1, toursCompleted: 1 });
  });

  it("keeps the best score and the fastest time", () => {
    let s = recordGame(emptyStats(), game({ score: 64, won: true, time: 300 }));
    s = recordGame(s, game({ score: 64, won: true, time: 200 }));
    s = recordGame(s, game({ score: 64, won: true, time: 400 }));
    s = recordGame(s, game({ score: 10 }));
    expect(sizeStats(s, 8)).toMatchObject({ bestScore: 64, bestTime: 200, gamesPlayed: 4, toursCompleted: 3 });
  });

  it("ignores time for untimed or unfinished games", () => {
    let s = recordGame(emptyStats(), game({ score: 64, won: true, time: null }));
    s = recordGame(s, game({ score: 40, won: false, time: 99 }));
    expect(sizeStats(s, 8).bestTime).toBeNull();
  });

  it("does not double-count a game finished again after undo, but can raise the best", () => {
    let s = recordGame(emptyStats(), game({ score: 40 }));
    s = recordGame(s, game({ score: 64, won: true, time: 100, alreadyCounted: true }));
    expect(sizeStats(s, 8)).toEqual({ bestScore: 64, bestTime: 100, gamesPlayed: 1, toursCompleted: 0 });
  });

  it("parses stored data and rejects anything invalid", () => {
    const good = recordGame(emptyStats(), game());
    expect(parseStats(JSON.stringify(good))).toEqual(good);
    const broken = JSON.parse(JSON.stringify(good));
    broken.sizes[5].bestTime = -1;
    for (const bad of [null, "nope", "{}", JSON.stringify({ ...good, version: 9 }), JSON.stringify(broken)]) {
      expect(parseStats(bad)).toEqual(emptyStats());
    }
  });

  it("upgrades v1 data into the 8×8 stats", () => {
    const v1 = { version: 1, bestScore: 12, gamesPlayed: 3, toursCompleted: 0 };
    const s = parseStats(JSON.stringify(v1));
    expect(s.version).toBe(STATS_VERSION);
    expect(sizeStats(s, 8)).toEqual({ bestScore: 12, bestTime: null, gamesPlayed: 3, toursCompleted: 0 });
    expect(sizeStats(s, 5).gamesPlayed).toBe(0);
  });
});
