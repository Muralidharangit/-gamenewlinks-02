# Betwise Smart PC — Comprehensive Project Documentation

**Application Name:** `betwise-smartpc`  
**Package Version:** `1.0.2`  
**Application Identifier:** `com.betwise.smartpc`  
**Target Platform:** Linux Desktop (Debian/Ubuntu x86_64) & Windows 10/11 Desktop (x64 NSIS)  
**Framework Stack:** Tauri v2 (`2.12.1`) + Rust (`2024` edition) + React 19 (`19.2.8`) + TypeScript (`~6.0.2`) + Vite (`8.3.0`) + Pusher JS (`8.6.0`)  
**Backend API Integration:** `https://staging.iccpanel.com/api/v1/{portal_slug}/shop/*`  

---

## Executive Summary

**Betwise Smart PC** is a dedicated desktop kiosk application engineered for physical betting shop environments. Unlike consumer gaming websites, players never register accounts, input credit cards, or log in with credentials directly on the machine. Instead:

1. **Station Claiming & Registration:** The shop manager binds the physical workstation using a one-time setup code (e.g., `WB-SHOP-4821` / `DEMO2026`) and unique hardware device fingerprint (`fp_spc_*`).
2. **Offline Crediting & Balance Sync:** Credit/chips are loaded exclusively off-screen by a shop cashier via the back-office management portal (`iccpanel`). The Smart PC maintains real-time synchronization through WebSocket events (Pusher) and periodic REST polling (2.5s session polling / 10s heartbeat).
3. **Dedicated Kiosk Protection:** The machine enforces a strict zero-distraction kiosk lock. On Windows, low-level Win32 hooks suppress `Windows Key`, `Alt+Tab`, `Alt+Escape`, and `Ctrl+Escape`. At the application layer, all keyboard inputs are locked when the player has zero balance, unless overridden with authorized staff shortcut combinations (`Ctrl+Shift+D` to toggle keyboard lock; `Ctrl+Shift+R` to unbind machine).
4. **Game Aggregation & Streaming:** Provides access to an extensive catalog of casino games (Spribe instant games like Aviator, Mines, Plinko, Dice, plus external provider games from Slotegrator / Live Casino) streamed securely via iframe or launched in dedicated popout windows, supplemented by a local Fast Bet game engine with real-time balance debits and credits.
5. **Cash-Out Workflow:** Players cash out on-screen via a single **Cash Out → Confirm** flow. The station dispatches a server-side cash-out request, transitions into a locked **Pending** state, and awaits cashier payout authorization at the physical counter.

---

## Documentation Suite Map

This documentation directory contains exhaustive, source-verified documentation of every aspect of the project:

