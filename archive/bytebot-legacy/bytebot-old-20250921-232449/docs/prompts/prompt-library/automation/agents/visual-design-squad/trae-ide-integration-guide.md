# Trae IDE 智能体集成指南

## 概述

本指南详细说明如何将 `/Users/zhiledeng/Downloads/新闻模块api接口/bytebot/提示词库/automation/agents` 目录下的智能体项目配置为 Trae IDE 自定义智能体。

## 目录结构说明

当前项目位于：
```
/Users/zhiledeng/Downloads/新闻模块api接口/bytebot/提示词库/automation/agents/visual-design-squad/
```

### 核心配置文件

1. **智能体配置**: `config/agents/trae_agent_configs.json`
   - 包含 12 个专业 Agent 角色配置
   - 每个 Agent 都有详细的系统提示词、能力和工具配置

2. **MCP 工具配置**: `config/mcp/mcp_tools_config.json`
   - 配置了图像处理、矢量处理等 MCP 服务器
   - 支持设计工作流所需的各种工具

3. **环境配置**: `.env.example` / `.env.template`
   - 包含 Trae IDE API 配置
   - MCP 服务器连接配置

## 在 Trae IDE 中创建自定义智能体

### 方法一：基于现有配置创建单个智能体

#### 步骤 1：选择 Agent 角色
从 `trae_agent_configs.json` 中选择一个 Agent，例如：
- **A0_product_owner**: 产品负责人/PO-Brand
- **A1_brand_strategist**: 品牌策略师
- **A2_design_director**: 设计总监
- **A3_logo_agent**: Logo设计专家
- 等等...

#### 步骤 2：在 Trae IDE 中创建智能体

1. **打开智能体配置面板**
   - 在 AI 对话窗口中，点击设置图标 > 智能体
   - 或在 AI 对话输入框中点击 @智能体 > + 创建智能体

2. **配置智能体基本信息**
   ```
   名称: ByteBot 产品负责人
   头像: 上传 assets/icons/ 目录下的相关图标
   ```

3. **配置提示词**
   复制 `trae_agent_configs.json` 中对应 Agent 的 `system_prompt` 内容：
   ```
   你是ByteBot.ai的产品负责人和品牌对齐专家。你的核心职责是确保所有视觉设计工作都与产品战略和品牌价值保持一致。

   ## 核心职责
   1. **产品目标对齐**: 确保设计决策支持产品战略目标
   2. **需求优先级管理**: 基于用户价值和业务影响排序设计需求
   3. **验收标准制定**: 为每个设计任务制定清晰的验收条件
   ...
   ```

4. **配置工具**
   - **内置工具**: 启用文件系统、终端、联网搜索、预览
   - **MCP Server**: 根据 `mcp_tools_config.json` 配置相关 MCP 服务器

#### 步骤 3：配置 MCP 服务器

根据选择的 Agent 角色，配置相应的 MCP 服务器：

1. **图像处理 MCP** (适用于设计类 Agent)
   ```bash
   npm install -g @modelcontextprotocol/server-imagemagick
   ```

2. **矢量处理 MCP** (适用于 Logo/图标设计 Agent)
   ```bash
   npm install -g @modelcontextprotocol/server-svg
   ```

3. **文件管理 MCP** (适用于资产管理 Agent)
   ```bash
   npm install -g @modelcontextprotocol/server-filesystem
   ```

### 方法二：批量导入智能体团队

#### 步骤 1：准备配置文件

1. **创建智能体配置脚本**
   ```bash
   cd /Users/zhiledeng/Downloads/新闻模块api接口/bytebot/提示词库/automation/agents/visual-design-squad
   chmod +x scripts/setup/init.sh
   ./scripts/setup/init.sh
   ```

2. **验证环境配置**
   ```bash
   # 复制环境配置
   cp .env.template .env
   
   # 编辑配置文件，填入你的 Trae IDE API 信息
   nano .env
   ```

#### 步骤 2：使用自动化脚本

创建批量导入脚本 `scripts/trae-import.js`:

```javascript
// 读取 trae_agent_configs.json
// 循环创建每个 Agent
// 自动配置提示词和工具
```

### 方法三：使用 Trae IDE 智能体模板

#### 步骤 1：创建智能体模板

基于 `templates/prompts/system_prompts_templates.md` 创建标准化模板：

1. **通用设计智能体模板**
2. **品牌专家模板**
3. **技术实现模板**
4. **项目管理模板**

#### 步骤 2：快速部署

使用模板快速创建多个相关智能体，形成完整的设计团队。

## 配置示例

### 示例 1：创建 Logo 设计专家智能体

```json
{
  "name": "ByteBot Logo设计专家",
  "description": "专业的Logo和品牌标识设计智能体",
  "system_prompt": "你是ByteBot.ai的Logo设计专家，专注于创造具有强烈品牌识别度的Logo和视觉标识...",
  "tools": {
    "mcp_servers": [
      "imagemagick-mcp",
      "svg-processor-mcp",
      "color-palette-mcp"
    ],
    "builtin_tools": [
      "file_system",
      "terminal",
      "web_search",
      "preview"
    ]
  }
}
```

