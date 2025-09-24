# ByteBot API接口和服务层索引系统

## 服务架构概览

ByteBot采用微服务架构，主要包含以下服务模块：
- **bytebot-agent**: 主智能体服务 (NestJS)
- **bytebot-agent-cc**: Claude Computer Use智能体
- **bytebotd**: 桌面环境服务
- **bytebot-llm-proxy**: LLM代理服务

## 🚀 主智能体服务 (bytebot-agent)

### 技术栈
- **框架**: NestJS (Node.js)
- **数据库**: PostgreSQL + Prisma ORM
- **实时通信**: WebSocket (Socket.IO)
- **API文档**: Swagger/OpenAPI
- **身份验证**: JWT (可选)

### 📁 服务模块结构

```
bytebot-agent/src/
├── app.module.ts              # 应用主模块
├── main.ts                    # 应用入口
├── tasks/                     # 任务管理服务
├── messages/                  # 消息管理服务
├── agent/                     # 智能体核心服务
├── anthropic/                 # Claude集成服务
├── openai/                    # OpenAI集成服务
├── google/                    # Google AI集成服务
├── proxy/                     # 代理服务
├── summaries/                 # 消息汇总服务
└── prisma/                    # 数据库服务
```

## 📋 任务管理API (tasks/)

### 1. TasksController ⭐⭐⭐
**文件**: `tasks.controller.ts`  
**功能**: 任务管理REST API端点  
**重要性**: 极高 - 任务操作的主要入口  
**已分析状态**: ✅ 部分分析

#### API端点概览
```typescript
@Controller('tasks')
export class TasksController {
  // GET /tasks - 获取任务列表
  @Get()
  async findAll(@Query() query: FindTasksDto)
  
  // POST /tasks - 创建新任务
  @Post()
  async create(@Body() createTaskDto: CreateTaskDto)
  
  // GET /tasks/:id - 获取任务详情
  @Get(':id')
  async findOne(@Param('id') id: string)
  
  // PATCH /tasks/:id - 更新任务
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto)
  
  // DELETE /tasks/:id - 删除任务
  @Delete(':id')
  async remove(@Param('id') id: string)
  
  // POST /tasks/:id/messages - 添加任务消息
  @Post(':id/messages')
  async addMessage(@Param('id') id: string, @Body() messageDto: AddTaskMessageDto)
  
  // POST /tasks/:id/takeover - 任务接管
  @Post(':id/takeover')
  async takeover(@Param('id') id: string)
  
  // POST /tasks/:id/resume - 任务恢复
  @Post(':id/resume')
  async resume(@Param('id') id: string)
  
  // POST /tasks/:id/cancel - 任务取消
  @Post(':id/cancel')
  async cancel(@Param('id') id: string)
}
```

#### 关键端点详解

##### POST /tasks - 创建任务
**请求体**: `CreateTaskDto`
```typescript
{
  description: string;        // 任务描述
  type?: TaskType;           // 任务类型
  priority?: TaskPriority;   // 任务优先级
  files?: TaskFileDto[];     // 附件文件
}
```

**响应**: 创建的任务对象
```typescript
{
  id: string;
  description: string;
  status: TaskStatus;
  createdAt: Date;
  updatedAt: Date;
  // ... 其他字段
}
```

##### GET /tasks - 获取任务列表
**查询参数**: `FindTasksDto`
- `status?`: 任务状态筛选
- `priority?`: 优先级筛选
- `page?`: 分页页码
- `limit?`: 每页数量
- `search?`: 搜索关键词

##### POST /tasks/:id/messages - 添加消息
**功能**: 向任务添加新的用户消息，触发智能体处理
**请求体**: `AddTaskMessageDto`
```typescript
{
  content: string;           // 消息内容
  role: MessageRole;         // 消息角色 (USER/ASSISTANT)
  attachments?: File[];      // 附件
}
```

### 2. TasksService ⭐⭐⭐
**文件**: `tasks.service.ts`  
**功能**: 任务业务逻辑处理  
**重要性**: 极高 - 任务管理的核心业务逻辑  
**已分析状态**: ✅ 部分分析 (前120行)

#### 核心方法分析

