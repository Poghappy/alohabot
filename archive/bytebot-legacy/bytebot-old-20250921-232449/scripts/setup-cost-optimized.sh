#!/bin/bash

# ByteBot 成本优化配置脚本
# 最大化使用本地模型，最小化 API 调用成本

# 定义颜色
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${PURPLE}💰 ByteBot 成本优化配置脚本${NC}"
echo "=============================================="
echo -e "${CYAN}最大化本地模型使用，最小化 API 成本${NC}"
echo ""

# 检查本地模型
check_local_models() {
    echo -e "${YELLOW}🔍 检查本地模型...${NC}"
    
    if ! command -v ollama &> /dev/null; then
        echo -e "${RED}❌ Ollama 未安装，无法使用本地模型${NC}"
        return 1
    fi
    
    if ! pgrep -f "ollama serve" > /dev/null; then
        echo -e "${YELLOW}🚀 启动 Ollama 服务...${NC}"
        nohup ollama serve > /dev/null 2>&1 &
        sleep 3
    fi
    
    if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Ollama 服务运行正常${NC}"
        
        # 显示可用本地模型
        local model_count=$(ollama list | wc -l)
        echo -e "${BLUE}📦 已安装本地模型数量: $((model_count - 1))${NC}"
        
        echo -e "${CYAN}免费本地模型:${NC}"
        ollama list | grep -E "(qwen|llama|gpt-oss)" | while read line; do
            echo "  - $line (免费)"
        done
        
        return 0
    else
        echo -e "${RED}❌ Ollama 服务启动失败${NC}"
        return 1
    fi
}

# 检查 API 密钥
check_api_keys() {
    echo -e "${YELLOW}🔍 检查 API 密钥配置...${NC}"
    
    local env_file="docker/.env"
    if [ ! -f "$env_file" ]; then
        echo -e "${RED}❌ 环境变量文件不存在${NC}"
        return 1
    fi
    
    local has_openai=false
    local has_anthropic=false
    local has_gemini=false
    
    if grep -q "OPENAI_API_KEY=sk-" "$env_file"; then
        has_openai=true
        echo -e "${GREEN}✅ OpenAI API 密钥已配置${NC}"
    fi
    
    if grep -q "ANTHROPIC_API_KEY=sk-ant-" "$env_file"; then
        has_anthropic=true
        echo -e "${GREEN}✅ Anthropic API 密钥已配置${NC}"
    fi
    
    if grep -q "GEMINI_API_KEY=" "$env_file" && ! grep -q "your-gemini-key-here" "$env_file"; then
        has_gemini=true
        echo -e "${GREEN}✅ Gemini API 密钥已配置${NC}"
    fi
    
    if [ "$has_openai" = true ] || [ "$has_anthropic" = true ] || [ "$has_gemini" = true ]; then
        echo -e "${YELLOW}⚠️  检测到云端 API 密钥，将配置为备选方案${NC}"
    else
        echo -e "${BLUE}ℹ️  未检测到云端 API 密钥，将仅使用本地模型${NC}"
    fi
}

# 显示成本优化策略
show_cost_optimization() {
    echo -e "${PURPLE}💡 成本优化策略:${NC}"
    echo ""
    
    echo -e "${CYAN}1. 本地模型优先 (免费)${NC}"
    echo "   - qwen2.5vl:7b: 视觉理解，完全免费"
    echo "   - llama3.2:3b: 快速响应，完全免费"
    echo "   - gpt-oss:20b: 复杂推理，完全免费"
    echo "   - qwen3:1.7b: 极速响应，完全免费"
    echo ""
    
    echo -e "${CYAN}2. 云端模型备选 (按需)${NC}"
    echo "   - gpt-4o-mini: 最便宜的云端模型"
    echo "   - gpt-4o: 高质量云端模型"
    echo "   - 仅在本地模型无法满足时使用"
    echo ""
    
    echo -e "${CYAN}3. 智能路由策略${NC}"
    echo "   - free-model: 仅使用本地模型 (零成本)"
    echo "   - low-cost-model: 本地优先，云端备选"
    echo "   - smart-model: 平衡成本与性能"
    echo ""
    
    echo -e "${CYAN}4. 成本控制措施${NC}"
    echo "   - 月度预算: $20 (可调整)"
    echo "   - 2小时缓存减少重复请求"
    echo "   - 智能路由减少 API 调用"
    echo "   - 本地模型优先策略"
    echo ""
}

