import { describe, it, expect } from "vitest";
import { start, move, getStatus, getLegalMoves } from "../src/game.js";
import { emptyStreak, recordPlay } from "../src/streak.js";
import { emptyStats, recordGame } from "../src/stats.js";
import { newSession } from "../src/session.js";
import { shareData } from "../src/screens/share.js";
import { renderResult } from "../src/screens/result.js";
import app from "../app.config.js";

// a8's only exits are b6 and c7: visiting both first leaves the knight stuck on a8 after 4 moves.
function stuckGame() {
  return [[3, 3], [2, 1], [0, 0]].reduce((g, [x, y]) => move(g, x, y), start(1, 2));
}

function wonGame() {
  // Backtracking search for a full 5×5 tour from a corner.
  const solve = g => {
    if (getStatus(g) === "won") return g;
    for (const [x, y] of getLegalMoves(g)) {
      const done = solve(move(g, x, y));
      if (done) return done;
    }
    return null;
  };
  return solve(start(0, 0, 5));
}

function stateFor(game, score = game.moves.length) {
  return {
    session: { ...newSession(game.size), game, elapsed: 248, undos: 2 },
    streak: recordPlay(emptyStreak(), "2026-10-29"),
    stats: recordGame(emptyStats(), { size: game.size, score, won: false, time: null, alreadyCounted: false }),
  };
}

const DAY = new Date(2026, 9, 29);

describe("share data", () => {
  it("describes a stuck game by the squares visited", () => {
    const d = shareData(stateFor(stuckGame()), DAY);
    expect(d.won).toBe(false);
    expect(d.visited).toBe(4);
    expect(d.total).toBe(64);
    expect(d.text).toContain("Visited 4 of 64 squares in 4:08.");
    expect(d.text.startsWith(app.name)).toBe(true);
  });

  it("describes a full tour as completed", () => {
    const d = shareData(stateFor(wonGame()), DAY);
    expect(d.won).toBe(true);
    expect(d.text).toContain("Completed all 25 squares in 4:08.");
  });

  it("shades only visited squares, spanning the whole ramp", () => {
    const game = stuckGame();
    const d = shareData(stateFor(game), DAY);
    const flat = game.board.flat();
    const dark = d.heat.filter((_, i) => flat[i] === -1);
    const lit = d.heat.filter((_, i) => flat[i] !== -1);
    expect(dark).toHaveLength(60);
    expect(new Set(dark).size).toBe(1);
    expect(lit).toHaveLength(4);
    expect(new Set(lit).size).toBe(4);            // first to last move uses all four shades
    expect(lit).not.toContain(dark[0]);
  });
});

describe("result screen", () => {
  it("shows a stuck game with its count and best", () => {
    const html = renderResult(stateFor(stuckGame(), 30));
    expect(html).toContain("No moves left");
    expect(html).toContain("4 / 64 squares");
    expect(html).toContain("visited 4 of 64 squares, from b6 to a8");
    expect(html).toContain("Your best on 8×8 is 30.");
    expect(html).toContain('data-action="share"');
    expect((html.match(/class="x-mark"/g) ?? []).length).toBe(4);   // only visited squares are crossed
  });

  it("calls out a new best for a stuck game", () => {
    expect(renderResult(stateFor(stuckGame(), 4))).toContain("That's your best on 8×8.");
  });

  it("shows a full tour as complete", () => {
    const html = renderResult(stateFor(wonGame()));
    expect(html).toContain("Tour complete");
    expect(html).toContain("25 / 25 squares");
    expect((html.match(/class="x-mark"/g) ?? []).length).toBe(25);
  });
});
