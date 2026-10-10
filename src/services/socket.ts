import Pusher from "pusher-js";
import { api, getStoredMachineId } from "./api";
import { broadcastBalanceChange, broadcastCashoutStatusChange, broadcastStationUnbound } from "../hooks/useMachine";

export interface LiveBalanceEventData {
  current_balance?: number;
  balance?: number;
  loaded_amount?: number;
  amount?: number;
}

export interface LiveCashoutEventData {
  status?: "PENDING" | "APPROVED" | "REJECTED";
  requested_amount?: number;
  restored_amount?: number;
  amount?: number;
}

class LiveSocketManager {
  private pusher: Pusher | null = null;
  private currentChannel: ReturnType<Pusher["subscribe"]> | null = null;
  private activeMachineId: string | null = null;
  private isConnected = false;

  public init() {
    const machineId = getStoredMachineId();
    if (!machineId) return;

    if (this.activeMachineId === machineId && this.pusher) {
      return;
    }

    this.disconnect();
    this.activeMachineId = machineId;

    const pusherKey = import.meta.env.VITE_PUSHER_APP_KEY || "staging_iccpanel_key";
    const wsHost = import.meta.env.VITE_PUSHER_HOST || "staging.iccpanel.com";
    const wsPort = Number(import.meta.env.VITE_PUSHER_PORT) || 443;
    const cluster = import.meta.env.VITE_PUSHER_APP_CLUSTER || "mt1";

    try {
      this.pusher = new Pusher(pusherKey, {
        cluster,
        wsHost: wsHost.replace(/^https?:\/\//, ""),
        wsPort,
        wssPort: 443,
        forceTLS: true,
        enabledTransports: ["ws", "wss", "xhr_streaming", "xhr_polling"],
        authorizer: (channel) => {
          return {
            authorize: (socketId, callback) => {
              api
                .broadcastAuth(channel.name, socketId)
                .then((authData) => {
                  callback(null, authData);
                })
                .catch((err) => {
                  callback(err, { auth: `auth_local_${socketId}` });
                });
            },
          };
        },
      });

      this.pusher.connection.bind("connected", () => {
        this.isConnected = true;
        console.log("🔌 WINBET Live Socket: Connected to real-time event bus");
      });

      this.pusher.connection.bind("disconnected", () => {
        this.isConnected = false;
        console.log("🔌 WINBET Live Socket: Disconnected");
      });

      this.pusher.connection.bind("error", (err: unknown) => {
        console.warn("🔌 WINBET Live Socket notice:", err);
      });

      this.subscribeMachineChannels(machineId);
    } catch (err) {
      console.warn("Could not initialize Pusher socket:", err);
    }
  }

  private subscribeMachineChannels(machineId: string) {
    if (!this.pusher) return;

    const channelName = `private-smart-pc.${machineId}`;
    const publicChannelName = `smart-pc.${machineId}`;

    try {
      this.currentChannel = this.pusher.subscribe(channelName);

      // Bind to balance updates
      const handleBalanceUpdate = (data: LiveBalanceEventData) => {
        const bal = typeof data.current_balance === "number" ? data.current_balance : typeof data.balance === "number" ? data.balance : null;
        if (bal !== null) {
          broadcastBalanceChange(bal);
        }
      };

      this.currentChannel.bind("balance.updated", handleBalanceUpdate);
      this.currentChannel.bind("BalanceUpdated", handleBalanceUpdate);
      this.currentChannel.bind("balance_updated", handleBalanceUpdate);
      this.currentChannel.bind("App\\Events\\BalanceUpdated", handleBalanceUpdate);

      // Bind to cashout approved
      const handleCashoutApproved = (data: LiveCashoutEventData) => {
        const amt = data.requested_amount || data.amount || 0;
        broadcastCashoutStatusChange("APPROVED", amt);
        broadcastBalanceChange(0);
      };

      this.currentChannel.bind("cashout.approved", handleCashoutApproved);
      this.currentChannel.bind("CashoutApproved", handleCashoutApproved);
      this.currentChannel.bind("cash_out_approved", handleCashoutApproved);
      this.currentChannel.bind("App\\Events\\CashoutApproved", handleCashoutApproved);

      // Bind to cashout rejected
      const handleCashoutRejected = (data: LiveCashoutEventData) => {
        const amt = data.restored_amount || data.requested_amount || data.amount || 0;
        broadcastCashoutStatusChange("REJECTED", amt);
        if (amt > 0) {
          broadcastBalanceChange(amt);
        }
      };

      this.currentChannel.bind("cashout.rejected", handleCashoutRejected);
      this.currentChannel.bind("CashoutRejected", handleCashoutRejected);
      this.currentChannel.bind("cash_out_rejected", handleCashoutRejected);
      this.currentChannel.bind("App\\Events\\CashoutRejected", handleCashoutRejected);

      // Bind to unbind events from admin panel
      const handleUnbound = (data?: { balance?: number; current_balance?: number; status?: string }) => {
        console.log("🔌 WINBET Live Socket: Station Unbind / Deauthorize event received from server", data);
        const bal = typeof data?.current_balance === "number" ? data.current_balance : typeof data?.balance === "number" ? data.balance : undefined;
        broadcastStationUnbound(bal);
      };

      const unbindEventNames = [
        "machine.unbound",
        "MachineUnbound",
        "smart-pc.unbound",
        "smart_pc.unbound",
        "station.unbound",
        "StationUnbound",
        "unbind",
        "Unbind",
        "machine.deauthorized",
        "smart-pc.deauthorized",
        "station.deauthorized",
        "deauthorized",
        "machine.deleted",
        "smart-pc.deleted",
        "station.unassigned",
        "StationUnassigned",
        "App\\Events\\MachineUnbound",
        "App\\Events\\SmartPCUnbound",
        "App\\Events\\StationUnbound",
        "App\\Events\\MachineDeauthorized",
        "App\\Events\\MachineStatusUpdated",
      ];

      unbindEventNames.forEach((evt) => {
        this.currentChannel?.bind(evt, handleUnbound);
      });

      // Also subscribe to public channel variant
      const publicChannel = this.pusher.subscribe(publicChannelName);
      publicChannel.bind("balance.updated", handleBalanceUpdate);
      publicChannel.bind("BalanceUpdated", handleBalanceUpdate);
      publicChannel.bind("cashout.approved", handleCashoutApproved);
      publicChannel.bind("cashout.rejected", handleCashoutRejected);
      unbindEventNames.forEach((evt) => {
        publicChannel.bind(evt, handleUnbound);
      });

      // Subscribe to machine.* channel variant if different
      if (!channelName.startsWith("private-machine.")) {
        try {
          const machineChan = this.pusher.subscribe(`private-machine.${machineId}`);
          machineChan.bind("balance.updated", handleBalanceUpdate);
          unbindEventNames.forEach((evt) => machineChan.bind(evt, handleUnbound));
        } catch {}
      }
    } catch (err) {
      console.warn("Channel subscription error:", err);
    }
  }

  public disconnect() {
    if (this.currentChannel && this.pusher) {
      try {
        this.pusher.unsubscribe(this.currentChannel.name);
      } catch {}
      this.currentChannel = null;
    }
    if (this.pusher) {
      try {
        this.pusher.disconnect();
      } catch {}
      this.pusher = null;
    }
    this.isConnected = false;
    this.activeMachineId = null;
  }

  public getStatus() {
    return {
      isConnected: this.isConnected,
      machineId: this.activeMachineId,
    };
  }
}

export const liveSocket = new LiveSocketManager();
