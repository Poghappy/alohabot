#!/bin/bash

# Visual Design Squad Agent 重启脚本
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

# 检查脚本权限
check_permissions() {
    if [ ! -x "$SCRIPT_DIR/stop.sh" ]; then
        log_info "设置停止脚本执行权限..."
        chmod +x "$SCRIPT_DIR/stop.sh"
    fi
    
    if [ ! -x "$SCRIPT_DIR/start.sh" ]; then
        log_info "设置启动脚本执行权限..."
        chmod +x "$SCRIPT_DIR/start.sh"
    fi
}

# 预重启检查
pre_restart_check() {
    log_info "执行重启前检查..."
    
    # 检查必要文件
    local required_files=(
        "$SCRIPT_DIR/stop.sh"
        "$SCRIPT_DIR/start.sh"
        "$PROJECT_DIR/config/agents/trae_agent_configs.json"
    )
    
    for file in "${required_files[@]}"; do
        if [ ! -f "$file" ]; then
            log_error "必要文件不存在: $file"
            exit 1
        fi
    done
    
    # 检查 Trae IDE
    if ! command -v trae &> /dev/null; then
        log_error "Trae IDE 未安装或不在 PATH 中"
        exit 1
    fi
    
    log_success "重启前检查通过"
}

# 创建重启备份
create_restart_backup() {
    log_info "创建重启备份..."
    
    local backup_dir="$PROJECT_DIR/backups/restart/$(date '+%Y%m%d_%H%M%S')"
    mkdir -p "$backup_dir"
    
    # 备份配置文件
    if [ -d "$PROJECT_DIR/config" ]; then
        cp -r "$PROJECT_DIR/config" "$backup_dir/" 2>/dev/null || true
        log_success "配置文件已备份"
    fi
    
    # 备份当前状态
    if command -v trae &> /dev/null; then
        trae agent status --all > "$backup_dir/agent_status_before.log" 2>&1 || true
        trae workflow status > "$backup_dir/workflow_status_before.log" 2>&1 || true
        log_success "服务状态已备份"
    fi
    
    echo "$backup_dir" > "$PROJECT_DIR/.last_restart_backup"
    log_success "重启备份创建完成: $backup_dir"
}

# 执行停止流程
execute_stop() {
    log_info "执行停止流程..."
    
    if [ "$1" = "--force" ]; then
        log_warning "使用强制停止模式"
        if "$SCRIPT_DIR/stop.sh" --force; then
            log_success "强制停止完成"
        else
            log_error "强制停止失败"
            exit 1
        fi
    else
        if "$SCRIPT_DIR/stop.sh"; then
            log_success "正常停止完成"
        else
            log_warning "正常停止失败，尝试强制停止..."
            if "$SCRIPT_DIR/stop.sh" --force; then
                log_success "强制停止完成"
            else
                log_error "停止失败，无法继续重启"
                exit 1
            fi
        fi
    fi
}

# 等待服务完全停止
wait_for_shutdown() {
    log_info "等待服务完全停止..."
    
    local max_wait=30
    local wait_count=0
    
    while [ $wait_count -lt $max_wait ]; do
        if command -v trae &> /dev/null; then
            local running_agents=$(trae agent status --all 2>/dev/null | grep -c "running" || echo "0")
            if [ "$running_agents" -eq 0 ]; then
                log_success "所有服务已停止"
                break
            fi
        fi
        
        sleep 1
        ((wait_count++))
        
        if [ $((wait_count % 5)) -eq 0 ]; then
            log_info "等待服务停止... ($wait_count/$max_wait)"
        fi
    done
    
    if [ $wait_count -eq $max_wait ]; then
        log_warning "等待超时，强制继续启动流程"
    fi
}

