import { SIZES, DEFAULT_SIZE } from "./game.js";
import { THEMES, DEFAULT_THEME, APPEARANCES, DEFAULT_APPEARANCE } from "./theme.js";

export const SETTINGS_VERSION = 1;

export function defaultSettings() {
  return { version: SETTINGS_VERSION, theme: DEFAULT_THEME, appearance: DEFAULT_APPEARANCE, size: DEFAULT_SIZE, timed: true };
}

// Each field is checked on its own, so a missing or bad value (e.g. from an older save
// without `appearance`) falls back to its default without losing the others.
export function parseSettings(raw) {
  const settings = defaultSettings();
  try {
    const data = JSON.parse(raw);
    if (data?.version !== SETTINGS_VERSION) return settings;
    if (data.theme in THEMES) settings.theme = data.theme;
    if (data.appearance in APPEARANCES) settings.appearance = data.appearance;
    if (SIZES.includes(data.size)) settings.size = data.size;
    if (typeof data.timed === "boolean") settings.timed = data.timed;
  } catch {
    // fall through
  }
  return settings;
}
