# ByteBot项目整理优化建议

> **文档版本**: v1.0.0  
> **创建日期**: 2025-01-27  
> **最后更新**: 2025-01-27  
> **维护者**: AI全栈工程师

## 📋 文档概述

本文档基于对当前项目中所有ByteBot相关项目的深入分析，提供完整的项目整理和优化建议。旨在解决当前项目结构混乱、文件散落、配置不统一等问题，建立清晰、可维护、可扩展的项目架构。

## 🎯 项目现状分析

### 📊 当前项目分布情况

通过全面扫描，发现ByteBot相关项目分布在以下位置：

#### 1. 主项目目录
```
Firecrawl数据采集器/bytebot/
├── packages/                    # 核心服务包
│   ├── bytebot-agent/          # AI智能体服务
│   ├── bytebot-ui/             # Web用户界面
│   ├── bytebot-desktop/        # 桌面应用
│   ├── bytebotd/               # 桌面服务守护进程
│   ├── bytebot-llm-proxy/      # LiteLLM代理
│   └── shared/                 # 共享工具库
├── config/                     # 配置管理
├── docs/                       # 项目文档
├── docker/                     # Docker配置
├── helm/                       # Kubernetes部署
└── scripts/                    # 脚本工具
```

#### 2. 历史版本备份
```
Firecrawl数据采集器/bytebot-old-20250921-232449/
├── rules/                      # 完整的规则文件
├── config/                     # 智能体配置
├── packages/                   # 旧版本服务包
└── docs/                       # 详细文档
```

#### 3. 配置备份
```
Firecrawl数据采集器/bytebot-backup-*/
├── agents/                     # Agent配置
├── mcp-servers/               # MCP服务器配置
└── prompt-templates/          # 提示词模板
```

### 🚨 主要问题识别

#### 1. 结构混乱问题
- **文件分散**: 核心文件分布在多个目录中
- **版本混乱**: 存在多个版本和备份，难以确定当前版本
- **配置重复**: 相同配置在不同位置重复存在
- **规则散落**: `.cursor/rules`文件分散在不同位置

#### 2. 维护困难问题
- **依赖关系复杂**: 各模块间依赖关系不清晰
- **版本不一致**: 不同模块使用不同版本的依赖
- **配置冲突**: 多个配置文件存在冲突
- **文档分散**: 项目文档分散在多个位置

#### 3. 开发效率问题
- **环境配置复杂**: 需要配置多个环境
- **构建流程不统一**: 不同模块有不同的构建方式
- **测试覆盖不全**: 缺乏统一的测试策略
- **部署流程复杂**: 部署配置分散且复杂

## 🏗️ 优化方案设计

### 方案一：统一独立项目管理（强烈推荐）

#### 核心理念
将所有ByteBot相关功能整合到一个独立的、结构清晰的项目中，采用现代化的项目管理方式。

