# ByteBot 项目结构重组方案

## 项目概述

ByteBot 是一个基于 AI 的自动化工具项目，本次重组旨在优化项目结构、统一命名规范，并为新功能需求创建相应的目录结构。

## 重组目标

1. **统一命名规范**：采用 kebab-case 命名约定，确保一致性
2. **功能模块化**：按功能将代码和配置分组
3. **新功能支持**：为系统提示词、用户历史记录、MCP 调用等功能创建基础架构
4. **清理冗余**：删除重复、过时的文件和配置

## 新项目结构

```
bytebot/
├── README.md                           # 项目主说明文档
├── LICENSE                             # 开源许可证
├── .nvmrc                             # Node.js 版本锁定 (v20.19.4)
├── .gitignore                         # Git 忽略规则
├── .prettierignore                    # Prettier 忽略规则
├── PROJECT_STRUCTURE.md              # 项目结构说明（旧版）
│
├── config/                            # 🆕 统一配置管理
│   ├── agents/                        # 智能体配置
│   │   └── trae_agent_configs.json   # Trae IDE 智能体配置
│   ├── gpt_actions/                   # GPT Actions 配置
│   │   └── n8n_openapi.yaml         # N8N OpenAPI 配置
│   ├── mcp-servers/                   # 🆕 MCP 服务器配置
│   │   ├── server-registry.yaml      # 服务器注册表
│   │   ├── n8n_mcp_configuration.md  # N8N MCP 配置说明
│   │   └── n8n_mcp_example_config.json # N8N MCP 示例配置
│   ├── prompt-templates/              # 🆕 提示词模板
│   │   └── system-prompts.yaml       # 系统提示词配置
│   └── user-profiles/                 # 🆕 用户配置文件
│       ├── profile-schema.json       # 用户配置模式
│       └── default-user.json         # 默认用户配置
│
├── src/                              # 🆕 源代码目录
│   ├── core/                         # 🆕 核心功能模块
│   │   ├── index.ts                  # 核心模块索引
│   │   ├── prompts/                  # 🆕 提示词管理
│   │   │   ├── prompt-manager.ts     # 提示词管理器
│   │   │   ├── system/               # 系统提示词
│   │   │   ├── user/                 # 用户提示词
│   │   │   ├── templates/            # 提示词模板
│   │   │   └── versions/             # 版本管理
│   │   ├── history/                  # 🆕 历史记录管理
│   │   │   ├── conversation-manager.ts # 对话管理器
│   │   │   ├── storage/              # 存储层
│   │   │   ├── retrieval/            # 检索层
│   │   │   └── session/              # 会话管理
│   │   └── mcp/                      # 🆕 MCP 协议支持
│   │       ├── mcp-client.ts         # MCP 客户端
│   │       ├── servers/              # 服务器连接
│   │       ├── tools/                # 工具调用
│   │       └── protocols/            # 协议实现
│   │
├── data/                             # 🆕 数据存储目录
│   ├── user-sessions/                # 用户会话数据
│   ├── conversation-history/         # 对话历史存储
│   └── prompt-cache/                 # 提示词缓存
│
├── packages/                         # 核心服务包
│   ├── bytebot-agent/               # AI 智能体服务
│   ├── bytebot-agent-cc/            # Computer Control 智能体
│   ├── bytebot-ui/                  # Web 用户界面
│   ├── bytebotd/                    # 桌面服务守护进程
│   ├── bytebot-llm-proxy/           # LLM 代理服务
│   └── shared/                      # 共享工具库
│
├── docs/                            # 文档目录
│   ├── project/                     # 项目相关文档
│   │   ├── AGENT_SYSTEM_INDEX.md    # 智能体系统索引
│   │   ├── API_SERVICES_INDEX.md    # API 服务索引
│   │   ├── CONFIG_DEPLOYMENT_INDEX.md # 配置部署索引
│   │   ├── PROJECT_INDEX.md         # 项目索引
│   │   ├── UI_COMPONENTS_INDEX.md   # UI 组件索引
│   │   ├── NEW_PROJECT_STRUCTURE.md # 🆕 新项目结构说明
│   │   ├── AI教学提示词模板.md      # AI 教学提示词模板
│   │   ├── brand_asset_audit_report.md # 品牌资产审计报告
│   │   └── 项目规则.md              # 项目规则
│   ├── chatgpt-client-guide/        # 🔄 重命名：ChatGPT 客户端指南
│   │   ├── README.md
│   │   ├── ChatGPT Plus 权限与功能（官方说明补充）.md
│   │   ├── ChatGPT 客户端教学·合并手册.md
│   │   ├── ChatGPT 开发者模式.md
│   │   ├── GPT Action 身份验证.md
│   │   ├── GPT Actions 制作说明.md
│   │   ├── GPT Actions 库.md
│   │   ├── GPT 操作.md
│   │   ├── GPT 操作入门.md
│   │   ├── Plus 用户：自定义 GPT 与连接器（MCP）说明.md
│   │   ├── 为 ChatGPT 和 API 集成构建 MCP 服务器.md
│   │   ├── 使用 GPT 操作发送和返回文件.md
│   │   ├── 使用 GPT 操作进行数据检索.md
│   │   └── 命名规范与映射.md
│   ├── prompts/
│   │   └── prompt-library/          # 🔄 重命名：提示词库
│   │       ├── automation/          # 自动化相关提示词
│   │       ├── 业务分类/            # 业务分类提示词
│   │       ├── 功能分类/            # 功能分类提示词
│   │       ├── 技术分类/            # 技术分类提示词
│   │       └── 索引文件/            # 索引文件
│   ├── api-reference/              # API 参考文档
│   ├── core-concepts/              # 核心概念文档
│   ├── deployment/                 # 部署文档
│   ├── guides/                     # 使用指南
│   ├── rest-api/                   # REST API 文档
│   ├── trae-ide-agents/           # Trae IDE 智能体文档
│   └── visual-design-squad/       # 视觉设计团队文档
│
├── docker/                         # Docker 配置
│   ├── .env                       # 环境变量配置
│   ├── .env.backup               # 环境变量备份
│   ├── docker-compose.yml        # 主要 Docker Compose 配置
│   ├── docker-compose.*.yml      # 其他环境配置
│   ├── bytebot-desktop.Dockerfile # 桌面服务 Dockerfile
│   └── trae-ide-agents/          # Trae IDE 智能体 Docker 配置
│
├── helm/                          # Kubernetes Helm Charts
│   ├── Chart.yaml                # Helm Chart 定义
│   ├── values*.yaml             # 配置值文件
│   ├── charts/                  # 子 Charts
│   └── templates/               # 模板文件
│
├── scripts/                      # 脚本和工具
│   ├── setup/                   # 安装配置脚本
│   │   └── setup_n8n_mcp.sh   # N8N MCP 安装脚本
│   └── chatgpt_plus_help.json  # ChatGPT Plus 帮助文件
│
├── static/                       # 静态资源
│   ├── bytebot-logo.png         # ByteBot Logo
│   ├── bytebot_icon.svg         # ByteBot 图标
│   └── vincent_icon.svg         # Vincent 图标
│
├── external/                     # 外部依赖
│   └── bytebot-upstream/        # 上游 ByteBot 代码
│
├── .git/                        # Git 版本控制
├── .github/                     # GitHub 工作流
├── .trae/                       # Trae IDE 配置
└── .vscode/                     # VS Code 配置
```

