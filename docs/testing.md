# ByteBot 测试策略与指南
*Cursor IDE Agent 团队测试规范文档*

## 🎯 测试策略概述

ByteBot 采用分层测试策略，确保代码质量和系统稳定性。我们遵循测试金字塔原则，重点关注单元测试，辅以集成测试和端到端测试。

## 🏗️ 测试金字塔

```
        /\
       /  \
      / E2E \     <- 少量，关键用户流程
     /______\
    /        \
   /Integration\ <- 适量，模块间交互
  /__________\
 /            \
/  Unit Tests  \   <- 大量，业务逻辑覆盖
/______________\
```

### 测试分层原则
- **70% 单元测试**: 快速、独立、覆盖业务逻辑
- **20% 集成测试**: 验证模块间交互
- **10% E2E 测试**: 验证关键用户流程

## 🧪 测试类型详解

### 1. 单元测试 (Unit Tests)
**目标**: 测试单个函数、类或组件的行为

**特点**:
- 快速执行 (< 1秒)
- 独立运行，无外部依赖
- 高覆盖率要求 (90%+)

**示例**:
```typescript
// utils/formatDate.unit.test.ts
import { formatDate } from '../formatDate';

describe('formatDate', () => {
  it('should format date correctly', () => {
    const date = new Date('2023-12-25');
    const result = formatDate(date);
    expect(result).toBe('2023-12-25');
  });

  it('should handle invalid date', () => {
    const result = formatDate(null);
    expect(result).toBe('Invalid Date');
  });
});
```

### 2. 集成测试 (Integration Tests)
**目标**: 测试模块间的交互和数据流

**特点**:
- 涉及数据库、API 调用
- 测试真实的业务场景
- 中等执行时间 (1-10秒)

**示例**:
```typescript
// services/userService.integration.test.ts
import { UserService } from '../userService';
import { prisma } from '../../../lib/prisma';

describe('UserService Integration', () => {
  beforeEach(async () => {
    await testUtils.cleanupTable('users');
  });

  it('should create user and save to database', async () => {
    const userData = {
      email: 'test@example.com',
      name: 'Test User',
    };

    const user = await UserService.create(userData);
    
    expect(user.id).toBeDefined();
    expect(user.email).toBe(userData.email);

    // 验证数据库中的数据
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
    });
    expect(dbUser).toBeTruthy();
  });
});
```

### 3. 端到端测试 (E2E Tests)
**目标**: 测试完整的用户流程

**特点**:
- 模拟真实用户操作
- 涉及完整的系统栈
- 较长执行时间 (10-60秒)

**示例**:
```typescript
// flows/userRegistration.e2e.test.ts
describe('User Registration Flow', () => {
  it('should complete user registration successfully', async () => {
    // 1. 访问注册页面
    const response = await e2eUtils.request('GET', '/api/auth/register');
    expect(response.status).toBe(200);

    // 2. 提交注册信息
    const userData = {
      email: 'newuser@example.com',
      name: 'New User',
      password: 'securePassword123',
    };

    const registerResponse = await e2eUtils.request('POST', '/api/auth/register', userData);
    expect(registerResponse.status).toBe(201);

    // 3. 验证用户创建
    const user = await prisma.user.findUnique({
      where: { email: userData.email },
    });
    expect(user).toBeTruthy();
    expect(user.name).toBe(userData.name);
  });
});
```

## 📊 覆盖率要求

### 全局覆盖率阈值
- **整体项目**: 80%
- **核心模块**: 90%
- **共享包**: 85%
- **UI 组件**: 70%

### 分类覆盖率要求
```yaml
业务逻辑:
  - 服务层: 95%
  - 工具函数: 90%
  - 数据模型: 85%

用户界面:
  - React 组件: 70%
  - Hooks: 80%
  - 页面组件: 60%

基础设施:
  - 配置文件: 60%
  - 中间件: 85%
  - 数据库层: 90%
```

### 覆盖率监控
```bash
# 生成覆盖率报告
npm run test:coverage

# 查看详细报告
open coverage/lcov-report/index.html

# CI 中的覆盖率检查
npm run test:coverage -- --coverageThreshold='{"global":{"branches":80,"functions":80,"lines":80,"statements":80}}'
```

## 🛠️ 测试工具链

### 核心工具
- **Jest**: 测试框架和断言库
- **Testing Library**: React 组件测试
- **Supertest**: API 测试
- **Prisma**: 数据库测试工具
- **MSW**: API 模拟

### 前端测试工具
```typescript
// React 组件测试示例
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../Button';

describe('Button Component', () => {
  it('should render with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('should handle click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### 后端测试工具
```typescript
// API 测试示例
import request from 'supertest';
import { app } from '../app';

