#!/bin/bash

# Visual Design Squad Agent 启动脚本
# 版本: v1.0.0
# 创建时间: 2024-01-15

set -e

# 获取脚本目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

# 加载环境变量
if [ -f "$PROJECT_DIR/.env" ]; then
    source "$PROJECT_DIR/.env"
else
    echo "警告: .env 文件不存在，使用默认配置"
fi

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
    echo "$(date '+%Y-%m-%d %H:%M:%S') [INFO] $1" >> "$PROJECT_DIR/logs/system/system.log"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
    echo "$(date '+%Y-%m-%d %H:%M:%S') [SUCCESS] $1" >> "$PROJECT_DIR/logs/system/system.log"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
    echo "$(date '+%Y-%m-%d %H:%M:%S') [WARNING] $1" >> "$PROJECT_DIR/logs/system/system.log"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
    echo "$(date '+%Y-%m-%d %H:%M:%S') [ERROR] $1" >> "$PROJECT_DIR/logs/system/system.log"
}

# 检查 Trae IDE 状态
check_trae_status() {
    log_info "检查 Trae IDE 状态..."
    
    if ! command -v trae &> /dev/null; then
        log_error "Trae IDE 未安装或不在 PATH 中"
        exit 1
    fi
    
    # 检查 Trae IDE 服务状态
    if ! trae status &> /dev/null; then
        log_warning "Trae IDE 服务未运行，尝试启动..."
        trae start || {
            log_error "无法启动 Trae IDE 服务"
            exit 1
        }
    fi
    
    log_success "Trae IDE 状态正常"
}

# 导入 Agent 配置
import_agent_configs() {
    log_info "导入 Agent 配置..."
    
    local config_file="$PROJECT_DIR/config/agents/trae_agent_configs.json"
    if [ ! -f "$config_file" ]; then
        log_error "Agent 配置文件不存在: $config_file"
        exit 1
    fi
    
    # 导入 Agent 配置
    if trae agent import "$config_file"; then
        log_success "Agent 配置导入成功"
    else
        log_error "Agent 配置导入失败"
        exit 1
    fi
    
    # 导入提示词配置
    local prompts_file="$PROJECT_DIR/config/agents/trae_prompts_config.json"
    if [ -f "$prompts_file" ]; then
        if trae prompts import "$prompts_file"; then
            log_success "提示词配置导入成功"
        else
            log_warning "提示词配置导入失败，但不影响 Agent 启动"
        fi
    fi
}

# 配置 MCP 工具
setup_mcp_tools() {
    log_info "配置 MCP 工具..."
    
    local mcp_config="$PROJECT_DIR/config/mcp/mcp_tools_config.json"
    if [ ! -f "$mcp_config" ]; then
        log_warning "MCP 配置文件不存在，跳过 MCP 工具配置"
        return
    fi
    
    # 检查 MCP 工具状态
    if trae mcp status &> /dev/null; then
        log_info "配置 MCP 工具..."
        if trae mcp configure --config "$mcp_config"; then
            log_success "MCP 工具配置成功"
        else
            log_warning "MCP 工具配置失败，某些功能可能不可用"
        fi
    else
        log_warning "MCP 服务不可用，跳过工具配置"
    fi
}

