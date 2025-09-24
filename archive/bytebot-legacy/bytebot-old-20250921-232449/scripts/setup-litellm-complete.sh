#!/bin/bash

# ByteBot 完整 LiteLLM 配置脚本
# 支持 100+ LLM 提供商，包括本地模型和云端服务

# 定义颜色
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${PURPLE}🚀 ByteBot 完整 LiteLLM 配置脚本${NC}"
echo "=============================================="
echo -e "${CYAN}支持 100+ LLM 提供商，包括本地模型和云端服务${NC}"
echo ""

# 检查系统信息
check_system() {
    echo -e "${YELLOW}🔍 检查系统配置...${NC}"
    
    # 检查操作系统
    local os=$(uname -s)
    local arch=$(uname -m)
    echo -e "${GREEN}✅ 操作系统: $os ($arch)${NC}"
    
    # 检查内存
    if [[ "$os" == "Darwin" ]]; then
        local memory=$(system_profiler SPHardwareDataType | grep "Memory:" | awk '{print $2}')
        echo -e "${GREEN}✅ 内存: $memory${NC}"
        
        # 检查芯片
        local chip=$(system_profiler SPHardwareDataType | grep "Chip:" | awk '{print $2}')
        if [[ "$chip" == *"M"* ]]; then
            echo -e "${GREEN}✅ 芯片: $chip (Apple Silicon)${NC}"
        else
            echo -e "${YELLOW}⚠️  芯片: $chip (建议使用 Apple Silicon 获得最佳性能)${NC}"
        fi
    else
        local memory=$(free -h | grep "Mem:" | awk '{print $2}')
        echo -e "${GREEN}✅ 内存: $memory${NC}"
    fi
    
    # 检查 Docker
    if command -v docker &> /dev/null; then
        local docker_version=$(docker --version | awk '{print $3}' | sed 's/,//')
        echo -e "${GREEN}✅ Docker: $docker_version${NC}"
    else
        echo -e "${RED}❌ Docker 未安装${NC}"
        return 1
    fi
    
    # 检查 Docker Compose
    if command -v docker-compose &> /dev/null; then
        local compose_version=$(docker-compose --version | awk '{print $3}' | sed 's/,//')
        echo -e "${GREEN}✅ Docker Compose: $compose_version${NC}"
    else
        echo -e "${RED}❌ Docker Compose 未安装${NC}"
        return 1
    fi
}

# 检查 Ollama 服务
check_ollama() {
    echo -e "${YELLOW}🔍 检查 Ollama 服务...${NC}"
    
    if ! command -v ollama &> /dev/null; then
        echo -e "${YELLOW}⚠️  Ollama 未安装，将跳过本地模型配置${NC}"
        return 0
    fi
    
    if ! pgrep -f "ollama serve" > /dev/null; then
        echo -e "${YELLOW}🚀 启动 Ollama 服务...${NC}"
        nohup ollama serve > /dev/null 2>&1 &
        sleep 3
    fi
    
    if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Ollama 服务运行正常${NC}"
        
        # 显示可用模型
        local model_count=$(ollama list | wc -l)
        echo -e "${BLUE}📦 已安装模型数量: $((model_count - 1))${NC}"
        
        # 显示推荐模型
        echo -e "${CYAN}推荐模型:${NC}"
        ollama list | grep -E "(qwen|llama|gpt-oss)" | head -5 | while read line; do
            echo "  - $line"
        done
        
        return 0
    else
        echo -e "${YELLOW}⚠️  Ollama 服务未运行，将跳过本地模型配置${NC}"
        return 0
    fi
}

