# ByteBot 桌面应用打包方案

## 🎯 项目目标
将 ByteBot 打包成原生桌面应用，支持 Mac 和 Windows 平台

## 🏆 推荐方案：Tauri + Rust

### 为什么选择 Tauri？
- **体积小**：比 Electron 小 10-20 倍
- **性能高**：原生性能，内存占用低
- **安全性强**：Rust 内存安全，权限控制精细
- **跨平台**：一套代码支持 Mac、Windows、Linux
- **现代化**：支持现代 Web 技术栈

### 技术架构
```
┌─────────────────────────────────────┐
│           Tauri 桌面应用            │
├─────────────────────────────────────┤
│ 前端层 (React/Next.js)              │
│ - 现有 ByteBot UI 界面              │
│ - 任务管理、桌面控制界面             │
├─────────────────────────────────────┤
│ 后端层 (Rust + Tauri)               │
│ - Docker 容器管理                   │
│ - 系统 API 调用                     │
│ - 文件系统操作                      │
├─────────────────────────────────────┤
│ 系统层                              │
│ - Docker Desktop 集成              │
│ - 系统权限管理                      │
│ - 原生通知和菜单                    │
└─────────────────────────────────────┘
```

## 📋 实施步骤

### 阶段 1: 环境准备
1. **安装 Rust**
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   ```

2. **安装 Tauri CLI**
   ```bash
   cargo install tauri-cli
   ```

3. **安装系统依赖**
   - Mac: Xcode Command Line Tools
   - Windows: Visual Studio Build Tools

### 阶段 2: 项目结构改造
```
bytebot-desktop/
├── src-tauri/           # Rust 后端
│   ├── src/
│   │   ├── main.rs      # 主程序入口
│   │   ├── docker.rs    # Docker 管理
│   │   ├── commands.rs  # Tauri 命令
│   │   └── lib.rs       # 核心逻辑
│   ├── Cargo.toml       # Rust 依赖
│   └── tauri.conf.json  # Tauri 配置
├── src/                 # 前端代码（现有）
│   ├── components/
│   ├── pages/
│   └── ...
├── public/              # 静态资源
└── package.json         # 前端依赖
```

### 阶段 3: 核心功能实现

#### 3.1 Docker 集成
```rust
// src-tauri/src/docker.rs
use tauri::command;
use std::process::Command;

#[command]
pub async fn start_bytebot() -> Result<String, String> {
    // 启动 Docker 容器
    let output = Command::new("docker")
        .args(&["compose", "-f", "docker/docker-compose.m4pro.yml", "up", "-d"])
        .output()
        .map_err(|e| e.to_string())?;
    
    Ok(String::from_utf8_lossy(&output.stdout).to_string())
}

#[command]
pub async fn stop_bytebot() -> Result<String, String> {
    // 停止 Docker 容器
    let output = Command::new("docker")
        .args(&["compose", "-f", "docker/docker-compose.m4pro.yml", "down"])
        .output()
        .map_err(|e| e.to_string())?;
    
    Ok(String::from_utf8_lossy(&output.stdout).to_string())
}
```

#### 3.2 系统集成
```rust
// src-tauri/src/commands.rs
use tauri::command;

#[command]
pub async fn get_system_info() -> Result<SystemInfo, String> {
    // 获取系统信息
    Ok(SystemInfo {
        os: std::env::consts::OS.to_string(),
        arch: std::env::consts::ARCH.to_string(),
        docker_installed: check_docker_installed(),
    })
}

#[command]
pub async fn open_browser(url: String) -> Result<(), String> {
    // 打开浏览器
    open::that(url).map_err(|e| e.to_string())
}
```

### 阶段 4: 前端集成
```typescript
// src/services/tauri.ts
import { invoke } from '@tauri-apps/api/tauri';

export class TauriService {
  static async startByteBot(): Promise<string> {
    return await invoke('start_bytebot');
  }
  
  static async stopByteBot(): Promise<string> {
    return await invoke('stop_bytebot');
  }
  
