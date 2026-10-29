// Inline SVG icons from the design. All are decorative (aria-hidden); buttons carry their own labels.
const stroke = (d, size = 20, width = 2) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;

const KNIGHT_PATH = "M6.5 21h11v-2.2l-1.1-1.1c.4-3.6-.6-6.7-2.9-8.9l.9-2.4-1.9-.6-.7-2.3-1.4 2.2C8 6.4 5.8 9 5.3 12.1l-.2 1.8 1.7 1.3 2.2-1.6 2.3.3c-1 1.2-2.4 2.3-3.4 3.8l-1.4 1.1z";

export const knight = (size, eyeColor) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="${KNIGHT_PATH}"/><circle cx="10.4" cy="8.6" r=".9" fill="${eyeColor}"/></svg>`;

// The app icon's closed tour without its tile, for use on the page. Drawn in theme colors so it
// follows the board theme and light/dark mode. Same 36 moves as public/icons/icon.svg, bold weight.
const TOUR_PATH = "M352 160L224 96L96 160L160 288L96 416L224 352L352 416L416 288L288 352L416 416L352 288L416 160L288 96L160 160L96 288L160 416L224 288L96 352L224 416L352 352L288 224L352 96L416 224L288 160L416 96L352 224L416 352L288 416L160 352L224 224L160 96L96 224L224 160L96 96L160 224L288 288Z";

export const logoMark = size =>
  `<svg class="logo" width="${size}" height="${size}" viewBox="66 66 380 380" aria-hidden="true"><path d="${TOUR_PATH}" fill="none" stroke="var(--accent)" stroke-width="16" stroke-linejoin="round"/><circle cx="352" cy="160" r="32" fill="var(--move)"/><circle cx="352" cy="160" r="12" fill="var(--ground)"/></svg>`;

export const flame = size =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12.6 2.5c.4 2.6-.6 4.3-2 5.9C9 10.2 7 12 7 15a5 5 0 0 0 10 0c0-1.9-.8-3.3-1.6-4.3-.2 1.2-.8 2.1-1.7 2.6.3-3.5-.6-7.5-1.1-10.8z"/></svg>`;

export const check = stroke('<path d="M5 12.5l4.5 4.5L19 7.5"/>', 16, 3);
export const cross = (size = 20) =>
  `<svg class="x-mark" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="var(--visited)" stroke-width="3" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>`;
export const arrowRight = (size = 18) => stroke('<path d="M5 12h14M13 6l6 6-6 6"/>', size, 2.4);
export const back = stroke('<path d="M15 5l-7 7 7 7"/>', 20, 2.2);
export const close = stroke('<path d="M6 6l12 12M18 6L6 18"/>', 18, 2.2);
export const undo = stroke('<path d="M9 14L4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>');
export const hint = stroke('<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/>');
export const restart = stroke('<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>');
export const share = stroke('<path d="M12 15V3M7 8l5-5 5 5"/><path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"/>', 18, 2.2);
export const appearance = {
  system: stroke('<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>', 18),
  light: stroke('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>', 18),
  dark: stroke('<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>', 18),
};
export const copy =stroke('<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>', 18);
