# n8n MCP 配置指南

基于 `/Users/zhiledeng/Downloads/新闻模块api接口/bytebot/ChatGPT客户端教学` 提供的官方文档和实际测试结果。

## 一、配置概述

### 当前状态验证
根据之前的测试，您的n8n实例已具备以下配置：

✅ **Public API 已启用**
- 端点：`http://localhost:5678/api/v1/`
- 状态：已验证可用

✅ **MCP 端点已配置**
- MCP端点：`http://localhost:5678/mcp`
- MCP测试端点：`http://localhost:5678/mcp-test`

✅ **API 密钥已创建**
- 格式：JWT token
- 验证：已通过API访问测试

✅ **基础工作流创建测试**
- 成功创建测试工作流
- API响应正常

## 二、MCP 服务器配置方案

### 方案一：使用官方 n8n-mcp 服务器（推荐）

基于 GitHub 项目：https://github.com/vredrick/n8n-mcp

#### Docker 配置

```json
{
  "mcpServers": {
    "n8n": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "-e", "N8N_API_URL=http://localhost:5678",
        "-e", "N8N_API_KEY=你的JWT密钥",
        "--network", "host",
        "vredrick/n8n-mcp:latest"
      ]
    }
  }
}
```

#### 环境变量配置

```bash
# n8n 连接配置
N8N_API_URL=http://localhost:5678
N8N_API_KEY=你的JWT密钥

# 可选配置
N8N_WEBHOOK_URL=http://localhost:5678/webhook
N8N_EDITOR_URL=http://localhost:5678
```

### 方案二：自定义 MCP 服务器

基于官方教学文档《为 ChatGPT 和 API 集成构建 MCP 服务器.md》的指导。

#### 核心工具实现

必须实现以下两个工具：

1. **search 工具**
   - 功能：搜索n8n工作流和节点
   - 参数：query (string)
   - 返回：结果数组，包含 id, title, url

2. **fetch 工具**
   - 功能：获取具体工作流或节点详情
   - 参数：id (string)
   - 返回：完整内容，包含 id, title, text, url, metadata

#### Python 实现示例

```python
import os
import requests
from fastmcp import FastMCP

# n8n 配置
N8N_API_URL = os.environ.get("N8N_API_URL", "http://localhost:5678")
N8N_API_KEY = os.environ.get("N8N_API_KEY")

headers = {
    "X-N8N-API-KEY": N8N_API_KEY,
    "Content-Type": "application/json"
}

mcp = FastMCP(name="n8n MCP Server")

@mcp.tool()
async def search(query: str):
    """搜索n8n工作流"""
    response = requests.get(
        f"{N8N_API_URL}/api/v1/workflows",
        headers=headers,
        params={"filter": query}
    )
    
    workflows = response.json().get("data", [])
    results = []
    
    for workflow in workflows:
        results.append({
            "id": workflow["id"],
            "title": workflow["name"],
            "url": f"{N8N_API_URL}/workflow/{workflow['id']}"
        })
    
    return {"results": results}

@mcp.tool()
async def fetch(id: str):
    """获取工作流详情"""
    response = requests.get(
        f"{N8N_API_URL}/api/v1/workflows/{id}",
        headers=headers
    )
    
    workflow = response.json()
    
    return {
        "id": workflow["id"],
        "title": workflow["name"],
        "text": f"工作流：{workflow['name']}\n节点数量：{len(workflow.get('nodes', []))}\n连接数量：{len(workflow.get('connections', {}))}",
        "url": f"{N8N_API_URL}/workflow/{workflow['id']}",
        "metadata": {
            "active": workflow.get("active", False),
            "tags": workflow.get("tags", []),
            "createdAt": workflow.get("createdAt"),
            "updatedAt": workflow.get("updatedAt")
        }
    }

if __name__ == "__main__":
    mcp.run(transport="sse", host="0.0.0.0", port=8000)
```

## 三、ChatGPT 连接器配置

### 权限要求

根据官方文档《Plus 用户：自定义 GPT 与连接器（MCP）说明.md》：

- ❌ **ChatGPT Plus 用户**：无法直接使用自定义连接器（MCP）
- ✅ **ChatGPT Pro 用户**：可以使用自定义连接器
- ✅ **Business/Enterprise/Edu 用户**：可以使用自定义连接器

### 替代方案（Plus 用户）

如果您是 Plus 用户，可以考虑：

1. **升级到 ChatGPT Pro**
   - 获得自定义连接器权限
   - 支持 MCP 协议集成

2. **使用 GPT Actions**
   - 基于 OpenAPI 规范
   - 直接调用 n8n API
   - 在自定义 GPT 中配置

