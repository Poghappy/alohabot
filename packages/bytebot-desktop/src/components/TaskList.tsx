import React, { useState } from 'react';
import { Task } from '../types';
import './TaskList.css';

interface TaskListProps {
    tasks: Task[];
    onExecuteTask: (taskId: string) => void;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, onExecuteTask }) => {
  const [expandedTask, setExpandedTask] = useState<string | null>(null);

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'pending':
        return 'var(--color-accent-warning)';
      case 'running':
        return 'var(--color-accent-info)';
      case 'completed':
        return 'var(--color-accent-success)';
      case 'failed':
        return 'var(--color-accent-error)';
      default:
        return 'var(--color-text-tertiary)';
    }
  };

  const getStatusText = (status: Task['status']) => {
    switch (status) {
      case 'pending':
        return '等待中';
      case 'running':
        return '执行中';
      case 'completed':
        return '已完成';
      case 'failed':
        return '失败';
      default:
        return '未知';
    }
  };

  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'pending':
        return '⏳';
      case 'running':
        return '🔄';
      case 'completed':
        return '✅';
      case 'failed':
        return '❌';
      default:
        return '❓';
    }
  };

  const toggleExpanded = (taskId: string) => {
    setExpandedTask(expandedTask === taskId ? null : taskId);
  };

    if (tasks.length === 0) {
        return (
            <div className="task-list">
                <div className="empty-state">
                    <div className="empty-icon">📝</div>
                    <h3>暂无任务</h3>
                    <p>创建你的第一个任务开始使用 ByteBot</p>
                </div>
            </div>
        );
    }

    return (
        <div className="task-list">
            <div className="task-list-header">
                <h2>任务列表</h2>
                <span className="task-count">{tasks.length} 个任务</span>
            </div>

            <div className="task-items">
                {tasks.map((task) => (
                    <div key={task.id} className="task-item">
                        <div className="task-header">
                            <h3 className="task-title">{task.title}</h3>
                            <div className="task-status">
                                <span
                                    className="status-badge"
                                    style={{ backgroundColor: getStatusColor(task.status) }}
                                >
                                    {getStatusText(task.status)}
                                </span>
                            </div>
                        </div>

                        <p className="task-description">{task.description}</p>

                        <div className="task-progress">
                            <div className="progress-bar">
                                <div
                                    className="progress-fill"
                                    style={{ width: `${task.progress}%` }}
                                />
                            </div>
                            <span className="progress-text">{task.progress}%</span>
                        </div>

                        <div className="task-actions">
                            <button
                                className="action-button primary"
                                onClick={() => onExecuteTask(task.id)}
                                disabled={task.status === 'running'}
                            >
                                {task.status === 'running' ? '执行中...' : '执行任务'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TaskList;
