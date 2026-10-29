import { getLegalMoves, getScore, getTotal, getStatus, toNotation } from "../game.js";
import { MAX_HINTS } from "../session.js";
import { FEATURES } from "../features.js";
import { formatTime, plural } from "../format.js";
import * as icon from "../icons.js";
import app from "../../app.config.js";

const same = (a, b) => a && b && a[0] === b[0] && a[1] === b[1];

export function boardLabels(size) {
  const ranks = Array.from({ length: size }, (_, i) => `<span>${size - i}</span>`).join("");
  const files = Array.from({ length: size }, (_, i) => `<span>${"abcdefgh"[i]}</span>`).join("");
  return { ranks, files };
}

function cells(game, hint) {
  const legal = getLegalMoves(game);
  const out = [];
  for (let y = 0; y < game.size; y++) {
    for (let x = 0; x < game.size; x++) {
      const sq = toNotation(x, y, game.size);
      const shade = (x + y) % 2 ? "sq-dark" : "sq-light";
      if (same(game.knight, [x, y])) {
        out.push(`<button class="cell sq-current" aria-label="${sq}, knight here" data-action="tap" data-x="${x}" data-y="${y}">${icon.knight("70%", "var(--accent)")}</button>`);
      } else if (legal.some(m => same(m, [x, y]))) {
        const hinted = same(hint, [x, y]);
        out.push(`<button class="cell ${shade}" aria-label="${sq}, ${hinted ? "suggested move" : "move here"}" data-action="tap" data-x="${x}" data-y="${y}"><span class="${hinted ? "dot dot-hint" : "dot"}"></span></button>`);
      } else if (game.board[y][x] !== -1) {
        out.push(`<button class="cell ${shade}" aria-label="${sq}, visited" disabled>${icon.cross("55%")}</button>`);
      } else {
        const idle = !game.knight;
        out.push(`<button class="cell ${shade}" aria-label="${sq}${idle ? ", start here" : ""}" ${idle ? `data-action="tap" data-x="${x}" data-y="${y}"` : "disabled"}></button>`);
      }
    }
  }
  return out.join("");
}

export function renderPlay(state, hint) {
  const { session, settings } = state;
  const { game } = session;
  const status = getStatus(game);
  const count = getScore(game);
  const total = getTotal(game);
  const legal = getLegalMoves(game).length;
  const hintsLeft = MAX_HINTS - session.hintsUsed;
  const { ranks, files } = boardLabels(game.size);
  const movesText = { idle: "Tap any square to start", won: "Solved", stuck: "No moves left" }[status]
    ?? `${plural(legal, "move")} available`;
  const cur = game.knight ? toNotation(...game.knight, game.size) : "";

  return `
    <div class="screen play" style="--n:${game.size}">
      <header class="topbar">
        <button class="icon-btn" data-action="back" aria-label="Back to home">${icon.back}</button>
        <div class="topbar-title">
          <span class="title">${app.tourModeName}</span>
          <span class="chip">${game.size}×${game.size} · open board</span>
        </div>
        ${settings.timed
          ? `<div class="clock mono" id="clock" role="timer" aria-label="Time elapsed">${formatTime(session.elapsed)}</div>`
          : `<div class="topbar-spacer"></div>`}
      </header>

      <div class="progress">
        <div class="progress-row">
          <span class="muted"><span class="count">${count}</span> / ${total} squares</span>
          <span class="muted small strong">${movesText}</span>
        </div>
        <div class="bar"><div style="width:${Math.round(count / total * 100)}%"></div></div>
      </div>

      <div class="board-area">
        <div class="ranks mono" aria-hidden="true">${ranks}</div>
        <div class="board" role="grid" aria-label="Chess board">${cells(game, hint)}</div>
        <div class="files mono" aria-hidden="true">${files}</div>
      </div>

      <div class="legend small muted" aria-label="Legend">
        <span><span class="legend-dot"></span>Possible move</span>
        <span>${icon.cross(12)}Visited</span>
      </div>

      ${status === "stuck" ? `
        <div class="banner banner-stuck" role="status">
          <b>No moves left from ${cur}</b>
          <span class="muted small">You covered ${count} of ${total} squares. Undo a few moves or restart.</span>
        </div>` : ""}
      ${status === "won" ? `
        <button class="banner banner-won" data-action="showResult" role="status">
          <b>Solved. All ${total} squares.</b>
          <span class="small">See your result</span>
        </button>` : ""}

      <div class="actions">
        <button class="action-btn" data-action="undo" ${status === "idle" ? "disabled" : ""}>${icon.undo}Undo</button>
        ${FEATURES.hints ? `
        <button class="action-btn" data-action="hint" ${status !== "playing" || hintsLeft === 0 ? "disabled" : ""}>
          ${icon.hint}Hint
          <span class="badge mono ${hintsLeft ? "" : "badge-empty"}" aria-label="${hintsLeft} of ${MAX_HINTS} hints left">${hintsLeft}/${MAX_HINTS}</span>
        </button>` : ""}
        <button class="action-btn" data-action="restart" ${status === "idle" ? "disabled" : ""}>${icon.restart}Restart</button>
      </div>
      ${FEATURES.hints && hintsLeft === 0 && status === "playing" ? `<p class="muted small" role="status">You've used all ${MAX_HINTS} hints for this game.</p>` : ""}
    </div>`;
}
