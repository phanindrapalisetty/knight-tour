// Preferences maps to SharedPreferences / UserDefaults in the native apps and to
// localStorage on the web, so saved data survives iOS WebView storage eviction.
import { Preferences } from "@capacitor/preferences";
import { parseStreak } from "./streak.js";
import { parseStats } from "./stats.js";
import { parseSession, serializeSession } from "./session.js";
import { parseSettings } from "./settings.js";

async function get(key) {
  const { value } = await Preferences.get({ key });
  return value;
}

function set(key, value) {
  return Preferences.set({ key, value });
}

export async function loadAll() {
  const [streak, stats, session, settings] = await Promise.all(
    ["streak", "stats", "game", "settings"].map(get),
  );
  return {
    streak: parseStreak(streak),
    stats: parseStats(stats),
    session: parseSession(session),
    settings: parseSettings(settings),
  };
}

export const saveStreak = streak => set("streak", JSON.stringify(streak));
export const saveStats = stats => set("stats", JSON.stringify(stats));
export const saveSession = session => set("game", serializeSession(session));
export const saveSettings = settings => set("settings", JSON.stringify(settings));
