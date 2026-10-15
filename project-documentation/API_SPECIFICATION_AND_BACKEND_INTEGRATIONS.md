# API Specification & Backend Integrations — Betwise Smart PC

**Document Scope:** Exhaustive technical specification of all REST endpoints, schemas, headers, query parameters, error responses, and client-side caching policies.  
**Source File:** `src/services/api.ts`  
**Base Origin:** Configured via `VITE_API_BASE_URL` (`https://staging.iccpanel.com/api`)  
**Portal Slug:** Configured via `VITE_PORTAL_SLUG` (defaults to `"betwise"`)  
**Root Shop URL Pattern:** `${VITE_API_BASE_URL}/v1/${portal_slug}/shop${endpoint}`  

---

## 1. Authentication & Machine Identification Architecture

Smart PC stations do not authenticate via JWT tokens or user cookies. Instead, the backend authenticates physical hardware using a **two-tuple credential model**:

```
Machine Authentication Tuple: (machine_id, device_fingerprint)
```

1.  **`device_fingerprint`:** A pseudorandom, persistent hardware identifier stored in `localStorage` under key `winbet_device_fingerprint`. Generated via `crypto.randomUUID()`:
    ```typescript
    // Format: fp_spc_{12_hex_chars} (e.g. fp_spc_a8f3b21c90e1)
    ```
2.  **`machine_id`:** The unique string code assigned by the backend upon successful registration (e.g., `SPC-4821` or `Smart PC-03`), stored in `winbet_machine_id`.
3.  **`portal_slug`:** Identifies the operator tenant (defaults to `betwise`).

Every authenticated request passes `machine_id` and `device_fingerprint` either in the JSON request body (for `POST`) or as URL search query parameters (for `GET`).

---

## 2. Complete REST API Endpoint Directory

The client interacts with 10 REST endpoints. All endpoints have been verified directly from `src/services/api.ts`:

```
┌────┬────────┬──────────────────────────────────────────┬─────────────────────────────────────────┐
│ #  │ Method │ Endpoint Path                            │ Function Name in api.ts                 │
├────┼────────┼──────────────────────────────────────────┼─────────────────────────────────────────┤
│ 1  │ POST   │ /smart-pcs/register                      │ registerSmartPC(payload)                │
│ 2  │ POST   │ /smart-pcs/heartbeat                     │ sendHeartbeat(machineId?, fp?)          │
│ 3  │ GET    │ /smart-pcs/session                       │ getSession(machineId?, fp?)             │
│ 4  │ GET    │ /smart-pcs/providers                     │ getProviders(search?, page?, limit?)    │
│ 5  │ GET    │ /smart-pcs/games                         │ getGamesPage(provider?, page?, limit?)  │
│ 6  │ POST   │ /smart-pcs/launch-game                   │ launchProviderGame(gameIdOrUuid)        │
│ 7  │ POST   │ /smart-pcs/place-bet                     │ placeBet(game?, choice?, stake?)        │
│ 8  │ POST   │ /cashout/request                         │ requestCashOut(requestedAmount?)        │
│ 9  │ GET    │ /cashout/terminal-status                 │ getCashoutStatus()                      │
│ 10 │ POST   │ /broadcasting/auth/terminal              │ broadcastAuth(channelName, socketId)    │
└────┴────────┴──────────────────────────────────────────┴─────────────────────────────────────────┘
```

---

## 3. Detailed Endpoint Specifications

### 3.1 Register Machine (POST `/smart-pcs/register`)
Binds an unclaimed station slot to the physical computer running this client.

*   **URL:** `https://staging.iccpanel.com/api/v1/{portal_slug}/shop/smart-pcs/register`
*   **Method:** `POST`
*   **Headers:**
    ```http
    Accept: application/json
    Content-Type: application/json
    ```
*   **Request Payload:**
    ```json
    {
      "registration_token": "WB-SHOP-4821",
      "device_fingerprint": "fp_spc_9f82ab410d12",
      "operating_system": "Linux"
    }
    ```
*   **Success Response (Status `201 Created` or `200 OK`):**
    ```json
    {
      "success": true,
      "message": "Smart PC registered successfully.",
      "data": {
        "id": 142,
        "machine_id": "SPC-03",
        "hostname": "smart-pc-station",
        "terminal_name": "Smart PC-03",
        "pc_name": "Smart PC-03",
        "shop_id": 8,
        "shop_name": "Windhoek Central",
        "status": "ONLINE",
        "current_balance": 0.00,
        "player_id": 11045
      }
    }
    ```
