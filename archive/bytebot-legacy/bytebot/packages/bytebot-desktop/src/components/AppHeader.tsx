import React from 'react';
import { ModelInfo } from '../types';
import './AppHeader.css';
import LanguageToggle from './LanguageToggle';
import ModelSelector from './ModelSelector';
import ThemeToggle from './ThemeToggle';

interface AppHeaderProps {
    models: ModelInfo[];
    selectedModel: string;
    onModelChange: (modelId: string) => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({
    models,
    selectedModel,
    onModelChange
}) => {
    return (
        <header className="app-header">
            <div className="app-header-left">
                <div className="app-logo">
                    <div className="logo-icon">🤖</div>
                    <div className="logo-text">
                        <h1>ByteBot Desktop</h1>
                        <span className="logo-subtitle">AI 智能助手</span>
                    </div>
                </div>
            </div>

            <div className="app-header-center">
                <div className="model-selector-wrapper">
                    <ModelSelector
                        models={models}
                        selectedModel={selectedModel}
                        onModelChange={onModelChange}
                    />
                </div>
            </div>

            <div className="app-header-right">
                <div className="header-actions">
                    <LanguageToggle />
                    <ThemeToggle />
                    <button
                        className="header-button"
                        title="设置"
                        aria-label="打开设置"
                    >
                        ⚙️
                    </button>
                    <button
                        className="header-button"
                        title="帮助"
                        aria-label="打开帮助"
                    >
                        ❓
                    </button>
                </div>
            </div>
        </header>
    );
};

export default AppHeader;
