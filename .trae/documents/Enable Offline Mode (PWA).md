I will implement an offline mode by creating a Progressive Web App (PWA) foundation. This ensures the app works fully without an internet connection by caching all necessary assets and data.

### 1. Create Web App Manifest (`manifest.json`)
- Create `manifest.json` in the root directory.
- Define app metadata: name "Xenos Army Builder", short name "Xenos Builder".
- Configure display mode as "standalone" (looks like a native app).
- Set icons using the existing `Images/WebIcon.png`.
- Define start URL as `./index.html`.

### 2. Create Service Worker (`sw.js`)
- Create `sw.js` in the root directory.
- **Pre-caching**: Automatically cache core files on first load:
  - App Shell: `index.html`, `styles.css`, `manifest.json`.
  - Images: All icons and unit images in `Images/`.
  - Data: `data/faction_rules.json`, `PDF/MainRules.json`.
  - Army Data: `data/armies/tyranids/master.json`, `data/armies/eldar/master.json`, `data/armies/orks/master.json`.
  - External Libs: Firebase SDK scripts (so they don't block loading).
- **Runtime Caching Strategy**:
  - **Stale-While-Revalidate**: For static assets (images, CSS, scripts). This serves the cached version immediately while checking for updates in the background.
  - **Network First**: For Data files (`master.json`). Tries to fetch the latest data from the server; if offline, falls back to the cached version.
  - **Cache External Resources**: specific handlers for Google Fonts and Firebase scripts to ensure they are available offline.

### 3. Update `index.html`
- Add the Manifest link: `<link rel="manifest" href="manifest.json">`.
- Add Service Worker registration script at the end of the `<body>`.
- Add `theme-color` meta tag for better PWA integration.

### 4. Verification
- Verify that the Service Worker registers successfully.
- Verify that files are being cached.
- (Self-Verification): I will assume the role of the user and ensure the code structure is correct for offline capability.
