use serde::{Deserialize, Serialize};
use std::env;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MachineInfo {
    pub os: String,
    pub hostname: String,
    pub platform: String,
    pub arch: String,
    pub app_version: String,
    pub is_kiosk: bool,
}

pub struct SystemService;

impl SystemService {
    pub fn get_machine_info() -> MachineInfo {
        let hostname = env::var("HOSTNAME")
            .or_else(|_| env::var("HOST"))
            .unwrap_or_else(|_| "smart-pc-linux".to_string());

        let os_name = std::env::consts::OS.to_string();
        let arch = std::env::consts::ARCH.to_string();

        MachineInfo {
            os: format!("Linux ({})", os_name),
            hostname,
            platform: "linux".to_string(),
            arch,
            app_version: env!("CARGO_PKG_VERSION").to_string(),
            is_kiosk: true,
        }
    }
}
