#!/bin/bash

echo "🏥 开始健康检查..."

# 检查服务状态
services=("bytebot-ui:9992" "bytebot-agent:9991" "bytebot-desktop:9990" "bytebot-llm-proxy:9993")

for service in "${services[@]}"; do
    name=$(echo $service | cut -d: -f1)
    port=$(echo $service | cut -d: -f2)
    
    if curl -f http://localhost:$port/health > /dev/null 2>&1; then
        echo "✅ $name 服务正常"
    else
        echo "❌ $name 服务异常"
        exit 1
    fi
done

echo "✅ 所有服务健康检查通过！"
