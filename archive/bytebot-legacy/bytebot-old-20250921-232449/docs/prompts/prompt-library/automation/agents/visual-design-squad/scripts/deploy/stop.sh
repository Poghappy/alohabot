#!/bin/bash

# Visual Design Squad Agent 停止脚本
# 版本: v1.0.0
# 创建时间: 2024-01-15

set -e

# 获取脚本目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

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

# 停止监控服务
stop_monitoring() {
    log_info "停止监控服务..."
    
    if [ -f "$PROJECT_DIR/.monitor.pid" ]; then
        local monitor_pid=$(cat "$PROJECT_DIR/.monitor.pid")
        if kill -0 "$monitor_pid" 2>/dev/null; then
            if kill "$monitor_pid" 2>/dev/null; then
                log_success "监控服务已停止 (PID: $monitor_pid)"
            else
                log_warning "无法停止监控服务，可能已经停止"
            fi
        else
            log_warning "监控服务进程不存在"
        fi
        rm -f "$PROJECT_DIR/.monitor.pid"
    else
        log_warning "未找到监控服务 PID 文件"
    fi
}

# 停止 Agent 服务
stop_agents() {
    log_info "停止 Agent 服务..."
    
    # Agent ID 列表
    local agents=(
        "A12_release_manager_agent"
        "A11_prompt_engineer_agent"
        "A10_design_qa_agent"
        "A9_asset_ops_agent"
        "A8_a11y_qa_agent"
        "A7_motion_agent"
        "A6_ui_agent"
        "A5_illustration_agent"
        "A4_iconography_agent"
        "A3_logo_agent"
        "A2_design_director"
        "A1_brand_strategist"
        "A0_product_owner"
    )
    
    local success_count=0
    local total_count=${#agents[@]}
    
    for agent in "${agents[@]}"; do
        log_info "停止 Agent: $agent"
        
        if trae agent stop --id "$agent" &> /dev/null; then
            log_success "✓ $agent 已停止"
            ((success_count++))
        else
            log_warning "✗ $agent 停止失败或已经停止"
        fi
        
        # 短暂延迟
        sleep 0.5
    done
    
    log_info "Agent 停止完成: $success_count/$total_count 成功"
    
    # 强制停止所有 Agent 进程
    if command -v trae &> /dev/null; then
        trae agent stop --all &> /dev/null || true
        log_info "执行全局 Agent 停止命令"
    fi
}

# 清理工作流
cleanup_workflows() {
    log_info "清理工作流状态..."
    
    if command -v trae &> /dev/null; then
        # 停止所有运行中的工作流
        if trae workflow stop --all &> /dev/null; then
            log_success "工作流已停止"
        else
            log_warning "工作流停止失败或无运行中的工作流"
        fi
        
        # 清理临时文件
        if trae workflow cleanup &> /dev/null; then
            log_success "工作流临时文件已清理"
        else
            log_warning "工作流清理失败"
        fi
    fi
}

# 备份日志文件
backup_logs() {
    log_info "备份日志文件..."
    
    local backup_dir="$PROJECT_DIR/backups/logs/$(date '+%Y%m%d_%H%M%S')"
    mkdir -p "$backup_dir"
    
    if [ -d "$PROJECT_DIR/logs" ]; then
        if cp -r "$PROJECT_DIR/logs"/* "$backup_dir/" 2>/dev/null; then
            log_success "日志文件已备份到: $backup_dir"
            
            # 清理当前日志文件
            find "$PROJECT_DIR/logs" -name "*.log" -exec truncate -s 0 {} \;
            log_info "当前日志文件已清空"
        else
            log_warning "日志备份失败"
        fi
    else
        log_warning "日志目录不存在，跳过备份"
    fi
}

# 清理临时文件
cleanup_temp_files() {
    log_info "清理临时文件..."
    
    # 清理 PID 文件
    find "$PROJECT_DIR" -name "*.pid" -delete 2>/dev/null || true
    
    # 清理临时配置文件
    find "$PROJECT_DIR" -name "*.tmp" -delete 2>/dev/null || true
    find "$PROJECT_DIR" -name "*.temp" -delete 2>/dev/null || true
    
    # 清理缓存文件
    if [ -d "$PROJECT_DIR/.cache" ]; then
        rm -rf "$PROJECT_DIR/.cache"
        log_info "缓存目录已清理"
    fi
    
    log_success "临时文件清理完成"
}

# 验证停止状态
verify_shutdown() {
    log_info "验证停止状态..."
    
    # 检查 Agent 状态
    if command -v trae &> /dev/null; then
        local running_agents=$(trae agent status --all 2>/dev/null | grep -c "running" || echo "0")
        if [ "$running_agents" -eq 0 ]; then
            log_success "所有 Agent 已停止"
        else
            log_warning "仍有 $running_agents 个 Agent 在运行"
        fi
        
        # 检查工作流状态
        local running_workflows=$(trae workflow status 2>/dev/null | grep -c "running" || echo "0")
        if [ "$running_workflows" -eq 0 ]; then
            log_success "所有工作流已停止"
        else
            log_warning "仍有 $running_workflows 个工作流在运行"
        fi
    fi
    
    # 检查监控进程
    if [ -f "$PROJECT_DIR/.monitor.pid" ]; then
        log_warning "监控 PID 文件仍然存在"
    else
        log_success "监控服务已完全停止"
    fi
}

# 显示停止信息
show_shutdown_info() {
    echo ""
    echo "======================================"
    echo "Visual Design Squad Agent 停止完成"
    echo "======================================"
    echo ""
    echo "🛑 服务状态:"
    echo "   - Agent 服务: 已停止"
    echo "   - 工作流: 已停止"
    echo "   - 监控服务: 已停止"
    echo ""
    echo "📦 清理完成:"
    echo "   - 临时文件: 已清理"
    echo "   - 日志文件: 已备份"
    echo "   - 缓存文件: 已清理"
    echo ""
    echo "🔄 重启命令:"
    echo "   - 启动服务: ./scripts/deploy/start.sh"
    echo "   - 重启服务: ./scripts/deploy/restart.sh"
    echo ""
    echo "📁 备份位置:"
    echo "   - 日志备份: backups/logs/"
    echo "   - 配置备份: backups/configs/"
    echo ""
    log_success "停止完成，感谢使用！"
}

# 强制停止模式
force_stop() {
    log_warning "执行强制停止模式..."
    
    # 查找并终止所有相关进程
    pkill -f "trae.*agent" 2>/dev/null || true
    pkill -f "visual-design-squad" 2>/dev/null || true
    
    # 清理所有 PID 文件
    find "$PROJECT_DIR" -name "*.pid" -delete 2>/dev/null || true
    
    log_warning "强制停止完成"
}

# 主函数
main() {
    echo "======================================"
    echo "Visual Design Squad Agent 停止脚本"
    echo "======================================"
    echo ""
    
    # 切换到项目目录
    cd "$PROJECT_DIR"
    
    # 检查是否需要强制停止
    if [ "$1" = "--force" ] || [ "$1" = "-f" ]; then
        force_stop
        cleanup_temp_files
        show_shutdown_info
        return
    fi
    
    # 执行停止流程
    stop_monitoring
    stop_agents
    cleanup_workflows
    backup_logs
    cleanup_temp_files
    verify_shutdown
    show_shutdown_info
}

# 信号处理
trap 'log_error "停止过程被中断"; exit 1' INT TERM

# 执行主函数
main "$@"