# ByteBot 配置文件和部署索引系统

## 部署架构概览

ByteBot支持多种部署方式：
- **Docker Compose**: 本地开发和小规模部署
- **Kubernetes (Helm)**: 生产环境和大规模部署
- **单机部署**: 简化的单服务器部署

## 🐳 Docker配置 (docker/)

### 1. 主配置文件

#### docker-compose.yml ⭐⭐⭐
**功能**: 生产环境Docker Compose配置  
**重要性**: 极高 - 标准部署配置  
**已分析状态**: ❌ 待深入分析

##### 服务架构
```yaml
version: '3.8'
services:
  # 主智能体服务
  bytebot-agent:
    image: bytebot/agent:latest
    ports:
      - "3001:3001"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
    depends_on:
      - postgres
      - redis
  
  # 前端UI服务
  bytebot-ui:
    image: bytebot/ui:latest
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=${API_URL}
    depends_on:
      - bytebot-agent
  
  # 桌面环境服务
  bytebotd:
    image: bytebot/desktop:latest
    ports:
      - "5900:5900"  # VNC端口
    privileged: true
    volumes:
      - /tmp/.X11-unix:/tmp/.X11-unix
  
  # 数据库服务
  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=bytebot
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
  
  # 缓存服务
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

#### docker-compose.development.yml ⭐⭐⭐
**功能**: 开发环境配置  
**重要性**: 极高 - 开发者必备配置  
**已分析状态**: ❌ 待分析

##### 开发特性
- **热重载**: 代码变更自动重启
- **调试端口**: 暴露调试接口
- **开发工具**: 集成开发辅助工具
- **日志详细**: 详细的调试日志

```yaml
version: '3.8'
services:
  bytebot-agent:
    build:
      context: ../packages/bytebot-agent
      dockerfile: Dockerfile
    volumes:
      - ../packages/bytebot-agent/src:/app/src
    environment:
      - NODE_ENV=development
      - LOG_LEVEL=debug
    ports:
      - "9229:9229"  # Node.js调试端口
```

#### docker-compose.core.yml ⭐⭐
**功能**: 核心服务配置  
**重要性**: 高 - 最小化部署配置  
**已分析状态**: ❌ 待分析

#### docker-compose.proxy.yml ⭐⭐
**功能**: 代理服务配置  
**重要性**: 高 - LLM代理服务部署  
**已分析状态**: ❌ 待分析

#### docker-compose-claude-code.yml ⭐⭐
**功能**: Claude Computer Use专用配置  
**重要性**: 高 - 特定AI模型部署  
**已分析状态**: ❌ 待分析

### 2. Dockerfile配置

#### bytebot-agent/Dockerfile ⭐⭐⭐
**功能**: 主智能体服务镜像构建  
**重要性**: 极高 - 核心服务容器化  
**已分析状态**: ❌ 待分析

```dockerfile
# 多阶段构建示例
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS runtime
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

#### bytebot-ui/Dockerfile ⭐⭐⭐
**功能**: 前端UI服务镜像构建  
**重要性**: 极高 - 前端服务容器化  
**已分析状态**: ❌ 待分析

#### bytebotd/Dockerfile ⭐⭐⭐
**功能**: 桌面环境服务镜像构建  
**重要性**: 极高 - 桌面服务容器化  
**已分析状态**: ❌ 待分析

##### 特殊配置
- **X11支持**: 图形界面支持
- **VNC服务**: 远程桌面访问
- **系统权限**: 特权模式运行
- **字体安装**: 中文字体支持

```dockerfile
FROM ubuntu:22.04

# 安装桌面环境
RUN apt-get update && apt-get install -y \
    xfce4 \
    xfce4-goodies \
    tigervnc-standalone-server \
    dbus-x11 \
    && rm -rf /var/lib/apt/lists/*

# 配置VNC
RUN mkdir -p /root/.vnc
COPY vnc-config/xstartup /root/.vnc/
RUN chmod +x /root/.vnc/xstartup

EXPOSE 5900
CMD ["vncserver", ":1", "-geometry", "1280x800", "-depth", "24"]
```

## ⚓ Kubernetes配置 (helm/)

### 1. Helm Chart结构

