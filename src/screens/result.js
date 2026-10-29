import { getScore, getStatus, getTotal, toNotation } from "../game.js";
import { displayedStreak } from "../streak.js";
import { sizeStats } from "../stats.js";
import { formatTime, plural } from "../format.js";
import { boardLabels } from "./play.js";
import { FEATURES } from "../features.js";
import * as icon from "../icons.js";
import app from "../../app.config.js";

function streakLine(streak) {
  const current = displayedStreak(streak);
  const gap = streak.best - current;
  return gap > 0 ? `${plural(gap, "day")} to beat your best.` : "That's your best streak yet.";
}

// Shown for any finished game: a full tour, or one that got stuck part-way.
export function renderResult(state) {
  const { session, streak, stats } = state;
  const { game } = session;
  const total = getTotal(game);
  const visited = getScore(game);
  const won = getStatus(game) === "won";
  const first = toNotation(...game.moves[0], game.size);
  const last = toNotation(...game.moves.at(-1), game.size);
  const best = sizeStats(stats, game.size).bestScore;
  const { ranks, files } = boardLabels(game.size);

  const cells = [];
  for (let y = 0; y < game.size; y++) {
    for (let x = 0; x < game.size; x++) {
      const order = game.board[y][x];
      const end = order === 0 || order === visited - 1;
      const shade = end ? "sq-current" : (x + y) % 2 ? "sq-dark" : "sq-light";
      cells.push(`<span class="cell ${shade}">${order === -1 ? "" : icon.cross("55%")}</span>`);
    }
  }

  const summary = won
    ? `Your knight visited every square once, from ${first} to ${last}.`
    : `Your knight visited ${visited} of ${total} squares, from ${first} to ${last}. `
      + (visited >= best ? `That's your best on ${game.size}×${game.size}.` : `Your best on ${game.size}×${game.size} is ${best}.`);

  return `
    <div class="screen result" style="--n:${game.size}">
      <header class="topbar">
        <button class="icon-btn" data-action="back" aria-label="Back">${icon.back}</button>
        <div class="topbar-title">
          <span class="title">${app.tourModeName}</span>
          <span class="muted small">${game.size}×${game.size} · open board</span>
        </div>
        <div class="topbar-spacer"></div>
      </header>

      <div class="board-area">
        <div class="ranks mono" aria-hidden="true">${ranks}</div>
        <div class="board" role="img" aria-label="${won ? "Completed board, every square crossed off" : `Final board, ${visited} of ${total} squares crossed off`}">${cells.join("")}</div>
        <div class="files mono" aria-hidden="true">${files}</div>
      </div>

      <section class="sheet" aria-label="Result">
        <div class="sheet-head">
          <span class="eyebrow">${visited} / ${total} squares</span>
          <h1>${won ? "Tour complete" : "No moves left"}</h1>
          <p class="muted">${summary}</p>
        </div>
        <dl class="tiles tiles-auto">
          <div class="tile"><dt>Time</dt><dd>${formatTime(session.elapsed)}</dd></div>
          ${FEATURES.hints ? `<div class="tile"><dt>Hints</dt><dd>${session.hintsUsed}</dd></div>` : ""}
          <div class="tile"><dt>Undos</dt><dd>${session.undos}</dd></div>
        </dl>
        <div class="streak-callout">
          <span class="flame">${icon.flame(32)}</span>
          <div>
            <b>${displayedStreak(streak)} day streak</b>
            <span class="muted small">${streakLine(streak)}</span>
          </div>
        </div>
        <div class="two-buttons">
          <button class="btn btn-outline btn-large" data-action="share">${icon.share}Share</button>
          <button class="btn btn-primary btn-large" data-action="home">Back home</button>
        </div>
      </section>
    </div>`;
}
