import { describe, it, expect } from "vitest";
import {
  createGame, start, move, undo, getHint, fromMoves, getLegalMoves, getScore, getTotal, getStatus, isLegalMove,
  toNotation, SIZES,
} from "../src/game.js";

const sorted = moves => [...moves].sort((a, b) => a[0] - b[0] || a[1] - b[1]);

describe("game", () => {
  it("starts idle with no legal moves", () => {
    const game = createGame();
    expect(game.size).toBe(8);
    expect(getStatus(game)).toBe("idle");
    expect(getLegalMoves(game)).toEqual([]);
    expect(getScore(game)).toBe(0);
  });

  it("gives a corner knight two moves", () => {
    expect(sorted(getLegalMoves(start(0, 0)))).toEqual([[1, 2], [2, 1]]);
  });

  it("gives a central knight eight moves", () => {
    expect(getLegalMoves(start(3, 3))).toHaveLength(8);
  });

  it("respects smaller board edges", () => {
    // On 5×5, c3 (the centre) reaches all eight squares; e1 only reaches two.
    expect(getLegalMoves(start(2, 2, 5))).toHaveLength(8);
    expect(sorted(getLegalMoves(start(4, 4, 5)))).toEqual([[2, 3], [3, 2]]);
    expect(getTotal(createGame(5))).toBe(25);
  });

  it("records moves and marks visited squares", () => {
    const game = move(start(0, 0), 1, 2);
    expect(game.board[0][0]).toBe(0);
    expect(game.board[2][1]).toBe(1);
    expect(game.knight).toEqual([1, 2]);
    expect(getScore(game)).toBe(2);
  });

  it("excludes visited squares from legal moves", () => {
    expect(getLegalMoves(move(start(0, 0), 1, 2))).not.toContainEqual([0, 0]);
  });

  it("rejects illegal moves", () => {
    const game = start(0, 0);
    expect(move(game, 1, 1)).toBeNull();
    expect(move(game, 0, 0)).toBeNull();
    expect(getScore(game)).toBe(1);
  });

  it("does not mutate the previous game", () => {
    const first = start(0, 0);
    move(first, 1, 2);
    expect(first.board[2][1]).toBe(-1);
    expect(first.moves).toHaveLength(1);
  });

  it("reports stuck when no moves remain", () => {
    // a8's only exits are b6 and c7; visit both before landing on a8.
    let game = start(1, 2);       // b6
    game = move(game, 3, 3);      // d5
    game = move(game, 2, 1);      // c7
    expect(getStatus(game)).toBe("playing");
    game = move(game, 0, 0);      // a8
    expect(getStatus(game)).toBe("stuck");
    expect(getScore(game)).toBe(4);
  });

  it("reports won after following hints for a full 8×8 tour", () => {
    let game = start(0, 7);   // a1
    while (getStatus(game) === "playing") game = move(game, ...getHint(game));
    expect(getStatus(game)).toBe("won");
    expect(getScore(game)).toBe(64);
  });

  it("reports won on a 5×5 board", () => {
    // Backtracking search; a corner start on 5×5 has open tours.
    const solve = game => {
      if (getStatus(game) === "won") return game;
      for (const [x, y] of getLegalMoves(game)) {
        const done = solve(move(game, x, y));
        if (done) return done;
      }
      return null;
    };
    const solved = solve(start(0, 0, 5));
    expect(getStatus(solved)).toBe("won");
    expect(getScore(solved)).toBe(25);
  });

  it("hints the legal move with the fewest onward moves", () => {
    const game = start(3, 3);
    const hint = getHint(game);
    const onward = ([x, y]) => getLegalMoves(move(game, x, y)).length;
    expect(isLegalMove(game, ...hint)).toBe(true);
    for (const m of getLegalMoves(game)) expect(onward(hint)).toBeLessThanOrEqual(onward(m));
  });

  it("has no hint when idle or stuck", () => {
    expect(getHint(createGame())).toBeNull();
    expect(getHint(fromMoves([[1, 2], [3, 3], [2, 1], [0, 0]]))).toBeNull();
  });

  it("undoes the last move", () => {
    const game = undo(move(start(0, 0), 1, 2));
    expect(game.knight).toEqual([0, 0]);
    expect(game.board[2][1]).toBe(-1);
    expect(getScore(game)).toBe(1);
  });

  it("undoing the start returns to an empty board of the same size", () => {
    expect(undo(start(4, 4))).toEqual(createGame());
    expect(undo(start(1, 1, 6))).toEqual(createGame(6));
    expect(undo(createGame(5))).toEqual(createGame(5));
  });

  it("rebuilds a game from saved moves", () => {
    const original = move(move(start(0, 0), 1, 2), 2, 4);
    expect(fromMoves(original.moves)).toEqual(original);
    expect(fromMoves([], 6)).toEqual(createGame(6));
  });

  it("rejects saved moves that are not a legal tour", () => {
    for (const bad of [null, "a1", [[0, 0], [0, 1]], [[0, 0], [1, 2], [0, 0]], [[9, 9]], [[0]], [["0", "0"]]]) {
      expect(fromMoves(bad)).toBeNull();
    }
    expect(fromMoves([[6, 6]], 5)).toBeNull();
    expect(fromMoves([], 9)).toBeNull();
    expect(fromMoves([], "8")).toBeNull();
  });

  it("supports every listed size", () => {
    for (const n of SIZES) expect(createGame(n).board).toHaveLength(n);
  });

  it("converts coordinates to chess notation for the board size", () => {
    expect(toNotation(0, 0)).toBe("a8");
    expect(toNotation(7, 7)).toBe("h1");
    expect(toNotation(0, 0, 5)).toBe("a5");
    expect(toNotation(4, 4, 5)).toBe("e1");
  });
});
