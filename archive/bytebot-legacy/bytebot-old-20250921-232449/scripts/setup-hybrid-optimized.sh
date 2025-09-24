#!/bin/bash

# ByteBot 混合配置优化脚本
# 针对 M4 Pro + 云端 API 密钥优化

# 定义颜色
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${PURPLE}🚀 ByteBot 混合配置优化脚本${NC}"
echo "=============================================="
echo -e "${CYAN}M4 Pro + 云端 API 密钥优化配置${NC}"
echo ""

# 检查系统配置
check_system() {
    echo -e "${YELLOW}🔍 检查系统配置...${NC}"
    
    # 检查 M4 Pro
    local chip=$(system_profiler SPHardwareDataType | grep "Chip:" | awk '{print $2}')
    local memory=$(system_profiler SPHardwareDataType | grep "Memory:" | awk '{print $2}')
    
    if [[ "$chip" == *"M4"* ]]; then
        echo -e "${GREEN}✅ 检测到: $chip ($memory)${NC}"
    else
        echo -e "${YELLOW}⚠️  检测到: $chip ($memory) - 建议使用 M4 Pro 获得最佳性能${NC}"
    fi
    
    # 检查 Docker
    if command -v docker &> /dev/null; then
        echo -e "${GREEN}✅ Docker 已安装${NC}"
    else
        echo -e "${RED}❌ Docker 未安装${NC}"
        return 1
    fi
}