#### GPT Actions 配置示例

```yaml
openapi: 3.0.0
info:
  title: n8n API
  version: 1.0.0
servers:
  - url: http://localhost:5678/api/v1
paths:
  /workflows:
    get:
      summary: 获取工作流列表
      parameters:
        - name: X-N8N-API-KEY
          in: header
          required: true
          schema:
            type: string
      responses:
        '200':
          description: 成功
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      type: object
  /workflows/{id}:
    get:
      summary: 获取工作流详情
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
          description: 成功
```

## 四、配置步骤

### 步骤 1：准备 n8n 环境

1. 确保 n8n 运行在 `http://localhost:5678`
2. 验证 Public API 已启用
3. 创建并记录 API 密钥

### 步骤 2：选择配置方案

**Pro 用户（推荐）：**
```bash
# 拉取官方 MCP 服务器
docker pull vredrick/n8n-mcp:latest

# 配置环境变量
export N8N_API_URL=http://localhost:5678
export N8N_API_KEY=你的JWT密钥
```

**Plus 用户：**
- 在 ChatGPT 中创建自定义 GPT
- 配置上述 OpenAPI Actions
- 设置 API 密钥认证

### 步骤 3：测试连接

```bash
# 测试 API 连接
curl -H "X-N8N-API-KEY: 你的密钥" \
     -s http://localhost:5678/api/v1/workflows | jq '.'

# 测试 MCP 端点
curl -H "X-N8N-API-KEY: 你的密钥" \
     -s http://localhost:5678/mcp
```

### 步骤 4：在 ChatGPT 中配置

**Pro 用户：**
1. 进入 ChatGPT Settings → Connectors
2. 添加自定义连接器
3. 输入 MCP 服务器 URL
4. 完成 OAuth 认证流程

**Plus 用户：**
1. 创建新的自定义 GPT
2. 在 Actions 中导入 OpenAPI 配置
3. 设置 API Key 认证
4. 测试 API 调用

## 五、功能特性

### n8n MCP 服务器功能

- ✅ **节点搜索和文档**：搜索 525+ 个可用节点
- ✅ **工作流管理**：创建、更新、验证工作流
- ✅ **AI 节点支持**：263 个 AI 优化节点
- ✅ **实时验证**：节点配置和工作流验证
- ✅ **模板库**：399 个社区工作流模板
- ✅ **执行管理**：触发和监控工作流执行

### 支持的操作

1. **搜索节点**：`search_nodes({query: "webhook"})`
2. **获取节点信息**：`get_node_info("nodes-base.webhook")`
3. **创建工作流**：`n8n_create_workflow({...})`
4. **验证配置**：`validate_workflow({...})`
5. **触发执行**：`n8n_trigger_webhook_workflow({...})`

## 六、安全考虑

### API 密钥安全

- 🔒 使用环境变量存储 API 密钥
- 🔒 定期轮换 API 密钥
- 🔒 限制 API 密钥权限范围

### 网络安全

- 🔒 使用 HTTPS（生产环境）
- 🔒 配置防火墙规则
- 🔒 启用访问日志监控

### MCP 服务器安全

根据官方文档警告：
- ⚠️ 仅连接可信的 MCP 服务器
- ⚠️ 注意提示注入攻击风险
- ⚠️ 谨慎处理敏感数据传输

## 七、故障排除

### 常见问题

1. **API 密钥无效**
   ```bash
   # 验证密钥格式
   echo "你的密钥" | base64 -d
   ```

2. **连接被拒绝**
   ```bash
   # 检查 n8n 服务状态
   curl -I http://localhost:5678/rest/settings
   ```

3. **MCP 服务器无响应**
   ```bash
   # 检查 Docker 容器状态
   docker ps | grep n8n-mcp
   ```

### 调试步骤

1. 验证 n8n API 可访问性
2. 检查环境变量配置
3. 查看 MCP 服务器日志
4. 测试基础 API 调用
5. 验证 ChatGPT 连接器配置

## 八、参考资源

- [n8n MCP GitHub 项目](https://github.com/vredrick/n8n-mcp)
- [MCP 协议规范](https://modelcontextprotocol.io/)
- [OpenAI MCP 文档](https://platform.openai.com/docs/mcp)
- [ChatGPT 连接器帮助](https://help.openai.com/en/articles/11487775-connectors-in-chatgpt)

---

**配置完成后，您将能够：**
- 在 ChatGPT 中直接搜索和管理 n8n 工作流
- 获取节点文档和配置指导
- 创建和验证新的自动化工作流
- 监控工作流执行状态
- 访问 n8n 的完整 API 功能