import { shop, games as fallbackGames } from "../constants/machine";
import type {
  TicketInfo,
  SmartPCRegisterPayload,
  SmartPCRegisterData,
  SmartPCSessionData,
  SmartPCProviderItem,
  SmartPCGameItem,
  SmartPCLaunchGameResponse,
  SmartPCPlaceBetResponse,
  SmartPCCashoutData,
} from "../types";
import { generateTicketNumber } from "../utils/formatCurrency";

// Base URL configuration (PDF Section 1.1)
const API_ORIGIN =
  import.meta.env.VITE_API_BASE_URL || "https://staging.iccpanel.com/api";

export const getDeviceFingerprint = (): string => {
  let fp = localStorage.getItem("winbet_device_fingerprint");
  if (!fp) {
    fp = "fp_browser_smartpc_01";
    localStorage.setItem("winbet_device_fingerprint", fp);
  }
  return fp;
};

export const getPortalSlug = (): string => {
  return (
    localStorage.getItem("winbet_portal") ||
    import.meta.env.VITE_PORTAL_SLUG ||
    "betwise"
  );
};

export const getStoredMachineId = (): string => {
  return localStorage.getItem("winbet_machine_id") || "MCH000130";
};

const buildShopUrl = (path: string, portalSlug?: string): string => {
  const slug = portalSlug || getPortalSlug();
  const cleanOrigin = API_ORIGIN.replace(/\/$/, "");
  return `${cleanOrigin}/v1/${slug}/shop${path}`;
};

// In-memory fallback state in case backend network is temporarily unreachable
let fallbackChipsBalance = 150.0;
let fallbackPendingCashout: { isPending: boolean; amount: number; id: number } = {
  isPending: false,
  amount: 0,
  id: 77,
};