##### create() - 任务创建
```typescript
async create(createTaskDto: CreateTaskDto): Promise<Task> {
  // 1. 数据验证
  // 2. 文件处理和保存
  // 3. 任务记录创建
  // 4. 初始消息生成
  // 5. WebSocket事件触发
}
```

**处理流程**:
1. **输入验证**: 验证任务描述和文件
2. **文件保存**: 异步保存上传的文件
3. **任务创建**: 在数据库中创建任务记录
4. **初始消息**: 创建包含任务描述和文件信息的初始消息
5. **事件通知**: 通过WebSocket通知前端

##### findScheduledTasks() - 查找待调度任务
**功能**: 获取等待处理的任务队列
**用途**: 任务调度器使用

##### findNextTask() - 获取下一个任务
**功能**: 根据优先级和创建时间获取下一个待处理任务
**算法**: 优先级 + 时间排序

#### 依赖服务
- **PrismaService**: 数据库操作
- **TasksGateway**: WebSocket通信
- **AgentProcessor**: 智能体处理器

### 3. TasksGateway ⭐⭐⭐
**文件**: `tasks.gateway.ts`  
**功能**: 任务相关WebSocket通信  
**重要性**: 极高 - 实时任务状态同步  
**已分析状态**: ❌ 待深入分析

#### WebSocket事件
```typescript
@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/tasks'
})
export class TasksGateway {
  // 任务状态更新事件
  @SubscribeMessage('task-status-update')
  handleTaskStatusUpdate()
  
  // 新消息事件
  @SubscribeMessage('new-message')
  handleNewMessage()
  
  // 任务完成事件
  @SubscribeMessage('task-completed')
  handleTaskCompleted()
}
```

### 4. 数据传输对象 (dto/)

#### CreateTaskDto ⭐⭐⭐
**文件**: `dto/create-task.dto.ts`  
**功能**: 任务创建数据验证  
**已分析状态**: ✅ 完全分析

```typescript
export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  description: string;
  
  @IsOptional()
  @IsEnum(TaskType)
  type?: TaskType;
  
  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;
  
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TaskFileDto)
  files?: TaskFileDto[];
}

export class TaskFileDto {
  @IsString()
  @IsNotEmpty()
  filename: string;
  
  @IsString()
  @IsNotEmpty()
  content: string;  // Base64编码
  
  @IsString()
  @IsNotEmpty()
  mimeType: string;
}
```

#### UpdateTaskDto & AddTaskMessageDto
**功能**: 任务更新和消息添加的数据验证
**已分析状态**: ❌ 待分析

## 💬 消息管理API (messages/)

### 1. MessagesService ⭐⭐⭐
**文件**: `messages.service.ts`  
**功能**: 消息管理业务逻辑  
**重要性**: 极高 - 聊天消息的核心处理  
**已分析状态**: ❌ 待深入分析

#### 预期功能
- 消息创建和存储
- 消息历史查询
- 消息内容解析
- 附件处理
- 消息汇总算法

## 🤖 智能体集成服务

### 1. Anthropic服务 (anthropic/)

#### AnthropicService ⭐⭐⭐
**文件**: `anthropic.service.ts`  
**功能**: Claude AI集成  
**重要性**: 极高 - 主要AI服务提供商  
**已分析状态**: ❌ 待深入分析

##### 预期功能
- Claude API调用
- 消息格式转换
- 流式响应处理
- 错误处理和重试
- 使用量统计

##### API集成
```typescript
@Injectable()
export class AnthropicService {
  async createMessage(messages: Message[]): Promise<AnthropicResponse>
  async streamMessage(messages: Message[]): AsyncIterable<AnthropicChunk>
  async validateApiKey(): Promise<boolean>
}
```

#### AnthropicTools ⭐⭐
**文件**: `anthropic.tools.ts`  
**功能**: Claude工具定义  
**已分析状态**: ❌ 待分析

### 2. OpenAI服务 (openai/)

#### OpenAIService ⭐⭐
**文件**: `openai.service.ts`  
**功能**: OpenAI GPT集成  
**重要性**: 高 - 备选AI服务提供商  
**已分析状态**: ❌ 待分析

### 3. Google服务 (google/)

#### GoogleService ⭐⭐
**文件**: `google.service.ts`  
**功能**: Google AI集成  
**重要性**: 高 - 备选AI服务提供商  
**已分析状态**: ❌ 待分析

## 🔄 代理服务 (proxy/)

