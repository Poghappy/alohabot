#!/bin/bash

# 火鸟门户 + Bytebot AI桌面代理 - 自动化安装配置脚本
# 使用方法: chmod +x scripts/setup-bytebot.sh && ./scripts/setup-bytebot.sh

set -e  # 遇到错误立即退出

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

# 检查系统要求
check_requirements() {
    log_info "检查系统要求..."
    
    # 检查Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker未安装，请先安装Docker"
        exit 1
    fi
    
    # 检查Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose未安装，请先安装Docker Compose"
        exit 1
    fi
    
    # 检查可用内存 (需要至少4GB)
    AVAILABLE_MEMORY=$(free -g | awk '/^Mem:/{print $7}')
    if [ "$AVAILABLE_MEMORY" -lt 4 ]; then
        log_warning "可用内存不足4GB，Bytebot可能运行不稳定"
    fi
    
    # 检查磁盘空间 (需要至少10GB)
    AVAILABLE_DISK=$(df -BG . | awk 'NR==2 {print $4}' | sed 's/G//')
    if [ "$AVAILABLE_DISK" -lt 10 ]; then
        log_warning "可用磁盘空间不足10GB，可能影响运行"
    fi
    
    log_success "系统要求检查完成"
}

# 创建必要目录
create_directories() {
    log_info "创建必要目录..."
    
    mkdir -p logs/bytebot
    mkdir -p data/bytebot_shared
    mkdir -p backups/bytebot
    mkdir -p backups/postgres
    mkdir -p config
    mkdir -p ssl
    
    log_success "目录创建完成"
}

# 配置环境变量
setup_environment() {
    log_info "配置环境变量..."
    
    # 检查是否存在.env.bytebot文件
    if [ ! -f ".env.bytebot" ]; then
        if [ -f "config/bytebot.env.example" ]; then
            cp config/bytebot.env.example .env.bytebot
            log_warning "已创建.env.bytebot文件，请编辑并填入真实的API密钥"
        else
            log_error "找不到配置模板文件"
            exit 1
        fi
    fi
    
    # 检查必要的环境变量
    if ! grep -q "ANTHROPIC_API_KEY=sk-ant" .env.bytebot; then
        log_warning "请在.env.bytebot中配置ANTHROPIC_API_KEY"
    fi
    
    log_success "环境变量配置完成"
}

# 拉取Docker镜像
pull_images() {
    log_info "拉取Docker镜像..."
    
    # 拉取Bytebot镜像
    docker pull ghcr.io/bytebot-ai/bytebot-desktop:edge
    docker pull ghcr.io/bytebot-ai/bytebot-agent:edge
    docker pull ghcr.io/bytebot-ai/bytebot-ui:edge
    
    # 拉取基础服务镜像
    docker pull postgres:16-alpine
    docker pull postgres:15
    docker pull redis:7-alpine
    docker pull n8nio/n8n:latest
    docker pull nginx:alpine
    
    log_success "Docker镜像拉取完成"
}

# 初始化数据库
init_databases() {
    log_info "初始化数据库..."
    
    # 启动数据库服务
    docker-compose -f docker-compose.bytebot.yml up -d postgres bytebot-postgres redis
    
    # 等待数据库启动
    sleep 10
    
    # 创建数据库表 (如果需要)
    # 这里可以添加数据库初始化脚本
    
    log_success "数据库初始化完成"
}

# 配置Nginx (可选)
setup_nginx() {
    log_info "配置Nginx反向代理..."
    
    cat > config/nginx.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    upstream huoniao_portal {
        server huoniao-portal:3000;
    }
    
    upstream bytebot_ui {
        server bytebot-ui:9992;
    }
    
    upstream bytebot_desktop {
        server bytebot-desktop:9990;
    }
    
    server {
        listen 80;
        server_name localhost;
        
        # 火鸟门户
        location / {
            proxy_pass http://huoniao_portal;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }
        
        # Bytebot UI
        location /bytebot/ {
            proxy_pass http://bytebot_ui/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }
        
        # Bytebot桌面VNC
        location /vnc/ {
            proxy_pass http://bytebot_desktop/;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
        }
    }
}
EOF
    
    log_success "Nginx配置完成"
}

# 启动服务
start_services() {
    log_info "启动所有服务..."
    
    # 加载环境变量并启动服务
    export $(cat .env.bytebot | xargs)
    docker-compose -f docker-compose.bytebot.yml up -d
    
    log_success "服务启动完成"
}

# 检查服务状态
check_services() {
    log_info "检查服务状态..."
    
    sleep 30  # 等待服务完全启动
    
    # 检查各个服务的健康状态
    services=(
        "http://localhost:3000:火鸟门户"
        "http://localhost:9990:Bytebot桌面"
        "http://localhost:9991:Bytebot代理"
        "http://localhost:9992:Bytebot UI"
        "http://localhost:5678:N8N工作流"
        "http://localhost:8000:Firecrawl API"
    )
    
    for service in "${services[@]}"; do
        IFS=':' read -r url name <<< "$service"
        if curl -s -o /dev/null -w "%{http_code}" "$url" | grep -q "200\|302"; then
            log_success "$name 运行正常 ($url)"
        else
            log_warning "$name 可能未正常启动 ($url)"
        fi
    done
}

# 显示访问信息
show_access_info() {
    log_info "服务访问信息:"
    echo ""
    echo "🏠 火鸟门户主页:     http://localhost:3000"
    echo "🤖 Bytebot AI界面:   http://localhost:9992"
    echo "🖥️  Bytebot桌面VNC:  http://localhost:9990"
    echo "⚡ N8N工作流管理:    http://localhost:5678 (admin/admin123)"
    echo "🔥 Firecrawl API:    http://localhost:8000"
    echo "📊 Redis缓存:        localhost:6379"
    echo "🗄️  PostgreSQL主库:  localhost:5432"
    echo "🗄️  Bytebot数据库:   localhost:5433"
    echo ""
    echo "📝 日志目录:         ./logs/"
    echo "💾 数据目录:         ./data/"
    echo "🔧 配置文件:         .env.bytebot"
    echo ""
    log_success "安装完成！请访问上述地址开始使用。"
}

# 主函数
main() {
    echo "================================================================"
    echo "🔥 火鸟门户 + Bytebot AI桌面代理 自动化安装脚本"
    echo "================================================================"
    echo ""
    
    check_requirements
    create_directories
    setup_environment
    
    # 询问是否拉取镜像
    read -p "是否拉取最新Docker镜像? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        pull_images
    fi
    
    init_databases
    setup_nginx
    start_services
    check_services
    show_access_info
    
    echo ""
    echo "================================================================"
    log_success "安装完成！"
    echo "================================================================"
}

# 错误处理
trap 'log_error "脚本执行失败，请检查错误信息"; exit 1' ERR

# 执行主函数
main "$@"
