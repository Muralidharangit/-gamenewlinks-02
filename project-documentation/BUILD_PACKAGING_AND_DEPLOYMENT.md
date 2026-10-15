# Build, Packaging & Deployment — Betwise Smart PC

**Document Scope:** Vite bundle optimization, Tauri v2 build pipeline, Linux Debian installer scripts, Windows NSIS installer hooks, and CI/CD GitHub Actions workflows.  
**Configuration Files:** `vite.config.ts`, `src-tauri/tauri.conf.json`, `src-tauri/Cargo.toml`, `.github/workflows/build-windows.yml`  

---

## 1. Vite 8 Frontend Build Pipeline

The frontend is built using Vite 8 with aggressive chunk splitting:

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  clearScreen: false,
  server: {
    port: 5173,
    strictPort: true,
    host: true,
    watch: { usePolling: false },
  },
  build: {
    target: "es2022",
    cssCodeSplit: true,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes("node_modules")) {
            if (
              id.includes("/react/") ||
              id.includes("/react-dom/") ||
              id.includes("/react-router/") ||
              id.includes("/react-router-dom/")
            ) {
              return "vendor-react";
            }
            if (id.includes("/swiper/")) {
              return "vendor-ui";
            }
            if (id.includes("/pusher-js/")) {
              return "vendor-realtime";
            }
          }
        },
      },
    },
  },
  envPrefix: ["VITE_", "TAURI_ENV_*"],
});
```

### 1.1 Vendor Chunks Strategy
*   **`vendor-react`:** Isolates React 19 core and React Router v7 DOM bindings into an immutable cached bundle.
*   **`vendor-ui`:** Isolates Swiper slider components and CSS.
*   **`vendor-realtime`:** Isolates `pusher-js` WebSocket client and crypto dependencies.

---

## 2. Tauri v2 Desktop Configuration (`tauri.conf.json`)

```json
{
  "productName": "betwise-smartpc",
  "version": "1.0.2",
  "identifier": "com.betwise.smartpc",
  "build": {
    "frontendDist": "../dist",
    "devUrl": "http://localhost:5173",
    "beforeDevCommand": "npm run dev",
    "beforeBuildCommand": "npm run build"
  },
  "app": {
    "windows": [
      {
        "label": "main",
        "title": "Betwise Smart PC",
        "width": 1920,
        "height": 1080,
        "minWidth": 1024,
        "minHeight": 768,
        "resizable": true,
        "fullscreen": true,
        "decorations": false
      }
    ],
    "security": { "csp": null }
  },
  "bundle": {
    "active": true,
    "targets": ["deb", "nsis"],
    "category": "Game"
  }
}
```

*   **Window Geometry:** Default `1920x1080` resolution. `decorations: false` removes window title bars, minimizing OS distraction.
*   **Fullscreen Mode:** `fullscreen: true` forces direct kiosk presentation.

---

## 3. Linux Debian (`.deb`) Packaging Pipeline

Target package: `installers/betwise-smartpc_1.0.2_amd64.deb`

### 3.1 Shared Library Dependencies
```json
"depends": [
  "libwebkit2gtk-4.1-0 | libwebkit2gtk-4.0-37",
  "libgtk-3-0",
  "libsoup-3.0-0 | libsoup2.4-1"
]
```

### 3.2 Debian Shell Lifecycle Scripts
The application defines three lifecycle shell scripts in `src-tauri/scripts/`:

#### Pre-Install Hook (`src-tauri/scripts/deb-preinstall.sh`)
Executes before unpacking new binaries. Kills any hung or active smartpc processes:
```bash
#!/bin/sh
set -e
killall -9 betwise-smartpc 2>/dev/null || true
killall -9 winbet-smart-pc 2>/dev/null || true
exit 0
```

#### Post-Install Hook (`src-tauri/scripts/deb-postinstall.sh`)
Clears stale WebKit cache folders across user profiles to ensure new web assets load fresh:
```bash
#!/bin/sh
set -e
for u in /home/*; do
  if [ -d "$u/.cache/com.betwise.smartpc" ]; then
    rm -rf "$u/.cache/com.betwise.smartpc" 2>/dev/null || true
  fi
  if [ -d "$u/.cache/com.winbet.smartpc" ]; then
    rm -rf "$u/.cache/com.winbet.smartpc" 2>/dev/null || true
  fi
done
exit 0
```

#### Post-Remove Hook (`src-tauri/scripts/deb-postremove.sh`)
Purges all lingering cache directories when the package is removed or purged:
```bash
#!/bin/sh
set -e
for u in /home/*; do
  rm -rf "$u/.cache/com.betwise.smartpc" 2>/dev/null || true
  rm -rf "$u/.cache/com.winbet.smartpc" 2>/dev/null || true
done
exit 0
```

---

## 4. Windows NSIS (`.exe`) Packaging Pipeline

Target package: `installers/betwise-smartpc_1.0.2_x64-setup.exe`

Configured in `src-tauri/installer_hooks.nsh` using Nullsoft Scriptable Install System macros:

```nsis
!macro NSIS_HOOK_PREINSTALL
  ; Terminate any existing instance before replacing files
  nsExec::Exec 'taskkill /F /IM betwise-smartpc.exe'
  nsExec::Exec 'taskkill /F /IM winbet-smart-pc.exe'
  
  ; Remove old application files
  RMDir /r "$INSTDIR"

  ; Clean old WebView2 cache and data directory
  RMDir /r "$LOCALAPPDATA\com.betwise.smartpc"
  RMDir /r "$LOCALAPPDATA\com.winbet.smartpc"
  RMDir /r "$APPDATA\com.betwise.smartpc"
  RMDir /r "$APPDATA\com.winbet.smartpc"
!macroend

!macro NSIS_HOOK_POSTUNINSTALL
  ; Wipe all leftover cache and app data on uninstall
  RMDir /r "$LOCALAPPDATA\com.betwise.smartpc"
  RMDir /r "$LOCALAPPDATA\com.winbet.smartpc"
  RMDir /r "$APPDATA\com.betwise.smartpc"
  RMDir /r "$APPDATA\com.winbet.smartpc"
!macroend
```

---

## 5. CI/CD GitHub Actions Workflow

Configured in `.github/workflows/build-windows.yml`:

*   **Trigger:** Manual workflow dispatch (`workflow_dispatch`) or tags.
*   **Runner:** `windows-latest`
*   **Pipeline Stages:**
    1.  Checkout repository code.
    2.  Set up Node.js v20.
    3.  Set up Rust stable toolchain with `x86_64-pc-windows-msvc` target.
    4.  Install dependencies (`npm install`).
    5.  Run Tauri build action (`tauri-apps/tauri-action@v0`).
    6.  Upload `.exe` setup installer artifact (`betwise-smartpc_1.0.2_x64-setup.exe`).

---

## 6. Build Commands Reference

| Platform / Task | Command | Description |
| :--- | :--- | :--- |
| **Frontend Dev** | `npm run dev` | Starts Vite dev server at `http://localhost:5173`. |
| **Desktop Dev** | `npm run tauri:dev` | Compiles Rust core in debug mode and spawns native window. |
| **Frontend Production** | `npm run build` | Compiles TypeScript and builds minified assets into `dist/`. |
| **Desktop Production** | `npm run tauri:build` | Generates distribution installers (`.deb` on Linux, `.exe` on Windows). |
| **Linting** | `npm run lint` | Runs `oxlint` static code analysis. |