| Document | Primary Focus & Coverage |
| :--- | :--- |
| **[1. System Architecture](file:///home/sys-0743/My_projects_Murali/newfolder/smartpc-Tauri/-gamenewlinks-02/project-documentation/SYSTEM_ARCHITECTURE.md)** | Tauri v2 multi-process architecture, Rust core lib, React 19 SPA frontend, security sandbox, IPC commands, and lifecycle. |
| **[2. Page Flows & Routes](file:///home/sys-0743/My_projects_Murali/newfolder/smartpc-Tauri/-gamenewlinks-02/project-documentation/PAGE_FLOWS_AND_ROUTES.md)** | Complete route manifest (`/`, `/register`, `/smart-pc`, `/smart-pc/play/:gameId`, `/smart-pc/cashout`, `/not-authorized`), screens, transitions, and lazy loading. |
| **[3. API Specification & Backend Integrations](file:///home/sys-0743/My_projects_Murali/newfolder/smartpc-Tauri/-gamenewlinks-02/project-documentation/API_SPECIFICATION_AND_BACKEND_INTEGRATIONS.md)** | All 10 REST API endpoints, exact HTTP methods, headers, payloads, response schemas, deduplication, caching, and fallback policies. |
| **[4. WebSocket & Real-Time Events](file:///home/sys-0743/My_projects_Murali/newfolder/smartpc-Tauri/-gamenewlinks-02/project-documentation/WEBSOCKET_AND_REALTIME_EVENTS.md)** | Pusher/Echo real-time event bus, channel naming (`private-smart-pc.{id}`, `smart-pc.{id}`), event handlers, and server-side unbind detection. |
| **[5. Hardware Communication & Security](file:///home/sys-0743/My_projects_Murali/newfolder/smartpc-Tauri/-gamenewlinks-02/project-documentation/HARDWARE_COMMUNICATION_AND_SECURITY.md)** | Win32 low-level keyboard hooks (`WH_KEYBOARD_LL`), W3C keyboard lock, client-side zero-balance lock, admin shortcuts, and printer/scanner integration. |
| **[6. State Management & Data Contracts](file:///home/sys-0743/My_projects_Murali/newfolder/smartpc-Tauri/-gamenewlinks-02/project-documentation/STATE_MANAGEMENT_AND_DATA_CONTRACTS.md)** | LocalStorage keys, custom window event bus (`winbet_balance_update`, `winbet_cashout_status_change`), TypeScript interfaces, and offline mocks. |
| **[7. Build, Packaging & Deployment](file:///home/sys-0743/My_projects_Murali/newfolder/smartpc-Tauri/-gamenewlinks-02/project-documentation/BUILD_PACKAGING_AND_DEPLOYMENT.md)** | Vite chunk splitting, Tauri configuration, Linux `.deb` installer scripts (`preinstall`, `postinstall`, `postremove`), Windows NSIS hooks, and CI/CD. |
| **[8. Verification & Gap Analysis](file:///home/sys-0743/My_projects_Murali/newfolder/smartpc-Tauri/-gamenewlinks-02/project-documentation/VERIFICATION_AND_GAP_ANALYSIS.md)** | Matrix of facts verified directly from source code vs. unverified/external dependencies, backend-bound contracts, and hardware assumptions. |

---

## Core System Information & Key Files

```
-gamenewlinks-02/
├── src/
│   ├── App.tsx                     # Top-level application with Pusher init & KeyboardLockProvider
│   ├── main.tsx                    # React 19 root bootstrap with Bootstrap & FontAwesome
│   ├── routes/AppRoutes.tsx        # React Router v7 lazy route table
│   ├── services/
│   │   ├── api.ts                  # REST client (10 endpoints), deduplication & caching
│   │   ├── socket.ts               # Pusher client & real-time event subscriptions
│   │   └── tauri.ts                # IPC bridge to Rust commands
│   ├── hooks/
│   │   ├── useMachine.ts           # Core station state, poller, & custom event bus
│   │   └── useKioskKeyboardLock.tsx# Kiosk input interception & shortcut handler
│   ├── components/
│   │   ├── layout/                 # GamingHeader, GamingLayout, ShopLocation
│   │   ├── gaming/                 # GameGrid, GameCard, Modals, Banner, Ticker
│   │   └── common/                 # Button, Modal, Toast, Loading
│   ├── pages/
│   │   ├── Registration/           # Setup Code registration wizard
│   │   ├── RegistrationSuccess/    # Post-registration confirmation
│   │   ├── NotAuthorized/          # Station unbound / hardware lock screen
│   │   └── SmartPC/                # SmartPCLobby, GamePlayPage, SmartPCCashOut
│   ├── constants/machine.ts        # Default fallback games, shop info, and machine configs
│   └── types/index.ts              # Canonical TypeScript contracts
└── src-tauri/
    ├── Cargo.toml                  # Rust dependencies (tauri v2, serde, log)
    ├── tauri.conf.json             # Desktop kiosk window definition & packaging
    ├── installer_hooks.nsh         # Windows NSIS pre-install / post-uninstall hooks
    ├── scripts/                    # Debian preinstall, postinstall, postremove scripts
    └── src/
        ├── main.rs                 # Native process entry point
        ├── lib.rs                  # Plugin registration & command wiring
        ├── kiosk.rs                # Win32 low-level keyboard hook implementation
        ├── commands/mod.rs          # Tauri IPC command definitions
        ├── hardware/mod.rs         # Hardware status & native ticket printing stub
        └── services/mod.rs         # System OS and hostname resolution
```
