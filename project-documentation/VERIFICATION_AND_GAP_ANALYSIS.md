# Verification & Gap Analysis — Betwise Smart PC

**Document Purpose:** In compliance with audit instructions, this document provides an explicit, granular breakdown of all facts verified directly from the available repository source code versus external, backend-dependent, or physical hardware items that cannot be verified without external access.

---

## 1. Verified Architecture & Implementation Matrix

The following components and behaviors have been **100% verified** by direct source code inspection:

| Domain | Verified Source File(s) | Verification Details |
| :--- | :--- | :--- |
| **Frontend Framework** | `package.json`, `src/main.tsx`, `src/App.tsx` | Built using React 19 (`19.2.8`), React Router DOM v7 (`7.18.4`), Vite 8 (`8.3.0`), Pusher JS (`8.6.0`), and Swiper (`14.3.0`). |
| **Desktop Runtime** | `src-tauri/tauri.conf.json`, `src-tauri/Cargo.toml` | Tauri v2 (`2.12.1`) runtime in Rust 2024 edition (`rust-version = 1.90`). Target ID: `com.betwise.smartpc`. Default fullscreen resolution: `1920x1080` without OS window decorations. |
| **OS Keyboard Hook** | `src-tauri/src/kiosk.rs` | Win32 low-level keyboard hook (`WH_KEYBOARD_LL = 13`) intercepts and suppresses `VK_LWIN (0x5B)`, `VK_RWIN (0x5C)`, `Alt+Tab`, `Alt+Escape`, and `Ctrl+Escape`. Linux module is a verified no-op. |
| **Native IPC Commands** | `src-tauri/src/commands/mod.rs`, `src/services/tauri.ts` | 4 commands registered in `tauri::generate_handler!`: `get_machine_information`, `get_hardware_status`, `print_ticket_native`, `get_system_time`. |
| **Kiosk Input Interception** | `src/hooks/useKioskKeyboardLock.tsx` | All DOM `keydown`, `keyup`, `keypress`, and `contextmenu` events are intercepted in the capture phase when `balance == 0.00` outside registration pages. Interactive form inputs (`<input>`, `<textarea>`) and modifier keys are whitelisted. |
| **Admin Shortcuts** | `src/hooks/useKioskKeyboardLock.tsx:112-180` | `Ctrl+Shift+D` (or `Ctrl+Shift+K`) toggles admin keyboard unlock override. `Ctrl+Shift+R` wipes all station tokens and redirects to `/register`. |
| **All Page Routes** | `src/routes/AppRoutes.tsx` | All 12 routes verified (`/`, `/register`, `/smart-pc/register`, `/smart-pc/login`, `/register/smart-pc`, `/register/success`, `/not-authorized`, `/smart-pc`, `/smart-pc/play/:gameId`, `/smart-pc/play`, `/play/:gameId`, `/smart-pc/cashout`). |
| **REST API Client** | `src/services/api.ts` | All 10 REST endpoints verified against `${origin}/v1/${portal_slug}/shop/*`. In-flight promise deduplication and memory query caching verified. |
| **Real-time Event Subscriptions** | `src/services/socket.ts` | Pusher subscriptions verified for `private-smart-pc.{id}`, `smart-pc.{id}`, and `private-machine.{id}`. 4 balance update event names, 4 cashout approved event names, 4 cashout rejected event names, and 21 unbind event names verified. |
| **Dual-Layer Polling** | `src/hooks/useMachine.ts:63-154` | Shared singleton poller queries `GET /smart-pcs/session` every 2,500ms when subscribers exist. Heartbeat runs every 10,000ms. |
| **Packaging & Cleaners** | `src-tauri/scripts/*`, `src-tauri/installer_hooks.nsh` | Linux Debian packaging scripts kill prior processes and clean `~/.cache/com.betwise.smartpc`. Windows NSIS pre-install / post-uninstall hooks kill `.exe` and wipe `%LOCALAPPDATA%` and `%APPDATA%`. |

---

## 2. Unverified Items & External Gaps

The following items **cannot be verified solely from the client source code** and represent external dependencies, server-side implementations, or physical cabinet characteristics:

### 2.1 Production Pusher Credentials
*   **Source Finding:** In `.env`, `VITE_PUSHER_APP_KEY` is blank (`VITE_PUSHER_APP_KEY=`). In `src/services/socket.ts:36`, it falls back to `"staging_iccpanel_key"`.
*   **Gap:** The production WebSocket cluster credentials and live Pusher app ID are managed externally or injected during deployment.

### 2.2 Remote Server Internal Business Logic (`staging.iccpanel.com`)
*   **Source Finding:** The client sends REST requests to `https://staging.iccpanel.com/api/v1/{portal_slug}/shop/*`.
*   **Gap:** The server-side codebase (Laravel controllers, database schemas, cashier authorization queues, and authentication token validation logic) is hosted remotely and cannot be inspected from this repository.

### 2.3 Physical ESC/POS Printer Hardware Driver
*   **Source Finding:** In `src-tauri/src/hardware/mod.rs:48-58`, `HardwareService::print_ticket` prints a log statement to `stdout`:
    ```rust
    println!("🖨️ [NATIVE PRINTER] Printing Ticket #{} for N$ {:.2} at {} ({})", ...);
    ```
*   **Gap:** The source repository contains simulated print logging. Direct raw byte streaming to physical ESC/POS serial/USB devices (e.g. `/dev/usb/lp2` or Windows print spooler APIs `winspool.drv`) is either handled by an external hardware bridge service or scheduled for a future hardware driver release.

### 2.4 External Game Provider Iframe Embedding & CORS Policies
*   **Source Finding:** In `src/pages/SmartPC/GamePlayPage.tsx:504-510`, provider games are embedded in an `<iframe>` using the URL returned by `POST /smart-pcs/launch-game`.
*   **Gap:** Whether third-party casino game providers (such as Slotegrator or Pragmatic Play) permit iframe streaming on specific domains or enforce `X-Frame-Options: SAMEORIGIN` / `Content-Security-Policy: frame-ancestors` depends entirely on each provider's staging server configuration. The client provides a popout window button and Fast Bet fallback for cases where iframe streaming is blocked.

### 2.5 Physical POS Peripherals on Smart PC Machines
*   **Source Finding:** `src/constants/machine.ts` and `src-tauri/src/hardware/mod.rs` set `bill_acceptor_connected: false`.
*   **Gap:** Per the specification, Smart PC machines do not feature physical bill acceptors or barcode scanners; all money handling occurs at the shop cashier desk. Hardware simulator buttons in `HardwareSimulatorBar.tsx` are for web lab testing only.