### ProxyService ⭐⭐
**文件**: `proxy.service.ts`  
**功能**: LLM请求代理和负载均衡  
**重要性**: 高 - 多模型支持和故障转移  
**已分析状态**: ❌ 待分析

#### 预期功能
- 多模型路由
- 负载均衡
- 故障转移
- 请求缓存
- 使用量监控

## 📊 汇总服务 (summaries/)

### SummariesService ⭐⭐
**文件**: `summaries.service.ts`  
**功能**: 消息汇总和上下文管理  
**重要性**: 高 - 长对话的上下文压缩  
**已分析状态**: ❌ 待分析

#### 预期功能
- 消息历史汇总
- 上下文窗口管理
- 关键信息提取
- 汇总质量评估

## 🗄️ 数据库服务 (prisma/)

### PrismaService ⭐⭐⭐
**文件**: `prisma.service.ts`  
**功能**: 数据库连接和操作  
**重要性**: 极高 - 数据持久化的基础  
**已分析状态**: ❌ 待分析

#### 数据模型 (schema.prisma)
```prisma
model Task {
  id          String   @id @default(cuid())
  description String
  status      TaskStatus
  priority    TaskPriority
  type        TaskType?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  messages    Message[]
  files       TaskFile[]
}

model Message {
  id        String      @id @default(cuid())
  content   String
  role      MessageRole
  createdAt DateTime    @default(now())
  
  taskId    String
  task      Task        @relation(fields: [taskId], references: [id])
}

model TaskFile {
  id       String @id @default(cuid())
  filename String
  path     String
  mimeType String
  size     Int
  
  taskId   String
  task     Task   @relation(fields: [taskId], references: [id])
}
```

## 🖥️ 桌面环境服务 (bytebotd)

### 技术栈
- **框架**: NestJS
- **桌面控制**: X11/Wayland
- **VNC服务**: TigerVNC
- **输入处理**: 原生系统调用

### 📁 服务模块结构

```
bytebotd/src/
├── app.module.ts              # 应用主模块
├── main.ts                    # 应用入口
├── computer-use/              # 计算机操作服务
├── input-tracking/            # 输入跟踪服务
├── mcp/                       # MCP协议集成
└── nut/                       # 网络用户跟踪
```

### 1. 计算机操作API (computer-use/)

#### ComputerUseController ⭐⭐⭐
**文件**: `computer-use.controller.ts`  
**功能**: 计算机操作REST API  
**重要性**: 极高 - 智能体操作计算机的接口  
**已分析状态**: ❌ 待深入分析

##### API端点概览
```typescript
@Controller('computer-use')
export class ComputerUseController {
  // POST /computer-use/screenshot - 截图
  @Post('screenshot')
  async takeScreenshot()
  
  // POST /computer-use/click - 鼠标点击
  @Post('click')
  async click(@Body() clickDto: ClickActionDto)
  
  // POST /computer-use/type - 键盘输入
  @Post('type')
  async type(@Body() typeDto: TypeActionDto)
  
  // POST /computer-use/key - 按键操作
  @Post('key')
  async key(@Body() keyDto: KeyActionDto)
  
  // POST /computer-use/scroll - 滚动操作
  @Post('scroll')
  async scroll(@Body() scrollDto: ScrollActionDto)
}
```

#### ComputerUseService ⭐⭐⭐
**文件**: `computer-use.service.ts`  
**功能**: 计算机操作业务逻辑  
**重要性**: 极高 - 系统操作的核心实现  
**已分析状态**: ✅ 部分分析

##### 支持的操作类型
```typescript
enum ComputerAction {
  SCREENSHOT = 'screenshot',
  CLICK = 'click',
  RIGHT_CLICK = 'right_click',
  DOUBLE_CLICK = 'double_click',
  TYPE = 'type',
  KEY = 'key',
  SCROLL = 'scroll',
  DRAG = 'drag'
}
```

##### 核心方法
- **`takeScreenshot()`**: 屏幕截图
- **`click(x, y)`**: 鼠标点击
- **`type(text)`**: 文本输入
- **`key(key)`**: 按键操作
- **`scroll(direction, amount)`**: 滚动操作

#### 数据传输对象 (dto/)

