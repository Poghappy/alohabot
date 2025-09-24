#!/bin/bash

# Visual Design Squad Agent - .env.template 文件修复脚本
# 用于解决 .env.template 文件在 IDE 中无法打开的问题

set -e

# 脚本信息
SCRIPT_NAME="fix-env-template.sh"
SCRIPT_VERSION="1.0.0"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

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

# 显示帮助信息
show_help() {
    cat << EOF
$SCRIPT_NAME v$SCRIPT_VERSION

用法: $0 [选项]

选项:
    -h, --help          显示此帮助信息
    -v, --version       显示版本信息
    -c, --check         仅检查文件状态，不执行修复
    -f, --force         强制执行所有修复操作
    --backup            创建备份后再修复
    --restore           从备份恢复文件

描述:
    此脚本用于修复 .env.template 文件在 IDE 中无法打开的问题。
    会尝试多种修复方案，包括文件权限、编码格式、文件关联等。

示例:
    $0                  # 执行标准修复流程
    $0 --check          # 仅检查文件状态
    $0 --backup         # 创建备份后修复
    $0 --restore        # 从备份恢复

EOF
}

# 检查文件状态
check_file_status() {
    local file_path="$PROJECT_ROOT/.env.template"
    
    log_info "检查 .env.template 文件状态..."
    
    # 检查文件是否存在
    if [[ ! -f "$file_path" ]]; then
        log_error "文件不存在: $file_path"
        return 1
    fi
    
    # 检查文件权限
    local permissions=$(ls -l "$file_path" | cut -d' ' -f1)
    log_info "文件权限: $permissions"
    
    # 检查文件大小
    local file_size=$(wc -c < "$file_path")
    log_info "文件大小: $file_size 字节"
    
    # 检查文件类型和编码
    local file_type=$(file "$file_path")
    log_info "文件类型: $file_type"
    
    # 检查文件内容前几行
    log_info "文件内容预览:"
    head -5 "$file_path" | while IFS= read -r line; do
        echo "  $line"
    done
    
    # 检查是否有特殊字符
    if grep -q $'\r' "$file_path"; then
        log_warning "检测到 Windows 换行符 (CRLF)"
    fi
    
    # 检查是否有 BOM
    if [[ $(head -c 3 "$file_path" | od -t x1 -N 3 | head -1 | grep "ef bb bf") ]]; then
        log_warning "检测到 UTF-8 BOM"
    fi
    
    return 0
}

# 创建备份
create_backup() {
    local file_path="$PROJECT_ROOT/.env.template"
    local backup_dir="$PROJECT_ROOT/backups/configs"
    local timestamp=$(date +"%Y%m%d_%H%M%S")
    local backup_file="$backup_dir/.env.template.backup.$timestamp"
    
    log_info "创建备份文件..."
    
    # 确保备份目录存在
    mkdir -p "$backup_dir"
    
    # 创建备份
    if cp "$file_path" "$backup_file"; then
        log_success "备份已创建: $backup_file"
        echo "$backup_file" > "$backup_dir/.env.template.latest_backup"
        return 0
    else
        log_error "备份创建失败"
        return 1
    fi
}

# 从备份恢复
restore_from_backup() {
    local backup_dir="$PROJECT_ROOT/backups/configs"
    local latest_backup_file="$backup_dir/.env.template.latest_backup"
    local file_path="$PROJECT_ROOT/.env.template"
    
    if [[ ! -f "$latest_backup_file" ]]; then
        log_error "未找到备份记录文件"
        return 1
    fi
    
    local backup_file=$(cat "$latest_backup_file")
    
    if [[ ! -f "$backup_file" ]]; then
        log_error "备份文件不存在: $backup_file"
        return 1
    fi
    
    log_info "从备份恢复文件: $backup_file"
    
    if cp "$backup_file" "$file_path"; then
        log_success "文件已从备份恢复"
        return 0
    else
        log_error "从备份恢复失败"
        return 1
    fi
}

# 修复文件权限
fix_permissions() {
    local file_path="$PROJECT_ROOT/.env.template"
    
    log_info "修复文件权限..."
    
    # 设置标准权限 (644)
    if chmod 644 "$file_path"; then
        log_success "文件权限已修复为 644"
        return 0
    else
        log_error "文件权限修复失败"
        return 1
    fi
}

# 修复换行符
fix_line_endings() {
    local file_path="$PROJECT_ROOT/.env.template"
    local temp_file="$file_path.tmp"
    
    log_info "修复换行符格式..."
    
    # 检查是否有 CRLF
    if grep -q $'\r' "$file_path"; then
        log_info "转换 CRLF 为 LF..."
        
        # 使用 tr 命令删除 \r
        if tr -d '\r' < "$file_path" > "$temp_file"; then
            mv "$temp_file" "$file_path"
            log_success "换行符已修复"
            return 0
        else
            log_error "换行符修复失败"
            rm -f "$temp_file"
            return 1
        fi
    else
        log_info "换行符格式正常"
        return 0
    fi
}