# 启动成本优化配置
start_cost_optimized() {
    echo -e "${YELLOW}🚀 启动 ByteBot 成本优化配置...${NC}"
    
    # 停止现有服务
    echo "停止现有服务..."
    docker-compose down 2>/dev/null || true
    docker-compose -f docker/docker-compose.proxy.yml down 2>/dev/null || true
    docker-compose -f docker/docker-compose.local-models.yml down 2>/dev/null || true
    docker-compose -f docker/docker-compose.m4pro.yml down 2>/dev/null || true
    docker-compose -f docker/docker-compose.hybrid-optimized.yml down 2>/dev/null || true
    
    # 启动成本优化配置
    echo "启动成本优化配置..."
    docker-compose -f docker/docker-compose.local-models.yml up -d
    
    # 等待服务启动
    echo "等待服务启动..."
    sleep 20
    
    # 检查服务状态
    echo -e "${YELLOW}📊 检查服务状态...${NC}"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep bytebot
}

# 验证配置
verify_config() {
    echo -e "${YELLOW}🔍 验证成本优化配置...${NC}"
    
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
        
        echo -e "${CYAN}免费本地模型:${NC}"
        curl -s http://localhost:4000/v1/models 2>/dev/null | jq -r '.data[].id' 2>/dev/null | grep local | head -5
        
        echo -e "${CYAN}云端模型 (按需):${NC}"
        curl -s http://localhost:4000/v1/models 2>/dev/null | jq -r '.data[].id' 2>/dev/null | grep -v local | head -3
        
        echo -e "${CYAN}成本优化路由组:${NC}"
        echo "  - free-model (零成本)"
        echo "  - low-cost-model (低成本)"
        echo "  - smart-model (平衡成本与性能)"
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
    echo -e "${PURPLE}📖 成本优化使用指南:${NC}"
    echo ""
    echo -e "${CYAN}1. 访问 ByteBot UI${NC}"
    echo "   http://localhost:9992"
    echo ""
    echo -e "${CYAN}2. 推荐模型选择 (按成本排序)${NC}"
    echo "   - free-model: 零成本，仅本地模型"
    echo "   - low-cost-model: 低成本，本地优先"
    echo "   - smart-model: 平衡成本与性能"
    echo "   - vision-model: 视觉任务，本地优先"
    echo "   - fast-model: 快速响应，本地优先"
    echo ""
    echo -e "${CYAN}3. 成本控制建议${NC}"
    echo "   - 日常使用: 选择 free-model"
    echo "   - 复杂任务: 选择 low-cost-model"
    echo "   - 专业工作: 选择 smart-model"
    echo "   - 月度预算: $20 (可调整)"
    echo ""
    echo -e "${CYAN}4. 监控成本使用${NC}"
    echo "   - 查看使用统计: curl http://localhost:4000/usage"
    echo "   - 检查预算状态: curl http://localhost:4000/budget"
    echo "   - 查看模型成本: curl http://localhost:4000/cost"
    echo ""
}

# 主函数
main() {
    echo -e "${PURPLE}开始配置 ByteBot 成本优化...${NC}"
    
    # 检查本地模型
    if ! check_local_models; then
        echo -e "${RED}❌ 本地模型检查失败${NC}"
        exit 1
    fi
    
    # 检查 API 密钥
    check_api_keys
    
    # 显示成本优化策略
    show_cost_optimization
    
    # 启动服务
    start_cost_optimized
    
    # 验证配置
    verify_config
    
    # 显示使用指南
    show_usage_guide
    
    echo -e "${GREEN}🎉 ByteBot 成本优化配置完成！${NC}"
    echo -e "${PURPLE}🚀 现在您可以访问 http://localhost:9992 开始使用${NC}"
    echo -e "${CYAN}💡 建议: 在模型选择器中选择 'free-model' 实现零成本使用${NC}"
    echo -e "${YELLOW}💰 成本控制: 月度预算 $20，优先使用本地模型${NC}"
}

# 运行主函数
main "$@"