```
helm/
├── Chart.yaml              # Chart元数据
├── values.yaml             # 默认配置值
├── values-simple.yaml      # 简化配置
├── values-proxy.yaml       # 代理配置
├── templates/              # Kubernetes模板
│   ├── deployment.yaml     # 部署配置
│   ├── service.yaml        # 服务配置
│   ├── ingress.yaml        # 入口配置
│   ├── configmap.yaml      # 配置映射
│   └── secret.yaml         # 密钥配置
└── charts/                 # 依赖Chart
```

### 2. Chart.yaml ⭐⭐⭐
**功能**: Helm Chart元数据定义  
**重要性**: 极高 - Chart基础配置  
**已分析状态**: ❌ 待分析

```yaml
apiVersion: v2
name: bytebot
description: ByteBot AI Assistant Helm Chart
type: application
version: 0.1.0
appVersion: "1.0.0"

dependencies:
  - name: postgresql
    version: "12.x.x"
    repository: "https://charts.bitnami.com/bitnami"
    condition: postgresql.enabled
  
  - name: redis
    version: "17.x.x"
    repository: "https://charts.bitnami.com/bitnami"
    condition: redis.enabled
```

### 3. values.yaml ⭐⭐⭐
**功能**: 默认配置值  
**重要性**: 极高 - 生产环境配置模板  
**已分析状态**: ❌ 待深入分析

#### 核心配置结构
```yaml
# 全局配置
global:
  imageRegistry: ""
  imagePullSecrets: []
  storageClass: ""

# 智能体服务配置
agent:
  enabled: true
  image:
    repository: bytebot/agent
    tag: latest
    pullPolicy: IfNotPresent
  
  replicaCount: 1
  
  resources:
    limits:
      cpu: 1000m
      memory: 2Gi
    requests:
      cpu: 500m
      memory: 1Gi
  
  env:
    - name: NODE_ENV
      value: "production"
    - name: DATABASE_URL
      valueFrom:
        secretKeyRef:
          name: bytebot-secrets
          key: database-url

# UI服务配置
ui:
  enabled: true
  image:
    repository: bytebot/ui
    tag: latest
  
  service:
    type: ClusterIP
    port: 3000
  
  ingress:
    enabled: true
    className: "nginx"
    annotations:
      cert-manager.io/cluster-issuer: "letsencrypt-prod"
    hosts:
      - host: bytebot.example.com
        paths:
          - path: /
            pathType: Prefix
    tls:
      - secretName: bytebot-tls
        hosts:
          - bytebot.example.com

# 桌面服务配置
desktop:
  enabled: true
  image:
    repository: bytebot/desktop
    tag: latest
  
  securityContext:
    privileged: true
  
  service:
    type: NodePort
    ports:
      - port: 5900
        targetPort: 5900
        nodePort: 30590

# 数据库配置
postgresql:
  enabled: true
  auth:
    postgresPassword: "changeme"
    database: "bytebot"
  
  primary:
    persistence:
      enabled: true
      size: 10Gi

# 缓存配置
redis:
  enabled: true
  auth:
    enabled: false
  
  master:
    persistence:
      enabled: true
      size: 1Gi
```

### 4. values-simple.yaml ⭐⭐
**功能**: 简化部署配置  
**重要性**: 高 - 快速部署模板  
**已分析状态**: ❌ 待分析

### 5. values-proxy.yaml ⭐⭐
**功能**: 代理服务配置  
**重要性**: 高 - LLM代理部署  
**已分析状态**: ❌ 待分析

### 6. Kubernetes模板 (templates/)

#### deployment.yaml ⭐⭐⭐
**功能**: 应用部署配置  
**重要性**: 极高 - 核心部署模板  
**已分析状态**: ❌ 待分析

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ include "bytebot.fullname" . }}-agent
  labels:
    {{- include "bytebot.labels" . | nindent 4 }}
    component: agent