#### 目标架构
```
bytebot-ecosystem/
├── README.md                           # 项目总览
├── CHANGELOG.md                        # 统一变更日志
├── LICENSE                             # 许可证
├── .gitignore                          # Git忽略文件
├── package.json                        # 根项目依赖管理
├── docker-compose.yml                  # 主Docker配置
├── .env.example                        # 环境变量示例
├── .nvmrc                              # Node.js版本锁定
├── .cursor/                            # 统一Cursor规则
│   └── rules/
│       ├── main.md                     # 主规则文件
│       ├── ai-integration.md           # AI集成规则
│       ├── backend.md                  # 后端开发规则
│       ├── frontend.md                 # 前端开发规则
│       ├── desktop-app.md              # 桌面应用规则
│       ├── deployment.md               # 部署规则
│       ├── security.md                 # 安全规则
│       └── testing.md                  # 测试规则
├── core/                               # 核心功能模块
│   ├── prompts/                        # 提示词管理
│   │   ├── prompt-manager.ts           # 提示词管理器
│   │   ├── template-engine.ts          # 模板引擎
│   │   └── cache-manager.ts            # 缓存管理
│   ├── history/                        # 对话历史管理
│   │   ├── conversation-manager.ts     # 对话管理器
│   │   ├── session-storage.ts          # 会话存储
│   │   └── search-engine.ts            # 搜索引擎
│   ├── mcp/                           # MCP协议支持
│   │   ├── mcp-client.ts              # MCP客户端
│   │   ├── server-registry.ts         # 服务器注册
│   │   └── tool-chain.ts              # 工具链管理
│   └── agents/                        # 智能体系统
│       ├── agent-manager.ts           # 智能体管理器
│       ├── task-scheduler.ts          # 任务调度器
│       └── workflow-engine.ts         # 工作流引擎
├── packages/                           # 核心服务包
│   ├── bytebot-agent/                  # AI智能体服务
│   │   ├── src/                        # 源代码
│   │   ├── tests/                      # 测试文件
│   │   ├── package.json                # 包配置
│   │   └── Dockerfile                  # 容器配置
│   ├── bytebot-ui/                     # Web用户界面
│   │   ├── src/                        # 源代码
│   │   ├── public/                     # 静态资源
│   │   ├── package.json                # 包配置
│   │   └── Dockerfile                  # 容器配置
│   ├── bytebot-desktop/                # 桌面应用
│   │   ├── src/                        # 前端代码
│   │   ├── src-tauri/                  # Rust后端
│   │   ├── scripts/                    # 构建脚本
│   │   └── package.json                # 包配置
│   ├── bytebotd/                       # 桌面服务守护进程
│   │   ├── src/                        # 源代码
│   │   ├── root/                       # 系统配置
│   │   ├── package.json                # 包配置
│   │   └── Dockerfile                  # 容器配置
│   ├── bytebot-llm-proxy/              # LiteLLM代理
│   │   ├── config/                     # 配置文件
│   │   ├── scripts/                    # 脚本文件
│   │   └── Dockerfile                  # 容器配置
│   └── shared/                         # 共享工具库
│       ├── types/                      # 类型定义
│       ├── utils/                      # 工具函数
│       ├── constants/                  # 常量定义
│       └── package.json                # 包配置
├── config/                             # 统一配置管理
│   ├── prompt-templates/               # 提示词模板
│   │   ├── system-prompts.yaml         # 系统提示词
│   │   ├── user-templates.yaml         # 用户模板
│   │   └── dynamic-templates.yaml      # 动态模板
│   ├── mcp-servers/                    # MCP服务器配置
│   │   ├── server-registry.yaml        # 服务器注册表
│   │   ├── tool-chains.yaml            # 工具链配置
│   │   └── security.yaml               # 安全配置
│   ├── user-profiles/                  # 用户配置
│   │   ├── profile-schema.json         # 配置模式
│   │   ├── default-user.json           # 默认用户
│   │   └── user-preferences.json       # 用户偏好
│   ├── agents/                         # 智能体配置
│   │   ├── trae-agent-configs.json     # Trae智能体配置
│   │   ├── workflow-templates.json     # 工作流模板
│   │   └── task-definitions.json       # 任务定义
│   └── environments/                   # 环境配置
│       ├── development.json             # 开发环境
│       ├── staging.json                 # 测试环境
│       ├── production.json              # 生产环境
│       └── local.example.json           # 本地配置示例
├── docs/                               # 项目文档
│   ├── README.md                       # 文档索引
│   ├── project/                        # 项目文档
│   │   ├── architecture.md             # 架构设计
│   │   ├── development-guide.md        # 开发指南
│   │   ├── deployment-guide.md         # 部署指南
│   │   └── api-reference.md            # API参考
│   ├── api-reference/                  # API参考文档
│   │   ├── agent/                      # Agent API
│   │   ├── computer-use/               # 计算机使用API
│   │   └── endpoints/                  # 端点文档
│   ├── guides/                         # 使用指南
│   │   ├── getting-started.md          # 快速开始
│   │   ├── user-manual.md              # 用户手册
│   │   └── troubleshooting.md          # 故障排除
│   └── deployment/                     # 部署指南
│       ├── docker.md                   # Docker部署
│       ├── kubernetes.md               # Kubernetes部署
│       └── railway.md                  # Railway部署
├── docker/                             # Docker配置
│   ├── docker-compose.yml              # 主配置
│   ├── docker-compose.development.yml  # 开发环境
│   ├── docker-compose.production.yml   # 生产环境
│   ├── docker-compose.m4pro.yml        # M4Pro优化
│   ├── .env.example                    # 环境变量示例
│   └── Dockerfile.node-base            # 基础镜像
├── data/                               # 数据存储
│   ├── conversation-history/           # 对话历史
│   │   ├── conversations.json          # 对话数据
│   │   └── sessions/                   # 会话文件
│   ├── user-sessions/                  # 用户会话
│   │   ├── active-sessions.json        # 活跃会话
│   │   └── session-cache/              # 会话缓存
│   └── prompt-cache/                   # 提示词缓存
│       ├── system-prompts.cache        # 系统提示词缓存
│       └── user-templates.cache        # 用户模板缓存
├── scripts/                            # 脚本工具
│   ├── setup/                          # 安装脚本
│   │   ├── install-dependencies.sh     # 依赖安装
│   │   ├── setup-environment.sh        # 环境设置
│   │   └── initialize-database.sh      # 数据库初始化
│   ├── deployment/                     # 部署脚本
│   │   ├── deploy.sh                   # 部署脚本
│   │   ├── rollback.sh                 # 回滚脚本
│   │   └── health-check.sh             # 健康检查
│   └── maintenance/                    # 维护脚本
│       ├── backup.sh                   # 备份脚本
│       ├── cleanup.sh                  # 清理脚本
│       └── update.sh                   # 更新脚本
├── tests/                              # 测试文件
│   ├── unit/                           # 单元测试
│   │   ├── core/                       # 核心模块测试
│   │   ├── packages/                   # 包测试
│   │   └── utils/                      # 工具测试
│   ├── integration/                    # 集成测试
│   │   ├── api/                        # API测试
│   │   ├── database/                   # 数据库测试
│   │   └── services/                   # 服务测试
│   ├── e2e/                            # 端到端测试
│   │   ├── desktop/                    # 桌面应用测试
│   │   ├── web/                        # Web应用测试
│   │   └── mobile/                     # 移动应用测试
│   └── fixtures/                       # 测试数据
│       ├── mock-data/                  # 模拟数据
│       └── test-configs/               # 测试配置
├── helm/                               # Kubernetes部署
│   ├── Chart.yaml                      # Helm图表
│   ├── values.yaml                     # 默认值
│   ├── values-prod.yaml                # 生产环境值
│   ├── values-staging.yaml             # 测试环境值
│   └── templates/                      # 模板文件
│       ├── deployment.yaml             # 部署模板
│       ├── service.yaml                # 服务模板
│       ├── ingress.yaml                # 入口模板
│       └── configmap.yaml              # 配置模板
└── archive/                            # 历史版本归档
    ├── bytebot-old-20250921-232449/    # 旧版本备份
    ├── bytebot-backup-20250921-232416/ # 配置备份1
    ├── bytebot-backup-20250921-232420/ # 配置备份2
    └── migration-logs/                 # 迁移日志
        ├── migration-2025-01-27.md     # 迁移记录
        └── rollback-procedures.md      # 回滚程序
```