##### ComputerActionDto ⭐⭐
**文件**: `dto/computer-action.dto.ts`  
**功能**: 计算机操作数据验证  
**已分析状态**: ❌ 待分析

```typescript
export class ClickActionDto {
  @IsNumber()
  @Min(0)
  x: number;
  
  @IsNumber()
  @Min(0)
  y: number;
  
  @IsOptional()
  @IsEnum(['left', 'right', 'middle'])
  button?: string;
}

export class TypeActionDto {
  @IsString()
  @IsNotEmpty()
  text: string;
}

export class KeyActionDto {
  @IsString()
  @IsNotEmpty()
  key: string;
  
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  modifiers?: string[];
}
```

### 2. 输入跟踪服务 (input-tracking/)

#### InputTrackingService ⭐⭐
**文件**: `input-tracking.service.ts`  
**功能**: 用户输入监控和记录  
**重要性**: 高 - 用户行为分析  
**已分析状态**: ❌ 待分析

#### InputTrackingGateway ⭐⭐
**文件**: `input-tracking.gateway.ts`  
**功能**: 输入事件实时推送  
**重要性**: 高 - 实时输入反馈  
**已分析状态**: ❌ 待分析

## 🔗 LLM代理服务 (bytebot-llm-proxy)

### 技术栈
- **框架**: LiteLLM
- **配置**: YAML配置文件
- **协议**: OpenAI兼容API

### 配置文件 (litellm-config.yaml)
```yaml
model_list:
  - model_name: claude-3-sonnet
    litellm_params:
      model: anthropic/claude-3-sonnet-20240229
      api_key: ${ANTHROPIC_API_KEY}
      
  - model_name: gpt-4
    litellm_params:
      model: openai/gpt-4
      api_key: ${OPENAI_API_KEY}
      
  - model_name: gemini-pro
    litellm_params:
      model: google/gemini-pro
      api_key: ${GOOGLE_API_KEY}
```

### 功能特性
- **统一API**: 所有模型使用OpenAI格式
- **负载均衡**: 自动分发请求
- **故障转移**: 模型不可用时自动切换
- **使用统计**: 请求量和成本监控

## 🔐 安全和认证

### API安全
- **CORS配置**: 跨域请求控制
- **请求验证**: DTO数据验证
- **错误处理**: 统一错误响应格式
- **日志记录**: 操作审计日志

### 数据安全
- **文件上传**: 类型和大小限制
- **SQL注入**: Prisma ORM防护
- **XSS防护**: 输入内容转义
- **敏感信息**: 环境变量管理

## 📊 监控和日志

### 应用监控
- **健康检查**: `/health` 端点
- **性能指标**: 响应时间统计
- **错误监控**: 异常捕获和报告
- **资源使用**: CPU和内存监控

### 日志系统
- **结构化日志**: JSON格式输出
- **日志级别**: DEBUG/INFO/WARN/ERROR
- **请求追踪**: 唯一请求ID
- **敏感信息**: 自动脱敏处理

## 🚀 部署和扩展

### Docker化部署
- **多阶段构建**: 优化镜像大小
- **健康检查**: 容器状态监控
- **环境变量**: 配置外部化
- **数据持久化**: 卷挂载

### 水平扩展
- **无状态设计**: 支持多实例部署
- **负载均衡**: Nginx/HAProxy
- **数据库连接池**: 连接复用
- **缓存策略**: Redis集成

## 📋 待完成的分析任务

### 高优先级
- [ ] `TasksGateway` - WebSocket实时通信实现
- [ ] `AnthropicService` - Claude AI集成详细分析
- [ ] `ComputerUseController` - 计算机操作API完整分析
- [ ] `MessagesService` - 消息管理业务逻辑

### 中优先级
- [ ] `ProxyService` - LLM代理服务实现
- [ ] `SummariesService` - 消息汇总算法
- [ ] `InputTrackingService` - 输入跟踪功能
- [ ] 数据库模型完整分析

### 低优先级
- [ ] OpenAI和Google服务集成
- [ ] MCP协议集成分析
- [ ] 安全和认证机制详细分析
- [ ] 监控和日志系统实现

---

**创建时间**: 2024年12月  
**分析进度**: 30% (核心API已识别，部分已分析)  
**架构模式**: 微服务 + RESTful API + WebSocket  
**下次更新**: 完成WebSocket和AI服务集成分析后