spec:
  replicas: {{ .Values.agent.replicaCount }}
  selector:
    matchLabels:
      {{- include "bytebot.selectorLabels" . | nindent 6 }}
      component: agent
  template:
    metadata:
      labels:
        {{- include "bytebot.selectorLabels" . | nindent 8 }}
        component: agent
    spec:
      containers:
        - name: agent
          image: "{{ .Values.agent.image.repository }}:{{ .Values.agent.image.tag }}"
          imagePullPolicy: {{ .Values.agent.image.pullPolicy }}
          ports:
            - name: http
              containerPort: 3001
              protocol: TCP
          env:
            {{- toYaml .Values.agent.env | nindent 12 }}
          resources:
            {{- toYaml .Values.agent.resources | nindent 12 }}
```

#### service.yaml ⭐⭐⭐
**功能**: 服务暴露配置  
**重要性**: 极高 - 网络访问配置  
**已分析状态**: ❌ 待分析

#### ingress.yaml ⭐⭐⭐
**功能**: 入口控制器配置  
**重要性**: 极高 - 外部访问配置  
**已分析状态**: ❌ 待分析

## ⚙️ 环境配置文件

### 1. 智能体服务配置

#### .env.example ⭐⭐⭐
**路径**: `packages/bytebot-agent/.env.example`  
**功能**: 智能体服务环境变量模板  
**重要性**: 极高 - 服务配置模板  
**已分析状态**: ❌ 待深入分析

```bash
# 数据库配置
DATABASE_URL="postgresql://user:password@localhost:5432/bytebot"

# AI服务配置
ANTHROPIC_API_KEY="your-anthropic-api-key"
OPENAI_API_KEY="your-openai-api-key"
GOOGLE_API_KEY="your-google-api-key"

# 服务配置
PORT=3001
NODE_ENV=development
LOG_LEVEL=info

# WebSocket配置
WS_PORT=3002
WS_CORS_ORIGIN="http://localhost:3000"

# 文件存储配置
FILE_UPLOAD_PATH="./uploads"
MAX_FILE_SIZE=10485760  # 10MB

# 桌面服务配置
DESKTOP_SERVICE_URL="http://localhost:8080"
VNC_PASSWORD="bytebot123"

# 缓存配置
REDIS_URL="redis://localhost:6379"

# 安全配置
JWT_SECRET="your-jwt-secret"
CORS_ORIGIN="http://localhost:3000"

# 监控配置
METRICS_ENABLED=true
METRICS_PORT=9090
```

### 2. 前端UI配置

#### .env.example ⭐⭐⭐
**路径**: `packages/bytebot-ui/.env.example`  
**功能**: 前端服务环境变量模板  
**重要性**: 极高 - 前端配置模板  
**已分析状态**: ❌ 待分析

```bash
# API服务配置
NEXT_PUBLIC_API_URL="http://localhost:3001"
NEXT_PUBLIC_WS_URL="ws://localhost:3002"

# 桌面服务配置
NEXT_PUBLIC_VNC_URL="http://localhost:5900"

# 应用配置
NEXT_PUBLIC_APP_NAME="ByteBot"
NEXT_PUBLIC_APP_VERSION="1.0.0"

# 功能开关
NEXT_PUBLIC_ENABLE_DESKTOP=true
NEXT_PUBLIC_ENABLE_FILE_UPLOAD=true
NEXT_PUBLIC_MAX_FILE_SIZE=10485760

# 主题配置
NEXT_PUBLIC_DEFAULT_THEME="light"
NEXT_PUBLIC_ENABLE_THEME_SWITCH=true

# 分析配置
NEXT_PUBLIC_ANALYTICS_ID=""
NEXT_PUBLIC_ENABLE_ANALYTICS=false
```

### 3. 桌面服务配置

#### .env.example ⭐⭐
**路径**: `packages/bytebotd/.env.example`  
**功能**: 桌面服务环境变量模板  
**重要性**: 高 - 桌面服务配置  
**已分析状态**: ❌ 待分析

```bash
# 服务配置
PORT=8080
NODE_ENV=development

# VNC配置
VNC_PORT=5900
VNC_PASSWORD="bytebot123"
VNC_GEOMETRY="1280x800"
VNC_DEPTH=24

# 显示配置
DISPLAY=:1
XAUTHORITY=/tmp/.X11-auth

# 安全配置
ALLOWED_ORIGINS="http://localhost:3000"
MAX_CONCURRENT_SESSIONS=5

