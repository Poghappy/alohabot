# ByteBot 环境变量配置指南
*Cursor IDE Agent 团队环境配置文档*

## 🎯 环境变量概述

ByteBot 使用环境变量来管理不同环境下的配置，包括数据库连接、API 密钥、服务端口等敏感信息。

## 📋 环境变量分类

### 必需变量 (Required)
这些变量在生产环境中必须设置：

```bash
# 数据库连接
DATABASE_URL=postgresql://user:password@host:port/database

# 安全密钥
JWT_SECRET=your-super-secret-jwt-key-change-in-production
ENCRYPTION_KEY=your-32-character-encryption-key-here

# 至少一个 AI API 密钥
OPENAI_API_KEY=sk-your-openai-api-key-here
# 或
ANTHROPIC_API_KEY=sk-ant-your-anthropic-api-key-here
# 或
GEMINI_API_KEY=your-gemini-api-key-here
```

### 可选变量 (Optional)
这些变量有默认值，可根据需要覆盖：

```bash
# 应用配置
NODE_ENV=development
BYTEBOT_UI_PORT=9992
BYTEBOT_AGENT_PORT=9991

# 日志配置
LOG_LEVEL=info
LOG_FORMAT=json
```

## 🔧 环境配置

### 开发环境 (.env.local)
```bash
# 应用环境
NODE_ENV=development

# 数据库 (本地)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/bytebotdb
REDIS_URL=redis://localhost:6379

# AI API (开发用)
OPENAI_API_KEY=sk-your-dev-openai-key
ANTHROPIC_API_KEY=sk-ant-your-dev-anthropic-key

# 安全 (开发用，不要在生产使用)
JWT_SECRET=dev-jwt-secret-key
ENCRYPTION_KEY=dev-encryption-key-32-characters

# 调试
DEBUG=bytebot:*
LOG_LEVEL=debug
VERBOSE=true
```

### 测试环境 (.env.test)
```bash
# 应用环境
NODE_ENV=test

# 测试数据库
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/bytebotdb_test
REDIS_URL=redis://localhost:6379/1

# 测试 API 密钥 (mock 或测试专用)
TEST_OPENAI_API_KEY=test-openai-key
TEST_ANTHROPIC_API_KEY=test-anthropic-key

# 安全 (测试用)
JWT_SECRET=test-jwt-secret
ENCRYPTION_KEY=test-encryption-key-32-characters

# 测试配置
LOG_LEVEL=error
VERBOSE=false
```

### 生产环境 (通过 GitHub Secrets 注入)
```bash
# 应用环境
NODE_ENV=production

# 数据库 (生产)
DATABASE_URL=${{ secrets.DATABASE_URL }}
REDIS_URL=${{ secrets.REDIS_URL }}

# AI API (生产)
OPENAI_API_KEY=${{ secrets.OPENAI_API_KEY }}
ANTHROPIC_API_KEY=${{ secrets.ANTHROPIC_API_KEY }}
GEMINI_API_KEY=${{ secrets.GEMINI_API_KEY }}

# 安全 (生产)
JWT_SECRET=${{ secrets.JWT_SECRET }}
ENCRYPTION_KEY=${{ secrets.ENCRYPTION_KEY }}

# 监控
SENTRY_DSN=${{ secrets.SENTRY_DSN }}
PROMETHEUS_ENABLED=true

# 日志
LOG_LEVEL=info
LOG_FORMAT=json
```

## 🔐 密钥管理策略

### GitHub Environments
为不同环境创建 GitHub Environments：

#### Development Environment
- **保护规则**: 无
- **密钥**:
  - `DATABASE_URL`: 开发数据库连接
  - `OPENAI_API_KEY`: 开发用 API 密钥
  - `JWT_SECRET`: 开发用 JWT 密钥

#### Staging Environment
- **保护规则**: 需要审批
- **密钥**:
  - `DATABASE_URL`: 测试数据库连接
  - `OPENAI_API_KEY`: 测试用 API 密钥
  - `JWT_SECRET`: 测试用 JWT 密钥

#### Production Environment
- **保护规则**: 需要审批 + 分支限制
- **密钥**:
  - `DATABASE_URL`: 生产数据库连接
  - `OPENAI_API_KEY`: 生产用 API 密钥
  - `ANTHROPIC_API_KEY`: 生产用 API 密钥
  - `JWT_SECRET`: 生产用 JWT 密钥
  - `ENCRYPTION_KEY`: 生产用加密密钥
  - `SENTRY_DSN`: 错误监控 DSN

### 本地开发设置
```bash
# 1. 复制环境变量模板
cp .env.example .env.local

# 2. 编辑环境变量
nano .env.local

# 3. 验证配置
npm run env:check
```

## 📊 环境变量验证

### 验证脚本
创建环境变量验证脚本：

