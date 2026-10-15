# Hardware Communication & Security — Betwise Smart PC

**Document Scope:** Native OS peripheral interfacing, low-level keyboard hooks, kiosk locking mechanisms, and security shortcuts.  
**Native Source Files:** `src-tauri/src/kiosk.rs`, `src-tauri/src/hardware/mod.rs`, `src-tauri/src/commands/mod.rs`  
**Webview Source Files:** `src/hooks/useKioskKeyboardLock.tsx`, `src/services/tauri.ts`  

---

## 1. Physical Hardware vs. Machine Type Comparison

Betting shop cabinets are deployed in two physical configurations that share the same underlying codebase:

| Capability / Hardware Feature | Smart PC Machine (`smart-pc`) | Terminal POS Cabinet (`terminal`) |
| :--- | :--- | :--- |
| **Physical Bill Acceptor (Cash-In)** | **None.** Credited exclusively by shop cashier via back office. | **Present.** AstroSys GBA ST2 (ccTalk protocol). |
| **Barcode Scanner (Ticket-In)** | **None.** No ticket voucher input. | **Present.** Zebex laser scanner (USB HID keyboard wedge). |
| **Thermal Receipt Printer** | **Simulated / Back-office.** Smart PC cashouts are paid directly in cash at cashier desk. | **Present.** Epson TM-T88IV / M244A (ESC/POS thermal printer). |
| **Primary Cash-Out Flow** | On-screen **Cash Out → Confirm** (creates pending queue entry). | On-screen **Print Cashout Ticket** (prints physical voucher). |
| **Keyboard & Mouse** | Desktop keyboard and mouse available for player navigation. | Touchscreen or numeric mechanical keypads. |

---

## 2. Windows Low-Level Keyboard Hook (`src-tauri/src/kiosk.rs`)

On Windows deployments, the native Rust process installs a low-level keyboard hook (`WH_KEYBOARD_LL = 13`) in a dedicated OS thread before initializing the window:

```rust
// src-tauri/src/kiosk.rs
const WH_KEYBOARD_LL: i32 = 13;
const HC_ACTION: i32 = 0;
const VK_TAB: u32 = 0x09;
const VK_ESCAPE: u32 = 0x1B;
const VK_CONTROL: i32 = 0x11;
const VK_LWIN: u32 = 0x5B;
const VK_RWIN: u32 = 0x5C;
const LLKHF_ALTDOWN: u32 = 0x20;
```

### 2.1 Intercepted Key Combinations

The callback function `low_level_keyboard_proc` inspects incoming scan codes and returns `1` (dropped) without calling `CallNextHookEx`:

1.  **Windows Keys (`VK_LWIN` & `VK_RWIN`):** Drops Left and Right Windows keys to prevent opening the Windows Start Menu or taskbar.
2.  **Alt + Tab (`VK_TAB` with `LLKHF_ALTDOWN`):** Drops application switcher gestures.
3.  **Alt + Escape (`VK_ESCAPE` with `LLKHF_ALTDOWN`):** Drops window cycling gestures.
4.  **Ctrl + Escape (`VK_ESCAPE` with `GetAsyncKeyState(VK_CONTROL) < 0`):** Drops Windows Start Menu shortcut.

### 2.2 Thread Lifecycle
```rust
std::thread::spawn(|| {
    unsafe {
        let hook = SetWindowsHookExW(
            WH_KEYBOARD_LL,
            low_level_keyboard_proc,
            null_mut(),
            0,
        );
        if !hook.is_null() {
            let mut msg: MSG = std::mem::zeroed();
            while GetMessageW(&mut msg, null_mut(), 0, 0) > 0 {}
        }
    }
});
```
*   **Linux Implementation:** On non-Windows platforms, `kiosk.rs` compiles a no-op module (`imp::init() { /* No-op */ }`).

---

## 3. Webview-Layer Security & Input Lockdown

In addition to OS-level hooks, the React application implements deep DOM-level input guards inside `src/hooks/useKioskKeyboardLock.tsx`:

### 3.1 W3C Modern Keyboard Lock API
```typescript
if (typeof navigator !== "undefined" && "keyboard" in navigator && (navigator as any).keyboard?.lock) {
  (navigator as any).keyboard.lock(["MetaLeft", "MetaRight", "Escape"]).catch(() => {});
}
```
*   Secures fullscreen escape key handling inside Chromium/WebView2.

### 3.2 Zero-Balance Gaming Lock Rule
To prevent bored players from hammering station keys when they have no money loaded:

*   **Lock Condition:** `!isRegisterPage && !isOverrideUnlocked`
*   **Intercepted Events:** `keydown`, `keyup`, `keypress`, and `contextmenu` (right click) attached to `window` with `capture: true`.
*   **Whitelisted Exceptions:**
    1.  **Form Inputs:** Any keystroke targeting `<input>`, `<textarea>`, `<select>`, or `[contenteditable]` is permitted.
    2.  **Modifier Keys:** `Control`, `Shift`, `Alt`, and `CapsLock` pass through to allow authorized staff shortcuts.
    3.  **Positive Balance:** When `balance > 0`, the lock automatically releases.

---

## 4. Authorized Staff Shortcut Matrix

Shop managers and technicians can bypass kiosk locks using global key combinations:

| Key Combination | Action / Handler | Visual Feedback | Description |
| :--- | :--- | :--- | :--- |
| **`Ctrl + Shift + D`** *(or `Ctrl + Shift + K`)* | `setIsOverrideUnlocked((prev) => !prev)` | Theme Notification Modal: *"🔓 KEYBOARD UNLOCKED (Admin Mode: Ctrl+Shift+D)"* + Yellow header badge | Toggles Admin Override. Allows keyboard usage even when balance is zero. Useful for maintenance, testing, and cashier inspection. |
| **`Ctrl + Shift + R`** | Reset & Unbind handler | Immediate redirect to `/register` | Emergency Station Reset. Clears `winbet_machine_id`, `winbet_numeric_id`, `winbet_setup_code`, and `winbet_registration_token`. Generates a fresh device fingerprint (`fp_spc_*`). |

---

## 5. Native Thermal Printer & Hardware Subsystem

### 5.1 Native Printer Dispatch (`src-tauri/src/hardware/mod.rs`)
When printing is invoked through Tauri IPC:

```rust
pub fn print_ticket(payload: PrintTicketPayload) -> Result<PrintTicketResponse, String> {
    if payload.amount <= 0.0 {
        return Err("Cannot print ticket for zero or negative amount".to_string());
    }

    // Native printer ESC/POS logging/dispatch
    println!(
        "🖨️ [NATIVE PRINTER] Printing Ticket #{} for N$ {:.2} at {} ({})",
        payload.ticket_number, payload.amount, payload.shop_name, payload.machine_name
    );

    Ok(PrintTicketResponse {
        success: true,
        message: format!("Ticket #{} printed successfully", payload.ticket_number),
        printed_at: payload.created_at,
    })
}
```

### 5.2 Device Fingerprint Engine (`src/services/api.ts`)
Stations generate a cryptographically resilient fingerprint:
```typescript
export const generateNewDeviceFingerprint = (): string => {
  const randomPart =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID().replace(/-/g, "").substring(0, 12)
      : Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
  const fp = `fp_spc_${randomPart}`;
  localStorage.setItem("winbet_device_fingerprint", fp);
  return fp;
};
```
*   Ensures that resetting or restoring a station creates a distinct machine identity on the server.
