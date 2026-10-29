// A day counts toward the streak once the player finishes a game (won or stuck).
// Dates are local calendar days ("YYYY-MM-DD"), so the streak follows the player's midnight.

export const STREAK_VERSION = 2;
const KEEP_DAYS = 14;   // enough history to draw the current Monday–Sunday week
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function emptyStreak() {
  return { version: STREAK_VERSION, current: 0, best: 0, lastPlayed: null, days: [] };
}

export function toDateKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Calendar arithmetic on date keys, done in UTC so DST shifts never produce 23- or 25-hour "days".
function keyToUtc(key) {
  const [y, m, d] = key.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}

function addDays(key, n) {
  const date = new Date(keyToUtc(key) + n * 86_400_000);
  return date.toISOString().slice(0, 10);
}

function daysBetween(fromKey, toKey) {
  return Math.round((keyToUtc(toKey) - keyToUtc(fromKey)) / 86_400_000);
}

export function recordPlay(streak, today = toDateKey()) {
  const gap = streak.lastPlayed ? daysBetween(streak.lastPlayed, today) : null;
  if (gap === 0) return streak;
  // gap < 0 means the clock moved backwards; start over rather than trust it.
  const current = gap === 1 ? streak.current + 1 : 1;
  const days = (gap > 0 ? streak.days : []).filter(d => daysBetween(d, today) < KEEP_DAYS);
  return {
    version: STREAK_VERSION,
    current,
    best: Math.max(streak.best, current),
    lastPlayed: today,
    days: [...days, today],
  };
}

// The stored streak is only updated on play, so a missed day shows as 0 until the next game.
export function displayedStreak(streak, today = toDateKey()) {
  if (!streak.lastPlayed) return 0;
  const gap = daysBetween(streak.lastPlayed, today);
  return gap === 0 || gap === 1 ? streak.current : 0;
}

export function playedToday(streak, today = toDateKey()) {
  return streak.lastPlayed === today;
}

// Monday to Sunday of the week containing `today`, each marked done / today / missed / future.
export function weekView(streak, today = toDateKey()) {
  const weekday = (new Date(keyToUtc(today)).getUTCDay() + 6) % 7;   // 0 = Monday
  const monday = addDays(today, -weekday);
  const played = new Set(streak.days);
  return ["M", "T", "W", "T", "F", "S", "S"].map((label, i) => {
    const date = addDays(monday, i);
    const state = played.has(date) ? "done"
      : i === weekday ? "today"
      : i < weekday ? "missed"
      : "future";
    return { label, date, state };
  });
}

// Accepts whatever was in storage and returns a valid streak object, upgrading old versions.
export function parseStreak(raw) {
  try {
    const data = JSON.parse(raw);
    const valid = Number.isInteger(data?.current) && Number.isInteger(data?.best)
      && (data.lastPlayed === null || DATE_RE.test(data.lastPlayed));
    if (valid && data.version === STREAK_VERSION
        && Array.isArray(data.days) && data.days.every(d => DATE_RE.test(d))) {
      return data;
    }
    if (valid && data.version === 1) {
      // v1 had no day history; a streak is consecutive, so rebuild it backwards from lastPlayed.
      const count = data.lastPlayed ? Math.min(data.current, KEEP_DAYS) : 0;
      const days = Array.from({ length: count }, (_, i) => addDays(data.lastPlayed, i - count + 1));
      return { ...data, version: STREAK_VERSION, days };
    }
  } catch {
    // fall through
  }
  return emptyStreak();
}
