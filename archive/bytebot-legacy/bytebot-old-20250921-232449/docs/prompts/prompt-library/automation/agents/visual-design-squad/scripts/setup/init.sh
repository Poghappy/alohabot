#!/bin/bash

# Visual Design Squad Agent 初始化脚本
# 版本: v1.0.0
# 创建时间: 2024-01-15

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查依赖
check_dependencies() {
    log_info "检查系统依赖..."
    
    # 检查 Trae IDE
    if ! command -v trae &> /dev/null; then
        log_error "Trae IDE 未安装，请先安装 Trae IDE"
        exit 1
    fi
    
    # 检查 Node.js
    if ! command -v node &> /dev/null; then
        log_warning "Node.js 未安装，某些功能可能无法使用"
    fi
    
    # 检查 Python
    if ! command -v python3 &> /dev/null; then
        log_warning "Python3 未安装，某些脚本可能无法运行"
    fi
    
    log_success "依赖检查完成"
}

# 创建环境变量文件
create_env_file() {
    log_info "创建环境变量配置文件..."
    
    cat > .env << EOF
# Visual Design Squad Agent 环境配置
# 请根据实际情况修改以下配置

# Trae IDE 配置
TRAE_API_URL=http://localhost:3000
TRAE_API_KEY=your_api_key_here

# MCP 工具配置
MCP_IMAGEMAGICK_PATH=/usr/local/bin/convert
MCP_SVGO_PATH=/usr/local/bin/svgo
MCP_DOCKER_HOST=unix:///var/run/docker.sock

# 日志配置
LOG_LEVEL=INFO
LOG_MAX_SIZE=10MB
LOG_MAX_FILES=5

# 备份配置
BACKUP_ENABLED=true
BACKUP_INTERVAL=24h
BACKUP_RETENTION=7d

# 通知配置
NOTIFICATION_WEBHOOK_URL=
NOTIFICATION_EMAIL=

EOF
    
    log_success "环境变量文件已创建: .env"
    log_warning "请编辑 .env 文件，配置正确的参数值"
}

# 初始化配置文件
init_configs() {
    log_info "初始化配置文件..."
    
    # 检查配置文件是否存在
    if [ ! -f "config/agents/trae_agent_configs.json" ]; then
        log_error "Agent配置文件不存在，请确保已正确复制配置文件"
        exit 1
    fi
    
    # 创建工作流配置
    cat > config/workflows/sprint_workflows.yaml << EOF
# Sprint 工作流配置
workflows:
  sprint_planning:
    name: "Sprint Planning"
    duration: "2h"
    participants:
      - "A0_product_owner"
      - "A1_brand_strategist"
      - "A2_design_director"
    steps:
      - name: "需求分析"
        duration: "30m"
        owner: "A0_product_owner"
      - name: "任务拆解"
        duration: "60m"
        owner: "A2_design_director"
      - name: "工作量估算"
        duration: "30m"
        owner: "团队协作"
  
  daily_standup:
    name: "Daily Standup"
    duration: "15m"
    participants: "all_agents"
    steps:
      - name: "昨日完成"
        duration: "5m"
      - name: "今日计划"
        duration: "5m"
      - name: "遇到阻塞"
        duration: "5m"
  
  design_review:
    name: "Design Review"
    duration: "1h"
    participants:
      - "A2_design_director"
      - "A8_a11y_qa_agent"
      - "A10_design_qa_agent"
    steps:
      - name: "设计展示"
        duration: "20m"
      - name: "反馈收集"
        duration: "20m"
      - name: "改进计划"
        duration: "20m"
EOF
    
    log_success "工作流配置文件已创建"
}

# 设置权限
set_permissions() {
    log_info "设置文件权限..."
    
    # 设置脚本执行权限
    chmod +x scripts/setup/*.sh
    chmod +x scripts/deploy/*.sh
    chmod +x scripts/utils/*.sh
    
    # 设置日志目录权限
    chmod 755 logs/
    chmod 755 logs/agents/
    chmod 755 logs/workflows/
    chmod 755 logs/system/
    
    # 设置备份目录权限
    chmod 755 backups/
    chmod 755 backups/configs/
    chmod 755 backups/data/
    
    log_success "文件权限设置完成"
}

# 验证安装
validate_installation() {
    log_info "验证安装..."
    
    # 检查配置文件
    local config_files=(
        "config/agents/trae_agent_configs.json"
        "config/agents/trae_prompts_config.json"
        "config/mcp/mcp_tools_config.json"
        "config/workflows/sprint_workflows.yaml"
    )
    
    for file in "${config_files[@]}"; do
        if [ -f "$file" ]; then
            log_success "✓ $file"
        else
            log_error "✗ $file 不存在"
        fi
    done
    
    # 检查目录结构
    local directories=(
        "scripts" "templates" "docs" "assets" "tests" "logs" "backups"
    )
    
    for dir in "${directories[@]}"; do
        if [ -d "$dir" ]; then
            log_success "✓ $dir/ 目录"
        else
            log_error "✗ $dir/ 目录不存在"
        fi
    done
    
    log_success "安装验证完成"
}

# 显示后续步骤
show_next_steps() {
    log_info "初始化完成！后续步骤："
    echo ""
    echo "1. 编辑环境变量文件:"
    echo "   vi .env"
    echo ""
    echo "2. 配置 Trae IDE Agent:"
    echo "   trae agent import config/agents/trae_agent_configs.json"
    echo ""
    echo "3. 启动 Agent 服务:"
    echo "   ./scripts/deploy/start.sh"
    echo ""
    echo "4. 查看运行状态:"
    echo "   trae agent status --all"
    echo ""
    echo "5. 查看日志:"
    echo "   tail -f logs/system/system.log"
    echo ""
    log_success "祝您使用愉快！"
}

# 主函数
main() {
    echo "======================================"
    echo "Visual Design Squad Agent 初始化脚本"
    echo "======================================"
    echo ""
    
    check_dependencies
    create_env_file
    init_configs
    set_permissions
    validate_installation
    show_next_steps
}

# 执行主函数
main "$@"