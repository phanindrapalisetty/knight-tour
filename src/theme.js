// Board themes from the design, each with a light and a dark palette. The theme picks the
// color family; the appearance setting (system / light / dark) picks which palette is used.
export const THEMES = {
  tournament: {
    name: "Tournament",
    light: { ground: "#F2F4EE", surface: "#FFFFFF", ink: "#18211A", muted: "#56615A", line: "#DCE2D6", light: "#E9EEDF", dark: "#7C9A74", accent: "#2F5D3A", accentInk: "#FFFFFF", flame: "#E0731A", flameInk: "#FFFFFF" },
    dark: { ground: "#0F1511", surface: "#18211B", ink: "#E7EEE6", muted: "#9DAA9F", line: "#2A362D", light: "#A9BBA2", dark: "#5E7A57", accent: "#7FC08E", accentInk: "#0F1511", flame: "#F0913D", flameInk: "#0F1511" },
  },
  walnut: {
    name: "Walnut",
    light: { ground: "#F5EFE6", surface: "#FFFDF9", ink: "#2A1D14", muted: "#6B5A4C", line: "#E6DACB", light: "#F0D9B5", dark: "#B58863", accent: "#6B3F22", accentInk: "#FFFFFF", flame: "#D9631E", flameInk: "#FFFFFF" },
    dark: { ground: "#17110C", surface: "#221912", ink: "#F2E8DC", muted: "#B3A08E", line: "#3A2C20", light: "#D9BE98", dark: "#8F6745", accent: "#E0A878", accentInk: "#17110C", flame: "#F0913D", flameInk: "#17110C" },
  },
  midnight: {
    name: "Midnight",
    light: { ground: "#EEF2F8", surface: "#FFFFFF", ink: "#141B2A", muted: "#55617A", line: "#D5DDEA", light: "#C9D5E8", dark: "#5B73A0", accent: "#2D4F94", accentInk: "#FFFFFF", flame: "#D9631E", flameInk: "#FFFFFF" },
    dark: { ground: "#0E131C", surface: "#172031", ink: "#E8ECF4", muted: "#9AA6BA", line: "#26324A", light: "#8EA2C2", dark: "#3C5078", accent: "#7FA7FF", accentInk: "#0E131C", flame: "#FF9A3D", flameInk: "#0E131C" },
  },
  marble: {
    name: "Marble",
    light: { ground: "#F4F4F2", surface: "#FFFFFF", ink: "#1C1C1E", muted: "#5F5F64", line: "#E1E1DE", light: "#EAEAE6", dark: "#A9A9AE", accent: "#1C1C1E", accentInk: "#FFFFFF", flame: "#E0731A", flameInk: "#FFFFFF" },
    dark: { ground: "#121214", surface: "#1C1C1F", ink: "#EDEDEF", muted: "#A1A1A8", line: "#303035", light: "#C9C9CE", dark: "#6E6E76", accent: "#EDEDEF", accentInk: "#121214", flame: "#F0913D", flameInk: "#121214" },
  },
  rose: {
    name: "Rose",
    light: { ground: "#FBF1F2", surface: "#FFFFFF", ink: "#2B1418", muted: "#755860", line: "#F0DADE", light: "#F6E0E3", dark: "#C9848F", accent: "#8E2E44", accentInk: "#FFFFFF", flame: "#E0731A", flameInk: "#FFFFFF" },
    dark: { ground: "#180F11", surface: "#24161A", ink: "#F6E6E9", muted: "#BFA0A7", line: "#3D262C", light: "#E8C2C9", dark: "#A2606C", accent: "#F08FA5", accentInk: "#180F11", flame: "#F0913D", flameInk: "#180F11" },
  },
};

export const DEFAULT_THEME = "tournament";
export const APPEARANCES = { system: "System", light: "Light", dark: "Dark" };
export const DEFAULT_APPEARANCE = "system";

const darkQuery = typeof matchMedia === "function" ? matchMedia("(prefers-color-scheme: dark)") : null;

// "light" or "dark", following the device when the appearance is "system".
export function resolveMode(appearance, systemDark = darkQuery?.matches ?? false) {
  if (appearance === "light" || appearance === "dark") return appearance;
  return systemDark ? "dark" : "light";
}

export function getPalette(id, mode) {
  return (THEMES[id] ?? THEMES[DEFAULT_THEME])[mode];
}

// Calls `callback` when the device switches between light and dark.
export function onSystemModeChange(callback) {
  darkQuery?.addEventListener("change", callback);
}

const toVar = key => "--" + key.replace(/[A-Z]/g, c => "-" + c.toLowerCase());

export function applyTheme(id, appearance) {
  const mode = resolveMode(appearance);
  const palette = getPalette(id, mode);
  const root = document.documentElement;
  for (const [key, value] of Object.entries(palette)) root.style.setProperty(toVar(key), value);
  root.style.colorScheme = mode;
  root.dataset.mode = mode;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", palette.ground);
}
