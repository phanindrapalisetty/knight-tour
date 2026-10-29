# ♞ Knight Zigg Game

[![CI](https://github.com/phanindrapalisetty/knight-tour/actions/workflows/ci.yml/badge.svg)](https://github.com/phanindrapalisetty/knight-tour/actions/workflows/ci.yml)

**Play it:** https://phanindrapalisetty.github.io/knight-tour/

A puzzle game built on the classic **Knight's Tour** problem from chess. It runs entirely in the browser, so one codebase ships as a PWA and, through Capacitor, as Android and iOS apps.

## Gameplay

Move a knight so that it visits every square of the board **exactly once**. Tap any square to place the knight, then follow the green dots. If you get stuck, undo a few moves or restart.

Finish a game each day to keep your 🔥 streak going.

## Features

- Board sizes from 5×5 to 8×8
- Timed mode with a best time for each size
- Day streak with a Monday–Sunday week view
- Stats for each size: best score, best time, games played, tours completed
- Share a result card as text or an image
- Five board themes, each in light and dark, plus a System / Light / Dark setting, in the ☰ menu
- Saves your game and progress on the device; no account or server

## Run locally

Requires Node.js 22.12 or later.

```bash
npm install
npm run dev       # dev server at http://localhost:5173
npm test          # run the tests
npm run build     # production build in dist/
npm run preview   # serve the production build
```

## Configuration

| File | What it controls |
|---|---|
| `app.config.js` | App name, description and brand colors. The page title, the PWA manifest, the screens and the share card all read from here. |
| `src/features.js` | Feature switches. Hints are built but currently switched off. |
| `src/theme.js` | Board themes and their light and dark palettes. |

## Project structure

```
app.config.js       name and brand colors
vite.config.js      build; generates manifest.json from app.config.js
public/             icons and service worker, copied as-is
src/
  index.html        page shell
  main.js           app state, navigation, timer, actions
  game.js           board rules (pure functions)
  session.js        the game in progress: moves, time, hints, undos
  streak.js         day streak and week view
  stats.js          per-size stats
  settings.js       theme, appearance, board size, timed mode
  storage.js        saving and loading through Capacitor Preferences
  theme.js          palettes and light/dark handling
  screens/          Home (with its ☰ menu), Play, Result and Share screens
tests/              Vitest tests
```

Saved data is versioned. When a format changes, older saves upgrade on load instead of being lost.

## Platforms

| Platform | Status |
|---|---|
| Web | Live on [GitHub Pages](https://phanindrapalisetty.github.io/knight-tour/); installable |
| PWA offline play | Not yet; see the roadmap |
| Android | Planned (Capacitor) |
| iOS | Planned (Capacitor) |

See [ROADMAP.md](ROADMAP.md) for the full checklist.

## Versioning

The project follows [Semantic Versioning](https://semver.org/). For each release:

1. Work on a branch named `release/vX.Y.Z`.
2. Set `version` in `package.json` to `X.Y.Z`.
3. Add its notes as `release-notes/vX.Y.Z.md` (see [release-notes/](release-notes/)).
4. Push the branch and wait for CI to pass.
5. Tag the release commit `vX.Y.Z` and push the tag. The Release workflow checks it, creates the GitHub Release from the notes, and deploys to GitHub Pages.
6. Fast-forward `main` to the release and push. The `main` ruleset only accepts commits that already passed the `tests` check.

## CI/CD

| Workflow | Runs on | Does |
|---|---|---|
| [`ci.yml`](.github/workflows/ci.yml) | Pushes to `main` and `release/**`, pull requests | Tests, build, release checks ([`scripts/check-release.mjs`](scripts/check-release.mjs)) |
| [`release.yml`](.github/workflows/release.yml) | `v*.*.*` tags (or manually) | Tests and release checks, GitHub Release, GitHub Pages deploy |

The Pages build sets `BASE_PATH=/knight-tour/` because Pages serves the site under the repository name. Local and native builds use `/`.
