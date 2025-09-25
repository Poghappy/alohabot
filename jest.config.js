/** @type {import('jest').Config} */
module.exports = {
  // 基础配置
  preset: 'ts-jest',
  testEnvironment: 'node',
  
  // 根目录
  rootDir: '.',
  
  // 测试文件匹配模式
  testMatch: [
    '<rootDir>/**/__tests__/**/*.{ts,tsx,js,jsx}',
    '<rootDir>/**/*.{test,spec}.{ts,tsx,js,jsx}',
  ],
  
  // 忽略的文件和目录
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/dist/',
    '<rootDir>/build/',
    '<rootDir>/.next/',
    '<rootDir>/target/',
    '<rootDir>/coverage/',
  ],
  
  // 模块路径映射
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@bytebot/ui/(.*)$': '<rootDir>/packages/ui/src/$1',
    '^@bytebot/types/(.*)$': '<rootDir>/packages/types/src/$1',
    '^@bytebot/utils/(.*)$': '<rootDir>/packages/utils/src/$1',
    '^@bytebot/config/(.*)$': '<rootDir>/packages/config/src/$1',
    '^@bytebot/mcp/(.*)$': '<rootDir>/packages/mcp/src/$1',
  },
  
  // 文件扩展名解析
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  
  // 转换配置
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
    }],
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  
  // 设置文件
  setupFilesAfterEnv: [
    '<rootDir>/jest.setup.js',
  ],
  
  // 覆盖率配置
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{ts,tsx,js,jsx}',
    'packages/*/src/**/*.{ts,tsx,js,jsx}',
    'core/**/*.{ts,tsx,js,jsx}',
    '!**/*.d.ts',
    '!**/*.config.{ts,js}',
    '!**/*.stories.{ts,tsx,js,jsx}',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/build/**',
    '!**/coverage/**',
  ],
  
  coverageDirectory: 'coverage',
  coverageReporters: [
    'text',
    'text-summary',
    'html',
    'lcov',
    'json',
  ],
  
  // 覆盖率阈值
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    // 核心模块要求更高覆盖率
    './core/**/*.{ts,tsx,js,jsx}': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
    // 共享包要求更高覆盖率
    './packages/*/src/**/*.{ts,tsx,js,jsx}': {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85,
    },
  },
  
  // 测试环境变量
  testEnvironmentOptions: {
    NODE_ENV: 'test',
  },
  
  // 全局变量
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
    },
  },
  
  // 清除模拟
  clearMocks: true,
  restoreMocks: true,
  
  // 详细输出
  verbose: true,
  
  // 错误时停止
  bail: false,
  
  // 最大并发数
  maxConcurrency: 5,
  
  // 测试超时
  testTimeout: 10000,
  
  // 项目配置 (多项目支持)
  projects: [
    {
      displayName: 'unit',
      testMatch: ['<rootDir>/**/*.unit.{test,spec}.{ts,tsx,js,jsx}'],
      testEnvironment: 'node',
    },
    {
      displayName: 'integration',
      testMatch: ['<rootDir>/**/*.integration.{test,spec}.{ts,tsx,js,jsx}'],
      testEnvironment: 'node',
      setupFilesAfterEnv: ['<rootDir>/jest.integration.setup.js'],
    },
    {
      displayName: 'e2e',
      testMatch: ['<rootDir>/**/*.e2e.{test,spec}.{ts,tsx,js,jsx}'],
      testEnvironment: 'node',
      setupFilesAfterEnv: ['<rootDir>/jest.e2e.setup.js'],
    },
  ],
};