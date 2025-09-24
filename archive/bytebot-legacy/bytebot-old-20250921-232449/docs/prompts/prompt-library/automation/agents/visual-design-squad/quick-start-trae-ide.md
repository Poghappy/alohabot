# Trae IDE 智能体快速开始指南

## 🚀 5分钟快速上手

### 第一步：选择智能体角色

从以下 12 个专业智能体中选择你需要的角色：

| 智能体ID | 角色名称 | 主要功能 | 适用场景 |
|---------|---------|---------|---------|
| `A0_product_owner` | 产品负责人/PO-Brand | 产品目标对齐、需求优先级管理 | 项目启动、需求分析 |
| `A1_brand_strategist` | 品牌策略师 | 品牌定位、策略制定 | 品牌规划、市场分析 |
| `A2_design_director` | 设计总监 | 设计方向把控、团队协调 | 设计管理、质量把控 |
| `A3_logo_agent` | Logo设计专家 | Logo设计、品牌标识 | Logo创作、标识设计 |
| `A4_iconography_agent` | 图标设计师 | 图标系统、视觉符号 | 图标设计、符号系统 |
| `A5_illustration_agent` | 插画师 | 插画创作、视觉叙事 | 插画设计、视觉内容 |
| `A6_typography_agent` | 字体设计师 | 字体选择、排版设计 | 字体设计、排版优化 |
| `A7_color_agent` | 色彩专家 | 色彩搭配、色彩系统 | 色彩方案、配色设计 |
| `A8_layout_agent` | 布局设计师 | 页面布局、空间设计 | 布局设计、空间规划 |
| `A9_asset_ops_agent` | 资产运营 | 资产管理、版本控制 | 资产管理、文件组织 |
| `A10_quality_agent` | 质量检查 | 设计审查、标准检查 | 质量控制、合规检查 |
| `A11_delivery_agent` | 交付专家 | 文件输出、交付管理 | 项目交付、文件导出 |

### 第二步：在 Trae IDE 中创建智能体

#### 方法一：手动创建（推荐新手）

1. **打开智能体配置**
   - 在 AI 对话窗口中，点击设置图标 > 智能体
   - 或点击 @智能体 > + 创建智能体

2. **配置基本信息**
   ```
   名称: ByteBot Logo设计专家
   描述: 专业的Logo和品牌标识设计智能体
   ```

3. **复制提示词**
   从 `config/agents/trae_agent_configs.json` 中复制对应智能体的 `system_prompt`

4. **配置工具**
   - ✅ 文件系统
   - ✅ 终端
   - ✅ 联网搜索
   - ✅ 预览

#### 方法二：批量导入（推荐高级用户）

```bash
# 1. 进入项目目录
cd /Users/zhiledeng/Downloads/新闻模块api接口/bytebot/提示词库/automation/agents/visual-design-squad

# 2. 运行导入脚本（Dry Run 模式，先生成配置）
node scripts/trae-import.js

# 3. 检查生成的配置文件
ls output/trae-agents/

# 4. 实际导入（可选）
node scripts/trae-import.js --no-dry-run
```

### 第三步：开始使用

#### 单个智能体使用

```
@ByteBot Logo设计专家

请为我们的AI产品设计一个现代简约的Logo，要求：
1. 体现科技感和专业性
2. 适用于多种场景（网站、APP、印刷品）
3. 提供3个不同的设计方案
```

#### 多智能体协作

```
@ByteBot产品负责人 @ByteBot设计总监 @ByteBot Logo设计专家

我们需要为新产品功能设计完整的视觉方案：
1. 产品定位分析
2. 视觉风格定义
3. Logo设计方案
4. 实施计划制定
```

## 🛠️ 常用配置

### 环境变量设置

复制并编辑环境配置文件：

```bash
cp .env.template .env
nano .env
```

关键配置项：

```bash
# Trae IDE 配置
TRAE_API_URL=https://api.trae.ai
TRAE_API_KEY=your_api_key_here
TRAE_WORKSPACE_PATH=/Users/zhiledeng/Downloads/新闻模块api接口/bytebot

# Agent 配置
AGENT_TEAM_SIZE=12
AGENT_COLLABORATION_MODE=multi_agent_coordination
```

