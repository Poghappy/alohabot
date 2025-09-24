#!/bin/bash

# ByteBot M4 Pro 优化配置脚本

# 定义颜色
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${PURPLE}🚀 ByteBot M4 Pro 优化配置脚本${NC}"
echo "=========================================="
echo -e "${BLUE}💻 检测到: Apple M4 Pro (24GB 统一内存)${NC}"
echo ""

# 检查系统信息
check_system() {
    echo -e "${YELLOW}🔍 检查 M4 Pro 系统配置...${NC}"
    
    # 检查芯片信息
    local chip=$(system_profiler SPHardwareDataType | grep "Chip:" | awk '{print $2}')
    local memory=$(system_profiler SPHardwareDataType | grep "Memory:" | awk '{print $2}')
    
    echo -e "${GREEN}✅ 芯片: $chip${NC}"
    echo -e "${GREEN}✅ 内存: $memory${NC}"
    
    # 检查 Metal 支持
    local metal=$(system_profiler SPDisplaysDataType | grep "Metal Support:" | awk '{print $3}')
    echo -e "${GREEN}✅ Metal 支持: $metal${NC}"
    
    # 检查可用内存
    local free_memory=$(vm_stat | grep "Pages free" | awk '{print $3}' | sed 's/\.//')
    local page_size=16384
    local free_gb=$((free_memory * page_size / 1024 / 1024 / 1024))
    echo -e "${GREEN}✅ 可用内存: ${free_gb}GB${NC}"
    
    if [ $free_gb -lt 8 ]; then
        echo -e "${YELLOW}⚠️  建议关闭其他应用以释放更多内存${NC}"
    fi
}

# 优化 Ollama 配置
optimize_ollama() {
    echo -e "${YELLOW}⚙️  优化 Ollama 配置...${NC}"
    
    # 创建 Ollama 配置目录
    mkdir -p ~/.ollama
    
    # 创建 M4 Pro 优化配置
    cat > ~/.ollama/config.json << EOF
{
  "gpu_layers": -1,
  "num_ctx": 8192,
  "num_thread": 8,
  "numa": true,
  "host": "0.0.0.0",
  "port": 11434,
  "keep_alive": "5m",
  "models": {
    "qwen2.5:7b": {
      "gpu_layers": -1,
      "num_ctx": 8192
    },
    "qwen2.5vl:7b": {
      "gpu_layers": -1,
      "num_ctx": 4096
    },
    "llama3.2:3b": {
      "gpu_layers": -1,
      "num_ctx": 16384
    },
    "gpt-oss:20b": {
      "gpu_layers": -1,
      "num_ctx": 4096
    }
  }
}
EOF
    
    echo -e "${GREEN}✅ Ollama 配置已优化${NC}"
}

# 检查并启动 Ollama
check_ollama() {
    echo -e "${YELLOW}🔍 检查 Ollama 服务...${NC}"
    
    if ! pgrep -f "ollama serve" > /dev/null; then
        echo -e "${YELLOW}🚀 启动 Ollama 服务...${NC}"
        nohup ollama serve > /dev/null 2>&1 &
        sleep 3
    fi
    
    if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Ollama 服务运行正常${NC}"
        return 0
    else
        echo -e "${RED}❌ Ollama 服务启动失败${NC}"
        return 1
    fi
}

# 预加载推荐模型
preload_models() {
    echo -e "${YELLOW}📦 预加载推荐模型...${NC}"
    
    local models=("qwen2.5:7b" "qwen2.5vl:7b" "llama3.2:3b")
    
    for model in "${models[@]}"; do
        echo -e "${BLUE}🔄 预加载: $model${NC}"
        ollama run "$model" "Hello, I'm ready!" > /dev/null 2>&1 &
    done
    
    echo -e "${GREEN}✅ 模型预加载已启动${NC}"
}

