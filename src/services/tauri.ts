import { invoke } from "@tauri-apps/api/core";

export interface NativeMachineInfo {
  os: string;
  hostname: string;
  platform: string;
  arch: string;
  app_version: string;
  is_kiosk: boolean;
}

export interface NativeHardwareStatus {
  printer_connected: boolean;
  printer_name: string;
  scanner_connected: boolean;
  bill_acceptor_connected: boolean;
  status_message: string;
}

export interface NativePrintTicketPayload {
  ticket_number: string;
  amount: number;
  machine_name: string;
  shop_name: string;
  created_at: string;
  barcode?: string;
}

export interface NativePrintTicketResponse {
  success: boolean;
  message: string;
  printed_at: string;
}

export const isTauri = (): boolean => {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
};

export const getNativeMachineInfo = async (): Promise<NativeMachineInfo | null> => {
  if (!isTauri()) return null;
  try {
    return await invoke<NativeMachineInfo>("get_machine_information");
  } catch (err) {
    console.warn("Failed to get native machine information:", err);
    return null;
  }
};

export const getNativeHardwareStatus = async (): Promise<NativeHardwareStatus | null> => {
  if (!isTauri()) return null;
  try {
    return await invoke<NativeHardwareStatus>("get_hardware_status");
  } catch (err) {
    console.warn("Failed to get native hardware status:", err);
    return null;
  }
};

export const printTicketNative = async (
  payload: NativePrintTicketPayload
): Promise<NativePrintTicketResponse | null> => {
  if (!isTauri()) return null;
  try {
    return await invoke<NativePrintTicketResponse>("print_ticket_native", { payload });
  } catch (err) {
    console.warn("Failed to execute native print ticket:", err);
    return null;
  }
};