### 示例 2：创建品牌策略师智能体

```json
{
  "name": "ByteBot 品牌策略师",
  "description": "负责品牌定位、策略制定和一致性管理",
  "system_prompt": "你是ByteBot.ai的品牌策略师，负责制定和维护品牌战略...",
  "tools": {
    "mcp_servers": [
      "research-mcp",
      "analytics-mcp",
      "document-processor-mcp"
    ],
    "builtin_tools": [
      "web_search",
      "file_system"
    ]
  }
}
```

## 环境配置

### 配置 .env 文件

```bash
# Trae IDE 配置
TRAE_API_URL=https://api.trae.ai
TRAE_API_KEY=your_api_key_here
TRAE_WORKSPACE_PATH=/Users/zhiledeng/Downloads/新闻模块api接口/bytebot

# Agent 配置
AGENT_TEAM_SIZE=12
AGENT_COLLABORATION_MODE=multi_agent_coordination
AGENT_METHODOLOGY=agile_scrum

# MCP 配置
MCP_IMAGEMAGICK_ENABLED=true
MCP_SVG_PROCESSOR_ENABLED=true
MCP_FILE_MANAGER_ENABLED=true

# 工作流配置
WORKFLOW_AUTO_SYNC=true
WORKFLOW_NOTIFICATION_ENABLED=true
WORKFLOW_BACKUP_ENABLED=true
```

### 验证配置

```bash
# 检查 MCP 服务器状态
mcp list-servers

# 验证智能体配置
cat config/agents/trae_agent_configs.json | jq '.agents[0].name'

# 测试环境变量
env | grep -E "(TRAE|AGENT|MCP)"
```

## 使用指南

### 1. 启动智能体团队

```bash
# 启动所有服务
./scripts/deploy/start.sh

# 检查状态
./scripts/deploy/status.sh
```

### 2. 在 Trae IDE 中使用

1. **选择智能体**: 在对话框中输入 `@ByteBot产品负责人`
2. **协作模式**: 可以同时 @ 多个智能体进行团队协作
3. **工作流触发**: 使用特定关键词触发预设工作流

### 3. 团队协作示例

```
@ByteBot产品负责人 @ByteBot设计总监 @ByteBot Logo设计专家

请为我们的新产品功能设计一套完整的视觉方案，包括：
1. 品牌定位分析
2. Logo 设计方案
3. 视觉规范制定
4. 实施计划
```

## 故障排除

### 常见问题

1. **MCP 服务器连接失败**
   ```bash
   # 检查 MCP 服务器状态
   mcp health-check
   
   # 重启 MCP 服务器
   mcp restart imagemagick-mcp
   ```

2. **智能体配置加载失败**
   ```bash
   # 验证 JSON 格式
   cat config/agents/trae_agent_configs.json | jq '.'
   
   # 检查文件权限
   ls -la config/agents/
   ```

3. **环境变量未生效**
   ```bash
   # 重新加载环境变量
   source .env
   
   # 验证变量设置
   echo $TRAE_API_KEY
   ```

### 日志查看

```bash
# 查看智能体日志
tail -f logs/agents/agent_*.log

# 查看 MCP 工具日志
tail -f logs/mcp/mcp_*.log

# 查看系统日志
tail -f logs/system/system.log
```

## 最佳实践

### 1. 智能体命名规范
- 使用清晰的角色描述：`ByteBot [角色名称]`
- 避免过长的名称，保持简洁明了
- 使用中文名称便于团队理解

### 2. 提示词优化
- 基于实际使用情况调整提示词
- 定期收集用户反馈优化响应质量
- 保持提示词的一致性和专业性

### 3. 工具配置
- 根据实际需求选择 MCP 服务器
- 避免配置过多不必要的工具
- 定期更新 MCP 服务器版本

### 4. 团队协作
- 建立清晰的智能体分工
- 设置合理的协作流程
- 定期评估团队效果并优化

## 扩展功能

### 1. 自定义 MCP 服务器
可以基于项目需求开发专用的 MCP 服务器：
- 品牌资产管理 MCP
- 设计规范检查 MCP
- 自动化交付 MCP

### 2. 工作流自动化
配置自动化工作流：
- 设计评审流程
- 资产发布流程
- 质量检查流程

### 3. 集成外部工具
- Figma 集成
- Adobe Creative Suite 集成
- 项目管理工具集成

## 总结

通过以上配置，你可以将 `visual-design-squad` 项目成功集成到 Trae IDE 中，创建一个功能完整的智能体设计团队。这个团队可以协同工作，提供从品牌策略到具体设计实现的全流程服务。

关键成功因素：
1. **正确配置环境变量和 MCP 服务器**
2. **选择合适的智能体角色组合**
3. **优化提示词以适应具体业务需求**
4. **建立有效的团队协作机制**

如需进一步定制或遇到问题，请参考项目文档或联系技术支持。