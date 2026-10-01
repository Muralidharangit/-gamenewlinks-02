import { VALID_SETUP_CODE, machineConfig, shop } from "../constants/machine";
import type { Machine, MachineType, TicketInfo } from "../types";
import { generateTicketNumber } from "../utils/formatCurrency";

export interface RegistrationRequest {
  setupCode: string;
  machineType: MachineType;
}

export interface RegistrationResponse {
  success: boolean;
  message?: string;
  machine?: Machine;
}

export const api = {
  /**
   * Validate setup code and register machine
   */
  async registerMachine(req: RegistrationRequest): Promise<RegistrationResponse> {
    // Mock network latency
    await new Promise((resolve) => setTimeout(resolve, 300));

    if (req.setupCode.trim().toUpperCase() !== VALID_SETUP_CODE) {
      return {
        success: false,
        message: "Invalid Setup Code. Please check the code and try again.",
      };
    }

    const config = req.machineType === "smart-pc" ? machineConfig.smartPc : machineConfig.terminal;
    return {
      success: true,
      machine: { ...config },
    };
  },

  /**
   * Cash out request for Smart PC
   */
  async cashOutSmartPC(machineName: string, amount: number): Promise<{ success: boolean; message: string }> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return {
      success: true,
      message: `Cash Out of N$ ${amount.toFixed(2)} confirmed for ${machineName}. Cashier will redeem at counter.`,
    };
  },

  /**
   * Print Ticket request for Terminal
   */
  async printTerminalTicket(machineName: string, amount: number): Promise<{ success: boolean; ticket: TicketInfo }> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const ticket: TicketInfo = {
      ticketNumber: generateTicketNumber(),
      amount,
      createdAt: new Date().toISOString(),
      machineName,
      shopName: shop.name,
    };
    return {
      success: true,
      ticket,
    };
  },
};
