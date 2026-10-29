import { SIZES, getStatus } from "../game.js";
import { renderMenu } from "./menu.js";
import { displayedStreak, playedToday, weekView } from "../streak.js";
import { sizeStats } from "../stats.js";
import { formatTime, plural } from "../format.js";
import * as icon from "../icons.js";
import app from "../../app.config.js";

const SIZE_NAMES = { 5: "Warm-up", 6: "Quick", 7: "Tricky", 8: "Classic" };
export const sizeName = size => `${SIZE_NAMES[size]} ${size}×${size}`;

function streakCard(streak) {
  const days = weekView(streak).map(d => `
    <li class="day day-${d.state}">
      <span class="day-label">${d.label}</span>
      <span class="day-dot">${d.state === "done" ? icon.check : ""}</span>
    </li>`).join("");
  const caption = playedToday(streak)
    ? "Done for today. Come back tomorrow to keep it going."
    : "Finish a game today to keep your streak.";
  return `
    <section class="card streak-card" aria-label="Streak">
      <div class="streak-top">
        <div class="streak-now">
          <span class="flame">${icon.flame(42)}</span>
          <span class="streak-number">${displayedStreak(streak)}</span>
          <span class="streak-unit">day streak</span>
        </div>
        <div class="streak-best">
          <span class="eyebrow">Best</span>
          <span class="mono">${plural(streak.best, "day")}</span>
        </div>
      </div>
      <ol class="week" aria-label="This week">${days}</ol>
      <p class="muted small">${caption}</p>
    </section>`;
}

// Placeholder until the daily puzzle logic exists.
function dailyCard() {
  const mini = Array.from({ length: 49 }, (_, i) =>
    `<span class="${(Math.floor(i / 7) + i % 7) % 2 ? "sq-dark" : "sq-light"}"></span>`).join("");
  return `
    <section class="card daily-card" aria-label="Daily puzzle">
      <div class="daily-body">
        <div class="mini-board" aria-hidden="true">${mini}</div>
        <div class="daily-text">
          <span class="eyebrow">Daily puzzle</span>
          <span class="daily-title">Coming soon</span>
          <span class="muted">A new puzzle every day, getting harder from Monday to Sunday.</span>
        </div>
      </div>
      <button class="btn btn-primary btn-large" disabled>Coming soon</button>
    </section>`;
}

function tourSection(state) {
  const { settings, stats, session } = state;
  const resumable = session.game.size === settings.size && getStatus(session.game) === "playing";
  const sizes = SIZES.map(n => `
    <button class="size-btn" data-action="setSize" data-size="${n}" aria-pressed="${n === settings.size}">
      <span class="mono">${n}×${n}</span>
      <span class="muted small">${SIZE_NAMES[n]}</span>
    </button>`).join("");
  const s = sizeStats(stats, settings.size);
  const total = settings.size ** 2;
  return `
    <section class="tour-section" aria-label="${app.tourModeName}">
      <div class="section-head">
        <div>
          <h2>${app.tourModeName}</h2>
          <span class="muted small">The classic: visit every square, any time</span>
        </div>
        <button class="btn btn-ink" data-action="play">${resumable ? "Resume" : "Play"} ${icon.arrowRight(16)}</button>
      </div>
      <div class="sizes">${sizes}</div>
      <dl class="tiles" aria-label="${settings.size}×${settings.size} stats">
        <div class="tile"><dt>Best</dt><dd>${s.bestScore}/${total}</dd></div>
        <div class="tile"><dt>Best time</dt><dd>${formatTime(s.bestTime)}</dd></div>
        <div class="tile"><dt>Played</dt><dd>${s.gamesPlayed}</dd></div>
        <div class="tile"><dt>Tours</dt><dd>${s.toursCompleted}</dd></div>
      </dl>
      <button class="toggle-row" data-action="toggleTimed" aria-pressed="${settings.timed}">
        <span><b>Timed mode</b> <span class="muted">beat your best time</span></span>
        <span class="switch" aria-hidden="true"><span></span></span>
      </button>
    </section>`;
}

// With the menu open, the home content is inert so focus and screen readers stay in the menu.
export function renderHome(state, { menuOpen = false } = {}) {
  return `
    <div class="screen home" ${menuOpen ? "inert" : ""}>
      <header class="app-header">
        ${icon.logoMark(34)}
        <span class="wordmark">${app.name}</span>
        <button class="icon-btn menu-btn" data-action="openMenu" aria-label="Menu" aria-haspopup="dialog" aria-controls="menu" aria-expanded="${menuOpen}">${icon.menu}</button>
      </header>
      ${streakCard(state.streak)}
      ${dailyCard()}
      ${tourSection(state)}
    </div>
    ${menuOpen ? renderMenu(state) : ""}`;
}
