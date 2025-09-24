import React from 'react';
import { ModelInfo } from '../types';
import './ModelSelector.css';

interface ModelSelectorProps {
    models: ModelInfo[];
    selectedModel: string;
    onModelChange: (modelId: string) => void;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({
    models,
    selectedModel,
    onModelChange
}) => {
    const getStatusColor = (status: ModelInfo['status']) => {
        switch (status) {
            case 'available':
                return '#10b981';
            case 'unavailable':
                return '#ef4444';
            case 'loading':
                return '#f59e0b';
            default:
                return '#6b7280';
        }
    };

    const getStatusText = (status: ModelInfo['status']) => {
        switch (status) {
            case 'available':
                return '可用';
            case 'unavailable':
                return '不可用';
            case 'loading':
                return '加载中';
            default:
                return '未知';
        }
    };

    return (
        <div className="model-selector">
            <label className="model-label">选择模型:</label>
            <select
                className="model-select"
                value={selectedModel}
                onChange={(e) => onModelChange(e.target.value)}
            >
                {models.map((model) => (
                    <option key={model.id} value={model.id}>
                        {model.name} ({model.provider})
                    </option>
                ))}
            </select>

            {selectedModel && (
                <div className="model-info">
                    {(() => {
                        const model = models.find(m => m.id === selectedModel);
                        if (!model) return null;

                        return (
                            <div className="model-details">
                                <div className="model-name">
                                    {model.name}
                                    <span
                                        className="model-status"
                                        style={{ color: getStatusColor(model.status) }}
                                    >
                                        {getStatusText(model.status)}
                                    </span>
                                </div>
                                <div className="model-provider">{model.provider}</div>
                                {model.description && (
                                    <div className="model-description">{model.description}</div>
                                )}
                            </div>
                        );
                    })()}
                </div>
            )}
        </div>
    );
};

export default ModelSelector;
