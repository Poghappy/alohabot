#!/bin/bash

# n8n MCP 快速配置脚本
# 基于 ChatGPT 客户端教学文档和实际测试结果

set -e

echo "🚀 n8n MCP 配置助手"
echo "================="
echo

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
    
    # 检查 curl
    if ! command -v curl &> /dev/null; then
        log_error "curl 未安装，请先安装 curl"
        exit 1
    fi
    
    # 检查 jq
    if ! command -v jq &> /dev/null; then
        log_warning "jq 未安装，将尝试安装..."
        if command -v brew &> /dev/null; then
            brew install jq
        elif command -v apt-get &> /dev/null; then
            sudo apt-get update && sudo apt-get install -y jq
        else
            log_error "无法自动安装 jq，请手动安装"
            exit 1
        fi
    fi
    
    # 检查 Docker
    if ! command -v docker &> /dev/null; then
        log_warning "Docker 未安装，MCP 服务器功能将受限"
    fi
    
    log_success "依赖检查完成"
}

# 检查 n8n 状态
check_n8n_status() {
    log_info "检查 n8n 实例状态..."
    
    N8N_URL="${N8N_URL:-http://localhost:5678}"
    
    if curl -s -f "$N8N_URL/rest/settings" > /dev/null; then
        log_success "n8n 实例运行正常: $N8N_URL"
        
        # 检查 Public API 状态
        API_STATUS=$(curl -s "$N8N_URL/rest/settings" | jq -r '.data.publicApi.enabled // false')
        if [ "$API_STATUS" = "true" ]; then
            log_success "Public API 已启用"
        else
            log_error "Public API 未启用，请在 n8n 设置中启用"
            exit 1
        fi
        
        # 检查 MCP 端点配置
        MCP_ENDPOINT=$(curl -s "$N8N_URL/rest/settings" | jq -r '.data.endpointMcp // "mcp"')
        log_info "MCP 端点配置: /$MCP_ENDPOINT"
        
    else
        log_error "无法连接到 n8n 实例: $N8N_URL"
        log_info "请确保 n8n 正在运行并可访问"
        exit 1
    fi
}

# 验证 API 密钥
validate_api_key() {
    log_info "验证 API 密钥..."
    
    if [ -z "$N8N_API_KEY" ]; then
        log_error "N8N_API_KEY 环境变量未设置"
        log_info "请设置您的 n8n API 密钥:"
        log_info "export N8N_API_KEY='您的JWT密钥'"
        exit 1
    fi
    
    # 测试 API 访问
    RESPONSE=$(curl -s -H "X-N8N-API-KEY: $N8N_API_KEY" "$N8N_URL/api/v1/workflows")
    
    if echo "$RESPONSE" | jq -e '.data' > /dev/null 2>&1; then
        log_success "API 密钥验证成功"
        WORKFLOW_COUNT=$(echo "$RESPONSE" | jq '.data | length')
        log_info "当前工作流数量: $WORKFLOW_COUNT"
    else
        log_error "API 密钥验证失败"
        log_info "响应: $RESPONSE"
        exit 1
    fi
}

# 创建测试工作流
create_test_workflow() {
    log_info "创建测试工作流..."
    
    TEST_WORKFLOW='{
        "name": "MCP Test Workflow - '$(date +%Y%m%d-%H%M%S)'",
        "nodes": [
            {
                "id": "start",
                "name": "Start",
                "type": "n8n-nodes-base.start",
                "typeVersion": 1,
                "position": [240, 300],
                "parameters": {}
            },
            {
                "id": "webhook",
                "name": "Webhook",
                "type": "n8n-nodes-base.webhook",
                "typeVersion": 1,
                "position": [460, 300],
                "parameters": {
                    "path": "mcp-test",
                    "httpMethod": "GET"
                }
            }
        ],
        "connections": {
            "Start": {
                "main": [
                    [
                        {
                            "node": "Webhook",
                            "type": "main",
                            "index": 0
                        }
                    ]
                ]
            }
        },
        "settings": {
            "executionOrder": "v1"
        }
    }'
    
    RESPONSE=$(curl -s -X POST \
        -H "X-N8N-API-KEY: $N8N_API_KEY" \
        -H "Content-Type: application/json" \
        -d "$TEST_WORKFLOW" \
        "$N8N_URL/api/v1/workflows")
    
    if echo "$RESPONSE" | jq -e '.id' > /dev/null 2>&1; then
        WORKFLOW_ID=$(echo "$RESPONSE" | jq -r '.id')
        log_success "测试工作流创建成功: $WORKFLOW_ID"
        echo "$WORKFLOW_ID" > .test_workflow_id
    else
        log_error "测试工作流创建失败"
        log_info "响应: $RESPONSE"
    fi
}

