// Jest E2E 测试设置文件
// 用于端到端测试

import { spawn } from 'child_process';
import { PrismaClient } from '@prisma/client';

// 全局变量
global.testServer = null;
global.prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.TEST_DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/bytebotdb_test',
    },
  },
});

// 启动测试服务器
const startTestServer = async () => {
  return new Promise((resolve, reject) => {
    const server = spawn('npm', ['run', 'start:test'], {
      env: {
        ...process.env,
        NODE_ENV: 'test',
        PORT: '3001',
        DATABASE_URL: process.env.TEST_DATABASE_URL,
      },
      stdio: 'pipe',
    });

    server.stdout.on('data', (data) => {
      const output = data.toString();
      if (output.includes('Server running on port 3001')) {
        resolve(server);
      }
    });

    server.stderr.on('data', (data) => {
      console.error('Server error:', data.toString());
    });

    server.on('error', (error) => {
      reject(error);
    });

    // 超时处理
    setTimeout(() => {
      reject(new Error('Server startup timeout'));
    }, 30000);
  });
};

// 停止测试服务器
const stopTestServer = (server) => {
  return new Promise((resolve) => {
    if (server) {
      server.kill('SIGTERM');
      server.on('close', () => {
        resolve();
      });
    } else {
      resolve();
    }
  });
};

// 全局设置
beforeAll(async () => {
  console.log('🚀 启动 E2E 测试环境...');
  
  try {
    // 连接测试数据库
    await global.prisma.$connect();
    console.log('✅ 测试数据库连接成功');

    // 运行数据库迁移
    await global.prisma.$executeRaw`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    `;

    // 启动测试服务器
    global.testServer = await startTestServer();
    console.log('✅ 测试服务器启动成功');

    // 等待服务器完全启动
    await new Promise(resolve => setTimeout(resolve, 2000));

  } catch (error) {
    console.error('❌ E2E 测试环境启动失败:', error);
    process.exit(1);
  }
}, 60000);

afterAll(async () => {
  console.log('🧹 清理 E2E 测试环境...');
  
  try {
    // 停止测试服务器
    await stopTestServer(global.testServer);
    console.log('✅ 测试服务器已停止');

    // 断开数据库连接
    await global.prisma.$disconnect();
    console.log('✅ 数据库连接已断开');

  } catch (error) {
    console.error('❌ E2E 测试环境清理失败:', error);
  }
});

beforeEach(async () => {
  // 每个测试前重置数据库
  const tablenames = await global.prisma.$queryRaw`
    SELECT tablename FROM pg_tables WHERE schemaname='public'
  `;
  
  const tables = tablenames
    .map(({ tablename }) => tablename)
    .filter(name => name !== '_prisma_migrations')
    .map(name => `"public"."${name}"`)
    .join(', ');

  try {
    await global.prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`);
  } catch (error) {
    console.log('Database cleanup error:', error);
  }
});

// E2E 测试工具
global.e2eUtils = {
  // API 基础 URL
  baseURL: 'http://localhost:3001',

  // HTTP 请求工具
  request: async (method, path, data = null, headers = {}) => {
    const url = `${global.e2eUtils.baseURL}${path}`;
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);
    const responseData = await response.json();

    return {
      status: response.status,
      data: responseData,
      headers: response.headers,
    };
  },

  // 认证工具
  authenticate: async (email = 'test@example.com', password = 'password') => {
    const response = await global.e2eUtils.request('POST', '/api/auth/login', {
      email,
      password,
    });

    if (response.status === 200) {
      return response.data.token;
    }

    throw new Error('Authentication failed');
  },

  // 创建测试数据
  createTestData: async () => {
    // 创建测试用户
    const user = await global.prisma.user.create({
      data: {
        email: 'test@example.com',
        name: 'Test User',
        role: 'USER',
      },
    });

    // 创建测试对话
    const conversation = await global.prisma.conversation.create({
      data: {
        userId: user.id,
        title: 'Test Conversation',
      },
    });

    return { user, conversation };
  },

  // 等待条件
  waitFor: async (condition, timeout = 5000) => {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      if (await condition()) {
        return true;
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    throw new Error('Condition not met within timeout');
  },
};
