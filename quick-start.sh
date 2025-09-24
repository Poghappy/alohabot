#!/bin/bash

echo "🚀 ByteBot 快速启动脚本"
echo "=========================="

# 检查 Docker 状态
if ! docker ps > /dev/null 2>&1; then
    echo "❌ Docker 未运行，请先启动 Docker Desktop"
    exit 1
fi

echo "✅ Docker 运行正常"

# 创建必要的环境文件
if [ ! -f ".env" ]; then
    echo "📝 创建环境配置文件..."
    cat > .env << EOF
# ByteBot 环境配置
NODE_ENV=development
DATABASE_URL=postgresql://bytebot:password@localhost:5433/bytebot
REDIS_URL=redis://localhost:6379

# AI 模型配置 (可选)
OPENAI_API_KEY=your_openai_key_here
ANTHROPIC_API_KEY=your_anthropic_key_here

# 服务端口配置
BYTEBOT_UI_PORT=9992
BYTEBOT_AGENT_PORT=9991
BYTEBOT_DESKTOP_PORT=9990
BYTEBOT_LLM_PROXY_PORT=9993
EOF
    echo "✅ 环境配置文件已创建"
fi

# 启动核心服务
echo "🐳 启动核心服务..."
docker-compose up -d postgres redis

echo "⏳ 等待数据库启动..."
sleep 10

# 检查服务状态
echo "🔍 检查服务状态..."
services=("postgres:5433" "redis:6379")

for service in "${services[@]}"; do
    name=$(echo $service | cut -d: -f1)
    port=$(echo $service | cut -d: -f2)
    
    if nc -z localhost $port 2>/dev/null; then
        echo "✅ $name 服务正常 (端口 $port)"
    else
        echo "❌ $name 服务异常 (端口 $port)"
    fi
done

echo ""
echo "🎯 下一步操作:"
echo "1. 启动应用服务: docker-compose up -d bytebot-ui bytebot-agent"
echo "2. 查看服务状态: docker-compose ps"
echo "3. 查看日志: docker-compose logs -f [服务名]"
echo "4. 访问 Web UI: http://localhost:9992"
echo ""
echo "📚 更多信息请查看 README.md"