*   **Client Side Side-Effects:**
    *   Wipes query cache via `clearApiCache()`.
    *   Saves `winbet_machine_id`, `winbet_numeric_id`, `winbet_player_id`, `winbet_shop_id`, `winbet_shop_name`, `winbet_machine_name`, `winbet_portal`, and `winbet_device_fingerprint`.
    *   Broadcasts balance update to window listeners.

---

### 3.2 Background Station Heartbeat (POST `/smart-pcs/heartbeat`)
Executed periodically (every 10 seconds) from `SmartPCLobby` and `GamePlayPage` to confirm the machine is active.

*   **URL:** `https://staging.iccpanel.com/api/v1/{portal_slug}/shop/smart-pcs/heartbeat`
*   **Method:** `POST`
*   **Request Payload:**
    ```json
    {
      "machine_id": "SPC-03",
      "device_fingerprint": "fp_spc_9f82ab410d12",
      "status": "ONLINE"
    }
    ```
*   **Success Response:**
    ```json
    {
      "success": true,
      "message": "Heartbeat acknowledged.",
      "data": {
        "status": "ONLINE",
        "current_balance": 250.00
      }
    }
    ```
*   **Unbound / De-authorized Detection:**
    If server responds with status `401`, `403`, `404`, `422`, or JSON containing `"status": "UNBOUND"`, `"DEAUTHORIZED"`, `"INACTIVE"`, or message containing `"fingerprint mismatch"`, client automatically invokes `broadcastStationUnbound()` to trigger Screen 28 security lock.

---

### 3.3 Station Session Query (GET `/smart-pcs/session`)
Queries current credits, player assignment, and pending cashout transactions. Deduplicated in memory.

*   **URL:** `https://staging.iccpanel.com/api/v1/{portal_slug}/shop/smart-pcs/session?machine_id={machineId}&device_fingerprint={fingerprint}`
*   **Method:** `GET`
*   **Headers:**
    ```http
    Accept: application/json
    ```
*   **Success Response:**
    ```json
    {
      "success": true,
      "data": {
        "id": 142,
        "machine_id": "SPC-03",
        "hostname": "Smart PC-03",
        "terminal_name": "Smart PC-03",
        "pc_name": "Smart PC-03",
        "status": "ONLINE",
        "current_balance": 150.00,
        "loaded_amount": 250.00,
        "player_id": 11045,
        "shop_id": 8,
        "shop_name": "Windhoek Central",
        "pending_cash_out": null
      }
    }
    ```
*   **Pending Cashout Variant:**
    ```json
    "pending_cash_out": {
      "id": 582,
      "requested_amount": 150.00,
      "status": "PENDING",
      "requested_at": "2026-10-15T02:00:00Z"
    }
    ```

---

### 3.4 Gaming Studios / Providers (GET `/smart-pcs/providers`)
Retrieves official certified game studio providers. Cached in-memory for 60 seconds (`TTL = 60000ms`).

*   **URL:** `https://staging.iccpanel.com/api/v1/{portal_slug}/shop/smart-pcs/providers?page=1&limit=50&provider={search}`
*   **Method:** `GET`
*   **Response Structure:**
    ```json
    {
      "success": true,
      "data": [
        {
          "id": 1,
          "provider": "Spribe",
          "game_count": 13,
          "images": {
            "logo": "https://staging.iccpanel.com/images/providers/spribe.png"
          }
        },
        {
          "id": 2,
          "provider": "Pragmatic Play",
          "game_count": 48
        }
      ]
    }
    ```

---

### 3.5 Game Catalog with Pagination (GET `/smart-pcs/games`)
Retrieves paginated live casino games. Cached in-memory for 30 seconds (`TTL = 30000ms`).

*   **URL:** `https://staging.iccpanel.com/api/v1/{portal_slug}/shop/smart-pcs/games?page={page}&limit=50&provider={provider}`
*   **Method:** `GET`
*   **Response Structure:**
    ```json
    {
      "success": true,
      "data": [
        {
          "id": 101,
          "uuid": "spribe-aviator",
          "name": "Aviator",
          "category": "crash",
          "description": "FLY HIGH • 10,000X MAX",
          "payout_label": "HOT",
          "choices": ["CASHOUT"],
          "kind": "provider",
          "provider": "Spribe",
          "image": "/assets/games/SPRIBE/AVIATOR.png",
          "provider_image": null
        }
      ],
      "pagination": {
        "total": 320,
        "last_page": 7,
        "current_page": 1,
        "per_page": 50
      }
    }
    ```

---

