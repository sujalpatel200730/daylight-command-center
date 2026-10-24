# Daylight — Personal Command Center

A lightweight, mobile-first dashboard designed for Android. It runs as a Progressive Web App (PWA), so you can install it from Chrome and open it like an app.

## Included in this starter version
- Full-screen dashboard with live clock and date
- Task list with priority, completion, filters and delete
- Important dates/events with date and optional time
- Engineering study setup and focus timer
- Notes that autosave locally, plus recent-note shortcuts
- World, technology and science news source links
- Quick calculator, mini checklist, study/developer links
- Light/dark theme and show/hide options for some widgets
- JSON backup download
- Basic offline caching after the first successful load

## Important limitations
- Tasks, notes, dates and settings are stored in this browser on this device. They do not sync to another device.
- News currently links to trusted news publishers and official sources; it does not fetch a live headline feed or summarize articles.
- The focus timer works while the page is active, but mobile operating systems may pause timers when the browser is backgrounded. This starter does not provide guaranteed background alarms.
- Notifications, account sync, cloud backup, and calendar integration are not implemented yet.

## Run locally on a computer
1. Extract the ZIP.
2. Open a terminal in the extracted folder.
3. Run a local server:
   - Python: `python -m http.server 8000`
   - Or use the VS Code Live Server extension.
4. On the same device, open `http://localhost:8000`.

Opening `index.html` directly will show the dashboard, but service-worker/offline features need a local server or HTTPS.

## Install on your Android phone
PWA installation generally requires the files to be hosted over HTTPS:
1. Upload these files to a static host such as GitHub Pages or Netlify.
2. Open the resulting HTTPS website in Chrome on your Android phone.
3. Open Chrome's three-dot menu and choose **Install app** or **Add to Home screen** (wording varies).
4. Open Daylight from the home screen. It will launch in its own app-like window.

### GitHub Pages quick path
1. Sign in to GitHub and create a new repository, for example `daylight-dashboard`.
2. Upload all files from this ZIP to the repository root.
3. Open repository **Settings → Pages**.
4. Under build/deployment, choose deploy from a branch, select `main` and `/ (root)`, then save.
5. Wait for the published URL shown on the Pages settings screen.
6. Visit that HTTPS URL on Android Chrome and install it.

Do not upload personal task or note data to the repository. The app data is stored in your browser, separate from the source files.

## Project files
- `index.html` — dashboard structure
- `style.css` — responsive design and themes
- `app.js` — task, event, notes, study timer, tools and local persistence
- `manifest.webmanifest` — installable app metadata
- `sw.js` — offline cache
- `icon.svg` — app icon

## Restore/backup
Use **Backup data** to download `daylight-backup.json`. This starter version creates backups but does not yet import them automatically.