# 创建环境变量文件
create_env_file() {
    echo -e "${YELLOW}⚙️  创建环境变量文件...${NC}"
    
    local env_file="docker/.env"
    
    if [ ! -f "$env_file" ]; then
        echo -e "${BLUE}创建 $env_file 文件...${NC}"
        cat > "$env_file" << 'EOF'
# ByteBot LiteLLM 环境变量配置
# 请根据需要填写您的 API 密钥

# ==================== 必需配置 ====================
# LiteLLM 主密钥 (用于访问代理)
LITELLM_MASTER_KEY=sk-litellm-master-key-$(date +%s)

# ==================== 云端 API 密钥 ====================
# Anthropic API
ANTHROPIC_API_KEY=sk-ant-your-key-here

# OpenAI API
OPENAI_API_KEY=sk-your-key-here

# Google Gemini API
GEMINI_API_KEY=your-gemini-key-here

# ==================== 可选配置 ====================
# Azure OpenAI
AZURE_OPENAI_API_KEY=your-azure-key-here
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/

# AWS Bedrock
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1

# Hugging Face
HUGGINGFACE_API_KEY=hf_your-token-here

# ==================== 数据库配置 ====================
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/bytebotdb

# ==================== 服务配置 ====================
BYTEBOT_AGENT_BASE_URL=http://bytebot-agent:9991
BYTEBOT_DESKTOP_BASE_URL=http://bytebot-desktop:9990
BYTEBOT_DESKTOP_VNC_URL=http://bytebot-desktop:9990/websockify
BYTEBOT_LLM_PROXY_URL=http://bytebot-llm-proxy:4000
EOF
        echo -e "${GREEN}✅ 环境变量文件已创建: $env_file${NC}"
        echo -e "${YELLOW}⚠️  请编辑 $env_file 文件，填写您的 API 密钥${NC}"
    else
        echo -e "${GREEN}✅ 环境变量文件已存在: $env_file${NC}"
    fi
}

# 显示配置选项
show_config_options() {
    echo -e "${PURPLE}📋 配置选项:${NC}"
    echo ""
    echo -e "${CYAN}1. 本地模型配置 (推荐用于 M4 Pro)${NC}"
    echo "   - 使用 Ollama 本地模型"
    echo "   - 完全离线，数据隐私保护"
    echo "   - 零 API 调用费用"
    echo "   - 响应速度快"
    echo ""
    echo -e "${CYAN}2. 云端模型配置${NC}"
    echo "   - 支持 Anthropic, OpenAI, Google 等"
    echo "   - 需要 API 密钥"
    echo "   - 功能最全面"
    echo "   - 有使用费用"
    echo ""
    echo -e "${CYAN}3. 混合配置 (推荐)${NC}"
    echo "   - 本地模型 + 云端模型"
    echo "   - 智能路由选择"
    echo "   - 最佳性能和功能平衡"
    echo ""
}

# 启动 LiteLLM 完整配置
start_litellm_complete() {
    echo -e "${YELLOW}🚀 启动 ByteBot LiteLLM 完整配置...${NC}"
    
    # 停止现有服务
    echo "停止现有服务..."
    docker-compose down 2>/dev/null || true
    docker-compose -f docker/docker-compose.proxy.yml down 2>/dev/null || true
    docker-compose -f docker/docker-compose.local-models.yml down 2>/dev/null || true
    docker-compose -f docker/docker-compose.m4pro.yml down 2>/dev/null || true
    
    # 启动完整 LiteLLM 配置
    echo "启动完整 LiteLLM 配置..."
    docker-compose -f docker/docker-compose.litellm-complete.yml up -d
    
    # 等待服务启动
    echo "等待服务启动..."
    sleep 20
    
    # 检查服务状态
    echo -e "${YELLOW}📊 检查服务状态...${NC}"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep bytebot
}

