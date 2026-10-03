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
  kind?: "provider" | "local";
  provider?: string;
  uuid?: string;
  choices?: string[];
  game_url?: string;
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
  | "CASHOUT_APPROVED"
  | "CHIPS_LOADED";

// PDF 4.1 Register Data Contract
export interface SmartPCRegisterPayload {
  portal_slug: string;
  registration_token: string;
  device_fingerprint: string;
  operating_system?: string;
}

export interface SmartPCRegisterData {
  id: number;
  machine_id: string;
  hostname?: string;
  terminal_name?: string;
  pc_name?: string;
  shop_id: number;
  shop_name: string;
  status: string;
  current_balance: number;
  player_id: number;
}

// PDF 4.3 Session Data Contract
export interface SmartPCSessionData {
  id: number;
  machine_id: string;
  hostname?: string;
  terminal_name?: string;
  pc_name?: string;
  status: string;
  current_balance: number;
  loaded_amount: number;
  player_id: number;
  shop_id: number;
  shop_name: string;
  pending_cash_out: null | {
    id: number;
    requested_amount: number;
    status: string;
    requested_at?: string;
  };
}

// PDF 4.4 Providers Contract
export interface SmartPCProviderItem {
  id: number;
  provider: string;
  game_count: number;
  images?: {
    logo?: string | null;
    name?: string | null;
    logo_name?: string | null;
  };
}

// PDF 4.5 Games Contract
export interface SmartPCGameItem {
  id: string | number;
  uuid?: string;
  name: string;
  category: string;
  description?: string;
  payout_label?: string;
  choices?: string[];
  kind: "provider" | "local";
  provider: string;
  image?: string | null;
  provider_image?: string | null;
  launcher?: string;
}

// PDF 4.6 Launch Provider Game Contract
export interface SmartPCLaunchGameResponse {
  game_url: string;
  game_name: string;
  provider: string;
  game_id: string | number;
  player_id: number;
}

// PDF 4.7 Place Bet Contract
export interface SmartPCPlaceBetResponse {
  game: string;
  game_name: string;
  choice: string;
  result: string;
  won: boolean;
  stake: number;
  payout: number;
  multiplier: number;
  current_balance: number;
  message: string;
  round_id?: string;
  transaction_id?: number;
  player_id: number;
}

// PDF 4.8 Cash-out Contract
export interface SmartPCCashoutData {
  id: number;
  machine_id: string;
  shop_machine_id?: number;
  pc_name?: string;
  shop_id: number;
  shop_name: string;
  player_id: number;
  requested_amount: number;
  approved_amount?: number | null;
  remarks?: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  requested_at: string;
  processed_at?: string | null;
}
