import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
// Tauri 类型定义
declare global {
    interface Window {
        __TAURI__?: {
            invoke: (command: string, args?: any) => Promise<any>;
        };
    }
}

// 检查是否在 Tauri 环境中
const isTauri = window.__TAURI__ !== undefined;

if (isTauri) {
    console.log('运行在 Tauri 桌面环境中');
} else {
    console.log('运行在 Web 开发环境中');
}

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);

root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
