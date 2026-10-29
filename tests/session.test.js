import { describe, it, expect } from "vitest";
import { newSession, parseSession, serializeSession } from "../src/session.js";
import { parseSettings, defaultSettings } from "../src/settings.js";
import { formatTime, plural } from "../src/format.js";
import { start, move } from "../src/game.js";

describe("session", () => {
  it("round-trips through storage", () => {
    const s = { ...newSession(6), game: move(start(0, 0, 6), 1, 2), elapsed: 42, hintsUsed: 2, undos: 3, counted: true };
    expect(parseSession(serializeSession(s))).toEqual(s);
  });

  it("falls back to a fresh 8×8 session on bad data", () => {
    const good = JSON.parse(serializeSession(newSession(5)));
    for (const bad of [null, "", "{}", JSON.stringify({ ...good, hintsUsed: 4 }), JSON.stringify({ ...good, size: 9 }),
      JSON.stringify({ ...good, elapsed: -1 }), JSON.stringify({ ...good, moves: [[0, 0], [0, 1]] })]) {
      expect(parseSession(bad)).toEqual(newSession());
    }
  });

  it("upgrades a v1 save as an 8×8 game", () => {
    const v1 = { version: 1, moves: [[0, 0], [1, 2]], counted: true };
    const s = parseSession(JSON.stringify(v1));
    expect(s.game.size).toBe(8);
    expect(s.game.moves).toEqual(v1.moves);
    expect(s).toMatchObject({ elapsed: 0, hintsUsed: 0, undos: 0, counted: true });
  });
});

describe("settings", () => {
  it("keeps valid values and replaces invalid ones with defaults", () => {
    expect(parseSettings(JSON.stringify({ version: 1, theme: "walnut", appearance: "dark", size: 6, timed: false })))
      .toEqual({ version: 1, theme: "walnut", appearance: "dark", size: 6, timed: false });
    expect(parseSettings(JSON.stringify({ version: 1, theme: "neon", appearance: "dim", size: 12, timed: "yes" })))
      .toEqual(defaultSettings());
    expect(parseSettings("garbage")).toEqual(defaultSettings());
  });

  it("defaults the appearance to system for saves made before it existed", () => {
    expect(parseSettings(JSON.stringify({ version: 1, theme: "rose", size: 7, timed: true })))
      .toEqual({ version: 1, theme: "rose", appearance: "system", size: 7, timed: true });
  });
});

describe("format", () => {
  it("formats times", () => {
    expect(formatTime(0)).toBe("0:00");
    expect(formatTime(248)).toBe("4:08");
    expect(formatTime(3725)).toBe("1:02:05");
    expect(formatTime(null)).toBe("—");
  });

  it("pluralises", () => {
    expect(plural(1, "hint")).toBe("1 hint");
    expect(plural(0, "hint")).toBe("0 hints");
  });
});