# 验证配置
verify_config() {
    echo -e "${YELLOW}🔍 验证 LiteLLM 配置...${NC}"
    
    # 检查 LiteLLM 代理
    echo -e "${BLUE}检查 LiteLLM 代理...${NC}"
    if curl -s http://localhost:4000/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ LiteLLM 代理运行正常${NC}"
    else
        echo -e "${RED}❌ LiteLLM 代理未响应${NC}"
    fi
    
    # 检查可用模型
    echo -e "${BLUE}检查可用模型...${NC}"
    local models=$(curl -s http://localhost:4000/v1/models 2>/dev/null | jq -r '.data[].id' 2>/dev/null | wc -l)
    if [ "$models" -gt 0 ]; then
        echo -e "${GREEN}✅ 发现 $models 个可用模型${NC}"
        echo -e "${CYAN}本地模型:${NC}"
        curl -s http://localhost:4000/v1/models 2>/dev/null | jq -r '.data[].id' 2>/dev/null | grep local | head -5
        echo -e "${CYAN}云端模型:${NC}"
        curl -s http://localhost:4000/v1/models 2>/dev/null | jq -r '.data[].id' 2>/dev/null | grep -v local | head -5
    else
        echo -e "${YELLOW}⚠️  无法获取模型列表${NC}"
    fi
    
    # 检查 ByteBot UI
    echo -e "${BLUE}检查 ByteBot UI...${NC}"
    if curl -s http://localhost:9992 > /dev/null 2>&1; then
        echo -e "${GREEN}✅ ByteBot UI 可访问${NC}"
        echo -e "${BLUE}🌐 访问地址: http://localhost:9992${NC}"
    else
        echo -e "${RED}❌ ByteBot UI 未响应${NC}"
    fi
    
    # 检查 ByteBot Agent
    echo -e "${BLUE}检查 ByteBot Agent...${NC}"
    if curl -s http://localhost:9991/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ ByteBot Agent 运行正常${NC}"
    else
        echo -e "${YELLOW}⚠️  ByteBot Agent 未响应${NC}"
    fi
}

# 显示使用指南
show_usage_guide() {
    echo -e "${PURPLE}📖 使用指南:${NC}"
    echo ""
    echo -e "${CYAN}1. 访问 ByteBot UI${NC}"
    echo "   http://localhost:9992"
    echo ""
    echo -e "${CYAN}2. 选择模型${NC}"
    echo "   - 本地模型: local-qwen2.5-7b, local-llama3.2-3b"
    echo "   - 云端模型: claude-3-5-sonnet-20241022, gpt-4o"
    echo "   - 智能路由: smart-model, vision-model, fast-model"
    echo ""
    echo -e "${CYAN}3. 监控服务${NC}"
    echo "   - LiteLLM 代理: http://localhost:4000"
    echo "   - 健康检查: http://localhost:4000/health"
    echo "   - 模型信息: http://localhost:4000/v1/models"
    echo ""
    echo -e "${CYAN}4. 管理命令${NC}"
    echo "   - 查看日志: docker logs bytebot-llm-proxy"
    echo "   - 重启服务: docker-compose -f docker/docker-compose.litellm-complete.yml restart"
    echo "   - 停止服务: docker-compose -f docker/docker-compose.litellm-complete.yml down"
    echo ""
}

# 主函数
main() {
    echo -e "${PURPLE}开始配置 ByteBot 完整 LiteLLM 集成...${NC}"
    
    # 检查系统
    if ! check_system; then
        echo -e "${RED}❌ 系统检查失败，请安装必要的依赖${NC}"
        exit 1
    fi
    
    # 检查 Ollama
    check_ollama
    
    # 创建环境变量文件
    create_env_file
    
    # 显示配置选项
    show_config_options
    
    # 启动服务
    start_litellm_complete
    
    # 验证配置
    verify_config
    
    # 显示使用指南
    show_usage_guide
    
    echo -e "${GREEN}🎉 ByteBot 完整 LiteLLM 配置完成！${NC}"
    echo -e "${PURPLE}🚀 现在您可以访问 http://localhost:9992 开始使用 ByteBot${NC}"
    echo -e "${CYAN}💡 提示: 在模型选择器中选择适合的模型开始对话${NC}"
}

# 运行主函数
main "$@"
