#!/bin/bash

# ByteBot 本地模型配置脚本

# 定义颜色
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 ByteBot 本地模型配置脚本${NC}"
echo "=================================="

# 检查 Ollama 是否运行
check_ollama() {
    echo -e "${YELLOW}🔍 检查 Ollama 服务状态...${NC}"
    if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Ollama 服务正在运行${NC}"
        return 0
    else
        echo -e "${RED}❌ Ollama 服务未运行，请先启动 Ollama${NC}"
        echo "启动命令: ollama serve"
        return 1
    fi
}

# 显示可用模型
show_models() {
    echo -e "${YELLOW}📦 可用的本地模型:${NC}"
    ollama list | grep -E "(qwen|llama|gpt-oss)" | while read line; do
        echo "  - $line"
    done
}

# 测试模型连接
test_model() {
    local model_name=$1
    echo -e "${YELLOW}🧪 测试模型: $model_name${NC}"
    
    if curl -s -X POST http://localhost:11434/api/generate \
        -H "Content-Type: application/json" \
        -d "{\"model\": \"$model_name\", \"prompt\": \"Hello\", \"stream\": false}" \
        > /dev/null 2>&1; then
        echo -e "${GREEN}✅ $model_name 模型响应正常${NC}"
        return 0
    else
        echo -e "${RED}❌ $model_name 模型测试失败${NC}"
        return 1
    fi
}

# 启动 ByteBot 本地模式
start_bytebot_local() {
    echo -e "${YELLOW}🚀 启动 ByteBot 本地模型模式...${NC}"
    
    # 停止现有服务
    echo "停止现有服务..."
    docker-compose down 2>/dev/null || true
    
    # 启动本地模型配置
    echo "启动本地模型配置..."
    docker-compose -f docker/docker-compose.local-models.yml up -d
    
    # 等待服务启动
    echo "等待服务启动..."
    sleep 10
    
    # 检查服务状态
    echo -e "${YELLOW}📊 检查服务状态...${NC}"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep bytebot
}

# 验证配置
verify_config() {
    echo -e "${YELLOW}🔍 验证配置...${NC}"
    
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
    echo -e "${YELLOW}📋 检查 LiteLLM 中的模型...${NC}"
    curl -s http://localhost:4000/v1/models | jq -r '.data[].id' 2>/dev/null || echo "无法获取模型列表"
}

# 主函数
main() {
    echo -e "${BLUE}开始配置 ByteBot 本地模型...${NC}"
    
    # 检查 Ollama
    if ! check_ollama; then
        exit 1
    fi
    
    # 显示模型
    show_models
    
    # 测试推荐模型
    echo -e "${YELLOW}🧪 测试推荐模型...${NC}"
    test_model "qwen2.5:7b"
    test_model "qwen2.5vl:7b"
    
    # 启动 ByteBot
    start_bytebot_local
    
    # 验证配置
    verify_config
    
    echo -e "${GREEN}🎉 配置完成！${NC}"
    echo -e "${BLUE}💡 提示: 在 ByteBot UI 中选择 'local-qwen2.5-7b' 作为默认模型${NC}"
}

# 运行主函数
main "$@"
