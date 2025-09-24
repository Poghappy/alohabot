#!/bin/bash

echo "🧪 开始运行测试..."

# 运行单元测试
echo "📋 运行单元测试..."
npm run test:unit

# 运行集成测试
echo "🔗 运行集成测试..."
npm run test:integration

# 运行E2E测试
echo "🎯 运行E2E测试..."
npm run test:e2e

echo "✅ 所有测试完成！"
