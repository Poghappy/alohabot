use anyhow::Result;
use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use tauri::{
    AppHandle, CustomMenuItem, Manager, SystemTray, SystemTrayEvent, SystemTrayMenu,
    SystemTrayMenuItem, Window, WindowEvent,
};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SystemTray {
    pub show_hide: bool,
    pub quit: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GlobalShortcuts {
    pub show_hide: String,
    pub quick_task: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SystemIntegration {
    pub tray: SystemTray,
    pub shortcuts: GlobalShortcuts,
}

impl Default for SystemIntegration {
    fn default() -> Self {
        Self {
            tray: SystemTray {
                show_hide: true,
                quit: true,
            },
            shortcuts: GlobalShortcuts {
                show_hide: "CmdOrCtrl+Shift+B".to_string(),
                quick_task: "CmdOrCtrl+Shift+T".to_string(),
            },
        }
    }
}

impl SystemIntegration {
    pub fn create_system_tray() -> SystemTray {
        let show = CustomMenuItem::new("show".to_string(), "显示 ByteBot");
        let hide = CustomMenuItem::new("hide".to_string(), "隐藏 ByteBot");
        let quit = CustomMenuItem::new("quit".to_string(), "退出");

        let tray_menu = SystemTrayMenu::new()
            .add_item(show)
            .add_native_item(SystemTrayMenuItem::Separator)
            .add_item(hide)
            .add_native_item(SystemTrayMenuItem::Separator)
            .add_item(quit);

        SystemTray::new().with_menu(tray_menu)
    }

    pub fn setup_global_shortcuts(app_handle: &AppHandle) -> Result<()> {
        let integration = SystemIntegration::default();

        // 显示/隐藏快捷键
        app_handle
            .global_shortcut_manager()
            .register(&integration.shortcuts.show_hide, || {
                let window = app_handle.get_window("main").unwrap();
                if window.is_visible().unwrap_or(false) {
                    let _ = window.hide();
                } else {
                    let _ = window.show();
                    let _ = window.set_focus();
                }
            })?;

        // 快速任务快捷键
        app_handle
            .global_shortcut_manager()
            .register(&integration.shortcuts.quick_task, || {
                let window = app_handle.get_window("main").unwrap();
                if !window.is_visible().unwrap_or(false) {
                    let _ = window.show();
                    let _ = window.set_focus();
                }
                // 发送快速任务事件到前端
                let _ = window.emit("quick-task", ());
            })?;

        Ok(())
    }

    pub fn handle_system_tray_event(app_handle: &AppHandle, event: SystemTrayEvent) {
        match event {
            SystemTrayEvent::LeftClick {
                position: _,
                size: _,
                ..
            } => {
                // 左键点击显示/隐藏窗口
                if let Some(window) = app_handle.get_window("main") {
                    if window.is_visible().unwrap_or(false) {
                        let _ = window.hide();
                    } else {
                        let _ = window.show();
                        let _ = window.set_focus();
                    }
                }
            }
            SystemTrayEvent::MenuItemClick { id, .. } => {
                match id.as_str() {
                    "show" => {
                        if let Some(window) = app_handle.get_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                    "hide" => {
                        if let Some(window) = app_handle.get_window("main") {
                            let _ = window.hide();
                        }
                    }
                    "quit" => {
                        app_handle.exit(0);
                    }
                    _ => {}
                }
            }
            _ => {}
        }
    }

    pub fn handle_window_event(event: &WindowEvent) {
        match event {
            WindowEvent::CloseRequested { api, .. } => {
                // 阻止默认关闭行为，改为隐藏到系统托盘
                api.prevent_close();
                if let Some(window) = event.window() {
                    let _ = window.hide();
                }
            }
            _ => {}
        }
    }

    pub fn get_app_data_dir() -> Result<PathBuf> {
        let data_dir = dirs::data_dir()
            .ok_or_else(|| anyhow::anyhow!("无法获取应用数据目录"))?
            .join("bytebot-desktop");
        
        std::fs::create_dir_all(&data_dir)?;
        Ok(data_dir)
    }

    pub fn get_config_dir() -> Result<PathBuf> {
        let config_dir = dirs::config_dir()
            .ok_or_else(|| anyhow::anyhow!("无法获取配置目录"))?
            .join("bytebot-desktop");
        
        std::fs::create_dir_all(&config_dir)?;
        Ok(config_dir)
    }

    pub fn get_cache_dir() -> Result<PathBuf> {
        let cache_dir = dirs::cache_dir()
            .ok_or_else(|| anyhow::anyhow!("无法获取缓存目录"))?
            .join("bytebot-desktop");
        
        std::fs::create_dir_all(&cache_dir)?;
        Ok(cache_dir)
    }
}

// Tauri 命令
#[tauri::command]
pub async fn get_app_directories() -> Result<serde_json::Value, String> {
    let app_data = SystemIntegration::get_app_data_dir()
        .map_err(|e| e.to_string())?;
    let config = SystemIntegration::get_config_dir()
        .map_err(|e| e.to_string())?;
    let cache = SystemIntegration::get_cache_dir()
        .map_err(|e| e.to_string())?;

    Ok(serde_json::json!({
        "app_data": app_data.to_string_lossy(),
        "config": config.to_string_lossy(),
        "cache": cache.to_string_lossy()
    }))
}

#[tauri::command]
pub async fn show_notification(title: &str, body: &str) -> Result<(), String> {
    // 这里可以添加系统通知逻辑
    log::info!("通知: {} - {}", title, body);
    Ok(())
}

#[tauri::command]
pub async fn minimize_to_tray(window: Window) -> Result<(), String> {
    window.hide().map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn restore_from_tray(window: Window) -> Result<(), String> {
    window.show().map_err(|e| e.to_string())?;
    window.set_focus().map_err(|e| e.to_string())?;
    Ok(())
}