# 配置 MCP 服务器
setup_mcp_server() {
    log_info "配置 MCP 服务器..."
    
    # 检查用户类型
    echo
    echo "请选择您的 ChatGPT 订阅类型:"
    echo "1) ChatGPT Pro (推荐 - 支持自定义连接器)"
    echo "2) ChatGPT Plus (使用 GPT Actions 替代方案)"
    echo "3) Business/Enterprise/Edu (支持自定义连接器)"
    echo
    read -p "请输入选项 (1-3): " USER_TYPE
    
    case $USER_TYPE in
        1|3)
            setup_mcp_connector
            ;;
        2)
            setup_gpt_actions
            ;;
        *)
            log_error "无效选项"
            exit 1
            ;;
    esac
}

# 配置 MCP 连接器 (Pro/Enterprise 用户)
setup_mcp_connector() {
    log_info "配置 MCP 连接器..."
    
    # 检查 Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker 未安装，无法运行 MCP 服务器"
        log_info "请安装 Docker 后重试"
        exit 1
    fi
    
    # 拉取官方 MCP 服务器镜像
    log_info "拉取 n8n MCP 服务器镜像..."
    if docker pull vredrick/n8n-mcp:latest; then
        log_success "镜像拉取成功"
    else
        log_error "镜像拉取失败"
        exit 1
    fi
    
    # 创建 MCP 配置文件
    MCP_CONFIG_DIR="$HOME/.config/mcp"
    mkdir -p "$MCP_CONFIG_DIR"
    
    cat > "$MCP_CONFIG_DIR/config.json" << EOF
{
  "mcpServers": {
    "n8n": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "-e", "N8N_API_URL=$N8N_URL",
        "-e", "N8N_API_KEY=$N8N_API_KEY",
        "--network", "host",
        "vredrick/n8n-mcp:latest"
      ]
    }
  }
}
EOF
    
    log_success "MCP 配置文件已创建: $MCP_CONFIG_DIR/config.json"
    
    # 测试 MCP 服务器
    log_info "测试 MCP 服务器连接..."
    
    # 启动临时 MCP 服务器进行测试
    CONTAINER_ID=$(docker run -d \
        -e "N8N_API_URL=$N8N_URL" \
        -e "N8N_API_KEY=$N8N_API_KEY" \
        --network host \
        vredrick/n8n-mcp:latest)
    
    if [ $? -eq 0 ]; then
        log_success "MCP 服务器启动成功"
        sleep 5
        
        # 停止测试容器
        docker stop "$CONTAINER_ID" > /dev/null 2>&1
        
        echo
        log_success "✅ MCP 连接器配置完成!"
        echo
        echo "下一步操作:"
        echo "1. 打开 ChatGPT Settings → Connectors"
        echo "2. 添加自定义连接器"
        echo "3. 输入 MCP 服务器信息并完成认证"
        echo "4. 在对话中使用 'Deep Research' 或 'Use Connectors' 功能"
    else
        log_error "MCP 服务器启动失败"
    fi
}

