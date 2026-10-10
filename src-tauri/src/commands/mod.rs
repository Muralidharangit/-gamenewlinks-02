use crate::hardware::{HardwareService, HardwareStatus, PrintTicketPayload, PrintTicketResponse};
use crate::services::{MachineInfo, SystemService};

#[tauri::command]
pub fn get_machine_information() -> Result<MachineInfo, String> {
    Ok(SystemService::get_machine_info())
}

#[tauri::command]
pub fn get_hardware_status() -> Result<HardwareStatus, String> {
    Ok(HardwareService::get_status())
}

#[tauri::command]
pub fn print_ticket_native(payload: PrintTicketPayload) -> Result<PrintTicketResponse, String> {
    HardwareService::print_ticket(payload)
}

#[tauri::command]
pub fn get_system_time() -> Result<String, String> {
    Ok(std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| d.as_secs().to_string())
        .unwrap_or_default())
}
