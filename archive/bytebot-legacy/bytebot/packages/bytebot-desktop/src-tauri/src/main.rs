// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{
    AppHandle, CustomMenuItem, Manager, SystemTray, SystemTrayEvent, SystemTrayMenu,
    SystemTrayMenuItem, WindowBuilder, WindowUrl, WindowEvent,
};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tokio::sync::Mutex;

mod llm_proxy;
mod system_integration;
use llm_proxy::{LiteLLMProxy, ModelInfo, TaskRequest, TaskResponse};
use system_integration::{SystemIntegration, SystemTray, GlobalShortcuts};

#[derive(Serialize, Deserialize)]
struct Task {
    id: String,
    title: String,
    description: String,
    status: String,
    progress: u8,
}

// ModelInfo 现在在 llm_proxy 模块中定义

// 全局状态
struct AppState {
    llm_proxy: Arc<Mutex<LiteLLMProxy>>,
    tasks: Arc<Mutex<Vec<Task>>>,
}

// Tauri commands
#[tauri::command]
async fn get_tasks(state: tauri::State<'_, AppState>) -> Result<Vec<Task>, String> {
    let tasks = state.tasks.lock().await;
    Ok(tasks.clone())
}

#[tauri::command]
async fn create_task(
    title: String, 
    description: String, 
    state: tauri::State<'_, AppState>
) -> Result<Task, String> {
    let mut tasks = state.tasks.lock().await;
    let new_task = Task {
        id: format!("{}", std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs()),
        title,
        description,
        status: "pending".to_string(),
        progress: 0,
    };
    tasks.push(new_task.clone());
    Ok(new_task)
}

#[tauri::command]
async fn get_available_models(state: tauri::State<'_, AppState>) -> Result<Vec<ModelInfo>, String> {
    let proxy = state.llm_proxy.lock().await;
    match proxy.get_available_models().await {
        Ok(models) => Ok(models),
        Err(e) => {
            log::error!("Failed to get models: {}", e);
            Err(format!("获取模型列表失败: {}", e))
        }
    }
}

#[tauri::command]
async fn execute_task(
    task_id: String, 
    model_id: String,
    state: tauri::State<'_, AppState>
) -> Result<TaskResponse, String> {
    // 更新任务状态为运行中
    {
        let mut tasks = state.tasks.lock().await;
        if let Some(task) = tasks.iter_mut().find(|t| t.id == task_id) {
            task.status = "running".to_string();
            task.progress = 10;
        }
    }

    let proxy = state.llm_proxy.lock().await;
    
    // 构建任务请求
    let request = TaskRequest {
        task_id: task_id.clone(),
        model_id: model_id.clone(),
        prompt: format!("请处理任务: {}", task_id),
        max_tokens: Some(1000),
        temperature: Some(0.7),
        system_prompt: Some("你是一个有用的AI助手，请帮助用户完成任务。".to_string()),
    };

    // 执行任务
    match proxy.execute_task(request).await {
        Ok(response) => {
            // 更新任务状态为完成
            {
                let mut tasks = state.tasks.lock().await;
                if let Some(task) = tasks.iter_mut().find(|t| t.id == task_id) {
                    task.status = "completed".to_string();
                    task.progress = 100;
                }
            }
            Ok(response)
        }
        Err(e) => {
            // 更新任务状态为失败
            {
                let mut tasks = state.tasks.lock().await;
                if let Some(task) = tasks.iter_mut().find(|t| t.id == task_id) {
                    task.status = "failed".to_string();
                    task.progress = 0;
                }
            }
            log::error!("Task execution failed: {}", e);
            Err(format!("任务执行失败: {}", e))
        }
    }
}

#[tauri::command]
async fn get_model_performance(
    model_id: String,
    state: tauri::State<'_, AppState>
) -> Result<llm_proxy::ModelPerformance, String> {
    let proxy = state.llm_proxy.lock().await;
    match proxy.get_model_performance(&model_id).await {
        Ok(performance) => Ok(performance),
        Err(e) => {
            log::error!("Failed to get model performance: {}", e);
            Err(format!("获取模型性能失败: {}", e))
        }
    }
}

#[tauri::command]
async fn select_best_model(
    task_type: String,
    state: tauri::State<'_, AppState>
) -> Result<String, String> {
    let proxy = state.llm_proxy.lock().await;
    match proxy.select_best_model(&task_type).await {
        Ok(model_id) => Ok(model_id),
        Err(e) => {
            log::error!("Failed to select best model: {}", e);
            Err(format!("选择最佳模型失败: {}", e))
        }
    }
}

fn main() {
    // 初始化日志
    env_logger::init();

    // 创建 LiteLLM 代理
    let base_url = std::env::var("LITELLM_PROXY_URL")
        .unwrap_or_else(|_| "http://localhost:4000".to_string());
    let master_key = std::env::var("LITELLM_MASTER_KEY")
        .unwrap_or_else(|_| "sk-litellm-master".to_string());
    
    let llm_proxy = Arc::new(Mutex::new(LiteLLMProxy::new(base_url, master_key)));
    let tasks = Arc::new(Mutex::new(Vec::<Task>::new()));

    let app_state = AppState {
        llm_proxy,
        tasks,
    };

    // 创建系统托盘
    let system_tray = SystemIntegration::create_system_tray();

    tauri::Builder::default()
        .manage(app_state)
        .system_tray(system_tray)
        .on_system_tray_event(|app, event| {
            SystemIntegration::handle_system_tray_event(app, event);
        })
        .invoke_handler(tauri::generate_handler![
            get_tasks,
            create_task,
            get_available_models,
            execute_task,
            get_model_performance,
            select_best_model,
            system_integration::get_app_directories,
            system_integration::show_notification,
            system_integration::minimize_to_tray,
            system_integration::restore_from_tray
        ])
        .setup(|app| {
            // 创建主窗口
            let window = WindowBuilder::new(app, "main", WindowUrl::App("index.html".into()))
                .title("ByteBot Desktop")
                .inner_size(1200.0, 800.0)
                .min_inner_size(800.0, 600.0)
                .build()?;

            // 设置全局快捷键
            if let Err(e) = SystemIntegration::setup_global_shortcuts(app) {
                log::error!("设置全局快捷键失败: {}", e);
            }

            // 设置窗口事件处理
            app.on_window_event(|event| {
                SystemIntegration::handle_window_event(&event);
            });

            log::info!("ByteBot Desktop application started successfully");
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
