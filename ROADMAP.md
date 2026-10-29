# Roadmap

One web codebase (`src/`, built by Vite) ships three ways: as a PWA on a static host, and wrapped
by Capacitor as Android and iOS apps. Branding lives in `app.config.js`; feature switches in
`src/features.js`.

Legend: `[x]` done · `[ ]` to do · `[~]` built but switched off or partial

## Releases

| Version | Branch | Highlights | Notes |
|---|---|---|---|
| v0.5.0 | `release/v0.5.0` | Result and share for any finished game, not just full tours | [v0.5.0](release-notes/v0.5.0.md) |
| v0.4.1 | `release/v0.4.1` | Home section heading reads "Knight's Tour" | [v0.4.1](release-notes/v0.4.1.md) |
| v0.4.0 | `release/v0.4.0` | PWA: offline play, update prompt, install screenshots | [v0.4.0](release-notes/v0.4.0.md) |
| v0.3.0 | `release/v0.3.0` | CI/CD: tests on every push, release checks, GitHub Releases, GitHub Pages deploy | [v0.3.0](release-notes/v0.3.0.md) |
| v0.2.0 | `release/v0.2.0` | Board theme and appearance moved into a ☰ menu | [v0.2.0](release-notes/v0.2.0.md) |
| v0.1.0 | `release/v0.1.0` | Client-only rebuild with the new design | [v0.1.0](release-notes/v0.1.0.md) |

## Housekeeping

- [x] Commit the work so far (branch `release/v0.1.0`, tagged `v0.1.0`)
- [x] Update `README.md` for the new structure; add release notes in `release-notes/`
- [x] Merge `release/v0.1.0` into `main` and push the branch and tag (v0.1.0)
- [x] Name branches after their release: `release/vX.Y.Z`
- [x] Merge `release/v0.2.0` into `main` and push the branch and tag (v0.2.0)
- [x] Rename the first release branch from `feat/client-app` to `release/v0.1.0`
- [ ] Rename `name` in `package.json` if the app name changes (it's an id, not shown to players)

### CI/CD (GitHub Actions)

CI
- [x] Run tests and the build on every push and pull request (`.github/workflows/ci.yml`)
- [x] Use the Node version from `package.json` (`engines`) and cache npm installs
- [x] `main` ruleset: required `tests` check, linear history, no deletions or force pushes

Release checks (on `release/v*` branches and `v*` tags)
- [x] `package.json` version matches the branch or tag (`scripts/check-release.mjs`)
- [x] `release-notes/vX.Y.Z.md` exists for that version and isn't empty

CD
- [x] On a `v*` tag, create a GitHub Release using `release-notes/vX.Y.Z.md` as its description (`.github/workflows/release.yml`)
- [x] On a `v*` tag, deploy the web build to GitHub Pages (built with `BASE_PATH=/knight-tour/`)
- [ ] Android build in CI (signed AAB as a release asset), once Phase 3 is in place
- [ ] iOS build in CI (TestFlight upload, needs a macOS runner), once Phase 5 is in place

## Phase 1: Client-only game

- [x] Port the move logic from Python to JavaScript (`src/game.js`)
- [x] Remove the FastAPI backend, Jinja template and Dockerfile
- [x] Vite build and dev server; Vitest tests (`npm test`)
- [x] Fix the shared-board bug (every visitor shared one server-side game)
- [x] Save data through `@capacitor/preferences` (native storage in the apps, localStorage on the web)

## Phase 2: Mobile UI and features

- [x] Redesign from the design canvas: Home, Play, Result and Share screens
- [x] Board sizes 5×5 to 8×8
- [x] Timed mode with a best time per size
- [x] Undo and restart
- [~] Hints, 3 per game (built and tested; switched off in `src/features.js`)
- [x] Day streak with a Monday–Sunday week view
- [x] Lifetime stats per size on Home: best score, best time, games played, tours completed
- [x] Result screen and share card (copy text, share or download an image)
- [x] Result and share for any finished game, including stuck ones (v0.5.0)
- [x] Five board themes, each with a light and dark palette
- [x] Appearance setting: System, Light, Dark (contrast checked by tests)
- [x] Saved game resumes after closing; old save formats upgrade automatically
- [x] Open tabs stay in sync; data reloads when the app comes back into view
- [x] App name and brand colors in one place (`app.config.js`)
- [x] App icon: Closed tour, recolored to the Tournament palette; tile-less mark in the Home header
- [~] Daily puzzle (placeholder card on Home; no puzzle logic yet)
- [x] Menu (☰) on Home holding board theme and appearance (v0.2.0) 
- [ ] Test on real phones: Android Chrome, iPhone Safari

## Phase 3: Android app

Setup
- [ ] Install Capacitor (`@capacitor/core`, `cli`, `android`); `npx cap add android`
- [ ] `capacitor.config.ts` reading the name from `app.config.js`; choose the app id (e.g. `com.<you>.knightstour`; permanent once published)
- [ ] Turn off the service worker inside the native app (Capacitor already bundles the files)

Native behavior
- [ ] Android back button follows in-app navigation (`@capacitor/app` → `history.back()`)
- [ ] Share image through the native share sheet (`@capacitor/share` + `@capacitor/filesystem`)
- [ ] Status bar and splash screen colors follow the theme (`@capacitor/status-bar`, `@capacitor/splash-screen`)
- [ ] No flash of the wrong light/dark mode while saved settings load
- [ ] Haptics on moves and on finishing (`@capacitor/haptics`), optional
- [ ] Generate adaptive icons and splash images (`@capacitor/assets`)

Release
- [ ] Create a signing keystore and back it up (losing it means no more updates)
- [ ] Build a signed AAB in Android Studio
- [ ] Play Console account ($25 one-time)
- [ ] Privacy policy URL, data safety form, content rating, store screenshots and description
- [ ] Closed test with 12+ testers for 14 days (required for new personal accounts)
- [ ] Production release

## Phase 4: PWA

- [x] Manifest generated from `app.config.js`: name, description, colors, standalone display
- [x] Icons: 192 and 512 PNG, maskable 512, SVG, Apple touch icon
- [x] Theme color, viewport and safe areas for notched phones
- [x] Deploy over HTTPS to GitHub Pages on each `v*` tag: https://phanindrapalisetty.github.io/knight-tour/ (v0.3.0)
- [x] Offline play: `vite-plugin-pwa` (Workbox) precaches the whole build, fonts included; replaces the placeholder `public/sw.js` (v0.4.0)
- [x] Update flow: "A new version is available" prompt; Reload saves the game, then switches to the new version (v0.4.0)
- [x] Manifest `id` and install screenshots for the richer install dialog (v0.4.0)
- [x] Verified: offline reload keeps the game, update prompt works, no installability errors in Chrome (v0.4.0)
- [ ] Try installing on a real Android phone and iPhone from the live site

## Phase 5: iOS app

- [ ] Apple Developer Program ($99/year)
- [ ] `npx cap add ios`; open in Xcode
- [ ] Check safe areas, the share sheet and haptics on a real iPhone
- [ ] iOS icon set and launch screen
- [ ] TestFlight beta
- [ ] App Store review and release

## Phase 6: Later

- [ ] Daily puzzle logic (fixed start, blocked squares, difficulty rising Monday to Sunday)
- [ ] Streak reminder notifications in the apps (`@capacitor/local-notifications`)
- [ ] Live updates for the apps (Capgo or Capawesome), only if store review delays become a problem
