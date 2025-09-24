import { invoke } from '@tauri-apps/api/core';
import React, { useEffect, useState } from 'react';
import './App.css';
import AppHeader from './components/AppHeader';
import CreateTaskForm from './components/CreateTaskForm';
import TaskList from './components/TaskList';
import { I18nProvider, useI18n } from './hooks/useI18n';
import { ThemeProvider } from './hooks/useTheme';
import { ModelInfo, Task, TaskResponse } from './types';

// 内部应用组件，可以使用国际化 Hook
const AppContent: React.FC = () => {
    const { t } = useI18n();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [models, setModels] = useState<ModelInfo[]>([]);
    const [selectedModel, setSelectedModel] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);

            // 并行加载任务和模型数据
            const [tasksData, modelsData] = await Promise.all([
                invoke<Task[]>('get_tasks'),
                invoke<ModelInfo[]>('get_available_models')
            ]);

            setTasks(tasksData);
            setModels(modelsData);

            // 设置默认模型
            if (modelsData.length > 0) {
                setSelectedModel(modelsData[0].id);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : t('error.serverError'));
            console.error('加载数据失败:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTask = async (title: string, description: string) => {
        try {
            const newTask = await invoke<Task>('create_task', { title, description });
            setTasks(prev => [...prev, newTask]);
        } catch (err) {
            setError(err instanceof Error ? err.message : t('error.taskFailed'));
            console.error('创建任务失败:', err);
        }
    };

    const handleExecuteTask = async (taskId: string) => {
        if (!selectedModel) {
            setError(t('error.modelNotFound'));
            return;
        }

        try {
            const result = await invoke<TaskResponse>('execute_task', {
                taskId,
                modelId: selectedModel
            });

            console.log('任务执行结果:', result);
            console.log(`模型: ${result.model_used}, 耗时: ${result.response_time.toFixed(2)}s, Token: ${result.tokens_used}`);

            // 更新任务状态
            setTasks(prev => prev.map(task =>
                task.id === taskId
                    ? { ...task, status: 'completed', progress: 100 }
                    : task
            ));

            // 显示成功消息
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : t('error.taskFailed'));
            console.error('执行任务失败:', err);

            // 更新任务状态为失败
            setTasks(prev => prev.map(task =>
                task.id === taskId
                    ? { ...task, status: 'failed', progress: 0 }
                    : task
            ));
        }
    };

    if (loading) {
        return (
            <div className="app">
                <div className="loading">
                    <div className="spinner"></div>
                    <div>{t('app.loading')}</div>
                </div>
            </div>
        );
    }

    return (
        <div className="app">
            <AppHeader
                models={models}
                selectedModel={selectedModel}
                onModelChange={setSelectedModel}
            />

            <main className="app-main">
                {error && (
                    <div className="error-banner">
                        <span>{error}</span>
                        <button onClick={() => setError(null)}>×</button>
                    </div>
                )}

                <div className="app-content">
                    <div className="sidebar">
                        <CreateTaskForm onCreateTask={handleCreateTask} />
                    </div>

                    <div className="main-content">
                        <TaskList
                            tasks={tasks}
                            onExecuteTask={handleExecuteTask}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
};

// 主应用组件，包装所有 Provider
const App: React.FC = () => {
    return (
        <ThemeProvider>
            <I18nProvider>
                <AppContent />
            </I18nProvider>
        </ThemeProvider>
    );
};

export default App;
