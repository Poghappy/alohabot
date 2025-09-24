use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use tokio::time::{timeout, Duration};
use reqwest::Client;
use anyhow::{Result, anyhow};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ModelInfo {
    pub id: String,
    pub name: String,
    pub provider: String,
    pub status: String,
    pub description: Option<String>,
    pub capabilities: Option<Vec<String>>,
    pub max_tokens: Option<u32>,
    pub supports_vision: Option<bool>,
    pub supports_function_calling: Option<bool>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ModelGroup {
    pub name: String,
    pub models: Vec<String>,
    pub description: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LiteLLMConfig {
    pub model_list: Vec<ModelInfo>,
    pub model_groups: Vec<ModelGroup>,
    pub default_model: String,
    pub fallback_models: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TaskRequest {
    pub task_id: String,
    pub model_id: String,
    pub prompt: String,
    pub max_tokens: Option<u32>,
    pub temperature: Option<f32>,
    pub system_prompt: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TaskResponse {
    pub task_id: String,
    pub response: String,
    pub model_used: String,
    pub tokens_used: u32,
    pub response_time: f64,
    pub cost: Option<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ModelPerformance {
    pub model_id: String,
    pub average_response_time: f64,
    pub success_rate: f64,
    pub cost_per_token: f64,
    pub total_requests: u32,
    pub average_tokens_per_request: f64,
}

pub struct LiteLLMProxy {
    client: Client,
    base_url: String,
    master_key: String,
    config: LiteLLMConfig,
    performance_cache: HashMap<String, ModelPerformance>,
}

impl LiteLLMProxy {
    pub fn new(base_url: String, master_key: String) -> Self {
        let client = Client::new();
        
        // 默认配置
        let config = LiteLLMConfig {
            model_list: vec![
                ModelInfo {
                    id: "claude-3-5-sonnet".to_string(),
                    name: "Claude 3.5 Sonnet".to_string(),
                    provider: "Anthropic".to_string(),
                    status: "available".to_string(),
                    description: Some("最新的 Claude 模型，性能优秀".to_string()),
                    capabilities: Some(vec!["vision".to_string(), "function_calling".to_string()]),
                    max_tokens: Some(8192),
                    supports_vision: Some(true),
                    supports_function_calling: Some(true),
                },
                ModelInfo {
                    id: "gpt-4o".to_string(),
                    name: "GPT-4o".to_string(),
                    provider: "OpenAI".to_string(),
                    status: "available".to_string(),
                    description: Some("OpenAI 的最新模型".to_string()),
                    capabilities: Some(vec!["vision".to_string(), "function_calling".to_string()]),
                    max_tokens: Some(4096),
                    supports_vision: Some(true),
                    supports_function_calling: Some(true),
                },
                ModelInfo {
                    id: "local-qwen3-32b".to_string(),
                    name: "Qwen3 32B".to_string(),
                    provider: "Local".to_string(),
                    status: "available".to_string(),
                    description: Some("本地 Qwen3 模型，支持离线使用".to_string()),
                    capabilities: Some(vec!["function_calling".to_string()]),
                    max_tokens: Some(32768),
                    supports_vision: Some(false),
                    supports_function_calling: Some(true),
                },
            ],
            model_groups: vec![
                ModelGroup {
                    name: "smart-model".to_string(),
                    models: vec!["claude-3-5-sonnet".to_string(), "gpt-4o".to_string(), "local-qwen3-32b".to_string()],
                    description: "智能选择最佳模型".to_string(),
                },
                ModelGroup {
                    name: "fast-model".to_string(),
                    models: vec!["claude-3-5-haiku".to_string(), "gpt-4o-mini".to_string()],
                    description: "快速响应模型".to_string(),
                },
                ModelGroup {
                    name: "local-model".to_string(),
                    models: vec!["local-qwen3-32b".to_string(), "local-deepseek-v3".to_string()],
                    description: "本地模型，支持离线使用".to_string(),
                },
            ],
            default_model: "claude-3-5-sonnet".to_string(),
            fallback_models: vec!["gpt-4o".to_string(), "local-qwen3-32b".to_string()],
        };

        Self {
            client,
            base_url,
            master_key,
            config,
            performance_cache: HashMap::new(),
        }
    }

    /// 获取所有可用模型
    pub async fn get_available_models(&self) -> Result<Vec<ModelInfo>> {
        // 首先尝试从 LiteLLM 代理获取
        match self.fetch_models_from_proxy().await {
            Ok(models) => Ok(models),
            Err(_) => {
                // 如果代理不可用，返回默认模型
                log::warn!("LiteLLM proxy not available, using default models");
                Ok(self.config.model_list.clone())
            }
        }
    }

    /// 从 LiteLLM 代理获取模型列表
    async fn fetch_models_from_proxy(&self) -> Result<Vec<ModelInfo>> {
        let url = format!("{}/model/info", self.base_url);
        let response = timeout(
            Duration::from_secs(10),
            self.client
                .get(&url)
                .header("Authorization", format!("Bearer {}", self.master_key))
                .send()
        ).await??;

        if response.status().is_success() {
            let models: Vec<ModelInfo> = response.json().await?;
            Ok(models)
        } else {
            Err(anyhow!("Failed to fetch models: {}", response.status()))
        }
    }

    /// 智能选择最佳模型
    pub async fn select_best_model(&self, task_type: &str) -> Result<String> {
        // 根据任务类型选择模型组
        let model_group = match task_type {
            "vision" => "vision-model",
            "fast" => "fast-model",
            "local" => "local-model",
            "long-context" => "long-context",
            _ => "smart-model",
        };

        // 获取模型组中的模型
        if let Some(group) = self.config.model_groups.iter().find(|g| g.name == model_group) {
            // 选择性能最好的模型
            for model_id in &group.models {
                if let Some(performance) = self.performance_cache.get(model_id) {
                    if performance.success_rate > 0.9 {
                        return Ok(model_id.clone());
                    }
                }
            }
            
            // 如果没有性能数据，返回第一个可用模型
            if let Some(first_model) = group.models.first() {
                return Ok(first_model.clone());
            }
        }

        // 默认返回配置的默认模型
        Ok(self.config.default_model.clone())
    }

    /// 执行任务
    pub async fn execute_task(&self, request: TaskRequest) -> Result<TaskResponse> {
        let start_time = std::time::Instant::now();
        
        // 构建请求
        let request_body = serde_json::json!({
            "model": request.model_id,
            "messages": [
                {
                    "role": "system",
                    "content": request.system_prompt.unwrap_or_else(|| "你是一个有用的AI助手。".to_string())
                },
                {
                    "role": "user",
                    "content": request.prompt
                }
            ],
            "max_tokens": request.max_tokens.unwrap_or(1000),
            "temperature": request.temperature.unwrap_or(0.7)
        });

        let url = format!("{}/chat/completions", self.base_url);
        let response = timeout(
            Duration::from_secs(300), // 5分钟超时
            self.client
                .post(&url)
                .header("Authorization", format!("Bearer {}", self.master_key))
                .header("Content-Type", "application/json")
                .json(&request_body)
                .send()
        ).await??;

        let response_time = start_time.elapsed().as_secs_f64();

        if response.status().is_success() {
            let response_json: serde_json::Value = response.json().await?;
            
            // 解析响应
            let content = response_json["choices"][0]["message"]["content"]
                .as_str()
                .unwrap_or("")
                .to_string();
            
            let tokens_used = response_json["usage"]["total_tokens"]
                .as_u64()
                .unwrap_or(0) as u32;

            let task_response = TaskResponse {
                task_id: request.task_id,
                response: content,
                model_used: request.model_id.clone(),
                tokens_used,
                response_time,
                cost: None, // TODO: 计算成本
            };

            // 更新性能缓存
            self.update_performance_cache(&request.model_id, response_time, tokens_used, true).await;

            Ok(task_response)
        } else {
            // 更新性能缓存（失败）
            self.update_performance_cache(&request.model_id, response_time, 0, false).await;
            
            Err(anyhow!("Task execution failed: {}", response.status()))
        }
    }

    /// 更新性能缓存
    async fn update_performance_cache(&self, model_id: &str, response_time: f64, tokens_used: u32, success: bool) {
        // 这里应该更新性能缓存，但在实际实现中可能需要使用 Arc<Mutex<HashMap>>
        // 为了简化，这里只是记录日志
        log::info!(
            "Model {}: response_time={:.2}s, tokens={}, success={}",
            model_id, response_time, tokens_used, success
        );
    }

    /// 获取模型性能统计
    pub async fn get_model_performance(&self, model_id: &str) -> Result<ModelPerformance> {
        // 从缓存获取性能数据
        if let Some(performance) = self.performance_cache.get(model_id) {
            return Ok(performance.clone());
        }

        // 如果没有缓存数据，返回默认值
        Ok(ModelPerformance {
            model_id: model_id.to_string(),
            average_response_time: 0.0,
            success_rate: 1.0,
            cost_per_token: 0.0,
            total_requests: 0,
            average_tokens_per_request: 0.0,
        })
    }

    /// 检查 LiteLLM 代理状态
    pub async fn check_proxy_health(&self) -> Result<bool> {
        let url = format!("{}/health", self.base_url);
        let response = timeout(
            Duration::from_secs(5),
            self.client.get(&url).send()
        ).await??;

        Ok(response.status().is_success())
    }
}
