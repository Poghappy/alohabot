# ByteBot 依赖管理指南

## 📋 概述

本文档描述了 ByteBot 项目的依赖管理策略、最佳实践和自动化工具。

## 🏗️ 项目结构

```
bytebot/
├── package.json              # 根目录统一管理
├── .npmrc                    # NPM 配置优化
├── scripts/
│   └── dependency-management.sh  # 依赖管理脚本
├── packages/
│   ├── bytebot-agent/        # AI 智能体服务
│   ├── bytebot-ui/           # Web 用户界面
│   ├── bytebotd/             # 桌面服务守护进程
│   └── shared/               # 共享工具库
└── docker/
    ├── docker-compose.optimized.yml  # 优化的 Docker 配置
    └── Dockerfile.node-base  # 基础 Node.js 镜像
```

## 🔧 依赖管理策略

### 1. 统一版本管理

- **根目录 package.json**: 管理公共依赖和脚本
- **Workspaces**: 使用 npm workspaces 管理多包项目
- **版本锁定**: 使用 package-lock.json 确保版本一致性

### 2. 依赖分类

#### 生产依赖 (dependencies)
- 运行时必需的包
- 版本范围使用 `^` 允许小版本更新

#### 开发依赖 (devDependencies)
- 开发和构建时需要的包
- 版本范围使用 `^` 允许小版本更新

#### 对等依赖 (peerDependencies)
- 需要宿主环境提供的包
- 避免版本冲突

## 🚀 快速开始

### 安装依赖

```bash
# 安装所有依赖
npm install

# 或使用脚本
./scripts/dependency-management.sh install
```

### 开发环境

```bash
# 启动所有服务
npm run start:dev

# 启动特定服务
npm run start:agent
npm run start:ui
npm run start:desktop
```

### 构建项目

```bash
# 构建所有包
npm run build:all

# 构建特定包
npm run build:agent
npm run build:ui
npm run build:desktop
```

## 🔍 依赖检查

### 检查过时依赖

```bash
# 检查所有包的过时依赖
npm run outdated:all

# 或使用脚本
./scripts/dependency-management.sh outdated
```

### 安全审计

```bash
# 运行安全审计
npm run audit:all

# 自动修复安全漏洞
npm audit fix

# 或使用脚本
./scripts/dependency-management.sh audit
```

### 代码质量检查

```bash
# 运行代码检查
npm run lint:all

# 格式化代码
npm run format:all

# 运行测试
npm run test:all
```

## 🐳 Docker 优化

### 使用优化的 Docker 配置

```bash
# 使用优化的 Docker Compose
docker-compose -f docker/docker-compose.optimized.yml up -d

# 构建优化的镜像
docker-compose -f docker/docker-compose.optimized.yml build
```

### 构建缓存策略

- **多阶段构建**: 分离依赖安装和代码构建
- **层缓存**: 优化 Docker 层缓存
- **基础镜像**: 使用统一的基础镜像

## 📊 依赖分析

### 当前依赖状态

| 包名          | 生产依赖 | 开发依赖 | 主要技术栈                  |
| ------------- | -------- | -------- | --------------------------- |
| bytebot-agent | 21       | 25       | NestJS, Prisma, Socket.IO   |
| bytebot-ui    | 25       | 8        | Next.js, React, TailwindCSS |
| bytebotd      | 15       | 25       | NestJS, Nut.js, MCP         |
| shared        | 0        | 8        | TypeScript, ESLint          |

### 版本一致性检查

- ✅ **NestJS**: 所有包使用 ^11.x
- ⚠️ **TypeScript**: bytebot-ui 使用 ^5，其他使用 ^5.7.3
- ⚠️ **Prisma**: bytebot-ui 使用 ^6.5.0，其他使用 ^6.16.1

## 🔄 更新策略

### 定期更新

1. **每周检查**: 运行 `npm run outdated:all`
2. **每月更新**: 更新小版本依赖
3. **季度升级**: 评估大版本升级

### 更新流程

```bash
# 1. 检查过时依赖
npm run outdated:all

# 2. 更新依赖
npm run update:all

# 3. 运行测试
npm run test:all

# 4. 构建项目
npm run build:all

# 5. 提交更改
git add package*.json
git commit -m "chore: update dependencies"
```

## 🛡️ 安全最佳实践

### 1. 定期安全审计

```bash
# 每日检查
npm run audit:all

# 自动修复
npm audit fix
```

### 2. 依赖锁定

- 使用 `package-lock.json` 锁定确切版本
- 定期更新锁定文件
- 审查依赖变更

### 3. 最小权限原则

- 只安装必需的依赖
- 定期清理未使用的依赖
- 使用 `npm prune` 清理

## 📈 性能优化

### 1. 安装优化

```bash
# 使用 npm ci 进行生产安装
npm ci

# 启用缓存
npm config set cache /path/to/cache
```

### 2. 构建优化

- 使用多阶段 Docker 构建
- 实施依赖缓存策略
- 优化构建顺序

### 3. 运行时优化

- 使用生产环境配置
- 启用压缩和优化
- 监控依赖大小

## 🚨 故障排除

### 常见问题

1. **版本冲突**
   ```bash
   # 清理依赖
   npm run clean:all
   
   # 重新安装
   npm install
   ```

2. **构建失败**
   ```bash
   # 检查依赖
   npm run audit:all
   
   # 更新依赖
   npm run update:all
   ```

3. **安全漏洞**
   ```bash
   # 修复漏洞
   npm audit fix
   
   # 手动更新
   npm update [package-name]
   ```

### 调试工具

- `npm ls`: 查看依赖树
- `npm explain`: 解释依赖关系
- `npm why`: 查看为什么安装某个包

## 📚 参考资源

- [NPM Workspaces 文档](https://docs.npmjs.com/cli/v7/using-npm/workspaces)
- [Docker 多阶段构建](https://docs.docker.com/develop/dev-best-practices/dockerfile_best-practices/)
- [NPM 安全审计](https://docs.npmjs.com/cli/v7/commands/npm-audit)
- [Node.js 最佳实践](https://github.com/goldbergyoni/nodebestpractices)

## 🤝 贡献指南

1. 添加新依赖前，请检查是否已存在
2. 使用 `npm install --save-exact` 锁定版本
3. 更新依赖后，运行完整测试
4. 提交时包含依赖变更说明

---

**最后更新**: 2024年9月22日  
**维护者**: ByteBot 开发团队
