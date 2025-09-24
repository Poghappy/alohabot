# ByteBot 项目文件索引系统

## 项目整体架构

### 核心模块结构
```
bytebot/
├── packages/                    # 核心代码包
│   ├── bytebot-agent/          # 主智能体服务 (NestJS)
│   ├── bytebot-agent-cc/       # Claude Computer Use智能体
│   ├── bytebot-ui/             # 前端界面 (Next.js)
│   ├── bytebotd/               # 桌面环境服务
│   ├── bytebot-llm-proxy/      # LLM代理服务
│   └── shared/                 # 共享类型和工具
├── docs/                       # 项目文档
├── docker/                     # Docker配置
├── helm/                       # Kubernetes部署
└── static/                     # 静态资源
```

## 智能体系统核心文件索引

### 🤖 bytebot-agent (主智能体服务)
**路径**: `/packages/bytebot-agent/src/`

#### 核心智能体模块 (`agent/`)
- **`agent.constants.ts`** ⭐ 核心常量定义
  - `AGENT_SYSTEM_PROMPT`: 智能体系统提示词
  - `SUMMARIZATION_SYSTEM_PROMPT`: 消息汇总提示词
  - `DEFAULT_DISPLAY_SIZE`: 默认显示尺寸
  - 已分析: ✅ 包含完整的智能体工作原理和任务处理流程

- **`agent.processor.ts`** ⭐ 任务处理核心逻辑
  - 任务接管、恢复、取消事件处理
  - `processTask()`: 任务处理主方法
  - `runIteration()`: 任务迭代执行
  - 已分析: ✅ 包含完整的任务生命周期管理

- **`agent.scheduler.ts`** 任务调度器
- **`agent.tools.ts`** 智能体工具集
- **`agent.types.ts`** 类型定义
- **`agent.computer-use.ts`** 计算机操作集成
- **`agent.analytics.ts`** 分析统计
- **`input-capture.service.ts`** 输入捕获服务

#### 任务管理模块 (`tasks/`)
- **`tasks.service.ts`** ⭐ 任务服务核心
  - `create()`: 任务创建逻辑
  - 文件处理和初始消息生成
  - 已分析: ✅ 包含完整的任务创建流程

- **`tasks.controller.ts`** 任务控制器
- **`tasks.gateway.ts`** WebSocket网关
- **`dto/create-task.dto.ts`** ⭐ 任务创建DTO
  - 任务描述、类型、优先级验证
  - 已分析: ✅ 包含任务创建的数据结构

#### LLM服务提供商
- **`anthropic/`** - Claude集成
- **`openai/`** - OpenAI集成  
- **`google/`** - Google AI集成
- **`proxy/`** - 代理服务

#### 其他核心模块
- **`messages/`** - 消息管理
- **`summaries/`** - 消息汇总
- **`prisma/`** - 数据库服务

### 🎨 bytebot-ui (前端界面)
**路径**: `/packages/bytebot-ui/src/`

#### 页面路由 (`app/`)
- **`page.tsx`** - 主页面
- **`tasks/page.tsx`** - 任务列表页
- **`tasks/[id]/page.tsx`** - 任务详情页
- **`desktop/page.tsx`** - 桌面查看页

#### 核心组件 (`components/`)

##### 消息组件 (`messages/`)
- **`ChatInput.tsx`** ⭐ 聊天输入组件
  - 用户输入处理和文件上传
  - Base64转换和验证
  - 已分析: ✅ 包含完整的输入处理逻辑

- **`ChatContainer.tsx`** - 聊天容器
- **`AssistantMessage.tsx`** - 智能体消息显示
- **`UserMessage.tsx`** - 用户消息显示
- **`MessageGroup.tsx`** - 消息分组
- **`MessageAvatar.tsx`** - 消息头像

##### 任务组件 (`tasks/`)
- **`TaskList.tsx`** - 任务列表
- **`TaskItem.tsx`** - 任务项
- **`TaskTabs.tsx`** - 任务标签页

##### UI组件 (`ui/`)
- 基础UI组件库 (按钮、输入框、卡片等)

#### 工具函数 (`utils/`)
- **`taskUtils.ts`** - 任务相关工具
- **`screenshotUtils.ts`** - 截图处理
- **`stringUtils.ts`** - 字符串处理
- **`clipboard.ts`** - 剪贴板操作

#### Hooks (`hooks/`)
- **`useChatSession.ts`** - 聊天会话管理
- **`useWebSocket.ts`** - WebSocket连接
- **`useScrollScreenshot.ts`** - 滚动截图

