#!/bin/bash

# ByteBot Desktop 开发环境启动脚本

set -e

echo "🚀 启动 ByteBot Desktop 开发环境..."

# 检查 Docker 是否运行
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker 未运行，请先启动 Docker"
    exit 1
fi

# 检查环境变量文件
if [ ! -f .env ]; then
    echo "📝 创建环境变量文件..."
    cp env.example .env
    echo "⚠️  请编辑 .env 文件，添加你的 API 密钥"
fi

# 启动 LiteLLM 代理和相关服务
echo "🔧 启动 LiteLLM 代理和相关服务..."
docker-compose -f docker-compose.dev.yml up -d

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 5

# 检查 LiteLLM 代理状态
echo "🔍 检查 LiteLLM 代理状态..."
if curl -s http://localhost:4000/health > /dev/null; then
    echo "✅ LiteLLM 代理运行正常"
else
    echo "⚠️  LiteLLM 代理可能未完全启动，请稍等..."
fi

# 检查 Ollama 状态
echo "🔍 检查 Ollama 状态..."
if curl -s http://localhost:11434/api/tags > /dev/null; then
    echo "✅ Ollama 运行正常"
else
    echo "⚠️  Ollama 可能未完全启动，请稍等..."
fi

# 启动前端开发服务器
echo "🎨 启动前端开发服务器..."
npm run dev &
FRONTEND_PID=$!

# 等待前端服务器启动
sleep 3

# 启动 Tauri 应用
echo "🖥️  启动 Tauri 桌面应用..."
npm run tauri:dev &
TAURI_PID=$!

echo ""
echo "🎉 ByteBot Desktop 开发环境已启动！"
echo ""
echo "📊 服务状态："
echo "  - LiteLLM 代理: http://localhost:4000"
echo "  - Ollama: http://localhost:11434"
echo "  - Redis: localhost:6379"
echo "  - PostgreSQL: localhost:5432"
echo "  - 前端开发服务器: http://localhost:3000"
echo ""
echo "🛑 停止服务："
echo "  - 按 Ctrl+C 停止所有服务"
echo "  - 或运行: ./scripts/stop-dev.sh"
echo ""

# 等待用户中断
trap "echo '🛑 停止服务...'; kill $FRONTEND_PID $TAURI_PID 2>/dev/null; docker-compose -f docker-compose.dev.yml down; exit 0" INT

# 保持脚本运行
wait