describe('User API', () => {
  it('should create user', async () => {
    const userData = {
      email: 'test@example.com',
      name: 'Test User',
    };

    const response = await request(app)
      .post('/api/users')
      .send(userData)
      .expect(201);

    expect(response.body.email).toBe(userData.email);
  });
});
```

## 🎭 模拟和存根

### API 模拟
```typescript
// 使用 MSW 模拟 API
import { rest } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
  rest.post('/api/ai/chat', (req, res, ctx) => {
    return res(
      ctx.json({
        message: 'Mocked AI response',
        tokens: 50,
      })
    );
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### 数据库模拟
```typescript
// 模拟 Prisma 客户端
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  })),
}));
```

### 外部服务模拟
```typescript
// 模拟 OpenAI API
jest.mock('openai', () => ({
  OpenAI: jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [{ message: { content: 'Mocked response' } }],
        }),
      },
    },
  })),
}));
```

## 📝 测试编写指南

### 测试命名规范
```typescript
// ✅ 好的测试名称
describe('UserService', () => {
  describe('create', () => {
    it('should create user with valid data', () => {});
    it('should throw error when email already exists', () => {});
    it('should hash password before saving', () => {});
  });
});

// ❌ 不好的测试名称
describe('UserService', () => {
  it('test1', () => {});
  it('should work', () => {});
  it('creates user', () => {});
});
```

### AAA 模式 (Arrange-Act-Assert)
```typescript
it('should calculate total price correctly', () => {
  // Arrange - 准备测试数据
  const items = [
    { price: 10, quantity: 2 },
    { price: 5, quantity: 3 },
  ];

  // Act - 执行被测试的操作
  const total = calculateTotal(items);

  // Assert - 验证结果
  expect(total).toBe(35);
});
```

### 测试数据管理
```typescript
// 使用工厂函数创建测试数据
const createTestUser = (overrides = {}) => ({
  id: 'test-user-id',
  email: 'test@example.com',
  name: 'Test User',
  role: 'USER',
  ...overrides,
});

// 使用 fixtures
const userFixtures = {
  admin: createTestUser({ role: 'ADMIN' }),
  regular: createTestUser({ role: 'USER' }),
  inactive: createTestUser({ status: 'INACTIVE' }),
};
```

## 🚀 测试执行

### 本地开发
```bash
# 运行所有测试
npm test

# 运行特定类型测试
npm run test:unit
npm run test:integration
npm run test:e2e

# 监听模式
npm test -- --watch

# 覆盖率报告
npm run test:coverage

# 调试模式
npm test -- --detectOpenHandles --forceExit
```

### CI/CD 环境
```bash
# CI 中的测试命令
npm run test:ci

# 并行执行
npm test -- --maxWorkers=4

# 静默模式
npm test -- --silent

# JUnit 报告
npm test -- --reporters=default --reporters=jest-junit
```

## 📈 测试性能优化

### 并行执行
```javascript
// jest.config.js
module.exports = {
  maxWorkers: '50%', // 使用 50% 的 CPU 核心
  testTimeout: 10000, // 10秒超时
};
```

### 测试隔离
```typescript
// 每个测试文件独立的数据库
beforeEach(async () => {
  await testUtils.cleanupDatabase();
  await testUtils.seedTestData();
});
```

### 缓存优化
```bash
# 清理 Jest 缓存
npm test -- --clearCache

# 禁用缓存
npm test -- --no-cache
```

## 🔍 测试调试

### 调试技巧
```typescript
// 使用 console.log 调试
it('should debug test', () => {
  const result = someFunction();
  console.log('Debug result:', result);
  expect(result).toBe(expected);
});

// 使用 Jest 调试器
it('should debug with breakpoint', () => {
  debugger; // 在此处设置断点
  const result = someFunction();
  expect(result).toBe(expected);
});
```

### 常见问题排查
```bash
# 内存泄漏检查
npm test -- --detectOpenHandles --forceExit

# 异步操作未完成
npm test -- --detectOpenHandles

# 测试超时
npm test -- --testTimeout=30000
```

## 📋 测试检查清单

### 单元测试检查清单
- [ ] 测试覆盖所有分支路径
- [ ] 测试边界条件和异常情况
- [ ] 使用有意义的测试名称
- [ ] 遵循 AAA 模式
- [ ] 避免测试实现细节
- [ ] 每个测试只验证一个行为

### 集成测试检查清单
- [ ] 测试真实的业务场景
- [ ] 验证数据持久化
- [ ] 测试错误处理
- [ ] 清理测试数据
- [ ] 验证副作用

### E2E 测试检查清单
- [ ] 覆盖关键用户流程
- [ ] 测试跨模块交互
- [ ] 验证用户界面
- [ ] 测试性能要求
- [ ] 包含错误场景

## 🎯 质量门禁

### 提交前检查
- 所有测试通过
- 覆盖率达到要求
- 无 linting 错误
- 性能测试通过

### CI/CD 检查
- 自动化测试执行
- 覆盖率报告生成
- 测试结果通知
- 失败时阻止部署

---

> **文档版本**: v1.0  
> **最后更新**: 2025年9月25日  
> **负责团队**: Cursor IDE Agent 团队  
> **下次评审**: 2025年12月25日
