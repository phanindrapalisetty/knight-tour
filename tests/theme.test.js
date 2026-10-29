import { describe, it, expect } from "vitest";
import { THEMES, resolveMode, getPalette, APPEARANCES } from "../src/theme.js";

// WCAG 2 contrast ratio.
function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map(c => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
const contrast = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

const KEYS = ["ground", "surface", "ink", "muted", "line", "light", "dark", "accent", "accentInk", "flame", "flameInk"];

describe("theme", () => {
  it("follows the device only for the system appearance", () => {
    expect(resolveMode("system", true)).toBe("dark");
    expect(resolveMode("system", false)).toBe("light");
    expect(resolveMode("light", true)).toBe("light");
    expect(resolveMode("dark", false)).toBe("dark");
    expect(Object.keys(APPEARANCES)).toEqual(["system", "light", "dark"]);
  });

  it("falls back to the default theme for unknown ids", () => {
    expect(getPalette("neon", "dark")).toBe(THEMES.tournament.dark);
  });

  for (const [id, theme] of Object.entries(THEMES)) {
    for (const mode of ["light", "dark"]) {
      it(`${id} ${mode} has every color and readable text`, () => {
        const p = theme[mode];
        expect(Object.keys(p).sort()).toEqual([...KEYS].sort());
        // Body text and labels (4.5:1).
        for (const [fg, bg] of [["ink", "ground"], ["ink", "surface"], ["muted", "ground"], ["muted", "surface"],
          ["accentInk", "accent"], ["ground", "ink"]]) {
          expect(contrast(p[fg], p[bg]), `${fg} on ${bg}`).toBeGreaterThanOrEqual(4.5);
        }
        // Icons and large text (3:1): the check on done days, the flame, the knight on its square.
        for (const [fg, bg] of [["flameInk", "flame"], ["flame", "surface"], ["accent", "ground"]]) {
          expect(contrast(p[fg], p[bg]), `${fg} on ${bg}`).toBeGreaterThanOrEqual(3);
        }
      });
    }
  }
});
