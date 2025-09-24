# ByteBot 项目结构

## 整理后的项目结构

```
bytebot/
├── README.md                           # 项目主说明文档
├── LICENSE                             # 开源许可证
├── PROJECT_STRUCTURE.md               # 项目结构说明（本文件）
│
├── config/                            # 配置文件目录
│   ├── agents/                        # 智能体配置
│   │   └── trae_agent_configs.json   # Trae IDE 智能体配置
│   ├── gpt_actions/                   # GPT Actions 配置
│   │   └── n8n_openapi.yaml         # N8N OpenAPI 配置
│   ├── n8n_mcp_configuration.md      # N8N MCP 配置说明
│   └── n8n_mcp_example_config.json   # N8N MCP 示例配置
│
├── docs/                              # 文档目录
│   ├── project/                       # 项目相关文档
│   │   ├── AGENT_SYSTEM_INDEX.md     # 智能体系统索引
│   │   ├── API_SERVICES_INDEX.md     # API 服务索引
│   │   ├── CONFIG_DEPLOYMENT_INDEX.md # 配置部署索引
│   │   ├── PROJECT_INDEX.md          # 项目索引
│   │   ├── UI_COMPONENTS_INDEX.md    # UI 组件索引
│   │   ├── AI教学提示词模板.md        # AI 教学提示词模板
│   │   ├── brand_asset_audit_report.md # 品牌资产审计报告
│   │   └── 项目规则.md                # 项目规则
│   │
│   ├── prompts/                       # 提示词库
│   │   ├── automation/               # 自动化工具
│   │   │   ├── prompt_manager.py     # 提示词管理器
│   │   │   ├── cli.py                # 命令行工具
│   │   │   ├── config.yaml           # 配置文件
│   │   │   ├── requirements.txt      # Python 依赖
│   │   │   └── README.md             # 使用说明
│   │   ├── 业务分类/                  # 业务维度分类
│   │   ├── 功能分类/                  # 功能维度分类
│   │   ├── 技术分类/                  # 技术维度分类
│   │   └── 索引文件/                  # 索引和统计
│   │
│   ├── ChatGPT客户端教学/              # ChatGPT 客户端教学文档
│   ├── trae-ide-agents/              # Trae IDE 智能体文档
│   └── visual-design-squad/          # 视觉设计团队文档
│
├── packages/                          # 核心包目录
│   ├── bytebot-agent/                # 智能体包
│   ├── bytebot-agent-cc/             # 智能体 CC 包
│   ├── bytebot-llm-proxy/            # LLM 代理包
│   ├── bytebot-ui/                   # UI 包
│   ├── bytebotd/                     # 守护进程包
│   └── shared/                       # 共享包
│
├── scripts/                           # 脚本目录
│   ├── setup/                        # 安装脚本
│   │   └── setup_n8n_mcp.sh         # N8N MCP 安装脚本
│   └── chatgpt_plus_help.json       # ChatGPT Plus 帮助脚本
│
├── docker/                           # Docker 配置
│   ├── *.Dockerfile                  # Docker 文件
│   ├── docker-compose*.yml           # Docker Compose 配置
│   └── trae-ide-agents/             # Trae IDE 智能体 Docker 配置
│
├── helm/                             # Kubernetes Helm 配置
│   ├── Chart.yaml                    # Helm Chart 定义
│   ├── values*.yaml                  # 不同环境的配置值
│   └── templates/                    # Helm 模板
│
├── static/                           # 静态资源
│   ├── bytebot_icon.svg             # ByteBot 图标
│   ├── bytebot-logo.png             # ByteBot Logo
│   └── vincent_icon.svg             # Vincent 图标
│
└── external/                         # 外部依赖
    └── bytebot-upstream/            # 上游代码
```

## 整理说明

### 已完成的整理工作：

1. **删除重复文件**：
   - 删除了重复的配置文件（trae_agent_configs.json, mcp_tools_config.json 等）
   - 删除了重复的 README.md 文件
   - 删除了过时的临时文件
   - 删除了重复的 logo 文件（保留最新版本）

2. **重新组织目录结构**：
   - 创建了统一的 `config/` 目录存放所有配置文件
   - 创建了 `docs/` 目录统一管理文档
   - 将项目相关文档移动到 `docs/project/`
   - 将提示词库移动到 `docs/prompts/`
   - 将脚本文件整理到 `scripts/` 目录

3. **清理过时文件**：
   - 删除了 Python 虚拟环境（可重新创建）
   - 删除了 Python 缓存文件
   - 删除了临时和测试文件

### 目录说明：

- **config/**: 所有配置文件集中管理
- **docs/**: 项目文档统一存放
- **packages/**: 核心代码包
- **scripts/**: 各种脚本和工具
- **docker/**: Docker 相关配置
- **helm/**: Kubernetes 部署配置
- **static/**: 静态资源文件
- **external/**: 外部依赖和上游代码

## 开发环境要求

- **Node.js**: v20.19.4 (LTS) - 已升级到 Node.js 20 以获得最佳性能
- **npm**: v10.8.2  
- **Docker**: 最新版本
- **Docker Compose**: 最新版本

### 建议的后续维护：

1. 定期清理临时文件和缓存
2. 保持配置文件的一致性
3. 及时更新文档和索引
4. 定期检查重复文件
5. 使用 nvm 管理 Node.js 版本，确保团队使用统一版本
