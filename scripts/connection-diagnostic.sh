#!/bin/bash

echo "🔍 ByteBot 连接诊断工具"
echo "=========================="

# 检查网络连接
echo "📡 检查网络连接..."
if curl -s --max-time 10 https://cursor.sh > /dev/null; then
    echo "✅ Cursor 服务连接正常"
else
    echo "❌ Cursor 服务连接异常"
fi

# 检查 DNS 解析
echo "🌐 检查 DNS 解析..."
if nslookup cursor.sh > /dev/null 2>&1; then
    echo "✅ DNS 解析正常"
else
    echo "❌ DNS 解析异常"
fi

# 检查系统资源
echo "💻 检查系统资源..."
echo "内存使用情况:"
vm_stat | head -10

echo "磁盘使用情况:"
df -h | grep -E "(/$|/System)"

echo "CPU 使用情况:"
sysctl -n hw.ncpu

# 检查端口占用
echo "🔌 检查服务端口..."
ports=(9990 9991 9992 9993)
for port in "${ports[@]}"; do
    if lsof -i :$port > /dev/null 2>&1; then
        echo "✅ 端口 $port 已占用"
    else
        echo "⚠️  端口 $port 空闲"
    fi
done

# 检查 Docker 状态
echo "🐳 检查 Docker 状态..."
if docker ps > /dev/null 2>&1; then
    echo "✅ Docker 运行正常"
    echo "当前容器:"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
else
    echo "❌ Docker 未运行或未安装"
fi

# 检查项目依赖
echo "📦 检查项目依赖..."
if [ -f "package.json" ]; then
    echo "✅ package.json 存在"
    if [ -d "node_modules" ]; then
        echo "✅ node_modules 存在"
    else
        echo "⚠️  node_modules 不存在，需要运行 npm install"
    fi
else
    echo "❌ package.json 不存在"
fi

echo ""
echo "🎯 建议的解决方案:"
echo "1. 如果网络连接异常，请检查网络设置或使用 VPN"
echo "2. 如果系统资源不足，请关闭其他应用程序"
echo "3. 如果 Docker 未运行，请启动 Docker Desktop"
echo "4. 如果依赖缺失，请运行 npm install"
echo ""
echo "诊断完成！"
