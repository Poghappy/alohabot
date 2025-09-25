// Jest 集成测试设置文件
// 用于需要数据库连接的集成测试

import { PrismaClient } from '@prisma/client';

// 全局 Prisma 客户端
global.prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.TEST_DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/bytebotdb_test',
    },
  },
});

// 测试数据库设置
beforeAll(async () => {
  // 确保测试数据库连接
  try {
    await global.prisma.$connect();
    console.log('✅ 测试数据库连接成功');
  } catch (error) {
    console.error('❌ 测试数据库连接失败:', error);
    process.exit(1);
  }
});

afterAll(async () => {
  // 清理测试数据库连接
  await global.prisma.$disconnect();
});

beforeEach(async () => {
  // 每个测试前清理数据库
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
    console.log({ error });
  }
});

// 测试工具函数
global.testUtils = {
  // 创建测试用户
  createTestUser: async (data = {}) => {
    return await global.prisma.user.create({
      data: {
        email: 'test@example.com',
        name: 'Test User',
        ...data,
      },
    });
  },

  // 创建测试对话
  createTestConversation: async (userId, data = {}) => {
    return await global.prisma.conversation.create({
      data: {
        userId,
        title: 'Test Conversation',
        ...data,
      },
    });
  },

  // 创建测试消息
  createTestMessage: async (conversationId, data = {}) => {
    return await global.prisma.message.create({
      data: {
        conversationId,
        role: 'USER',
        content: 'Test message',
        ...data,
      },
    });
  },

  // 清理特定表
  cleanupTable: async (tableName) => {
    await global.prisma.$executeRawUnsafe(`TRUNCATE TABLE "public"."${tableName}" CASCADE;`);
  },
};