# 检查 API 密钥配置
check_api_keys() {
    echo -e "${YELLOW}🔍 检查 API 密钥配置...${NC}"
    
    local env_file="docker/.env"
    if [ ! -f "$env_file" ]; then
        echo -e "${RED}❌ 环境变量文件不存在: $env_file${NC}"
        return 1
    fi
    
    echo -e "${GREEN}✅ 环境变量文件存在${NC}"
    
    # 检查已配置的 API 密钥
    local configured_keys=()
    
    if grep -q "OPENAI_API_KEY=sk-" "$env_file"; then
        configured_keys+=("OpenAI")
    fi
    
    if grep -q "ANTHROPIC_API_KEY=sk-ant-" "$env_file"; then
        configured_keys+=("Anthropic")
    fi
    
    if grep -q "GEMINI_API_KEY=" "$env_file" && ! grep -q "your-gemini-key-here" "$env_file"; then
        configured_keys+=("Gemini")
    fi
    
    if [ ${#configured_keys[@]} -gt 0 ]; then
        echo -e "${GREEN}✅ 已配置的 API 密钥: ${configured_keys[*]}${NC}"
    else
        echo -e "${YELLOW}⚠️  未检测到有效的 API 密钥${NC}"
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
        echo -e "${CYAN}推荐本地模型:${NC}"
        ollama list | grep -E "(qwen|llama|gpt-oss)" | head -5 | while read line; do
            echo "  - $line"
        done
        
        return 0
    else
        echo -e "${YELLOW}⚠️  Ollama 服务未运行，将跳过本地模型配置${NC}"
        return 0
    fi
}

# 显示优化建议
show_optimization_suggestions() {
    echo -e "${PURPLE}💡 混合配置优化建议:${NC}"
    echo ""
    
    echo -e "${CYAN}1. 模型选择策略${NC}"
    echo "   - 日常对话: local-qwen2.5vl-7b (本地) + gpt-4o (云端)"
    echo "   - 快速响应: local-llama3.2-3b (本地) + gpt-4o-mini (云端)"
    echo "   - 视觉任务: local-qwen2.5vl-7b (本地) + gpt-4o (云端)"
    echo "   - 复杂推理: local-gpt-oss-20b (本地) + claude-3-5-sonnet (云端)"
    echo ""
    
    echo -e "${CYAN}2. 智能路由组${NC}"
    echo "   - fast-model: 快速响应，优先本地"
    echo "   - smart-model: 智能对话，本地+云端平衡"
    echo "   - vision-model: 视觉任务，支持图像理解"
    echo "   - local-first: 本地优先，云端备选"
    echo "   - cloud-first: 云端优先，本地备选"
    echo ""
    
    echo -e "${CYAN}3. 成本控制${NC}"
    echo "   - 月度预算: $200"
    echo "   - 优先使用本地模型"
    echo "   - 云端模型作为备选"
    echo ""
}

# 启动混合优化配置
start_hybrid_optimized() {
    echo -e "${YELLOW}🚀 启动 ByteBot 混合优化配置...${NC}"
    
    # 停止现有服务
    echo "停止现有服务..."
    docker-compose down 2>/dev/null || true
    docker-compose -f docker/docker-compose.proxy.yml down 2>/dev/null || true
    docker-compose -f docker/docker-compose.local-models.yml down 2>/dev/null || true
    docker-compose -f docker/docker-compose.m4pro.yml down 2>/dev/null || true
    docker-compose -f docker/docker-compose.litellm-complete.yml down 2>/dev/null || true
    
    # 启动混合优化配置
    echo "启动混合优化配置..."
    docker-compose -f docker/docker-compose.hybrid-optimized.yml up -d
    
    # 等待服务启动
    echo "等待服务启动..."
    sleep 20
    
    # 检查服务状态
    echo -e "${YELLOW}📊 检查服务状态...${NC}"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep bytebot
}

# 验证配置
verify_config() {
    echo -e "${YELLOW}🔍 验证混合优化配置...${NC}"
    
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
        
        echo -e "${CYAN}智能路由组:${NC}"
        echo "  - fast-model (快速响应)"
        echo "  - smart-model (智能对话)"
        echo "  - vision-model (视觉任务)"
        echo "  - local-first (本地优先)"
        echo "  - cloud-first (云端优先)"
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
}

# 显示使用指南
show_usage_guide() {
    echo -e "${PURPLE}📖 混合配置使用指南:${NC}"
    echo ""
    echo -e "${CYAN}1. 访问 ByteBot UI${NC}"
    echo "   http://localhost:9992"
    echo ""
    echo -e "${CYAN}2. 推荐模型选择${NC}"
    echo "   - 日常使用: smart-model (自动选择最佳)"
    echo "   - 快速响应: fast-model (优先本地)"
    echo "   - 视觉任务: vision-model (图像理解)"
    echo "   - 本地优先: local-first (节省成本)"
    echo "   - 云端优先: cloud-first (最佳性能)"
    echo ""
    echo -e "${CYAN}3. 性能优化建议${NC}"
    echo "   - M4 Pro 本地模型响应: 1-3秒"
    echo "   - 云端模型响应: 2-6秒"
    echo "   - 智能路由自动选择最快可用模型"
    echo "   - 本地模型优先，云端模型备选"
    echo ""
    echo -e "${CYAN}4. 成本控制${NC}"
    echo "   - 月度预算: $200"
    echo "   - 优先使用本地模型 (免费)"
    echo "   - 云端模型按需使用"
    echo "   - 智能路由减少不必要的 API 调用"
    echo ""
}

# 主函数
main() {
    echo -e "${PURPLE}开始配置 ByteBot 混合优化...${NC}"
    
    # 检查系统
    if ! check_system; then
        echo -e "${RED}❌ 系统检查失败${NC}"
        exit 1
    fi
    
    # 检查 API 密钥
    check_api_keys
    
    # 检查 Ollama
    check_ollama
    
    # 显示优化建议
    show_optimization_suggestions
    
    # 启动服务
    start_hybrid_optimized
    
    # 验证配置
    verify_config
    
    # 显示使用指南
    show_usage_guide
    
    echo -e "${GREEN}🎉 ByteBot 混合优化配置完成！${NC}"
    echo -e "${PURPLE}🚀 现在您可以访问 http://localhost:9992 开始使用${NC}"
    echo -e "${CYAN}💡 建议: 在模型选择器中选择 'smart-model' 开始体验${NC}"
}

# 运行主函数
main "$@"