  static async getSystemInfo(): Promise<SystemInfo> {
    return await invoke('get_system_info');
  }
}
```

### 阶段 5: 打包配置

#### 5.1 Tauri 配置
```json
// src-tauri/tauri.conf.json
{
  "build": {
    "beforeDevCommand": "npm run dev",
    "beforeBuildCommand": "npm run build",
    "devPath": "http://localhost:3000",
    "distDir": "../dist"
  },
  "package": {
    "productName": "ByteBot Desktop",
    "version": "1.0.0"
  },
  "tauri": {
    "allowlist": {
      "all": false,
      "shell": {
        "all": false,
        "open": true
      },
      "dialog": {
        "all": false,
        "open": true,
        "save": true
      }
    },
    "bundle": {
      "active": true,
      "targets": "all",
      "identifier": "com.bytebot.desktop",
      "icon": [
        "icons/32x32.png",
        "icons/128x128.png",
        "icons/128x128@2x.png",
        "icons/icon.icns",
        "icons/icon.ico"
      ]
    },
    "security": {
      "csp": null
    }
  }
}
```

#### 5.2 构建脚本
```json
// package.json
{
  "scripts": {
    "tauri:dev": "tauri dev",
    "tauri:build": "tauri build",
    "tauri:build:mac": "tauri build --target aarch64-apple-darwin",
    "tauri:build:win": "tauri build --target x86_64-pc-windows-msvc"
  }
}
```

## 🚀 快速开始

### 1. 创建 Tauri 项目
```bash
# 在现有 ByteBot 项目中
npm create tauri-app@latest bytebot-desktop
cd bytebot-desktop
```

### 2. 集成现有代码
```bash
# 复制现有前端代码
cp -r ../bytebot/packages/bytebot-ui/* src/
cp -r ../bytebot/docker ./
```

### 3. 开发模式
```bash
npm run tauri:dev
```

### 4. 构建应用
```bash
# 构建所有平台
npm run tauri:build

# 仅构建 Mac
npm run tauri:build:mac

# 仅构建 Windows
npm run tauri:build:win
```

## 📦 输出文件

### Mac 平台
- `ByteBot Desktop.app` - 应用程序包
- `ByteBot Desktop.dmg` - 安装镜像
- `ByteBot Desktop.pkg` - 安装包

### Windows 平台
- `ByteBot Desktop.exe` - 可执行文件
- `ByteBot Desktop.msi` - Windows 安装包
- `ByteBot Desktop Setup.exe` - 安装程序

## 🔧 高级功能

### 1. 自动更新
```rust
// 集成 Tauri 自动更新
use tauri::updater::UpdaterExt;

#[command]
pub async fn check_update() -> Result<Option<Update>, String> {
    let updater = app.updater().map_err(|e| e.to_string())?;
    let update = updater.check().await.map_err(|e| e.to_string())?;
    Ok(update)
}
```

### 2. 系统托盘
```rust
// 添加系统托盘功能
use tauri::{CustomMenuItem, SystemTray, SystemTrayMenu};

let quit = CustomMenuItem::new("quit".to_string(), "退出");
let show = CustomMenuItem::new("show".to_string(), "显示");
let tray_menu = SystemTrayMenu::new()
    .add_item(show)
    .add_item(quit);
let system_tray = SystemTray::new().with_menu(tray_menu);
```

### 3. 原生通知
```rust
// 系统通知
use tauri::api::notification::Notification;

#[command]
pub async fn show_notification(title: String, body: String) -> Result<(), String> {
    Notification::new(&app_handle)
        .title(&title)
        .body(&body)
        .show()
        .map_err(|e| e.to_string())
}
```

## 🎯 预期效果

### 用户体验
- ✅ **一键安装**：用户下载后直接安装使用
- ✅ **原生体验**：系统级集成，菜单栏、通知等
- ✅ **自动启动**：开机自启动，后台运行
- ✅ **离线使用**：不依赖网络，本地运行

### 技术优势
- ✅ **体积小**：最终应用 < 50MB
- ✅ **性能高**：启动时间 < 3 秒
- ✅ **兼容性好**：支持 macOS 10.15+ 和 Windows 10+
- ✅ **安全性强**：沙盒运行，权限控制

## 📈 后续扩展

### 1. 移动端支持
- 使用 Tauri Mobile 扩展到 iOS/Android
- 支持手机端远程控制

### 2. 企业功能
- 多用户管理
- 云端同步
- 企业级安全

### 3. 插件系统
- 支持第三方插件
- 自定义工作流
- 社区生态

---

> 💡 这个方案将让你的 ByteBot 成为真正的桌面应用，用户无需了解 Docker 或命令行，就能享受 AI 桌面智能体的强大功能！
