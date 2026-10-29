import { THEMES, APPEARANCES, resolveMode } from "../theme.js";
import { version } from "../../package.json";
import app from "../../app.config.js";
import * as icon from "../icons.js";

// Swatches show each theme in the palette currently in use, so dark mode previews dark boards.
function themeRows({ theme, appearance }) {
  const mode = resolveMode(appearance);
  return Object.entries(THEMES).map(([id, t]) => `
    <button class="menu-row" data-action="setTheme" data-theme="${id}" aria-pressed="${id === theme}">
      <span class="swatch"style="--sw-light:${t[mode].light};--sw-dark:${t[mode].dark}" aria-hidden="true"><span></span><span></span><span></span><span></span></span>
      <span class="menu-row-label">${t.name}</span>
      <span class="menu-row-check" aria-hidden="true">${id === theme ? icon.check : ""}</span>
    </button>`).join("");
}

function appearancePicker(current) {
  return Object.entries(APPEARANCES).map(([id, label]) => `
    <button class="segment" data-action="setAppearance" data-appearance="${id}" aria-pressed="${id === current}">
      ${icon.appearance[id]}${label}
    </button>`).join("");
}

export function renderMenu(state) {
  return `
    <div class="menu-backdrop" data-action="closeMenu"></div>
    <aside class="drawer" id="menu" role="dialog" aria-modal="true" aria-labelledby="menu-title">
      <header class="drawer-head">
        <h2 id="menu-title">Menu</h2>
        <button class="icon-btn menu-close" data-action="closeMenu" aria-label="Close menu">${icon.close}</button>
      </header>
      <section class="drawer-section" aria-labelledby="theme-title">
        <h3 id="theme-title" class="eyebrow">Board theme</h3>
        <div class="menu-list">${themeRows(state.settings)}</div>
      </section>
      <section class="drawer-section" aria-labelledby="appearance-title">
        <h3 id="appearance-title" class="eyebrow">Appearance</h3>
        <div class="segmented">${appearancePicker(state.settings.appearance)}</div>
      </section>
      <p class="drawer-foot muted small">${app.name} v${version}</p>
    </aside>`;
}
