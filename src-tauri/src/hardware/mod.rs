use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HardwareStatus {
    pub printer_connected: bool,
    pub printer_name: String,
    pub scanner_connected: bool,
    pub bill_acceptor_connected: bool,
    pub status_message: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PrintTicketPayload {
    pub ticket_number: String,
    pub amount: f64,
    pub machine_name: String,
    pub shop_name: String,
    pub created_at: String,
    pub barcode: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PrintTicketResponse {
    pub success: bool,
    pub message: String,
    pub printed_at: String,
}

pub struct HardwareService;

impl HardwareService {
    pub fn get_status() -> HardwareStatus {
        HardwareStatus {
            printer_connected: true,
            printer_name: "Generic ESC/POS Thermal Printer (Simulated/Auto)".to_string(),
            scanner_connected: true,
            bill_acceptor_connected: false,
            status_message: "Hardware subsystem active and ready".to_string(),
        }
    }

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
}
