export interface Task {
    id: string;
    title: string;
    description: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    progress: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface ModelInfo {
    id: string;
    name: string;
    provider: string;
    status: 'available' | 'unavailable' | 'loading';
    description?: string;
    capabilities?: string[];
    max_tokens?: number;
    supports_vision?: boolean;
    supports_function_calling?: boolean;
}

export interface CreateTaskRequest {
    title: string;
    description: string;
    priority?: 'low' | 'medium' | 'high';
    modelId?: string;
}

export interface ExecuteTaskRequest {
    taskId: string;
    modelId: string;
    parameters?: Record<string, any>;
}

export interface TaskResponse {
    task_id: string;
    response: string;
    model_used: string;
    tokens_used: number;
    response_time: number;
    cost?: number;
}

export interface ModelPerformance {
    model_id: string;
    average_response_time: number;
    success_rate: number;
    cost_per_token: number;
    total_requests: number;
    average_tokens_per_request: number;
}
