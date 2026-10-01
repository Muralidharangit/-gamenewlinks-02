export type MachineType = "smart-pc" | "terminal";

export interface Machine {
  name: string;
  type: MachineType;
  balance: number;
  shopName: string;
  location: string;
  action: string;
}

export interface GameItem {
  id: number | string;
  name: string;
  title: string;
  subtitle?: string;
  category: string;
  categories: string[];
  theme: "theme-red" | "theme-magenta" | "theme-gold" | "theme-blue" | "theme-purple" | "theme-green";
  badge?: {
    text: string;
    type: "hot" | "gold" | "live" | "cyan" | "green";
    icon?: string;
  };
  image: string;
  rtp?: string;
  multiplier?: string;
  players?: string;
  actionText?: string;
}

export interface ShopInfo {
  name: string;
  location: string;
  tagline?: string;
}

export interface TicketInfo {
  ticketNumber: string;
  amount: number;
  createdAt: string;
  machineName: string;
  shopName: string;
}

export type ValidationAlertType =
  | "NONE"
  | "SHOP_BALANCE_TOO_LOW"
  | "PRINTER_FAILED"
  | "NOTE_NOT_ACCEPTED"
  | "SCAN_AGAIN"
  | "TICKET_NOT_ACCEPTED"
  | "PRINTER_REQUIRED"
  | "CASHOUT_PENDING"
  | "CASHOUT_REJECTED"
  | "CASHOUT_APPROVED";