### 3.6 Launch Provider Game (POST `/smart-pcs/launch-game`)
Generates an authenticated live stream URL to mount inside an `<iframe>` or secondary window.

*   **URL:** `https://staging.iccpanel.com/api/v1/{portal_slug}/shop/smart-pcs/launch-game`
*   **Method:** `POST`
*   **Request Payload:**
    ```json
    {
      "machine_id": "SPC-03",
      "device_fingerprint": "fp_spc_9f82ab410d12",
      "game": "spribe-aviator",
      "return_url": "https://staging.iccpanel.com/close"
    }
    ```
*   **Success Response:**
    ```json
    {
      "success": true,
      "data": {
        "game_url": "https://staging.game-stream-provider.com/launch?token=auth_7a9f82",
        "game_name": "Aviator",
        "provider": "Spribe",
        "game_id": "spribe-aviator",
        "player_id": 11045
      }
    }
    ```

---

### 3.7 Place Bet — Fast Bet Arcade Engine (POST `/smart-pcs/place-bet`)
Allows instant wagering on the built-in slot or mini-game engine.

*   **URL:** `https://staging.iccpanel.com/api/v1/{portal_slug}/shop/smart-pcs/place-bet`
*   **Method:** `POST`
*   **Request Payload:**
    ```json
    {
      "machine_id": "SPC-03",
      "device_fingerprint": "fp_spc_9f82ab410d12",
      "game": "red_black",
      "choice": "RED",
      "stake": 10.00
    }
    ```
*   **Success Response:**
    ```json
    {
      "success": true,
      "data": {
        "game": "red_black",
        "game_name": "RED BLACK",
        "choice": "RED",
        "result": "RED",
        "won": true,
        "stake": 10.00,
        "payout": 20.00,
        "multiplier": 2.0,
        "current_balance": 160.00,
        "message": "RED BLACK — You won! Result: RED. +20.00",
        "round_id": "rnd_8a92f0",
        "transaction_id": 481,
        "player_id": 11045
      }
    }
    ```
*   **Fallback Behavior:** If backend is unreachable or returns a network fault, client contains a mathematical simulation fallback allowing offline testing while keeping balance consistent in `localStorage`.

---

### 3.8 Cash-Out Request (POST `/cashout/request`)
Submits a player cash-out claim to the cashier desk.

*   **URL:** `https://staging.iccpanel.com/api/v1/{portal_slug}/shop/cashout/request`
*   **Method:** `POST`
*   **Request Payload:**
    ```json
    {
      "machine_id": "SPC-03",
      "device_fingerprint": "fp_spc_9f82ab410d12",
      "requested_amount": 160.00
    }
    ```
*   *(Note: If `requested_amount` is omitted, server cashes out the full available station balance).*
*   **Success Response (Status `201 Created`):**
    ```json
    {
      "success": true,
      "data": {
        "id": 981,
        "machine_id": "SPC-03",
        "shop_machine_id": 142,
        "pc_name": "Smart PC-03",
        "shop_id": 8,
        "shop_name": "Windhoek Central",
        "player_id": 11045,
        "requested_amount": 160.00,
        "approved_amount": null,
        "remarks": null,
        "status": "PENDING",
        "requested_at": "2026-10-15T02:05:00Z",
        "processed_at": null
      }
    }
    ```

---

### 3.9 Cash-Out Status Poll (GET `/cashout/terminal-status`)
Polled every 2 seconds when `CASHOUT_PENDING` modal is open to detect cashier approval or rejection.

*   **URL:** `https://staging.iccpanel.com/api/v1/{portal_slug}/shop/cashout/terminal-status?machine_id={machineId}&device_fingerprint={fingerprint}`
*   **Method:** `GET`
*   **Success Response:**
    ```json
    {
      "success": true,
      "data": {
        "pending": null,
        "latest": {
          "id": 981,
          "status": "APPROVED",
          "requested_amount": 160.00
        }
      }
    }
    ```

---

### 3.10 Real-Time Broadcasting Auth (POST `/broadcasting/auth/terminal`)
Authorizes private Pusher channels for machine event streaming.

*   **URL:** `https://staging.iccpanel.com/api/v1/{portal_slug}/shop/broadcasting/auth/terminal`
*   **Method:** `POST`
*   **Request Payload:**
    ```json
    {
      "channel_name": "private-smart-pc.SPC-03",
      "socket_id": "18420.912481",
      "machine_id": "SPC-03",
      "device_fingerprint": "fp_spc_9f82ab410d12"
    }
    ```
*   **Response:**
    ```json
    {
      "auth": "staging_iccpanel_key:b892a0e417fa..."
    }
    ```
