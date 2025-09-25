import type { Config } from 'jest';

const config: Config = {
  // 使用 ts-jest 预设
  preset: 'ts-jest',
  
  // 测试环境
  testEnvironment: 'node',
  
  // 测试文件匹配模式
  testMatch: [
    '<rootDir>/apps/**/__tests__/**/*.{ts,tsx,js,jsx}',
    '<rootDir>/apps/**/*.{test,spec}.{ts,tsx,js,jsx}',
    '<rootDir>/packages/**/__tests__/**/*.{ts,tsx,js,jsx}',
    '<rootDir>/packages/**/*.{test,spec}.{ts,tsx,js,jsx}',
    '<rootDir>/src/**/__tests__/**/*.{ts,tsx,js,jsx}',
    '<rootDir>/src/**/*.{test,spec}.{ts,tsx,js,jsx}',
  ],

  // 忽略的文件和目录
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/dist/',
    '<rootDir>/build/',
    '<rootDir>/.next/',
    '<rootDir>/target/',
    '<rootDir>/coverage/',
    '<rootDir>/archive/',
  ],

  // 模块路径映射
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@bytebot/ui/(.*)$': '<rootDir>/packages/ui/src/$1',
    '^@bytebot/types/(.*)$': '<rootDir>/packages/types/src/$1',
    '^@bytebot/utils/(.*)$': '<rootDir>/packages/utils/src/$1',
    '^@bytebot/config/(.*)$': '<rootDir>/packages/config/src/$1',
    '^@bytebot/mcp/(.*)$': '<rootDir>/packages/mcp/src/$1',
  },

  // 覆盖率配置
  collectCoverage: true,
  collectCoverageFrom: [
    // 只统计 apps/ 和 packages/ 目录
    'apps/**/*.{ts,tsx,js,jsx}',
    'packages/**/*.{ts,tsx,js,jsx}',
    'src/**/*.{ts,tsx,js,jsx}',
    // 排除测试文件和配置文件
    '!**/*.{test,spec}.{ts,tsx,js,jsx}',
    '!**/__tests__/**',
    '!**/*.config.{ts,js}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/build/**',
    '!**/coverage/**',
    '!**/archive/**',
  ],
  
  // 覆盖率阈值设置为 60%
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60,
    },
  },

  // 覆盖率报告格式
  coverageReporters: ['text', 'lcov', 'html'],
  
  // 覆盖率输出目录
  coverageDirectory: 'coverage',

  // 设置文件
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  // 清除模拟
  clearMocks: true,
  
  // 详细输出
  verbose: true,

  // TypeScript 转换配置
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },

  // 模块文件扩展名
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],

  // 全局变量
  globals: {
    'ts-jest': {
      tsconfig: {
        jsx: 'react-jsx',
      },
    },
  },
};

export default config;