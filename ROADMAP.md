# Roadmap

One web codebase (`src/`, built by Vite) ships three ways: as a PWA on a static host, and wrapped
by Capacitor as Android and iOS apps. Branding lives in `app.config.js`; feature switches in
`src/features.js`.

Legend: `[x]` done · `[ ]` to do · `[~]` built but switched off or partial

## Housekeeping

- [x] Commit the work so far (branch `feat/client-app`, tagged `v0.1.0`)
- [x] Update `README.md` for the new structure; add release notes in `release-notes/`
- [ ] Merge `feat/client-app` into `main` and push the branch and tag
- [ ] Rename `name` in `package.json` if the app name changes (it's an id, not shown to players)

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
- [x] Five board themes, each with a light and dark palette
- [x] Appearance setting: System, Light, Dark (contrast checked by tests)
- [x] Saved game resumes after closing; old save formats upgrade automatically
- [x] Open tabs stay in sync; data reloads when the app comes back into view
- [x] App name and brand colors in one place (`app.config.js`)
- [x] App icon: Closed tour, recolored to the Tournament palette; tile-less mark in the Home header
- [~] Daily puzzle (placeholder card on Home; no puzzle logic yet)
- [ ] Settings screen (the design shows a button but doesn't define it)
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

Done
- [x] Manifest generated from `app.config.js`: name, description, colors, standalone display
- [x] Icons: 192 and 512 PNG, maskable 512, SVG, Apple touch icon
- [x] Theme color, viewport and safe areas for notched phones
- [x] Service worker registered in production builds (installable in Chrome and Edge)

To do
- [ ] Offline play: replace the placeholder `public/sw.js` with `vite-plugin-pwa` (Workbox) precaching the build and fonts
- [ ] Update flow: "New version available" prompt that reloads into the new version
- [ ] Manifest `id` and install screenshots (richer install dialog on Android)
- [ ] Verify offline in DevTools and pass the installability checks
- [ ] Deploy over HTTPS to a static host (GitHub Pages, Netlify or Cloudflare Pages)

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
- [ ] CI on GitHub Actions: tests, web deploy and Android build on each tag
- [ ] Live updates for the apps (Capgo or Capawesome), only if store review delays become a problem