### 🖥️ bytebotd (桌面环境服务)
**路径**: `/packages/bytebotd/src/`

#### 计算机操作 (`computer-use/`)
- **`computer-use.service.ts`** ⭐ 计算机操作服务
  - 已分析: ✅ 包含鼠标、键盘、截图等操作定义
- **`computer-use.controller.ts`** - 操作控制器
- **`dto/computer-action.dto.ts`** - 操作数据传输对象

#### 输入跟踪 (`input-tracking/`)
- **`input-tracking.service.ts`** - 输入跟踪服务
- **`input-tracking.gateway.ts`** - WebSocket网关

#### MCP集成 (`mcp/`)
- **`computer-use.tools.ts`** - 计算机操作工具
- **`compressor.ts`** - 数据压缩

### 🔗 shared (共享模块)
**路径**: `/packages/shared/src/`

#### 类型定义 (`types/`)
- **`computerAction.types.ts`** - 计算机操作类型
- **`messageContent.types.ts`** - 消息内容类型

#### 工具函数 (`utils/`)
- **`computerAction.utils.ts`** - 计算机操作工具
- **`messageContent.utils.ts`** - 消息内容工具

## 智能路径导航

### 🎯 快速访问核心功能

#### 任务创建流程
1. **前端输入**: `bytebot-ui/src/components/messages/ChatInput.tsx`
2. **API接口**: `bytebot-agent/src/tasks/tasks.controller.ts`
3. **服务处理**: `bytebot-agent/src/tasks/tasks.service.ts`
4. **数据验证**: `bytebot-agent/src/tasks/dto/create-task.dto.ts`

#### 智能体处理流程
1. **系统提示**: `bytebot-agent/src/agent/agent.constants.ts`
2. **任务处理**: `bytebot-agent/src/agent/agent.processor.ts`
3. **工具调用**: `bytebot-agent/src/agent/agent.tools.ts`
4. **计算机操作**: `bytebotd/src/computer-use/computer-use.service.ts`

#### 用户界面交互
1. **任务列表**: `bytebot-ui/src/components/tasks/TaskList.tsx`
2. **聊天界面**: `bytebot-ui/src/components/messages/ChatContainer.tsx`
3. **消息显示**: `bytebot-ui/src/components/messages/AssistantMessage.tsx`
4. **桌面查看**: `bytebot-ui/src/components/vnc/VncViewer.tsx`

## 关键信息标记

### ⭐ 核心文件 (已深度分析)
- `agent.constants.ts` - 智能体系统提示词和配置
- `agent.processor.ts` - 任务处理核心逻辑
- `tasks.service.ts` - 任务创建和管理
- `create-task.dto.ts` - 任务数据结构
- `ChatInput.tsx` - 用户输入处理
- `computer-use.service.ts` - 计算机操作定义

### 🔍 待深入分析的重要文件
- `agent.scheduler.ts` - 任务调度机制
- `agent.tools.ts` - 智能体工具集
- `tasks.gateway.ts` - WebSocket实时通信
- `anthropic.service.ts` - Claude集成实现
- `TaskList.tsx` - 任务列表组件
- `AssistantMessage.tsx` - 智能体消息渲染

### 📊 配置和部署文件
- **Docker**: `/docker/docker-compose.yml`
- **Helm**: `/helm/values.yaml`
- **数据库**: `/packages/bytebot-agent/prisma/schema.prisma`
- **环境配置**: `.env.example` 文件

## 开发者快速指南

### 🚀 启动开发环境
1. 查看 `/docker/docker-compose.development.yml`
2. 配置环境变量 (参考各包的 `.env.example`)
3. 运行数据库迁移 (Prisma)

### 🔧 修改智能体行为
- **系统提示词**: 修改 `agent.constants.ts` 中的 `AGENT_SYSTEM_PROMPT`
- **任务处理逻辑**: 修改 `agent.processor.ts` 中的处理方法
- **工具集成**: 在 `agent.tools.ts` 中添加新工具

### 🎨 自定义UI界面
- **主题样式**: 修改 `bytebot-ui/src/app/globals.css`
- **组件库**: 扩展 `bytebot-ui/src/components/ui/`
- **页面布局**: 修改 `bytebot-ui/src/app/layout.tsx`

---

**最后更新**: 2024年12月
**索引状态**: 已分析核心架构和关键文件，建立智能导航系统
**下一步**: 继续深入分析待标记的重要文件