## 主要变更说明

### 1. 新增功能模块

#### 🆕 系统提示词支持 (`src/core/prompts/`)
- **prompt-manager.ts**: 提示词管理器，支持动态加载和版本控制
- **system-prompts.yaml**: 系统提示词配置文件
- 支持提示词模板化和用户上下文注入

#### 🆕 用户历史记录 (`src/core/history/`)
- **conversation-manager.ts**: 对话历史管理器
- **data/conversation-history/**: 历史记录存储目录
- 支持会话管理、消息检索和自动清理

#### 🆕 MCP 协议支持 (`src/core/mcp/`)
- **mcp-client.ts**: MCP 客户端实现
- **server-registry.yaml**: MCP 服务器注册表
- 支持多服务器连接、工具调用和工具链组合

### 2. 目录重命名

| 原名称                    | 新名称                         | 说明                 |
| ------------------------- | ------------------------------ | -------------------- |
| `docs/ChatGPT客户端教学/` | `docs/chatgpt-client-guide/`   | 统一使用 kebab-case  |
| `docs/prompts/提示词库/`  | `docs/prompts/prompt-library/` | 英文命名，便于国际化 |

### 3. 配置结构优化

- **统一配置管理**: 所有配置文件集中在 `config/` 目录
- **分类配置**: 按功能模块分类（agents、mcp-servers、prompt-templates 等）
- **用户配置**: 新增用户配置文件支持，包含权限和偏好设置

### 4. 清理的文件

- ❌ 删除了 21 个 `.DS_Store` 系统文件
- ❌ 删除了重复的配置文件 `config/n8n_mcp_*`
- ❌ 删除了临时文件 `.test_workflow_id`

## 新功能使用说明

### 系统提示词管理

```typescript
import { promptManager } from './src/core';

// 初始化提示词管理器
await promptManager.loadConfig();

// 获取系统提示词
const codeAssistant = promptManager.getSystemPrompt('code_assistant');

// 设置用户上下文
promptManager.setUserContext({
  user_name: 'Developer',
  user_role: 'Software Engineer',
  project_context: 'ByteBot Development'
});

// 构建上下文化提示词
const contextualPrompt = promptManager.buildContextualPrompt('default');
```

### 对话历史管理

```typescript
import { conversationManager } from './src/core';

// 创建新会话
const session = conversationManager.createSession('user123', '代码优化讨论');

// 添加消息
conversationManager.addMessage(session.id, {
  role: 'user',
  content: '请帮我优化这段代码'
});

// 搜索历史消息
const results = conversationManager.searchMessages('user123', '代码优化');

// 获取最近消息
const recentMessages = conversationManager.getRecentMessages(session.id, 10);
```

### MCP 工具调用

```typescript
import { mcpClient } from './src/core';

// 初始化 MCP 客户端
await mcpClient.initialize();

// 获取可用工具
const tools = mcpClient.getAvailableTools();

// 调用单个工具
const result = await mcpClient.callTool('filesystem_file_read', {
  path: '/path/to/file.txt'
});

// 执行工具链
const chainResults = await mcpClient.executeToolChain('development_workflow', {
  project_path: '/path/to/project'
});
```

## 开发环境要求

- **Node.js**: v20.19.4 (LTS) - 已升级获得最佳性能
- **npm**: v10.8.2
- **Docker**: 最新版本
- **Docker Compose**: 最新版本

## 迁移指南

### 现有代码迁移

1. **更新导入路径**：
   ```typescript
   // 旧的导入方式
   import { someFunction } from './old/path';
   
   // 新的导入方式
   import { someFunction } from './src/core';
   ```

2. **配置文件更新**：
   - 检查 `config/` 目录下的新配置文件
   - 根据 `config/user-profiles/profile-schema.json` 创建用户配置

3. **环境变量**：
   - 检查 `docker/.env` 文件中的新环境变量
   - 配置 MCP 服务器相关的 API 密钥

### 数据迁移

1. **历史数据**：现有的对话历史会自动迁移到新的存储格式
2. **提示词**：现有的提示词需要按新格式重新组织
3. **用户配置**：根据 `default-user.json` 模板创建用户配置文件

## 维护建议

1. **定期清理**：使用 `conversationManager.cleanupExpiredSessions()` 清理过期会话
2. **配置备份**：定期备份 `config/` 和 `data/` 目录
3. **版本管理**：使用 `.nvmrc` 确保团队使用统一的 Node.js 版本
4. **监控日志**：关注核心模块的初始化和错误日志
5. **性能优化**：定期检查 MCP 工具调用的性能和成功率

## 下一步计划

1. **🔄 集成测试**：为新的核心模块编写集成测试
2. **📚 API 文档**：为新功能生成详细的 API 文档
3. **🎨 UI 集成**：将新功能集成到 Web UI 中
4. **🔧 工具扩展**：开发更多的 MCP 工具和服务器连接器
5. **🌐 国际化**：完成中英文界面的国际化支持

---

**注意**: 本次重组保持了所有现有功能的兼容性，不会破坏现有的 Docker 服务和 API 接口。新功能以渐进式方式集成，可以逐步启用和测试。