# 移除 BOM
remove_bom() {
    local file_path="$PROJECT_ROOT/.env.template"
    local temp_file="$file_path.tmp"
    
    log_info "检查并移除 UTF-8 BOM..."
    
    # 检查是否有 BOM
    if [[ $(head -c 3 "$file_path" | od -t x1 -N 3 | head -1 | grep "ef bb bf") ]]; then
        log_info "移除 UTF-8 BOM..."
        
        # 移除前 3 个字节 (BOM)
        if tail -c +4 "$file_path" > "$temp_file"; then
            mv "$temp_file" "$file_path"
            log_success "UTF-8 BOM 已移除"
            return 0
        else
            log_error "BOM 移除失败"
            rm -f "$temp_file"
            return 1
        fi
    else
        log_info "未检测到 UTF-8 BOM"
        return 0
    fi
}

# 创建副本文件
create_alternative_files() {
    local file_path="$PROJECT_ROOT/.env.template"
    
    log_info "创建替代文件..."
    
    # 创建 .txt 扩展名版本
    local txt_file="$PROJECT_ROOT/.env.template.txt"
    if cp "$file_path" "$txt_file"; then
        log_success "已创建 .txt 版本: .env.template.txt"
    fi
    
    # 创建 .env.example 版本
    local example_file="$PROJECT_ROOT/.env.example"
    if cp "$file_path" "$example_file"; then
        log_success "已创建 .env.example 版本"
    fi
    
    # 创建实际的 .env 文件（如果不存在）
    local env_file="$PROJECT_ROOT/.env"
    if [[ ! -f "$env_file" ]]; then
        if cp "$file_path" "$env_file"; then
            log_success "已创建 .env 文件"
            log_warning "请根据实际情况修改 .env 文件中的配置"
        fi
    fi
}

# 验证修复结果
verify_fix() {
    local file_path="$PROJECT_ROOT/.env.template"
    
    log_info "验证修复结果..."
    
    # 检查文件是否可读
    if [[ -r "$file_path" ]]; then
        log_success "文件可读性正常"
    else
        log_error "文件仍然不可读"
        return 1
    fi
    
    # 检查文件内容
    if head -1 "$file_path" > /dev/null 2>&1; then
        log_success "文件内容可正常访问"
    else
        log_error "文件内容访问异常"
        return 1
    fi
    
    # 检查文件编码
    local file_type=$(file "$file_path")
    if [[ "$file_type" == *"UTF-8"* ]]; then
        log_success "文件编码正常 (UTF-8)"
    else
        log_warning "文件编码可能异常: $file_type"
    fi
    
    return 0
}

# 主修复流程
main_fix() {
    local create_backup_flag="$1"
    local force_flag="$2"
    
    log_info "开始 .env.template 文件修复流程..."
    
    # 检查文件状态
    if ! check_file_status; then
        log_error "文件状态检查失败"
        return 1
    fi
    
    # 创建备份（如果需要）
    if [[ "$create_backup_flag" == "true" ]]; then
        if ! create_backup; then
            log_error "备份创建失败，终止修复流程"
            return 1
        fi
    fi
    
    # 执行修复操作
    local fix_success=true
    
    # 修复文件权限
    if ! fix_permissions; then
        fix_success=false
    fi
    
    # 修复换行符
    if ! fix_line_endings; then
        fix_success=false
    fi
    
    # 移除 BOM
    if ! remove_bom; then
        fix_success=false
    fi
    
    # 创建替代文件
    create_alternative_files
    
    # 验证修复结果
    if verify_fix; then
        log_success "文件修复完成！"
        
        echo ""
        log_info "修复后的文件信息:"
        check_file_status
        
        echo ""
        log_info "建议的后续操作:"
        echo "  1. 尝试在 IDE 中重新打开 .env.template 文件"
        echo "  2. 如果仍无法打开，可以使用 .env.template.txt 文件"
        echo "  3. 复制 .env.template 为 .env 并根据需要修改配置"
        echo "  4. 重启 IDE 清理缓存"
        
        return 0
    else
        log_error "文件修复验证失败"
        return 1
    fi
}

# 主函数
main() {
    local check_only=false
    local create_backup_flag=false
    local force_flag=false
    local restore_flag=false
    
    # 解析命令行参数
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_help
                exit 0
                ;;
            -v|--version)
                echo "$SCRIPT_NAME v$SCRIPT_VERSION"
                exit 0
                ;;
            -c|--check)
                check_only=true
                shift
                ;;
            -f|--force)
                force_flag=true
                shift
                ;;
            --backup)
                create_backup_flag=true
                shift
                ;;
            --restore)
                restore_flag=true
                shift
                ;;
            *)
                log_error "未知参数: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    # 显示脚本信息
    echo "========================================"
    echo "$SCRIPT_NAME v$SCRIPT_VERSION"
    echo "Visual Design Squad Agent 文件修复工具"
    echo "========================================"
    echo ""
    
    # 检查项目根目录
    if [[ ! -d "$PROJECT_ROOT" ]]; then
        log_error "项目根目录不存在: $PROJECT_ROOT"
        exit 1
    fi
    
    cd "$PROJECT_ROOT"
    
    # 执行相应操作
    if [[ "$restore_flag" == "true" ]]; then
        restore_from_backup
    elif [[ "$check_only" == "true" ]]; then
        check_file_status
    else
        main_fix "$create_backup_flag" "$force_flag"
    fi
}

# 执行主函数
main "$@"