# 测试模型性能
test_performance() {
    echo -e "${YELLOW}🧪 测试模型性能...${NC}"
    
    local models=("qwen2.5:7b" "llama3.2:3b")
    
    for model in "${models[@]}"; do
        echo -e "${BLUE}测试: $model${NC}"
        
        local start_time=$(date +%s%3N)
        
        if curl -s -X POST http://localhost:11434/api/generate \
            -H "Content-Type: application/json" \
            -d "{\"model\": \"$model\", \"prompt\": \"Hello, how are you?\", \"stream\": false}" \
            > /dev/null 2>&1; then
            
            local end_time=$(date +%s%3N)
            local duration=$((end_time - start_time))
            
            echo -e "${GREEN}✅ $model: ${duration}ms${NC}"
        else
            echo -e "${RED}❌ $model: 测试失败${NC}"
        fi
    done
}

# 启动 ByteBot M4 Pro 配置
start_bytebot() {
    echo -e "${YELLOW}🚀 启动 ByteBot M4 Pro 配置...${NC}"
    
    # 停止现有服务
    echo "停止现有服务..."
    docker-compose down 2>/dev/null || true
    docker-compose -f docker/docker-compose.local-models.yml down 2>/dev/null || true
    
    # 启动 M4 Pro 优化配置
    echo "启动 M4 Pro 优化配置..."
    docker-compose -f docker/docker-compose.m4pro.yml up -d
    
    # 等待服务启动
    echo "等待服务启动..."
    sleep 15
    
    # 检查服务状态
    echo -e "${YELLOW}📊 检查服务状态...${NC}"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep bytebot
}

# 验证配置
verify_config() {
    echo -e "${YELLOW}🔍 验证 M4 Pro 配置...${NC}"
    
    # 检查 LiteLLM 代理
    if curl -s http://localhost:4000/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ LiteLLM 代理运行正常${NC}"
    else
        echo -e "${RED}❌ LiteLLM 代理未响应${NC}"
    fi
    
    # 检查 ByteBot UI
    if curl -s http://localhost:9992 > /dev/null 2>&1; then
        echo -e "${GREEN}✅ ByteBot UI 可访问${NC}"
        echo -e "${BLUE}🌐 访问地址: http://localhost:9992${NC}"
    else
        echo -e "${RED}❌ ByteBot UI 未响应${NC}"
    fi
    
    # 检查可用模型
    echo -e "${YELLOW}📋 检查可用模型...${NC}"
    curl -s http://localhost:4000/v1/models | jq -r '.data[].id' 2>/dev/null | grep local || echo "无法获取本地模型列表"
    
    # 显示性能建议
    echo -e "${PURPLE}💡 M4 Pro 性能建议:${NC}"
    echo "  - 推荐使用: local-qwen2.5-7b (平衡性能)"
    echo "  - 视觉任务: local-qwen2.5vl-7b"
    echo "  - 快速响应: local-llama3.2-3b"
    echo "  - 复杂推理: local-gpt-oss-20b"
}

# 显示资源使用情况
show_resources() {
    echo -e "${YELLOW}📊 系统资源使用情况:${NC}"
    
    # 内存使用
    echo "内存使用:"
    vm_stat | grep -E "(Pages free|Pages active|Pages inactive)" | while read line; do
        echo "  $line"
    done
    
    # Docker 资源使用
    echo ""
    echo "Docker 容器资源:"
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}" | grep bytebot || echo "  无 ByteBot 容器运行"
}

# 主函数
main() {
    echo -e "${PURPLE}开始配置 ByteBot M4 Pro 优化...${NC}"
    
    # 检查系统
    check_system
    
    # 优化 Ollama
    optimize_ollama
    
    # 检查 Ollama
    if ! check_ollama; then
        exit 1
    fi
    
    # 预加载模型
    preload_models
    
    # 测试性能
    test_performance
    
    # 启动 ByteBot
    start_bytebot
    
    # 验证配置
    verify_config
    
    # 显示资源
    show_resources
    
    echo -e "${GREEN}🎉 M4 Pro 优化配置完成！${NC}"
    echo -e "${BLUE}💡 提示: 在 ByteBot UI 中选择适合的本地模型${NC}"
    echo -e "${PURPLE}🚀 享受 M4 Pro 的强大性能！${NC}"
}

# 运行主函数
main "$@"