```javascript
// scripts/validate-env.js
const requiredVars = {
  production: [
    'DATABASE_URL',
    'JWT_SECRET',
    'ENCRYPTION_KEY',
  ],
  development: [
    'DATABASE_URL',
  ],
  test: [
    'TEST_DATABASE_URL',
  ],
};

const optionalVars = [
  'OPENAI_API_KEY',
  'ANTHROPIC_API_KEY',
  'GEMINI_API_KEY',
  'REDIS_URL',
  'SENTRY_DSN',
];

function validateEnv() {
  const env = process.env.NODE_ENV || 'development';
  const required = requiredVars[env] || [];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(key => console.error(`  - ${key}`));
    process.exit(1);
  }
  
  console.log('✅ All required environment variables are set');
  
  // 检查可选变量
  const missingOptional = optionalVars.filter(key => !process.env[key]);
  if (missingOptional.length > 0) {
    console.warn('⚠️  Missing optional environment variables:');
    missingOptional.forEach(key => console.warn(`  - ${key}`));
  }
}

validateEnv();
```

### 类型定义
```typescript
// src/types/env.ts
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // 应用配置
      NODE_ENV: 'development' | 'staging' | 'production' | 'test';
      BYTEBOT_UI_PORT?: string;
      BYTEBOT_AGENT_PORT?: string;
      BYTEBOT_DESKTOP_PORT?: string;
      
      // 数据库
      DATABASE_URL: string;
      REDIS_URL?: string;
      
      // AI API
      OPENAI_API_KEY?: string;
      ANTHROPIC_API_KEY?: string;
      GEMINI_API_KEY?: string;
      
      // 安全
      JWT_SECRET: string;
      ENCRYPTION_KEY: string;
      
      // 监控
      SENTRY_DSN?: string;
      LOG_LEVEL?: 'error' | 'warn' | 'info' | 'debug';
    }
  }
}

export {};
```

## 🛡️ 安全最佳实践

### 密钥生成
```bash
# JWT 密钥 (至少 32 字符)
openssl rand -base64 32

# 加密密钥 (32 字节)
openssl rand -hex 32

# 随机密码
openssl rand -base64 24
```

### 密钥轮换
- **JWT 密钥**: 每 90 天轮换
- **加密密钥**: 每 180 天轮换
- **API 密钥**: 根据提供商建议轮换
- **数据库密码**: 每 180 天轮换

### 访问控制
- **开发环境**: 团队成员可访问
- **测试环境**: 需要审批
- **生产环境**: 仅核心团队可访问

## 🔍 故障排除

### 常见问题

#### 1. 数据库连接失败
```bash
# 检查数据库 URL 格式
echo $DATABASE_URL
# 应该是: postgresql://user:password@host:port/database

# 测试连接
psql $DATABASE_URL -c "SELECT 1;"
```

#### 2. API 密钥无效
```bash
# 检查 OpenAI API 密钥
curl -H "Authorization: Bearer $OPENAI_API_KEY" \
  https://api.openai.com/v1/models

# 检查 Anthropic API 密钥
curl -H "x-api-key: $ANTHROPIC_API_KEY" \
  https://api.anthropic.com/v1/messages
```

#### 3. 环境变量未加载
```bash
# 检查环境变量文件
ls -la .env*

# 验证环境变量
node -e "console.log(process.env.NODE_ENV)"

# 检查 dotenv 配置
npm run env:debug
```

### 调试命令
```bash
# 显示所有环境变量 (注意安全)
npm run env:list

# 验证必需变量
npm run env:validate

# 测试数据库连接
npm run db:test

# 测试 API 连接
npm run api:test
```

## 📋 环境变量清单

### 应用配置
- [ ] `NODE_ENV` - 应用环境
- [ ] `BYTEBOT_UI_PORT` - UI 端口
- [ ] `BYTEBOT_AGENT_PORT` - Agent 端口
- [ ] `BYTEBOT_DESKTOP_PORT` - Desktop 端口

### 数据库配置
- [ ] `DATABASE_URL` - PostgreSQL 连接
- [ ] `REDIS_URL` - Redis 连接

### AI API 配置
- [ ] `OPENAI_API_KEY` - OpenAI API 密钥
- [ ] `ANTHROPIC_API_KEY` - Anthropic API 密钥
- [ ] `GEMINI_API_KEY` - Gemini API 密钥

### 安全配置
- [ ] `JWT_SECRET` - JWT 签名密钥
- [ ] `ENCRYPTION_KEY` - 数据加密密钥

### 监控配置
- [ ] `SENTRY_DSN` - 错误监控
- [ ] `LOG_LEVEL` - 日志级别

### 开发配置
- [ ] `DEBUG` - 调试命名空间
- [ ] `VERBOSE` - 详细日志

---

> **文档版本**: v1.0  
> **最后更新**: 2025年9月25日  
> **负责团队**: Cursor IDE Agent 团队  
> **下次评审**: 2025年12月25日