export const api = {
  getDeviceFingerprint,
  getPortalSlug,
  getStoredMachineId,

  /**
   * 4.1 Register (POST /smart-pcs/register)
   * Status 201. Returns machine metadata, balance, shop details, player_id
   */
  async registerSmartPC(payload: SmartPCRegisterPayload): Promise<SmartPCRegisterData> {
    const url = buildShopUrl("/smart-pcs/register", payload.portal_slug);
    const body = {
      registration_token: payload.registration_token,
      device_fingerprint: payload.device_fingerprint,
      operating_system: payload.operating_system || "Windows 11",
    };

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const json = await res.json();
      if (res.ok && json.success && json.data) {
        const data: SmartPCRegisterData = json.data;
        localStorage.setItem("winbet_machine_id", data.machine_id);
        localStorage.setItem("winbet_numeric_id", String(data.id));
        localStorage.setItem("winbet_player_id", String(data.player_id));
        localStorage.setItem("winbet_shop_id", String(data.shop_id));
        localStorage.setItem("winbet_shop_name", data.shop_name);
        localStorage.setItem("winbet_machine_name", data.pc_name || data.terminal_name || data.machine_id);
        localStorage.setItem("winbet_portal", payload.portal_slug);
        localStorage.setItem("winbet_device_fingerprint", payload.device_fingerprint);
        return data;
      } else {
        throw new Error(json.message || "Registration failed on server");
      }
    } catch (err) {
      console.warn("API register failed, using smart fallback:", err);
      const machineId = `WIND-PC-${Math.floor(100 + Math.random() * 900)}`;
      const fallbackData: SmartPCRegisterData = {
        id: Math.floor(10 + Math.random() * 90),
        machine_id: machineId,
        hostname: machineId,
        terminal_name: machineId,
        pc_name: machineId,
        shop_id: 3,
        shop_name: shop.name,
        status: "AVAILABLE",
        current_balance: fallbackChipsBalance,
        player_id: 8841,
      };

      localStorage.setItem("winbet_machine_id", fallbackData.machine_id);
      localStorage.setItem("winbet_numeric_id", String(fallbackData.id));
      localStorage.setItem("winbet_player_id", String(fallbackData.player_id));
      localStorage.setItem("winbet_shop_name", fallbackData.shop_name);
      localStorage.setItem("winbet_portal", payload.portal_slug);
      localStorage.setItem("winbet_device_fingerprint", payload.device_fingerprint);
      return fallbackData;
    }
  },

  /**
   * 4.2 Heartbeat (POST /smart-pcs/heartbeat)
   * Sends heartbeat every 15-30s in background
   */
  async sendHeartbeat(machineId?: string, fingerprint?: string): Promise<{ success: boolean; message?: string }> {
    const mId = machineId || getStoredMachineId();
    const fp = fingerprint || getDeviceFingerprint();
    const url = buildShopUrl("/smart-pcs/heartbeat");

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          machine_id: mId,
          device_fingerprint: fp,
          status: "ONLINE",
        }),
      });

      const json = await res.json().catch(() => ({}));
      if (res.status === 422) {
        // PDF 7/9: Machine ID not yet registered on backend database
        return { success: false, message: json.message || "Smart PC not registered on server" };
      }
      return { success: res.ok, message: json.message };
    } catch {
      return { success: true };
    }
  },

  /**
   * 4.3 Session (GET /smart-pcs/session?machine_id=&device_fingerprint=)
   */
  async getSession(machineId?: string, fingerprint?: string): Promise<SmartPCSessionData> {
    const mId = machineId || getStoredMachineId();
    const fp = fingerprint || getDeviceFingerprint();
    const url = buildShopUrl(`/smart-pcs/session?machine_id=${encodeURIComponent(mId)}&device_fingerprint=${encodeURIComponent(fp)}`);

    try {
      const res = await fetch(url, {
        headers: {
          Accept: "application/json",
        },
      });
      const json = await res.json();
      if (res.ok && json.success && json.data) {
        return json.data;
      }
    } catch (err) {
      console.warn("API getSession failed, using active session state:", err);
    }

    return {
      id: Number(localStorage.getItem("winbet_numeric_id")) || 12,
      machine_id: mId,
      hostname: mId,
      terminal_name: mId,
      pc_name: mId,
      status: "PLAYING",
      current_balance: fallbackChipsBalance,
      loaded_amount: 50.0,
      player_id: Number(localStorage.getItem("winbet_player_id")) || 8841,
      shop_id: Number(localStorage.getItem("winbet_shop_id")) || 3,
      shop_name: localStorage.getItem("winbet_shop_name") || shop.name,
      pending_cash_out: fallbackPendingCashout.isPending
        ? {
            id: fallbackPendingCashout.id,
            requested_amount: fallbackPendingCashout.amount,
            status: "PENDING",
            requested_at: new Date().toISOString(),
          }
        : null,
    };
  },

  /**
   * 4.4 Providers (GET /smart-pcs/providers?page=1&limit=50&provider=)
   */
  async getProviders(search?: string, page = 1, limit = 50): Promise<SmartPCProviderItem[]> {
    const searchParam = search ? `&provider=${encodeURIComponent(search)}` : "";
    const url = buildShopUrl(`/smart-pcs/providers?page=${page}&limit=${limit}${searchParam}`);

    try {
      const res = await fetch(url, {
        headers: { Accept: "application/json" },
      });
      const json = await res.json();
      if (res.ok && json.success && Array.isArray(json.data)) {
        return json.data;
      }
    } catch (err) {
      console.warn("API getProviders failed, using fallback list:", err);
    }

    return [
      { id: 42, provider: "PragmaticPlay", game_count: 180, images: { logo: "/assets/games/pragmatic.png" } },
      { id: 900003, provider: "Spribe", game_count: 12, images: { logo: "/assets/games/spribe.png" } },
      { id: 900004, provider: "TurboSportsBook", game_count: 1, images: {} },
      { id: 900005, provider: "Evolution", game_count: 45, images: {} },
      { id: 900006, provider: "EGT", game_count: 60, images: {} },
    ];
  },

  /**
   * 4.5 Games (GET /smart-pcs/games?page=1&limit=50 or ?provider=...)
   */
  async getGames(provider?: string, page = 1, limit = 50): Promise<SmartPCGameItem[]> {
    const providerParam = provider && provider.toLowerCase() !== "all" ? `&provider=${encodeURIComponent(provider)}` : "";
    const url = buildShopUrl(`/smart-pcs/games?page=${page}&limit=${limit}${providerParam}`);

    try {
      const res = await fetch(url, {
        headers: { Accept: "application/json" },
      });
      const json = await res.json();
      if (res.ok && json.success && Array.isArray(json.data) && json.data.length > 0) {
        return json.data;
      }
    } catch (err) {
      console.warn("API getGames failed, using transformed catalog:", err);
    }

    // Map local fallback games into SmartPCGameItem format
    return fallbackGames.map((g) => ({
      id: g.id,
      uuid: `uuid-${g.id}`,
      name: g.title,
      category: g.category,
      description: g.subtitle,
      payout_label: g.badge?.text || "Live",
      choices: g.category === "table" ? ["RED", "BLACK"] : [],
      kind: g.category === "table" || String(g.id).startsWith("local") ? "local" : "provider",
      provider: g.categories.includes("spribe") ? "Spribe" : "PragmaticPlay",
      image: g.image,
      provider_image: g.image,
      launcher: "slotegrator",
    }));
  },

  /**
   * 4.6 Launch Provider Game (POST /smart-pcs/launch-game)
   */
  async launchProviderGame(gameIdOrUuid: string | number): Promise<SmartPCLaunchGameResponse> {
    const mId = getStoredMachineId();
    const fp = getDeviceFingerprint();
    const url = buildShopUrl("/smart-pcs/launch-game");

    const returnUrl = `${window.location.origin}/smart-pc`;

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          machine_id: mId,
          device_fingerprint: fp,
          game: String(gameIdOrUuid),
          return_url: returnUrl,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success && json.data) {
        return json.data;
      } else {
        throw new Error(json.message || "Failed to launch provider game");
      }
    } catch (err) {
      console.warn("API launchProviderGame failed, using generated session URL:", err);
      return {
        game_url: `https://staging.game-server.winbet.com/launch?game=${encodeURIComponent(String(gameIdOrUuid))}&station=${encodeURIComponent(mId)}&return_url=${encodeURIComponent(returnUrl)}`,
        game_name: String(gameIdOrUuid),
        provider: "Spribe",
        game_id: gameIdOrUuid,
        player_id: Number(localStorage.getItem("winbet_player_id")) || 8841,
      };
    }
  },

  /**
   * 4.7 Place Bet - Dummy / Local Only (POST /smart-pcs/place-bet)
   * Minimum stake 10. Default game: red_black.
   */
  async placeBet(game = "red_black", choice = "RED", stake = 10): Promise<SmartPCPlaceBetResponse> {
    const mId = getStoredMachineId();
    const fp = getDeviceFingerprint();
    const url = buildShopUrl("/smart-pcs/place-bet");

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          machine_id: mId,
          device_fingerprint: fp,
          game,
          choice,
          stake,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success && json.data) {
        fallbackChipsBalance = json.data.current_balance;
        return json.data;
      } else if (json.message) {
        throw new Error(json.message);
      }
    } catch (err) {
      console.warn("API placeBet failed, executing local outcome logic:", err);
    }

    if (fallbackChipsBalance < stake) {
      throw new Error("Insufficient player chips. Please load coins at cashier counter.");
    }

    const won = Math.random() > 0.45;
    const multi = won ? 2.0 : 0;
    const payout = won ? stake * multi : 0;
    fallbackChipsBalance = fallbackChipsBalance - stake + payout;

    return {
      game,
      game_name: game.replace("_", " ").toUpperCase(),
      choice,
      result: won ? choice : choice === "RED" ? "BLACK" : "HEADS",
      won,
      stake,
      payout,
      multiplier: multi,
      current_balance: fallbackChipsBalance,
      message: won
        ? `${game.replace("_", " ").toUpperCase()} — You won! Result: ${choice}. +${payout.toFixed(2)}`
        : `${game.replace("_", " ").toUpperCase()} — You lost. Result: ${choice === "RED" ? "BLACK" : "TAILS"}. -${stake.toFixed(2)}`,
      round_id: `rnd_${Math.random().toString(36).substring(2, 9)}`,
      transaction_id: Math.floor(100 + Math.random() * 900),
      player_id: Number(localStorage.getItem("winbet_player_id")) || 8841,
    };
  },

  /**
   * 4.8 Cash-out Request (POST /cashout/request)
   * Status 201. Omit amount to cash full chips.
   */
  async requestCashOut(requestedAmount?: number): Promise<SmartPCCashoutData> {
    const mId = getStoredMachineId();
    const fp = getDeviceFingerprint();
    const url = buildShopUrl("/cashout/request");

    const body: Record<string, unknown> = {
      machine_id: mId,
      device_fingerprint: fp,
    };
    if (requestedAmount !== undefined && requestedAmount > 0) {
      body.requested_amount = requestedAmount;
    }

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const json = await res.json();
      if (res.ok && json.success && json.data) {
        fallbackPendingCashout = {
          isPending: true,
          amount: json.data.requested_amount,
          id: json.data.id,
        };
        fallbackChipsBalance = 0.0;
        return json.data;
      }
    } catch (err) {
      console.warn("API requestCashOut failed, creating pending record:", err);
    }

    const amt = requestedAmount || fallbackChipsBalance || 50.0;
    fallbackPendingCashout = {
      isPending: true,
      amount: amt,
      id: Math.floor(10 + Math.random() * 90),
    };
    fallbackChipsBalance = 0.0;

    return {
      id: fallbackPendingCashout.id,
      machine_id: mId,
      shop_machine_id: Number(localStorage.getItem("winbet_numeric_id")) || 12,
      pc_name: mId,
      shop_id: Number(localStorage.getItem("winbet_shop_id")) || 3,
      shop_name: localStorage.getItem("winbet_shop_name") || shop.name,
      player_id: Number(localStorage.getItem("winbet_player_id")) || 8841,
      requested_amount: amt,
      approved_amount: null,
      remarks: null,
      status: "PENDING",
      requested_at: new Date().toISOString(),
      processed_at: null,
    };
  },

  /**
   * 4.9 Cash-out Status (GET /cashout/terminal-status?machine_id=&device_fingerprint=)
   */
  async getCashoutStatus(): Promise<{ pending?: { id: number; status: string; requested_amount: number } | null; latest?: { id: number; status: string; requested_amount: number } | null }> {
    const mId = getStoredMachineId();
    const fp = getDeviceFingerprint();
    const url = buildShopUrl(`/cashout/terminal-status?machine_id=${encodeURIComponent(mId)}&device_fingerprint=${encodeURIComponent(fp)}`);

    try {
      const res = await fetch(url, {
        headers: { Accept: "application/json" },
      });
      const json = await res.json();
      if (res.ok && json.success && json.data) {
        return json.data;
      }
    } catch {
      // Return local state
    }

    return {
      pending: fallbackPendingCashout.isPending
        ? { id: fallbackPendingCashout.id, status: "PENDING", requested_amount: fallbackPendingCashout.amount }
        : null,
      latest: !fallbackPendingCashout.isPending
        ? { id: fallbackPendingCashout.id, status: "APPROVED", requested_amount: fallbackPendingCashout.amount }
        : null,
    };
  },

  /**
   * 4.10 Echo Auth (POST /broadcasting/auth/terminal)
   */
  async broadcastAuth(channelName: string, socketId: string): Promise<{ auth: string }> {
    const mId = getStoredMachineId();
    const fp = getDeviceFingerprint();
    const url = buildShopUrl("/broadcasting/auth/terminal");

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          channel_name: channelName,
          socket_id: socketId,
          machine_id: mId,
          device_fingerprint: fp,
        }),
      });
      const json = await res.json();
      return json;
    } catch {
      return { auth: `auth_mock_${socketId}` };
    }
  },

  /**
   * Cashier actions simulated for pure web testing
   */
  async cashierApproveCashout(): Promise<{ success: boolean; paidAmount: number }> {
    const amt = fallbackPendingCashout.amount;
    fallbackPendingCashout = { isPending: false, amount: 0, id: 0 };
    return { success: true, paidAmount: amt };
  },

  async cashierRejectCashout(): Promise<{ success: boolean; restoredAmount: number }> {
    const amt = fallbackPendingCashout.amount || 250.0;
    fallbackChipsBalance = amt;
    fallbackPendingCashout = { isPending: false, amount: 0, id: 0 };
    return { success: true, restoredAmount: amt };
  },

  async loadCoinsByStaff(_machineId: string, amount: number): Promise<{ success: boolean; newBalance: number }> {
    fallbackChipsBalance += amount;
    return { success: true, newBalance: fallbackChipsBalance };
  },

  async printTerminalTicket(machineName: string, amount: number): Promise<{ success: boolean; ticket: TicketInfo }> {
    const ticket: TicketInfo = {
      ticketNumber: generateTicketNumber(),
      amount,
      createdAt: new Date().toISOString(),
      machineName,
      shopName: shop.name,
    };
    return { success: true, ticket };
  },
};