### 方案二：保持独立项目分离（备选方案）

#### 核心理念
将ByteBot拆分为多个独立的项目，每个项目专注于特定功能领域。

#### 项目划分
```
bytebot-desktop-app/                    # 桌面应用项目
├── src-tauri/                          # Tauri配置
├── src/                                # 前端代码
├── scripts/                            # 构建脚本
├── package.json                        # 项目配置
└── README.md                           # 项目文档

bytebot-web-app/                        # Web应用项目
├── packages/bytebot-ui/                # UI组件
├── packages/bytebot-agent/             # Agent服务
├── docker-compose.yml                  # 部署配置
└── README.md                           # 项目文档

bytebot-core/                           # 核心功能项目
├── src/core/                           # 核心模块
├── config/                             # 配置管理
├── docs/                               # 文档
└── README.md                           # 项目文档

bytebot-mcp-servers/                    # MCP服务器项目
├── servers/                            # 服务器实现
├── clients/                            # 客户端实现
├── protocols/                          # 协议定义
└── README.md                           # 项目文档
```

## 🎯 推荐方案：统一独立项目管理

### 为什么选择方案一？

#### 1. 统一管理优势
- **集中管理**: 所有ByteBot相关功能集中在一个项目中
- **版本统一**: 统一的版本控制和发布流程
- **配置一致**: 避免配置冲突和重复
- **文档统一**: 完整的项目文档和API参考