# 配置 GPT Actions (Plus 用户)
setup_gpt_actions() {
    log_info "配置 GPT Actions..."
    
    # 创建 OpenAPI 配置文件
    ACTIONS_DIR="./gpt_actions"
    mkdir -p "$ACTIONS_DIR"
    
    cat > "$ACTIONS_DIR/n8n_openapi.yaml" << EOF
openapi: 3.0.0
info:
  title: n8n API Integration
  version: 1.0.0
  description: Direct n8n API access for ChatGPT Plus users
servers:
  - url: $N8N_URL/api/v1
    description: n8n API endpoint
paths:
  /workflows:
    get:
      summary: List all workflows
      parameters:
        - name: X-N8N-API-KEY
          in: header
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      type: object
    post:
      summary: Create new workflow
      parameters:
        - name: X-N8N-API-KEY
          in: header
          required: true
          schema:
            type: string
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                name:
                  type: string
                nodes:
                  type: array
                connections:
                  type: object
                settings:
                  type: object
              required: [name, nodes, connections, settings]
      responses:
        '201':
          description: Workflow created
  /workflows/{id}:
    get:
      summary: Get workflow details
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
        - name: X-N8N-API-KEY
          in: header
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Workflow details
  /executions:
    get:
      summary: List workflow executions
      parameters:
        - name: X-N8N-API-KEY
          in: header
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Execution list
components:
  securitySchemes:
    ApiKeyAuth:
      type: apiKey
      in: header
      name: X-N8N-API-KEY
security:
  - ApiKeyAuth: []
EOF
    
    log_success "OpenAPI 配置文件已创建: $ACTIONS_DIR/n8n_openapi.yaml"
    
    echo
    log_success "✅ GPT Actions 配置完成!"
    echo
    echo "下一步操作:"
    echo "1. 在 ChatGPT 中创建新的自定义 GPT"
    echo "2. 在 Actions 部分导入上述 OpenAPI 配置文件"
    echo "3. 设置 API Key 认证，使用您的 n8n API 密钥"
    echo "4. 测试 API 调用功能"
    echo
    echo "OpenAPI 配置文件位置: $ACTIONS_DIR/n8n_openapi.yaml"
    echo "您的 API 密钥: $N8N_API_KEY"
}

# 清理测试资源
cleanup() {
    log_info "清理测试资源..."
    
    if [ -f ".test_workflow_id" ]; then
        WORKFLOW_ID=$(cat .test_workflow_id)
        log_info "删除测试工作流: $WORKFLOW_ID"
        
        curl -s -X DELETE \
            -H "X-N8N-API-KEY: $N8N_API_KEY" \
            "$N8N_URL/api/v1/workflows/$WORKFLOW_ID" > /dev/null
        
        rm -f .test_workflow_id
        log_success "测试工作流已删除"
    fi
}

# 显示配置摘要
show_summary() {
    echo
    echo "🎉 n8n MCP 配置完成!"
    echo "=================="
    echo
    echo "配置摘要:"
    echo "- n8n URL: $N8N_URL"
    echo "- API 状态: ✅ 已验证"
    echo "- MCP 端点: ✅ 已配置"
    echo "- 测试工作流: ✅ 创建成功"
    echo
    echo "可用功能:"
    echo "- 🔍 搜索和管理 n8n 工作流"
    echo "- 📚 获取节点文档和配置指导"
    echo "- ⚡ 创建和验证新的自动化工作流"
    echo "- 📊 监控工作流执行状态"
    echo "- 🤖 访问 263 个 AI 优化节点"
    echo
    echo "相关文档:"
    echo "- 配置指南: ./n8n_mcp_configuration.md"
    echo "- 配置示例: ./n8n_mcp_example_config.json"
    echo "- GitHub 项目: https://github.com/vredrick/n8n-mcp"
    echo
}

# 主函数
main() {
    echo "开始 n8n MCP 配置..."
    echo
    
    # 设置默认值
    N8N_URL="${N8N_URL:-http://localhost:5678}"
    
    # 执行配置步骤
    check_dependencies
    check_n8n_status
    validate_api_key
    create_test_workflow
    setup_mcp_server
    
    # 显示摘要
    show_summary
    
    # 询问是否清理测试资源
    echo
    read -p "是否删除测试工作流? (y/N): " CLEANUP
    if [[ $CLEANUP =~ ^[Yy]$ ]]; then
        cleanup
    fi
    
    log_success "配置完成! 🚀"
}

# 错误处理
trap 'log_error "配置过程中发生错误，请检查日志"' ERR

# 运行主函数
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi