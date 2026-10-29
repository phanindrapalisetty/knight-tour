import "@fontsource-variable/bricolage-grotesque";
import "@fontsource-variable/figtree";
import "@fontsource-variable/jetbrains-mono";
import "./style.css";
import { start, move, undo, getHint, getScore, getStatus, isLegalMove } from "./game.js";
import { newSession, MAX_HINTS } from "./session.js";
import { recordPlay, emptyStreak } from "./streak.js";
import { recordGame, emptyStats } from "./stats.js";
import { defaultSettings } from "./settings.js";
import { applyTheme, onSystemModeChange } from "./theme.js";
import { formatTime } from "./format.js";
import { FEATURES } from "./features.js";
import { Capacitor } from "@capacitor/core";
import { setupServiceWorker } from "./pwa.js";
import { loadAll, saveSession, saveSettings, saveStats, saveStreak } from "./storage.js";
import { renderHome } from "./screens/home.js";
import { renderPlay } from "./screens/play.js";
import { renderResult } from "./screens/result.js";
import { renderShare, shareData, drawShareCard, appSlug } from "./screens/share.js";

const state = {
  streak: emptyStreak(),
  stats: emptyStats(),
  session: newSession(),
  settings: defaultSettings(),
};
let hint = null;   // suggested square; not saved, it disappears on the next change

const root = document.getElementById("app");

function persist(promise) {
  promise.catch(err => console.error("Failed to save", err));
}

// --- Routing -------------------------------------------------------------------------------
// Screens live in the URL hash so the browser (and later the Android) back button works.
// history.state.depth counts in-app steps, so "back" never leaves the app.

const SCREENS = {
  home: () => renderHome(state),
  menu: () => renderHome(state, { menuOpen: true }),   // Home with the menu panel over it
  play: () => renderPlay(state, hint),
  result: () => renderResult(state),
  share: () => renderShare(state),
};

function currentScreen() {
  const name = location.hash.replace(/^#\/?/, "") || "home";
  if (!(name in SCREENS)) return "home";
  // Result and share only make sense for a finished tour.
  if ((name === "result" || name === "share") && getStatus(state.session.game) !== "won") return "home";
  return name;
}

let lastScreen = null;

// Identifies a control across re-renders, e.g. "setTheme|walnut", so focus can be put back.
const controlKey = el => el && [el.dataset.action, el.dataset.theme, el.dataset.appearance, el.dataset.size, el.dataset.x, el.dataset.y].join("|");

function render({ resetScroll = false } = {}) {
  const screen = currentScreen();
  const focused = controlKey(document.activeElement?.closest("[data-action]"));
  const menuToggled = (lastScreen === "home" && screen === "menu") || (lastScreen === "menu" && screen === "home");

  root.innerHTML = SCREENS[screen]();
  // Entrance animations play only when arriving on a screen, not when it redraws in place.
  root.classList.toggle("settled", screen === lastScreen);
  document.documentElement.classList.toggle("menu-open", screen === "menu");

  if (menuToggled) {
    // Opening the menu moves focus into it; closing returns focus to the menu button.
    root.querySelector(screen === "menu" ? ".menu-close" : ".menu-btn")?.focus();
  } else if (focused && screen === lastScreen) {
    [...root.querySelectorAll("[data-action]")].find(el => controlKey(el) === focused)?.focus();
  }
  // The menu sits over Home, so opening or closing it keeps the page where it was.
  if (resetScroll && !menuToggled) window.scrollTo(0, 0);
  lastScreen = screen;
}

function navigate(name) {
  history.pushState({ depth: (history.state?.depth ?? 0) + 1 }, "", `#/${name}`);
  render({ resetScroll: true });
}

function goBack() {
  if (history.state?.depth > 0) {
    history.back();
  } else {
    history.replaceState({ depth: 0 }, "", "#/home");
    render({ resetScroll: true });
  }
}

window.addEventListener("popstate", () => render({ resetScroll: true }));

// --- Game actions --------------------------------------------------------------------------

function updateSession(changes) {
  state.session = { ...state.session, ...changes };
  hint = null;
  persist(saveSession(state.session));
}

function finishGame(status) {
  const { session, settings } = state;
  state.streak = recordPlay(state.streak);
  state.stats = recordGame(state.stats, {
    size: session.game.size,
    score: getScore(session.game),
    won: status === "won",
    time: settings.timed ? session.elapsed : null,
    alreadyCounted: session.counted,
  });
  state.session = { ...session, counted: true };
  persist(Promise.all([saveStreak(state.streak), saveStats(state.stats), saveSession(state.session)]));
}

function updateSettings(changes) {
  state.settings = { ...state.settings, ...changes };
  persist(saveSettings(state.settings));
}

const actions = {
  play() {
    const { game } = state.session;
    const resumable = game.size === state.settings.size && getStatus(game) === "playing";
    if (!resumable) updateSession(newSession(state.settings.size));
    navigate("play");
  },
  tap({ x, y }) {
    [x, y] = [Number(x), Number(y)];
    const { game } = state.session;
    if (!game.knight) {
      updateSession({ game: start(x, y, game.size) });
    } else if (isLegalMove(game, x, y)) {
      updateSession({ game: move(game, x, y) });
    } else {
      return;
    }
    const status = getStatus(state.session.game);
    if (status === "won" || status === "stuck") finishGame(status);
    render();
  },
  undo() {
    const { game, undos } = state.session;
    if (!game.knight) return;
    updateSession({ game: undo(game), undos: undos + 1 });
    render();
  },
  hint() {
    const { game, hintsUsed } = state.session;
    if (!FEATURES.hints || getStatus(game) !== "playing" || hintsUsed >= MAX_HINTS) return;
    const suggestion = getHint(game);
    updateSession({ hintsUsed: hintsUsed + 1 });
    hint = suggestion;
    render();
  },
  restart() {
    updateSession(newSession(state.session.game.size));
    render();
  },
  showResult: () => navigate("result"),
  share: () => navigate("share"),
  home() {
    history.replaceState({ depth: 0 }, "", "#/home");
    render({ resetScroll: true });
  },
  back: goBack,
  openMenu: () => navigate("menu"),
  closeMenu: goBack,
  setSize({ size }) {
    updateSettings({ size: Number(size) });
    render();
  },
  toggleTimed() {
    updateSettings({ timed: !state.settings.timed });
    render();
  },
  setTheme({ theme }) {
    updateSettings({ theme });
    applyTheme(theme, state.settings.appearance);
    render();
  },
  setAppearance({ appearance }) {
    updateSettings({ appearance });
    applyTheme(state.settings.theme, appearance);
    render();
  },
  async copyText(_, button) {
    try {
      await navigator.clipboard.writeText(shareData(state).text);
      button.querySelector("span").textContent = "Copied";
    } catch (err) {
      console.error("Copy failed", err);
    }
  },
  async shareImage() {
    const data = shareData(state);
    const blob = await drawShareCard(data);
    const file = new File([blob], `${appSlug}.png`, { type: "image/png" });
    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], text: data.text });
      } catch (err) {
        if (err.name !== "AbortError") console.error("Share failed", err);
      }
      return;
    }
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = file.name;
    link.click();
    URL.revokeObjectURL(link.href);
  },
};

root.addEventListener("click", event => {
  const el = event.target.closest("[data-action]");
  if (!el || el.disabled) return;
  actions[el.dataset.action]?.(el.dataset, el);
});

root.addEventListener("keydown", event => {
  if (currentScreen() !== "menu") return;
  if (event.key === "Escape") actions.closeMenu();
  // Keep Tab cycling inside the open menu instead of leaving the page.
  if (event.key === "Tab") {
    const controls = [...root.querySelectorAll(".drawer button")];
    const [first, last] = [controls[0], controls.at(-1)];
    if (event.shiftKey && document.activeElement === first) {
      last.focus();
      event.preventDefault();
    } else if (!event.shiftKey && document.activeElement === last) {
      first.focus();
      event.preventDefault();
    }
  }
});

// --- Timer ---------------------------------------------------------------------------------
// Counts only while the play screen is showing, the game is live and the app is in front.

let ticks = 0;
setInterval(() => {
  if (currentScreen() !== "play" || document.hidden || getStatus(state.session.game) !== "playing") return;
  state.session.elapsed += 1;
  const clock = document.getElementById("clock");
  if (clock) clock.textContent = formatTime(state.session.elapsed);
  if (++ticks % 5 === 0) persist(saveSession(state.session));
}, 1000);

// --- Staying in sync -----------------------------------------------------------------------
// State is loaded once at startup, so reload it whenever it may have changed elsewhere:
// another browser tab saved (the "storage" event; web only), or the app comes back into view
// (switching tabs, or the phone app resuming, possibly on a new day). Without this a stale tab
// would show old numbers and overwrite newer saves when it finishes a game.

async function reloadState() {
  try {
    Object.assign(state, await loadAll());
  } catch (err) {
    console.error("Failed to reload saved data", err);
    return;
  }
  hint = null;
  applySettingsTheme();
  render();
}

window.addEventListener("storage", event => {
  // key is null when storage was cleared; Capacitor Preferences prefixes its keys on the web.
  if (event.key === null || event.key.startsWith("CapacitorStorage.")) reloadState();
});

document.addEventListener("visibilitychange", () => {
  if (document.hidden) persist(saveSession(state.session));
  else reloadState();
});

// --- Start ---------------------------------------------------------------------------------

const applySettingsTheme = () => applyTheme(state.settings.theme, state.settings.appearance);

// With the "system" appearance, follow the device as it switches between light and dark.
onSystemModeChange(() => {
  if (state.settings.appearance !== "system") return;
  applySettingsTheme();
  render();
});

history.replaceState({ depth: 0 }, "", location.hash || "#/home");
applySettingsTheme();
render();
try {
  Object.assign(state, await loadAll());
} catch (err) {
  console.error("Failed to load saved data", err);
}
applySettingsTheme();
render();

// Offline support and update prompts on the web. The native apps bundle their files already.
if (import.meta.env.PROD && "serviceWorker" in navigator && !Capacitor.isNativePlatform()) {
  setupServiceWorker({ beforeReload: () => saveSession(state.session) });
}