# 执行启动流程
execute_start() {
    log_info "执行启动流程..."
    
    if "$SCRIPT_DIR/start.sh"; then
        log_success "启动完成"
    else
        log_error "启动失败"
        
        # 尝试恢复备份
        if [ -f "$PROJECT_DIR/.last_restart_backup" ]; then
            local backup_dir=$(cat "$PROJECT_DIR/.last_restart_backup")
            log_info "尝试从备份恢复: $backup_dir"
            
            if [ -d "$backup_dir/config" ]; then
                cp -r "$backup_dir/config"/* "$PROJECT_DIR/config/" 2>/dev/null || true
                log_info "配置文件已恢复"
            fi
        fi
        
        exit 1
    fi
}

# 验证重启结果
verify_restart() {
    log_info "验证重启结果..."
    
    # 等待服务完全启动
    sleep 10
    
    local success=true
    
    # 检查 Agent 状态
    if command -v trae &> /dev/null; then
        local running_agents=$(trae agent status --all 2>/dev/null | grep -c "running" || echo "0")
        local total_agents=13  # 总共 13 个 Agent
        
        if [ "$running_agents" -eq "$total_agents" ]; then
            log_success "所有 Agent ($running_agents/$total_agents) 运行正常"
        else
            log_warning "部分 Agent 未启动 ($running_agents/$total_agents)"
            success=false
        fi
        
        # 保存重启后状态
        if [ -f "$PROJECT_DIR/.last_restart_backup" ]; then
            local backup_dir=$(cat "$PROJECT_DIR/.last_restart_backup")
            trae agent status --all > "$backup_dir/agent_status_after.log" 2>&1 || true
            trae workflow status > "$backup_dir/workflow_status_after.log" 2>&1 || true
        fi
    else
        log_error "无法验证 Agent 状态"
        success=false
    fi
    
    if $success; then
        log_success "重启验证通过"
    else
        log_warning "重启验证发现问题，请检查日志"
    fi
}

# 清理重启临时文件
cleanup_restart() {
    log_info "清理重启临时文件..."
    
    # 保留最近 5 次重启备份
    if [ -d "$PROJECT_DIR/backups/restart" ]; then
        local backup_count=$(ls -1 "$PROJECT_DIR/backups/restart" | wc -l)
        if [ "$backup_count" -gt 5 ]; then
            local to_remove=$((backup_count - 5))
            ls -1t "$PROJECT_DIR/backups/restart" | tail -n "$to_remove" | while read dir; do
                rm -rf "$PROJECT_DIR/backups/restart/$dir"
                log_info "删除旧备份: $dir"
            done
        fi
    fi
    
    log_success "清理完成"
}

# 显示重启信息
show_restart_info() {
    echo ""
    echo "======================================"
    echo "Visual Design Squad Agent 重启完成"
    echo "======================================"
    echo ""
    echo "🔄 重启状态:"
    
    if command -v trae &> /dev/null; then
        local running_agents=$(trae agent status --all 2>/dev/null | grep -c "running" || echo "0")
        echo "   - Agent 服务: $running_agents/13 运行中"
        
        local running_workflows=$(trae workflow status 2>/dev/null | grep -c "running" || echo "0")
        echo "   - 工作流: $running_workflows 个运行中"
    else
        echo "   - 状态: 无法获取详细信息"
    fi
    
    echo ""
    echo "📊 管理命令:"
    echo "   - 查看状态: trae agent status --all"
    echo "   - 查看日志: tail -f logs/system/system.log"
    echo "   - 停止服务: ./scripts/deploy/stop.sh"
    echo "   - 再次重启: ./scripts/deploy/restart.sh"
    echo ""
    echo "📁 备份信息:"
    if [ -f "$PROJECT_DIR/.last_restart_backup" ]; then
        local backup_dir=$(cat "$PROJECT_DIR/.last_restart_backup")
        echo "   - 重启备份: $(basename "$backup_dir")"
    fi
    echo "   - 备份目录: backups/restart/"
    echo ""
    
    local restart_time=$(date '+%Y-%m-%d %H:%M:%S')
    echo "⏰ 重启时间: $restart_time"
    echo "$restart_time" > "$PROJECT_DIR/.last_restart_time"
    
    log_success "重启完成，服务已就绪！"
}

# 主函数
main() {
    echo "======================================"
    echo "Visual Design Squad Agent 重启脚本"
    echo "======================================"
    echo ""
    
    # 切换到项目目录
    cd "$PROJECT_DIR"
    
    # 创建必要目录
    mkdir -p logs/system backups/restart
    
    # 执行重启流程
    check_permissions
    pre_restart_check
    create_restart_backup
    execute_stop "$1"
    wait_for_shutdown
    execute_start
    verify_restart
    cleanup_restart
    show_restart_info
}

# 显示帮助信息
show_help() {
    echo "Visual Design Squad Agent 重启脚本"
    echo ""
    echo "用法:"
    echo "  $0 [选项]"
    echo ""
    echo "选项:"
    echo "  --force, -f    强制重启（跳过正常停止流程）"
    echo "  --help, -h     显示此帮助信息"
    echo ""
    echo "示例:"
    echo "  $0             正常重启"
    echo "  $0 --force     强制重启"
    echo ""
}

# 参数处理
case "$1" in
    --help|-h)
        show_help
        exit 0
        ;;
    --force|-f)
        # 继续执行主函数
        ;;
    "")
        # 正常重启，继续执行
        ;;
    *)
        echo "未知参数: $1"
        show_help
        exit 1
        ;;
esac

# 信号处理
trap 'log_error "重启过程被中断"; exit 1' INT TERM

# 执行主函数
main "$@"