#### 2. 开发效率提升
- **单一代码库**: 便于开发和调试
- **统一CI/CD**: 统一的持续集成和部署流程
- **代码复用**: 便于跨模块的代码共享
- **工具链统一**: 统一的开发工具和规范

#### 3. 维护成本降低
- **减少重复**: 避免重复配置和代码
- **统一依赖**: 统一的依赖管理
- **问题追踪**: 便于问题追踪和修复
- **知识积累**: 团队知识集中管理

#### 4. 扩展性增强
- **模块化设计**: 清晰的模块边界
- **插件系统**: 便于添加新功能
- **微服务架构**: 支持微服务化改造
- **云原生**: 支持云原生部署

## 🚀 实施计划

### 阶段一：项目初始化（1-2天）

#### 1.1 创建项目结构
```bash
# 创建主项目目录
mkdir bytebot-ecosystem
cd bytebot-ecosystem

# 初始化Git仓库
git init
git remote add origin <repository-url>

# 创建基础目录结构
mkdir -p {core,packages,config,docs,docker,data,scripts,tests,helm,archive}
mkdir -p .cursor/rules
mkdir -p core/{prompts,history,mcp,agents}
mkdir -p config/{prompt-templates,mcp-servers,user-profiles,agents,environments}
mkdir -p docs/{project,api-reference,guides,deployment}
mkdir -p scripts/{setup,deployment,maintenance}
mkdir -p tests/{unit,integration,e2e,fixtures}
```

#### 1.2 创建基础配置文件
```bash
# 创建根目录配置文件
touch README.md CHANGELOG.md LICENSE .gitignore package.json
touch .env.example .nvmrc

# 创建Docker配置
touch docker-compose.yml docker-compose.development.yml
touch docker-compose.production.yml .env.example
```

#### 1.3 设置Git配置
```bash
# 创建.gitignore
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Build outputs
dist/
build/
*.tgz
*.tar.gz

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
logs/
*.log

# Runtime data
pids/
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# Dependency directories
jspm_packages/

# Optional npm cache directory
.npm

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env

# next.js build output
.next

# Nuxt.js build output
.nuxt

# vuepress build output
.vuepress/dist

# Serverless directories
.serverless

# FuseBox cache
.fusebox/

# DynamoDB Local files
.dynamodb/

# TernJS port file
.tern-port
EOF

# 创建.gitattributes
cat > .gitattributes << 'EOF'
# Auto detect text files and perform LF normalization
* text=auto

# Custom for Visual Studio
*.cs     diff=csharp

# Standard to msysgit
*.doc	 diff=astextplain
*.DOC	 diff=astextplain
*.docx diff=astextplain
*.DOCX diff=astextplain
*.dot  diff=astextplain
*.DOT  diff=astextplain
*.pdf  diff=astextplain
*.PDF	 diff=astextplain
*.rtf	 diff=astextplain
*.RTF	 diff=astextplain
EOF
```

### 阶段二：代码迁移（2-3天）

#### 2.1 迁移核心代码
```bash
# 迁移主项目代码
cp -r ../Firecrawl数据采集器/bytebot/packages/* packages/
cp -r ../Firecrawl数据采集器/bytebot/config/* config/
cp -r ../Firecrawl数据采集器/bytebot/docs/* docs/
cp -r ../Firecrawl数据采集器/bytebot/docker/* docker/
cp -r ../Firecrawl数据采集器/bytebot/helm/* helm/
cp -r ../Firecrawl数据采集器/bytebot/scripts/* scripts/
```

#### 2.2 迁移规则文件
```bash
# 迁移规则文件
cp -r ../Firecrawl数据采集器/bytebot-old-20250921-232449/rules/* .cursor/rules/
```

#### 2.3 归档历史版本
```bash
# 归档历史版本
cp -r ../Firecrawl数据采集器/bytebot-old-20250921-232449 archive/
cp -r ../Firecrawl数据采集器/bytebot-backup-* archive/
```

#### 2.4 创建核心模块
```bash
# 创建核心模块
mkdir -p core/{prompts,history,mcp,agents}

# 迁移核心功能
cp ../Firecrawl数据采集器/bytebot/src/core/* core/
```

