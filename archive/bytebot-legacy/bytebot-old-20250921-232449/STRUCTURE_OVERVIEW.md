# ByteBot 项目结构总览

> **最后更新**: 2025-09-20  
> **Node.js 版本**: v20.19.4 (LTS)  
> **项目状态**: ✅ 已完成结构重组和功能升级

## 📋 快速导航

| 目录                     | 用途           | 重要文件                                                                    |
| ------------------------ | -------------- | --------------------------------------------------------------------------- |
| [`src/core/`](#核心模块) | 🧠 核心功能模块 | `index.ts`, `prompt-manager.ts`, `conversation-manager.ts`, `mcp-client.ts` |
| [`config/`](#配置管理)   | ⚙️ 统一配置管理 | `system-prompts.yaml`, `server-registry.yaml`, `profile-schema.json`        |
| [`data/`](#数据存储)     | 💾 数据存储目录 | 用户会话、对话历史、提示词缓存                                              |
| [`packages/`](#核心服务) | 🚀 核心服务包   | `bytebot-agent`, `bytebot-ui`, `bytebotd`                                   |
| [`docs/`](#文档)         | 📚 项目文档     | `NEW_PROJECT_STRUCTURE.md`, `chatgpt-client-guide/`                         |
| [`docker/`](#部署)       | 🐳 容器化配置   | `docker-compose.yml`, `.env`                                                |

## 🧠 核心模块

### 系统提示词管理 (`src/core/prompts/`)
```typescript
import { promptManager } from './src/core';

// 加载配置
await promptManager.loadConfig();

// 获取系统提示词
const prompt = promptManager.getSystemPrompt('code_assistant');

// 构建上下文化提示词
const contextualPrompt = promptManager.buildContextualPrompt('default');
```

### 对话历史管理 (`src/core/history/`)
```typescript
import { conversationManager } from './src/core';

// 创建会话
const session = conversationManager.createSession('user123');

// 添加消息
conversationManager.addMessage(session.id, {
  role: 'user',
  content: '请帮我优化代码'
});

// 搜索历史
const results = conversationManager.searchMessages('user123', '代码优化');
```

### MCP 协议支持 (`src/core/mcp/`)
```typescript
import { mcpClient } from './src/core';

// 初始化客户端
await mcpClient.initialize();

// 调用工具
const result = await mcpClient.callTool('filesystem_file_read', {
  path: '/path/to/file.txt'
});

// 执行工具链
const chainResults = await mcpClient.executeToolChain('development_workflow', {
  project_path: '/path/to/project'
});
```

## ⚙️ 配置管理

### 系统提示词配置 (`config/prompt-templates/system-prompts.yaml`)
```yaml
core_prompts:
  default:
    name: "ByteBot 默认系统提示词"
    content: |
      你是 ByteBot，一个智能的 AI 自动化助手...
  
  code_assistant:
    name: "代码助手"
    content: |
      你是一个专业的代码助手...

dynamic_templates:
  user_context:
    variables: [user_name, user_role, project_context]
    template: |
      用户信息：
      - 姓名：{user_name}
      - 角色：{user_role}
```

### MCP 服务器注册 (`config/mcp-servers/server-registry.yaml`)
```yaml
servers:
  filesystem:
    name: "文件系统工具"
    type: "builtin"
    capabilities: [file_read, file_write, directory_list]
    
  web_search:
    name: "网络搜索工具"
    type: "external"
    capabilities: [web_search, content_scrape]

tool_chains:
  development_workflow:
    tools: [filesystem, code_analysis, web_search]
    sequence: [code_analysis, filesystem, web_search]
```

### 用户配置 (`config/user-profiles/`)
```json
{
  "user_id": "default_user",
  "profile": {
    "name": "默认用户",
    "role": "user",
    "language": "zh-CN"
  },
  "preferences": {
    "default_prompt_style": "technical",
    "response_format": "markdown",
    "auto_save_history": true
  },
  "mcp_access": {
    "enabled_servers": ["filesystem", "web_search"],
    "rate_limits": {
      "requests_per_minute": 60
    }
  }
}
```

## 💾 数据存储

```
data/
├── user-sessions/           # 用户会话数据
│   ├── user123_session1.json
│   └── user456_session2.json
├── conversation-history/    # 对话历史存储
│   └── conversations.json
└── prompt-cache/           # 提示词缓存
    ├── system_prompts.cache
    └── user_templates.cache
```

## 🚀 核心服务

| 服务                | 端口 | 用途          | 配置文件                              |
| ------------------- | ---- | ------------- | ------------------------------------- |
| **bytebot-ui**      | 9992 | Web 用户界面  | `packages/bytebot-ui/package.json`    |
| **bytebot-agent**   | 9991 | AI 智能体服务 | `packages/bytebot-agent/package.json` |
| **bytebot-desktop** | 9990 | 虚拟桌面服务  | `packages/bytebotd/package.json`      |
| **postgres**        | 5433 | 数据库服务    | `docker/docker-compose.yml`           |

## 📚 文档结构

```
docs/
├── project/                     # 项目文档
│   ├── NEW_PROJECT_STRUCTURE.md # 🆕 新结构说明
│   ├── AGENT_SYSTEM_INDEX.md   # 智能体系统索引
│   └── API_SERVICES_INDEX.md   # API 服务索引
├── chatgpt-client-guide/       # 🔄 ChatGPT 客户端指南
├── prompts/prompt-library/     # 🔄 提示词库
├── api-reference/              # API 参考文档
├── core-concepts/              # 核心概念
├── deployment/                 # 部署指南
└── guides/                     # 使用指南
```

## 🐳 部署配置

### Docker Compose 服务
```yaml
services:
  bytebot-ui:
    image: ghcr.io/bytebot-ai/bytebot-ui:edge
    ports: ["9992:9992"]
    
  bytebot-agent:
    image: ghcr.io/bytebot-ai/bytebot-agent:edge
    ports: ["9991:9991"]
    
  bytebot-desktop:
    image: ghcr.io/bytebot-ai/bytebot-desktop:edge
    ports: ["9990:9990"]
    
  postgres:
    image: postgres:16-alpine
    ports: ["5433:5432"]
```

### 环境变量 (`docker/.env`)
```bash
# API 密钥
OPENAI_API_KEY=sk-proj-...
ANTHROPIC_API_KEY=sk-ant-...
GEMINI_API_KEY=...

# 数据库配置
DATABASE_URL=postgresql://bytebot:password@postgres:5432/bytebot

# 服务配置
BYTEBOT_UI_PORT=9992
BYTEBOT_AGENT_PORT=9991
BYTEBOT_DESKTOP_PORT=9990
```

## 🛠️ 开发工具

### 脚本和工具 (`scripts/`)
```bash
# 安装 N8N MCP 支持
./scripts/setup/setup_n8n_mcp.sh

# 启动开发环境
docker-compose -f docker/docker-compose.development.yml up -d

# 查看服务状态
docker-compose -f docker/docker-compose.yml ps
```

### IDE 配置
- **VS Code**: `.vscode/settings.json` - 编辑器配置
- **Trae IDE**: `.trae/rules/` - Trae IDE 智能体规则
- **Prettier**: `.prettierignore` - 代码格式化忽略规则

## 📊 项目统计

| 指标            | 数值 | 说明              |
| --------------- | ---- | ----------------- |
| **总目录数**    | ~80  | 包含所有子目录    |
| **核心文件数**  | ~170 | 不含 node_modules |
| **配置文件**    | 15+  | 各类配置和模板    |
| **文档文件**    | 50+  | 项目文档和指南    |
| **代码包**      | 6    | 核心服务包        |
| **Docker 服务** | 4    | 主要服务容器      |

## 🔗 重要链接

- **🏠 项目主页**: [bytebot.ai](https://bytebot.ai)
- **📖 官方文档**: [docs.bytebot.ai](https://docs.bytebot.ai)
- **💬 社区讨论**: [Discord](https://discord.com/invite/d9ewZkWPTP)
- **🐙 源代码**: [GitHub](https://github.com/bytebot-ai/bytebot)
- **🆕 结构说明**: [NEW_PROJECT_STRUCTURE.md](./docs/project/NEW_PROJECT_STRUCTURE.md)

## 🚀 快速开始

```bash
# 1. 克隆项目
git clone https://github.com/bytebot-ai/bytebot.git
cd bytebot

# 2. 确保使用正确的 Node.js 版本
nvm use  # 自动使用 .nvmrc 中的版本

# 3. 配置环境变量
cp docker/.env.example docker/.env
# 编辑 docker/.env 添加 API 密钥

# 4. 启动服务
docker-compose -f docker/docker-compose.yml up -d

# 5. 访问 Web UI
open http://localhost:9992
```

---

> 💡 **提示**: 本文档会随着项目发展持续更新。如有疑问，请查看详细的 [新项目结构说明](./docs/project/NEW_PROJECT_STRUCTURE.md) 或加入我们的 [Discord 社区](https://discord.com/invite/d9ewZkWPTP) 讨论。
