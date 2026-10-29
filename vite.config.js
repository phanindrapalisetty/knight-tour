import { defineConfig } from "vite";
import app from "./app.config.js";

function manifest() {
  return {
    name: app.name,
    short_name: app.shortName,
    description: app.description,
    start_url: "/",
    display: "standalone",
    background_color: app.backgroundColor,
    theme_color: app.themeColor,
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
      { src: "/icons/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
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
      server.middlewares.use("/manifest.json", (_, res) => {
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
