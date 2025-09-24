#!/bin/bash

# ByteBot 依赖管理脚本
# 用于统一管理项目依赖的安装、更新和安全检查

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

# 检查 Node.js 版本
check_node_version() {
    log_info "检查 Node.js 版本..."
    local required_version="20.19.4"
    local current_version=$(node --version | sed 's/v//')
    
    if [ "$current_version" != "$required_version" ]; then
        log_warning "Node.js 版本不匹配: 当前 $current_version, 需要 $required_version"
        log_info "请运行: nvm use"
    else
        log_success "Node.js 版本正确: $current_version"
    fi
}

# 安装所有依赖
install_dependencies() {
    log_info "安装所有依赖..."
    npm ci
    log_success "依赖安装完成"
}

# 检查过时依赖
check_outdated() {
    log_info "检查过时依赖..."
    npm run outdated:all
}

# 运行安全审计
run_audit() {
    log_info "运行安全审计..."
    npm run audit:all
}

# 更新依赖
update_dependencies() {
    log_info "更新依赖..."
    npm run update:all
    log_success "依赖更新完成"
}

# 清理依赖
clean_dependencies() {
    log_info "清理依赖..."
    npm run clean:all
    log_success "依赖清理完成"
}

# 构建所有包
build_all() {
    log_info "构建所有包..."
    npm run build:all
    log_success "构建完成"
}

# 运行测试
run_tests() {
    log_info "运行测试..."
    npm run test:all
    log_success "测试完成"
}

# 运行代码检查
run_lint() {
    log_info "运行代码检查..."
    npm run lint:all
    log_success "代码检查完成"
}

# 格式化代码
format_code() {
    log_info "格式化代码..."
    npm run format:all
    log_success "代码格式化完成"
}

# 显示帮助信息
show_help() {
    echo "ByteBot 依赖管理脚本"
    echo ""
    echo "用法: $0 [命令]"
    echo ""
    echo "命令:"
    echo "  install     安装所有依赖"
    echo "  outdated    检查过时依赖"
    echo "  audit       运行安全审计"
    echo "  update      更新依赖"
    echo "  clean       清理依赖"
    echo "  build       构建所有包"
    echo "  test        运行测试"
    echo "  lint        运行代码检查"
    echo "  format      格式化代码"
    echo "  all         执行所有检查"
    echo "  help        显示帮助信息"
}

# 执行所有检查
run_all_checks() {
    log_info "执行所有依赖管理检查..."
    check_node_version
    install_dependencies
    check_outdated
    run_audit
    run_lint
    format_code
    build_all
    run_tests
    log_success "所有检查完成"
}

# 主函数
main() {
    case "${1:-help}" in
        install)
            check_node_version
            install_dependencies
            ;;
        outdated)
            check_outdated
            ;;
        audit)
            run_audit
            ;;
        update)
            update_dependencies
            ;;
        clean)
            clean_dependencies
            ;;
        build)
            build_all
            ;;
        test)
            run_tests
            ;;
        lint)
            run_lint
            ;;
        format)
            format_code
            ;;
        all)
            run_all_checks
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            log_error "未知命令: $1"
            show_help
            exit 1
            ;;
    esac
}

# 运行主函数
main "$@"