# 启动 Agent 服务
start_agents() {
    log_info "启动 Agent 服务..."
    
    # Agent ID 列表
    local agents=(
        "A0_product_owner"
        "A1_brand_strategist"
        "A2_design_director"
        "A3_logo_agent"
        "A4_iconography_agent"
        "A5_illustration_agent"
        "A6_ui_agent"
        "A7_motion_agent"
        "A8_a11y_qa_agent"
        "A9_asset_ops_agent"
        "A10_design_qa_agent"
        "A11_prompt_engineer_agent"
        "A12_release_manager_agent"
    )
    
    local success_count=0
    local total_count=${#agents[@]}
    
    for agent in "${agents[@]}"; do
        log_info "启动 Agent: $agent"
        
        if trae agent start --id "$agent" &> "$PROJECT_DIR/logs/agents/${agent}.log"; then
            log_success "✓ $agent 启动成功"
            ((success_count++))
        else
            log_error "✗ $agent 启动失败，查看日志: logs/agents/${agent}.log"
        fi
        
        # 短暂延迟，避免同时启动过多服务
        sleep 1
    done
    
    log_info "Agent 启动完成: $success_count/$total_count 成功"
    
    if [ $success_count -eq $total_count ]; then
        log_success "所有 Agent 启动成功！"
    else
        log_warning "部分 Agent 启动失败，请检查日志文件"
    fi
}

# 验证服务状态
verify_services() {
    log_info "验证服务状态..."
    
    # 等待服务完全启动
    sleep 5
    
    # 检查 Agent 状态
    if trae agent status --all > "$PROJECT_DIR/logs/system/agent_status.log" 2>&1; then
        log_success "Agent 状态检查完成，详情查看: logs/system/agent_status.log"
    else
        log_warning "无法获取 Agent 状态信息"
    fi
    
    # 检查工作流状态
    if trae workflow status > "$PROJECT_DIR/logs/system/workflow_status.log" 2>&1; then
        log_success "工作流状态检查完成"
    else
        log_warning "无法获取工作流状态信息"
    fi
}

# 启动监控
start_monitoring() {
    log_info "启动监控服务..."
    
    # 创建监控脚本
    cat > "$PROJECT_DIR/scripts/utils/monitor.sh" << 'EOF'
#!/bin/bash

# 监控脚本
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

while true; do
    # 检查 Agent 健康状态
    if ! trae agent health-check &> /dev/null; then
        echo "$(date '+%Y-%m-%d %H:%M:%S') [MONITOR] Agent 健康检查失败" >> "$PROJECT_DIR/logs/system/monitor.log"
    fi
    
    # 检查日志文件大小
    find "$PROJECT_DIR/logs" -name "*.log" -size +10M -exec echo "$(date '+%Y-%m-%d %H:%M:%S') [MONITOR] 日志文件过大: {}" \; >> "$PROJECT_DIR/logs/system/monitor.log"
    
    # 等待 5 分钟
    sleep 300
done
EOF
    
    chmod +x "$PROJECT_DIR/scripts/utils/monitor.sh"
    
    # 后台启动监控
    nohup "$PROJECT_DIR/scripts/utils/monitor.sh" &> /dev/null &
    echo $! > "$PROJECT_DIR/.monitor.pid"
    
    log_success "监控服务已启动 (PID: $(cat "$PROJECT_DIR/.monitor.pid"))"
}

# 显示启动信息
show_startup_info() {
    echo ""
    echo "======================================"
    echo "Visual Design Squad Agent 启动完成"
    echo "======================================"
    echo ""
    echo "🚀 服务状态:"
    echo "   - Trae IDE: 运行中"
    echo "   - Agent 服务: 已启动"
    echo "   - 监控服务: 已启动"
    echo ""
    echo "📊 管理命令:"
    echo "   - 查看状态: trae agent status --all"
    echo "   - 查看日志: tail -f logs/system/system.log"
    echo "   - 停止服务: ./scripts/deploy/stop.sh"
    echo "   - 重启服务: ./scripts/deploy/restart.sh"
    echo ""
    echo "📁 重要目录:"
    echo "   - 配置文件: config/"
    echo "   - 日志文件: logs/"
    echo "   - 备份文件: backups/"
    echo ""
    echo "🔗 访问地址:"
    echo "   - Trae IDE: ${TRAE_API_URL:-http://localhost:3000}"
    echo ""
    log_success "启动完成，祝您使用愉快！"
}

# 主函数
main() {
    echo "======================================"
    echo "Visual Design Squad Agent 启动脚本"
    echo "======================================"
    echo ""
    
    # 切换到项目目录
    cd "$PROJECT_DIR"
    
    # 创建日志目录
    mkdir -p logs/system logs/agents logs/workflows
    
    # 执行启动流程
    check_trae_status
    import_agent_configs
    setup_mcp_tools
    start_agents
    verify_services
    start_monitoring
    show_startup_info
}

# 信号处理
trap 'log_error "启动过程被中断"; exit 1' INT TERM

# 执行主函数
main "$@"