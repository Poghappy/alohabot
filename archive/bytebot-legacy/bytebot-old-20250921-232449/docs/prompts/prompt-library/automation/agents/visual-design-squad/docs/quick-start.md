# Visual Design Squad Agent 快速开始指南

## 🚀 快速启动

### 1. 环境准备

#### 系统要求
- macOS 10.15+ 或 Linux
- Node.js 16+ 
- Docker (可选，用于容器化部署)
- Trae IDE

#### 检查环境
```bash
# 检查 Node.js 版本
node --version

# 检查 npm 版本
npm --version

# 检查 Docker 版本（可选）
docker --version
```

### 2. 项目初始化

#### 步骤 1：进入项目目录
```bash
cd visual-design-squad
```

#### 步骤 2：运行初始化脚本
```bash
# 运行环境初始化
./scripts/setup/init.sh
```

#### 步骤 3：配置环境变量
```bash
# 复制环境配置模板
cp .env.template .env

# 编辑配置文件
nano .env
```

**重要配置项：**
```bash
# Trae IDE 配置
TRAE_API_URL=http://localhost:3000
TRAE_WORKSPACE_PATH=/path/to/your/workspace

# Agent 配置
AGENT_MODE=development
AGENT_LOG_LEVEL=info

# MCP 工具配置
MCP_SERVER_URL=http://localhost:8080
```

### 3. 启动服务

#### 方式 1：使用启动脚本（推荐）
```bash
# 启动所有服务
./scripts/deploy/start.sh
```

#### 方式 2：手动启动
```bash
# 加载环境变量
source .env

# 启动 Agent 服务
npm start
```

### 4. 验证安装

#### 检查服务状态
```bash
# 检查 Agent 状态
curl http://localhost:3000/health

# 检查 MCP 工具状态
curl http://localhost:8080/health
```

#### 查看日志
```bash
# 查看启动日志
tail -f logs/system/startup.log

# 查看 Agent 日志
tail -f logs/agents/main.log
```

## 🎯 基本使用

### 1. 创建第一个设计任务

#### 通过 Trae IDE
1. 打开 Trae IDE
2. 创建新项目或打开现有项目
3. 在 Agent 面板中选择 "Visual Design Squad"
4. 输入设计需求描述

#### 通过 API
```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "type": "ui_design",
    "description": "设计一个现代化的登录页面",
    "requirements": {
      "style": "modern",
      "colors": ["#007AFF", "#FFFFFF"],
      "components": ["form", "button", "logo"]
    }
  }'
```

### 2. 监控任务进度

#### 查看任务列表
```bash
curl http://localhost:3000/api/tasks
```

#### 查看特定任务
```bash
curl http://localhost:3000/api/tasks/{task_id}
```

### 3. 获取设计产物

设计完成后，产物将保存在：
- `assets/outputs/` - 生成的设计文件
- `docs/deliverables/` - 设计文档
- `logs/tasks/` - 任务执行日志

## 🛠️ 常用命令

### 服务管理
```bash
# 启动服务
./scripts/deploy/start.sh

# 停止服务
./scripts/deploy/stop.sh

# 重启服务
./scripts/deploy/restart.sh

# 查看服务状态
./scripts/utils/status.sh
```

### 配置管理
```bash
# 验证配置
./scripts/utils/validate-config.sh

# 重新加载配置
./scripts/utils/reload-config.sh

# 备份配置
./scripts/utils/backup-config.sh
```

### 日志管理
```bash
# 查看实时日志
./scripts/utils/tail-logs.sh

# 收集日志
./scripts/utils/collect-logs.sh

# 清理日志
./scripts/utils/clean-logs.sh
```

### 故障排除
```bash
# 运行诊断
./scripts/utils/diagnostic.sh

# 修复环境配置文件
./scripts/utils/fix-env-template.sh

# 重置环境
./scripts/utils/reset-env.sh
```

## 📋 配置说明

### 核心配置文件

#### `.env` - 环境变量配置
主要的环境配置文件，包含所有运行时参数。

#### `config/agents/trae_agent_configs.json` - Agent 配置
```json
{
  "agents": {
    "product_owner": {
      "role": "产品负责人",
      "capabilities": ["需求分析", "验收标准定义"],
      "max_concurrent_tasks": 3
    },
    "solution_architect": {
      "role": "解决方案架构师", 
      "capabilities": ["技术方案设计", "架构评审"],
      "max_concurrent_tasks": 2
    }
  }
}
```

#### `config/mcp/mcp_tools_config.json` - MCP 工具配置
```json
{
  "tools": {
    "image_processor": {
      "enabled": true,
      "endpoint": "http://localhost:8081",
      "timeout": 30
    },
    "quality_checker": {
      "enabled": true,
      "rules": ["accessibility", "performance", "seo"]
    }
  }
}
```

### 高级配置

#### 性能优化
```bash
# 在 .env 文件中调整
AGENT_MAX_CONCURRENT=5          # 最大并发任务数
AGENT_TIMEOUT=300              # 任务超时时间（秒）
MCP_TIMEOUT=60                 # MCP 工具超时时间（秒）
```

#### 日志配置
```bash
# 日志级别设置
AGENT_LOG_LEVEL=info           # debug|info|warn|error
LOG_ROTATION_SIZE=100MB        # 日志轮转大小
LOG_RETENTION_DAYS=30          # 日志保留天数
```

## 🔧 开发模式

### 启用开发模式
```bash
# 在 .env 文件中设置
AGENT_MODE=development

# 启用详细日志
AGENT_LOG_LEVEL=debug

# 启用热重载
ENABLE_HOT_RELOAD=true
```

### 调试工具
```bash
# 启动调试模式
npm run debug

# 查看详细日志
./scripts/utils/debug-logs.sh

# 性能分析
./scripts/utils/profile.sh
```

## 📚 更多资源

### 文档
- [完整用户手册](docs/user-guide.md)
- [API 文档](docs/api/README.md)
- [故障排除指南](docs/troubleshooting.md)
- [最佳实践](docs/best-practices.md)

### 示例
- [设计任务示例](docs/examples/design-tasks.md)
- [工作流配置示例](docs/examples/workflows.md)
- [集成示例](docs/examples/integrations.md)

### 支持
- 问题反馈：创建 GitHub Issue
- 功能请求：提交 Feature Request
- 社区讨论：加入 Discord 频道

## ⚠️ 注意事项

1. **首次启动**：首次启动可能需要较长时间来下载依赖和初始化环境
2. **端口冲突**：确保配置的端口（3000, 8080 等）未被其他服务占用
3. **权限问题**：某些脚本可能需要执行权限，使用 `chmod +x` 命令授权
4. **网络访问**：确保网络连接正常，某些功能需要访问外部 API
5. **资源占用**：Agent 运行时会占用一定的 CPU 和内存资源

## 🎉 开始使用

现在你已经完成了基本设置，可以开始使用 Visual Design Squad Agent 了！

建议从简单的设计任务开始，逐步熟悉系统的各项功能。如果遇到问题，请参考故障排除指南或联系技术支持。

祝你使用愉快！ 🚀