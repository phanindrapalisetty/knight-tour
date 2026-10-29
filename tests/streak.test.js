import { describe, it, expect } from "vitest";
import {
  emptyStreak, recordPlay, displayedStreak, playedToday, parseStreak, toDateKey, weekView, STREAK_VERSION,
} from "../src/streak.js";

const playOn = (...dates) => dates.reduce((s, d) => recordPlay(s, d), emptyStreak());

describe("streak", () => {
  it("starts a streak on first play", () => {
    expect(playOn("2026-10-29")).toEqual({
      version: STREAK_VERSION, current: 1, best: 1, lastPlayed: "2026-10-29", days: ["2026-10-29"],
    });
  });

  it("counts a day only once", () => {
    const once = playOn("2026-10-29");
    expect(recordPlay(once, "2026-10-29")).toBe(once);
  });

  it("extends on consecutive days, including across month and year ends", () => {
    const s = playOn("2026-12-30", "2026-12-31", "2027-01-01");
    expect(s.current).toBe(3);
    expect(s.best).toBe(3);
  });

  it("handles leap days", () => {
    expect(playOn("2028-02-28", "2028-02-29").current).toBe(2);
  });

  it("resets after a missed day but keeps the best", () => {
    const s = playOn("2026-10-01", "2026-10-02", "2026-10-04");
    expect(s.current).toBe(1);
    expect(s.best).toBe(2);
  });

  it("resets and clears history if the clock moves backwards", () => {
    const s = playOn("2026-10-29", "2026-10-20");
    expect(s.current).toBe(1);
    expect(s.days).toEqual(["2026-10-20"]);
  });

  it("keeps only the last two weeks of days", () => {
    const dates = Array.from({ length: 20 }, (_, i) => toDateKey(new Date(2026, 9, 1 + i)));
    const s = playOn(...dates);
    expect(s.current).toBe(20);
    expect(s.days).toHaveLength(14);
    expect(s.days.at(-1)).toBe("2026-10-20");
  });

  it("displays the streak until a day is missed", () => {
    const s = playOn("2026-10-28", "2026-10-29");
    expect(displayedStreak(s, "2026-10-29")).toBe(2);
    expect(displayedStreak(s, "2026-10-30")).toBe(2);
    expect(displayedStreak(s, "2026-10-31")).toBe(0);
    expect(displayedStreak(emptyStreak(), "2026-10-29")).toBe(0);
  });

  it("knows whether today is done", () => {
    const s = playOn("2026-10-29");
    expect(playedToday(s, "2026-10-29")).toBe(true);
    expect(playedToday(s, "2026-10-30")).toBe(false);
  });

  it("shows the current Monday-to-Sunday week", () => {
    // Thursday 29 Oct 2026; played Mon, Tue, Thu.
    const s = playOn("2026-10-26", "2026-10-27", "2026-10-29");
    const week = weekView(s, "2026-10-29");
    expect(week.map(d => d.label).join("")).toBe("MTWTFSS");
    expect(week.map(d => d.date)[0]).toBe("2026-10-26");
    expect(week.map(d => d.state)).toEqual(["done", "done", "missed", "done", "future", "future", "future"]);
    expect(weekView(s, "2026-10-30")[4].state).toBe("today");
  });

  it("starts the week on Monday when today is Sunday", () => {
    const week = weekView(emptyStreak(), "2026-11-01");
    expect(week[0].date).toBe("2026-10-26");
    expect(week[6].state).toBe("today");
  });

  it("formats local dates with zero padding", () => {
    expect(toDateKey(new Date(2026, 0, 5, 23, 59))).toBe("2026-01-05");
  });

  it("parses stored data and rejects anything invalid", () => {
    const good = playOn("2026-10-28", "2026-10-29");
    expect(parseStreak(JSON.stringify(good))).toEqual(good);
    for (const bad of [null, "", "not json", "{}", '{"version":99,"current":1,"best":1,"lastPlayed":null,"days":[]}',
      JSON.stringify({ ...good, current: "3" }), JSON.stringify({ ...good, lastPlayed: "yesterday" }),
      JSON.stringify({ ...good, days: ["soon"] })]) {
      expect(parseStreak(bad)).toEqual(emptyStreak());
    }
  });

  it("upgrades v1 data by rebuilding the days of the current streak", () => {
    const v1 = { version: 1, current: 3, best: 5, lastPlayed: "2026-11-01" };
    expect(parseStreak(JSON.stringify(v1))).toEqual({
      version: STREAK_VERSION, current: 3, best: 5, lastPlayed: "2026-11-01",
      days: ["2026-10-30", "2026-10-31", "2026-11-01"],
    });
    expect(parseStreak(JSON.stringify({ version: 1, current: 0, best: 0, lastPlayed: null })).days).toEqual([]);
  });
});
