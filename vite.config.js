import { defineConfig } from "vite";
import app from "./app.config.js";

// Where the site is served from. "/" locally and in the native apps; GitHub Pages serves the
// project at /<repo>/, so its workflow builds with BASE_PATH=/knight-tour/. Must start and end with "/".
const base = process.env.BASE_PATH ?? "/";

function manifest() {
  return {
    name: app.name,
    short_name: app.shortName,
    description: app.description,
    start_url: base,
    scope: base,
    display: "standalone",
    background_color: app.backgroundColor,
    theme_color: app.themeColor,
    icons: [
      { src: `${base}icons/icon-192.png`, sizes: "192x192", type: "image/png", purpose: "any" },
      { src: `${base}icons/icon-512.png`, sizes: "512x512", type: "image/png", purpose: "any" },
      { src: `${base}icons/icon-maskable-512.png`, sizes: "512x512", type: "image/png", purpose: "maskable" },
      { src: `${base}icons/icon.svg`, sizes: "any", type: "image/svg+xml", purpose: "any" },
    ],
  };
}

// Fills %APP_NAME% and friends in index.html, and serves / emits manifest.json from app.config.js.
function appConfig() {
  const vars = {
    "%APP_NAME%": app.name,
    "%APP_DESCRIPTION%": app.description,
    "%APP_THEME_COLOR%": app.themeColor,
  };
  return {
    name: "app-config",
    transformIndexHtml: html => Object.entries(vars).reduce((out, [key, value]) => out.replaceAll(key, value), html),
    configureServer(server) {
      server.middlewares.use(`${base}manifest.json`, (_, res) => {
        res.setHeader("Content-Type", "application/manifest+json");
        res.end(JSON.stringify(manifest(), null, 2));
      });
    },
    generateBundle() {
      this.emitFile({ type: "asset", fileName: "manifest.json", source: JSON.stringify(manifest(), null, 2) });
    },
  };
}

export default defineConfig({
  base,
  root: "src",
  publicDir: "../public",
  plugins: [appConfig()],
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    target: "es2022",
  },
  test: {
    root: ".",
    include: ["tests/**/*.test.js"],
  },
});