# 性能配置
SCREENSHOT_QUALITY=80
SCREENSHOT_FORMAT="jpeg"
MAX_SCREENSHOT_SIZE=1920x1080
```

## 🗄️ 数据库配置

### 1. Prisma配置

#### schema.prisma ⭐⭐⭐
**路径**: `packages/bytebot-agent/prisma/schema.prisma`  
**功能**: 数据库模式定义  
**重要性**: 极高 - 数据结构定义  
**已分析状态**: ❌ 待深入分析

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// 任务模型
model Task {
  id          String      @id @default(cuid())
  description String
  status      TaskStatus  @default(PENDING)
  priority    TaskPriority @default(MEDIUM)
  type        TaskType?
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  completedAt DateTime?
  
  // 关联关系
  messages    Message[]
  files       TaskFile[]
  summaries   Summary[]
  
  @@map("tasks")
}

// 消息模型
model Message {
  id        String      @id @default(cuid())
  content   String
  role      MessageRole
  createdAt DateTime    @default(now())
  
  // 消息内容
  contentBlocks Json?
  attachments   Json?
  metadata      Json?
  
  // 关联关系
  taskId    String
  task      Task   @relation(fields: [taskId], references: [id], onDelete: Cascade)
  
  @@map("messages")
}

// 任务文件模型
model TaskFile {
  id       String @id @default(cuid())
  filename String
  path     String
  mimeType String
  size     Int
  checksum String?
  
  createdAt DateTime @default(now())
  
  // 关联关系
  taskId String
  task   Task   @relation(fields: [taskId], references: [id], onDelete: Cascade)
  
  @@map("task_files")
}

// 消息汇总模型
model Summary {
  id        String   @id @default(cuid())
  content   String
  tokenCount Int
  createdAt DateTime @default(now())
  
  // 关联关系
  taskId String
  task   Task   @relation(fields: [taskId], references: [id], onDelete: Cascade)
  
  @@map("summaries")
}

// 枚举定义
enum TaskStatus {
  PENDING
  RUNNING
  COMPLETED
  FAILED
  CANCELLED
}

enum TaskPriority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

enum TaskType {
  GENERAL
  CODING
  RESEARCH
  AUTOMATION
}

enum MessageRole {
  USER
  ASSISTANT
  SYSTEM
}
```

### 2. 数据库迁移 (migrations/)
**功能**: 数据库版本控制和迁移  
**重要性**: 高 - 数据库演进管理  
**已分析状态**: ❌ 待分析

## 🔧 构建配置

### 1. TypeScript配置

#### tsconfig.json ⭐⭐
**功能**: TypeScript编译配置  
**重要性**: 高 - 类型检查和编译  
**已分析状态**: ❌ 待分析

### 2. Next.js配置

#### next.config.ts ⭐⭐⭐
**路径**: `packages/bytebot-ui/next.config.ts`  
**功能**: Next.js应用配置  
**重要性**: 极高 - 前端构建配置  
**已分析状态**: ❌ 待分析

```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // 实验性功能
  experimental: {
    appDir: true,
    serverComponentsExternalPackages: ['prisma']
  },
  
  // 图片优化
  images: {
    domains: ['localhost'],
    formats: ['image/webp', 'image/avif']
  },
  
  // WebSocket支持
  webpack: (config) => {
    config.externals.push({
      'utf-8-validate': 'commonjs utf-8-validate',
      'bufferutil': 'commonjs bufferutil'
    })
    return config
  },
  
  // 环境变量
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY
  },
  
  // 重定向规则
  async redirects() {
    return [
      {
        source: '/',
        destination: '/tasks',
        permanent: false
      }
    ]
  }
}

export default nextConfig
```

### 3. ESLint配置

#### eslint.config.mjs ⭐⭐
**功能**: 代码质量检查配置  
**重要性**: 高 - 代码规范保证  
**已分析状态**: ❌ 待分析

### 4. Prettier配置

#### .prettierrc ⭐⭐
**功能**: 代码格式化配置  
**重要性**: 高 - 代码风格统一  
**已分析状态**: ❌ 待分析

## 🚀 部署脚本和自动化

### 1. GitHub Actions (.github/workflows/)