### 阶段三：配置统一（1-2天）

#### 3.1 统一package.json
```json
{
  "name": "bytebot-ecosystem",
  "version": "1.0.0",
  "description": "ByteBot - Open-Source AI Desktop Agent Ecosystem",
  "private": true,
  "workspaces": [
    "packages/*",
    "core/*"
  ],
  "scripts": {
    "dev": "docker-compose -f docker/docker-compose.development.yml up -d",
    "build": "docker-compose -f docker/docker-compose.yml build",
    "start": "docker-compose -f docker/docker-compose.yml up -d",
    "stop": "docker-compose -f docker/docker-compose.yml down",
    "test": "npm run test:unit && npm run test:integration",
    "test:unit": "jest --testPathPattern=unit",
    "test:integration": "jest --testPathPattern=integration",
    "test:e2e": "jest --testPathPattern=e2e",
    "lint": "eslint . --ext .ts,.tsx,.js,.jsx",
    "format": "prettier --write .",
    "type-check": "tsc --noEmit",
    "setup": "./scripts/setup/setup-environment.sh",
    "deploy": "./scripts/deployment/deploy.sh",
    "backup": "./scripts/maintenance/backup.sh",
    "cleanup": "./scripts/maintenance/cleanup.sh"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "typescript": "^5.0.0",
    "eslint": "^8.0.0",
    "prettier": "^3.0.0",
    "jest": "^29.0.0",
    "@testing-library/react": "^13.0.0",
    "@testing-library/jest-dom": "^5.0.0"
  },
  "engines": {
    "node": ">=20.0.0",
    "npm": ">=9.0.0"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/bytebot-ai/bytebot-ecosystem.git"
  },
  "keywords": [
    "ai",
    "desktop-agent",
    "automation",
    "tauri",
    "react",
    "typescript"
  ],
  "author": "ByteBot Team",
  "license": "Apache-2.0"
}
```

#### 3.2 统一Docker配置
```yaml
# docker-compose.yml
version: '3.8'

services:
  bytebot-ui:
    build: ./packages/bytebot-ui
    ports:
      - "9992:9992"
    environment:
      - NODE_ENV=production
    depends_on:
      - bytebot-agent
      - postgres
      - redis

  bytebot-agent:
    build: ./packages/bytebot-agent
    ports:
      - "9991:9991"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://bytebot:password@postgres:5432/bytebot
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis

  bytebot-desktop:
    build: ./packages/bytebotd
    ports:
      - "9990:9990"
    environment:
      - NODE_ENV=production
    depends_on:
      - bytebot-agent

  bytebot-llm-proxy:
    build: ./packages/bytebot-llm-proxy
    ports:
      - "9993:9993"
    environment:
      - NODE_ENV=production

  postgres:
    image: postgres:16-alpine
    ports:
      - "5433:5432"
    environment:
      - POSTGRES_DB=bytebot
      - POSTGRES_USER=bytebot
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

#### 3.3 统一环境变量
```bash
# .env.example
# API Keys
OPENAI_API_KEY=sk-proj-...
ANTHROPIC_API_KEY=sk-ant-...
GEMINI_API_KEY=...
GROQ_API_KEY=...

# Database
DATABASE_URL=postgresql://bytebot:password@localhost:5433/bytebot
REDIS_URL=redis://localhost:6379

# Services
BYTEBOT_UI_PORT=9992
BYTEBOT_AGENT_PORT=9991
BYTEBOT_DESKTOP_PORT=9990
BYTEBOT_LLM_PROXY_PORT=9993

# Environment
NODE_ENV=development
LOG_LEVEL=info

# Security
JWT_SECRET=your-jwt-secret
ENCRYPTION_KEY=your-encryption-key

# MCP Servers
MCP_FILESYSTEM_ENABLED=true
MCP_WEB_SEARCH_ENABLED=true
MCP_CODE_ANALYSIS_ENABLED=true
```

### 阶段四：文档完善（1天）

#### 4.1 创建主README
```markdown
# ByteBot Ecosystem