### MCP 服务器配置

根据需要安装 MCP 服务器：

```bash
# 图像处理（Logo、图标设计必需）
npm install -g @modelcontextprotocol/server-imagemagick

# 矢量处理（Logo设计推荐）
npm install -g @modelcontextprotocol/server-svg

# 文件管理（资产管理必需）
npm install -g @modelcontextprotocol/server-filesystem
```

## 📋 使用场景示例

### 场景1：Logo设计项目

```
@ByteBot产品负责人 @ByteBot Logo设计专家

项目背景：为AI写作助手产品设计Logo
要求：
- 目标用户：内容创作者、营销人员
- 品牌调性：专业、创新、易用
- 应用场景：网站、移动APP、社交媒体

请制定设计方案并开始创作。
```

### 场景2：品牌视觉系统

```
@ByteBot品牌策略师 @ByteBot色彩专家 @ByteBot字体设计师

需要建立完整的品牌视觉系统：
1. 品牌色彩方案（主色、辅助色、中性色）
2. 字体系统（标题、正文、装饰字体）
3. 视觉元素规范
4. 应用指南

请协作完成这个系统性项目。
```

### 场景3：网站界面设计

```
@ByteBot布局设计师 @ByteBot图标设计师 @ByteBot插画师

设计任务：企业官网首页设计
页面结构：
- 导航栏
- Hero区域（主视觉）
- 产品特性展示
- 客户案例
- 联系方式

请提供完整的设计方案。
```

## 🔧 故障排除

### 常见问题

1. **智能体无响应**
   ```bash
   # 检查配置文件
   cat config/agents/trae_agent_configs.json | jq '.agents[0].name'
   
   # 验证环境变量
   env | grep TRAE
   ```

2. **MCP 工具不可用**
   ```bash
   # 检查 MCP 服务器状态
   npm list -g | grep mcp
   
   # 重新安装 MCP 服务器
   npm install -g @modelcontextprotocol/server-imagemagick
   ```

3. **文件权限问题**
   ```bash
   # 修复权限
   chmod +x scripts/*.sh
   chmod 644 config/**/*.json
   ```

### 获取帮助

- 📖 详细文档：`trae-ide-integration-guide.md`
- 🐛 问题排查：`docs/troubleshooting.md`
- 💬 技术支持：查看项目 README.md

## 🎯 最佳实践

### 1. 智能体命名
- 使用清晰的角色描述：`ByteBot [角色名称]`
- 保持名称简洁，便于 @ 调用

### 2. 协作模式
- 单一任务：使用单个专业智能体
- 复杂项目：组合多个智能体协作
- 项目管理：始终包含产品负责人角色

### 3. 提示词优化
- 明确任务目标和要求
- 提供具体的背景信息
- 设定清晰的交付标准

### 4. 工具配置
- 根据实际需求选择 MCP 服务器
- 定期更新工具版本
- 监控工具使用情况

## 🚀 进阶功能

### 自定义工作流

创建自动化工作流：

```yaml
# config/workflows/design_workflow.yaml
name: "Logo设计工作流"
agents:
  - A0_product_owner
  - A3_logo_agent
  - A10_quality_agent
steps:
  1. 需求分析
  2. 设计创作
  3. 质量检查
  4. 交付确认
```

### 团队模板

保存常用的智能体组合：

```json
{
  "templates": {
    "logo_design_team": ["A0_product_owner", "A3_logo_agent", "A7_color_agent"],
    "brand_strategy_team": ["A1_brand_strategist", "A2_design_director", "A7_color_agent"],
    "web_design_team": ["A8_layout_agent", "A4_iconography_agent", "A6_typography_agent"]
  }
}
```

---

## 🎉 开始你的智能体之旅！

现在你已经掌握了在 Trae IDE 中使用智能体的基本方法。选择一个智能体角色，开始你的第一个设计项目吧！

需要更多帮助？查看完整的集成指南：`trae-ide-integration-guide.md`