#### CI/CD流水线 ⭐⭐⭐
**功能**: 持续集成和部署  
**重要性**: 极高 - 自动化部署  
**已分析状态**: ❌ 待深入分析

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test
      - run: npm run lint
  
  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: docker/build-push-action@v3
        with:
          context: .
          push: true
          tags: bytebot/agent:${{ github.sha }}
  
  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: azure/k8s-deploy@v1
        with:
          manifests: |
            k8s/deployment.yaml
            k8s/service.yaml
```

### 2. 部署脚本

#### 快速部署脚本 ⭐⭐
**功能**: 一键部署脚本  
**重要性**: 高 - 简化部署流程  
**已分析状态**: ❌ 待创建

```bash
#!/bin/bash
# deploy.sh - ByteBot快速部署脚本

set -e

echo "🚀 开始部署ByteBot..."

# 检查依赖
command -v docker >/dev/null 2>&1 || { echo "❌ Docker未安装"; exit 1; }
command -v docker-compose >/dev/null 2>&1 || { echo "❌ Docker Compose未安装"; exit 1; }

# 创建环境文件
if [ ! -f .env ]; then
    echo "📝 创建环境配置文件..."
    cp .env.example .env
    echo "⚠️  请编辑 .env 文件配置必要的环境变量"
    exit 1
fi

# 构建和启动服务
echo "🔨 构建Docker镜像..."
docker-compose build

echo "🚀 启动服务..."
docker-compose up -d

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 30

# 健康检查
echo "🔍 检查服务状态..."
if curl -f http://localhost:3000 >/dev/null 2>&1; then
    echo "✅ ByteBot部署成功！"
    echo "🌐 访问地址: http://localhost:3000"
else
    echo "❌ 服务启动失败，请检查日志"
    docker-compose logs
    exit 1
fi
```

## 📊 监控和日志配置

### 1. 日志配置

#### 日志轮转配置 ⭐⭐
**功能**: 日志文件管理  
**重要性**: 高 - 日志存储优化  
**已分析状态**: ❌ 待创建

### 2. 监控配置

#### Prometheus配置 ⭐⭐
**功能**: 指标收集配置  
**重要性**: 高 - 性能监控  
**已分析状态**: ❌ 待创建

#### Grafana仪表板 ⭐⭐
**功能**: 监控可视化  
**重要性**: 高 - 监控展示  
**已分析状态**: ❌ 待创建

## 🔐 安全配置

### 1. SSL/TLS配置
**功能**: HTTPS证书配置  
**重要性**: 高 - 传输安全  
**已分析状态**: ❌ 待分析

### 2. 防火墙规则
**功能**: 网络安全配置  
**重要性**: 高 - 网络防护  
**已分析状态**: ❌ 待分析

### 3. 密钥管理
**功能**: 敏感信息管理  
**重要性**: 极高 - 安全基础  
**已分析状态**: ❌ 待分析

## 📋 部署检查清单

### 部署前检查
- [ ] 环境变量配置完整
- [ ] 数据库连接正常
- [ ] API密钥有效
- [ ] 存储空间充足
- [ ] 网络端口开放

### 部署后验证
- [ ] 服务健康检查通过
- [ ] 前端页面正常访问
- [ ] WebSocket连接正常
- [ ] 任务创建和执行正常
- [ ] 桌面环境可访问

### 性能优化
- [ ] 数据库索引优化
- [ ] 缓存策略配置
- [ ] 负载均衡设置
- [ ] CDN配置
- [ ] 监控告警设置

## 📋 待完成的分析任务

### 高优先级
- [ ] `docker-compose.yml` - 生产环境配置详细分析
- [ ] `values.yaml` - Kubernetes配置完整分析
- [ ] `schema.prisma` - 数据库模式深度分析
- [ ] 环境变量配置文件完整分析

### 中优先级
- [ ] Dockerfile构建配置分析
- [ ] Next.js配置详细分析
- [ ] CI/CD流水线配置
- [ ] 监控和日志配置

### 低优先级
- [ ] 安全配置详细分析
- [ ] 性能优化配置
- [ ] 部署脚本创建
- [ ] 故障排除指南

---

**创建时间**: 2024年12月  
**分析进度**: 20% (配置文件已识别，待深入分析)  
**部署方式**: Docker Compose + Kubernetes  
**下次更新**: 完成核心配置文件分析后