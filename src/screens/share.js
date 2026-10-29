import { getTotal } from "../game.js";
import { displayedStreak } from "../streak.js";
import { formatTime, plural } from "../format.js";
import { sizeName } from "./home.js";
import { FEATURES } from "../features.js";
import * as icon from "../icons.js";
import app from "../../app.config.js";

// "Knight Zigg" → "knights-tour", for file names.
export const appSlug = app.name.toLowerCase().replace(/['’]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

// The card is always dark, whatever the app theme, like the design.
const CARD = { bg: "#18211A", ink: "#F2F4EE", muted: "#B9C4BA", rule: "#34433A", chip: "#2F5D3A", flame: "#FF9A3D" };
const HEAT = ["#CFEBD5", "#9ED8AC", "#5FBF7C", "#1FA352"];   // first moves → last moves

export function shareData(state, date = new Date()) {
  const { game, elapsed, hintsUsed } = state.session;
  const total = getTotal(game);
  const heat = game.board.flat().map(order => HEAT[Math.min(3, Math.floor(order / total * 4))]);
  const streak = displayedStreak(state.streak);
  const time = formatTime(elapsed);
  const day = date.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
  return {
    size: game.size,
    heat,
    time,
    hints: hintsUsed,
    streak,
    chip: sizeName(game.size),
    date: day.replace(",", ""),
    text: `${app.name} · ${sizeName(game.size)}\nCompleted in ${time}${FEATURES.hints ? ` with ${plural(hintsUsed, "hint")}` : ""}. ${streak} day streak.`,
  };
}

export function renderShare(state) {
  const d = shareData(state);
  const cells = d.heat.map(bg => `<span style="background:${bg}"></span>`).join("");
  return `
    <div class="screen share">
      <header class="topbar">
        <button class="icon-btn" data-action="back" aria-label="Close">${icon.close}</button>
        <span class="title">Share your result</span>
        <div class="topbar-spacer"></div>
      </header>

      <figure class="share-card" aria-label="Result card">
        <div class="share-card-head">
          <div>
            <span class="share-card-title">${app.name}</span>
            <span class="mono share-card-date">${d.date}</span>
          </div>
          <span class="share-chip">${d.chip}</span>
        </div>
        <div class="heatmap" style="--n:${d.size}" aria-hidden="true">${cells}</div>
        <div class="heat-legend"><span>First move</span><span class="heat-ramp"></span><span>Last move</span></div>
        <div class="share-stats">
          <div><span class="mono">${d.time}</span><span>time</span></div>
          ${FEATURES.hints ? `<div><span class="mono">${d.hints}</span><span>${d.hints === 1 ? "hint" : "hints"}</span></div>` : ""}
          <div><span class="mono flame-text">${d.streak}</span><span>day streak</span></div>
        </div>
      </figure>

      <div class="share-message">
        <span class="eyebrow">Message that goes with it</span>
        <div class="message-box mono">${d.text}</div>
      </div>

      <div class="two-buttons push-down">
        <button class="btn btn-outline btn-large" data-action="copyText">${icon.copy}<span>Copy text</span></button>
        <button class="btn btn-primary btn-large" data-action="shareImage">${icon.share}Share image</button>
      </div>
    </div>`;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();
}

// Draws the result card at 2x for sharing as a PNG.
export async function drawShareCard(d) {
  await Promise.all([
    document.fonts.load('800 22px "Bricolage Grotesque Variable"'),
    document.fonts.load('700 18px "JetBrains Mono Variable"'),
    document.fonts.load('500 12px "Figtree Variable"'),
  ]);
  const W = 360, pad = 24, gap = 4;
  const cell = (W - 2 * pad - gap * (d.size - 1)) / d.size;
  const gridTop = 92;
  const gridH = cell * d.size + gap * (d.size - 1);
  const H = gridTop + gridH + 130;

  const canvas = document.createElement("canvas");
  canvas.width = W * 2;
  canvas.height = H * 2;
  const ctx = canvas.getContext("2d");
  ctx.scale(2, 2);

  ctx.fillStyle = CARD.bg;
  roundRect(ctx, 0, 0, W, H, 28);

  ctx.fillStyle = CARD.ink;
  ctx.font = '800 22px "Bricolage Grotesque Variable", sans-serif';
  ctx.fillText(app.name, pad, pad + 22);
  ctx.fillStyle = CARD.muted;
  ctx.font = '500 13px "JetBrains Mono Variable", monospace';
  ctx.fillText(d.date, pad, pad + 44);

  ctx.font = '700 12px "Figtree Variable", sans-serif';
  const chipW = ctx.measureText(d.chip).width + 20;
  ctx.fillStyle = CARD.chip;
  roundRect(ctx, W - pad - chipW, pad + 4, chipW, 24, 12);
  ctx.fillStyle = CARD.ink;
  ctx.fillText(d.chip, W - pad - chipW + 10, pad + 20);

  d.heat.forEach((bg, i) => {
    ctx.fillStyle = bg;
    roundRect(ctx, pad + (i % d.size) * (cell + gap), gridTop + Math.floor(i / d.size) * (cell + gap), cell, cell, 6);
  });

  let y = gridTop + gridH + 26;
  ctx.font = '500 12px "Figtree Variable", sans-serif';
  ctx.fillStyle = CARD.muted;
  ctx.fillText("First move", pad, y);
  const lastW = ctx.measureText("Last move").width;
  ctx.fillText("Last move", W - pad - lastW, y);
  const rampX = pad + ctx.measureText("First move").width + 10;
  const ramp = ctx.createLinearGradient(rampX, 0, W - pad - lastW - 10, 0);
  ramp.addColorStop(0, HEAT[0]);
  ramp.addColorStop(1, HEAT[3]);
  ctx.fillStyle = ramp;
  roundRect(ctx, rampX, y - 7, W - pad - lastW - 10 - rampX, 6, 3);

  y += 18;
  ctx.fillStyle = CARD.rule;
  ctx.fillRect(pad, y, W - 2 * pad, 1);

  const stats = [
    [d.time, "time", CARD.ink],
    FEATURES.hints && [String(d.hints), d.hints === 1 ? "hint" : "hints", CARD.ink],
    [String(d.streak), "day streak", CARD.flame],
  ].filter(Boolean);
  const colW = (W - 2 * pad) / stats.length;
  stats.forEach(([value, label, color], i) => {
      ctx.fillStyle = color;
      ctx.font = '700 18px "JetBrains Mono Variable", monospace';
      ctx.fillText(value, pad + i * colW, y + 36);
      ctx.fillStyle = CARD.muted;
      ctx.font = '500 12px "Figtree Variable", sans-serif';
      ctx.fillText(label, pad + i * colW, y + 56);
    });

  return new Promise(resolve => canvas.toBlob(resolve, "image/png"));
}