[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/deploy/bytebot?referralCode=L9lKXQ)
[![Docker](https://img.shields.io/badge/docker-ready-blue.svg)](https://github.com/bytebot-ai/bytebot-ecosystem/tree/main/docker)
[![License](https://img.shields.io/badge/license-Apache%202.0-green.svg)](LICENSE)

**An AI that has its own computer to complete tasks for you**

## 🚀 Quick Start

```bash
# 1. 克隆项目
git clone https://github.com/bytebot-ai/bytebot-ecosystem.git
cd bytebot-ecosystem

# 2. 安装依赖
npm install

# 3. 配置环境变量
cp .env.example .env
# 编辑 .env 添加 API 密钥

# 4. 启动服务
npm run dev

# 5. 访问 Web UI
open http://localhost:9992
```

## 📁 项目结构

- `core/` - 核心功能模块
- `packages/` - 核心服务包
- `config/` - 统一配置管理
- `docs/` - 项目文档
- `docker/` - 容器化配置
- `.cursor/rules/` - Cursor规则文件

## 🔧 开发指南

详见 [开发文档](docs/README.md)

## 📚 文档

- [项目结构说明](docs/project/architecture.md)
- [API参考文档](docs/api-reference/)
- [部署指南](docs/deployment/)
```

#### 4.2 创建开发文档
```markdown
# 开发指南

## 环境要求

- Node.js >= 20.0.0
- npm >= 9.0.0
- Docker >= 20.0.0
- Docker Compose >= 2.0.0

## 开发环境设置

```bash
# 1. 克隆项目
git clone <repository-url>
cd bytebot-ecosystem

# 2. 安装依赖
npm install

# 3. 配置环境变量
cp .env.example .env
# 编辑 .env 文件

# 4. 启动开发环境
npm run dev
```

## 项目结构

### 核心模块 (core/)
- `prompts/` - 提示词管理
- `history/` - 对话历史管理
- `mcp/` - MCP协议支持
- `agents/` - 智能体系统

### 服务包 (packages/)
- `bytebot-agent/` - AI智能体服务
- `bytebot-ui/` - Web用户界面
- `bytebot-desktop/` - 桌面应用
- `bytebotd/` - 桌面服务守护进程
- `bytebot-llm-proxy/` - LiteLLM代理
- `shared/` - 共享工具库

## 开发规范

### 代码风格
- 使用 TypeScript
- 遵循 ESLint 规则
- 使用 Prettier 格式化
- 编写单元测试

### 提交规范
- 使用 Conventional Commits
- 类型: feat, fix, docs, style, refactor, test, chore
- 示例: `feat(desktop): add tauri window management`

### 测试规范
- 单元测试覆盖率 > 80%
- 集成测试覆盖主要功能
- E2E测试覆盖关键流程

## 部署

### 本地部署
```bash
npm run build
npm run start
```

### Docker部署
```bash
docker-compose up -d
```

### Kubernetes部署
```bash
helm install bytebot ./helm
```
```

### 阶段五：测试验证（1天）

#### 5.1 创建测试脚本
```bash
# scripts/test/run-tests.sh
#!/bin/bash

echo "🧪 开始运行测试..."

# 运行单元测试
echo "📋 运行单元测试..."
npm run test:unit

# 运行集成测试
echo "🔗 运行集成测试..."
npm run test:integration

# 运行E2E测试
echo "🎯 运行E2E测试..."
npm run test:e2e

echo "✅ 所有测试完成！"
```

#### 5.2 创建健康检查脚本
```bash
# scripts/health-check.sh
#!/bin/bash

echo "🏥 开始健康检查..."

# 检查服务状态
services=("bytebot-ui:9992" "bytebot-agent:9991" "bytebot-desktop:9990" "bytebot-llm-proxy:9993")

for service in "${services[@]}"; do
    name=$(echo $service | cut -d: -f1)
    port=$(echo $service | cut -d: -f2)
    
    if curl -f http://localhost:$port/health > /dev/null 2>&1; then
        echo "✅ $name 服务正常"
    else
        echo "❌ $name 服务异常"
        exit 1
    fi
done

echo "✅ 所有服务健康检查通过！"
```

### 阶段六：部署上线（1天）

#### 6.1 创建部署脚本
```bash
# scripts/deployment/deploy.sh
#!/bin/bash

echo "🚀 开始部署 ByteBot Ecosystem..."

# 构建镜像
echo "🔨 构建Docker镜像..."
docker-compose build

# 运行测试
echo "🧪 运行测试..."
npm run test

# 部署服务
echo "📦 部署服务..."
docker-compose up -d

# 健康检查
echo "🏥 健康检查..."
./scripts/health-check.sh

echo "✅ 部署完成！"
```

#### 6.2 创建回滚脚本
```bash
# scripts/deployment/rollback.sh
#!/bin/bash

echo "🔄 开始回滚..."

# 停止当前服务
docker-compose down

# 恢复备份
if [ -f "backup/latest.tar.gz" ]; then
    echo "📦 恢复备份..."
    tar -xzf backup/latest.tar.gz
    docker-compose up -d
    echo "✅ 回滚完成！"
else
    echo "❌ 未找到备份文件"
    exit 1
fi
```

## 📊 预期效果

### 1. 项目结构清晰
- **模块化设计**: 清晰的模块边界和职责
- **统一配置**: 避免配置冲突和重复
- **文档完整**: 完整的项目文档和API参考

### 2. 开发效率提升
- **统一工具链**: 统一的开发工具和规范
- **快速启动**: 一键启动开发环境
- **自动化测试**: 完整的测试覆盖

### 3. 维护成本降低
- **单一代码库**: 便于管理和维护
- **统一版本**: 避免版本不一致问题
- **自动化部署**: 减少手动操作

### 4. 扩展性增强
- **插件系统**: 便于添加新功能
- **微服务架构**: 支持微服务化改造
- **云原生**: 支持云原生部署

## 🔧 迁移工具

### 自动迁移脚本
```bash
#!/bin/bash
# migrate-bytebot.sh

echo "🔄 开始迁移 ByteBot 项目..."

# 创建新项目目录
mkdir -p bytebot-ecosystem
cd bytebot-ecosystem

# 初始化Git
git init

# 创建目录结构
mkdir -p {core,packages,config,docs,docker,data,scripts,tests,helm,archive}
mkdir -p .cursor/rules
mkdir -p core/{prompts,history,mcp,agents}
mkdir -p config/{prompt-templates,mcp-servers,user-profiles,agents,environments}
mkdir -p docs/{project,api-reference,guides,deployment}
mkdir -p scripts/{setup,deployment,maintenance}
mkdir -p tests/{unit,integration,e2e,fixtures}

# 迁移代码
echo "📁 迁移代码..."
cp -r ../Firecrawl数据采集器/bytebot/packages/* packages/
cp -r ../Firecrawl数据采集器/bytebot/config/* config/
cp -r ../Firecrawl数据采集器/bytebot/docs/* docs/
cp -r ../Firecrawl数据采集器/bytebot/docker/* docker/
cp -r ../Firecrawl数据采集器/bytebot/helm/* helm/
cp -r ../Firecrawl数据采集器/bytebot/scripts/* scripts/

# 迁移规则文件
echo "📋 迁移规则文件..."
cp -r ../Firecrawl数据采集器/bytebot-old-20250921-232449/rules/* .cursor/rules/

# 归档历史版本
echo "📦 归档历史版本..."
cp -r ../Firecrawl数据采集器/bytebot-old-20250921-232449 archive/
cp -r ../Firecrawl数据采集器/bytebot-backup-* archive/

# 创建配置文件
echo "⚙️ 创建配置文件..."
# [创建各种配置文件]

echo "✅ 迁移完成！"
echo "📝 下一步："
echo "1. 检查配置文件"
echo "2. 运行 npm install"
echo "3. 配置环境变量"
echo "4. 启动服务测试"
```

## 🎯 总结

通过实施统一独立项目管理方案，ByteBot项目将获得：

1. **清晰的项目结构** - 模块化、可维护、可扩展
2. **统一的开发体验** - 工具链、规范、流程统一
3. **降低维护成本** - 减少重复、提高效率
4. **增强扩展性** - 支持插件、微服务、云原生

这个方案将帮助ByteBot项目从当前的结构混乱状态转变为现代化、专业化的项目架构，为后续的开发和维护奠定坚实基础。

---

**文档维护**: 本文档应随项目发展持续更新，确保建议的实用性和时效性。
