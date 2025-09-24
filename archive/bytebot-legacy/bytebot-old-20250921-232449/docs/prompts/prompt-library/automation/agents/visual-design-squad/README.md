# Visual Design Squad Agent 目录

## 目录结构说明

本目录为视觉设计智能体团队项目的专用Agent文件夹，包含所有Agent运行所需的配置文件、脚本和资源。

### 目录结构

```
visual-design-squad/
├── README.md                    # 项目说明文档
├── config/                      # 配置文件目录
│   ├── agents/                  # Agent配置文件
│   │   ├── trae_agent_configs.json
│   │   └── trae_prompts_config.json
│   ├── mcp/                     # MCP工具配置
│   │   └── mcp_tools_config.json
│   └── workflows/               # 工作流配置
│       └── sprint_workflows.yaml
├── scripts/                     # 脚本文件目录
│   ├── setup/                   # 安装配置脚本
│   ├── deploy/                  # 部署脚本
│   └── utils/                   # 工具脚本
├── templates/                   # 模板文件目录
│   ├── prompts/                 # 提示词模板
│   ├── deliverables/            # 交付物模板
│   └── workflows/               # 工作流模板
├── docs/                        # 文档目录
│   ├── guides/                  # 使用指南
│   ├── api/                     # API文档
│   └── examples/                # 示例文档
├── assets/                      # 资源文件目录
│   ├── icons/                   # 图标资源
│   ├── images/                  # 图片资源
│   └── fonts/                   # 字体资源
├── tests/                       # 测试文件目录
│   ├── unit/                    # 单元测试
│   ├── integration/             # 集成测试
│   └── fixtures/                # 测试数据
├── logs/                        # 日志文件目录
│   ├── agents/                  # Agent日志
│   ├── workflows/               # 工作流日志
│   └── system/                  # 系统日志
└── backups/                     # 备份文件目录
    ├── configs/                 # 配置备份
    └── data/                    # 数据备份
```

### 文件说明

#### 配置文件 (config/)
- **agents/**: Agent相关配置文件
- **mcp/**: MCP工具链配置
- **workflows/**: 工作流程配置

#### 脚本文件 (scripts/)
- **setup/**: 环境安装和初始化脚本
- **deploy/**: 部署和发布脚本
- **utils/**: 日常维护工具脚本

#### 模板文件 (templates/)
- **prompts/**: 系统提示词模板
- **deliverables/**: 设计交付物模板
- **workflows/**: 工作流程模板

#### 文档目录 (docs/)
- **guides/**: 详细使用指南
- **api/**: API接口文档
- **examples/**: 使用示例

#### 资源文件 (assets/)
- **icons/**: 项目图标资源
- **images/**: 项目图片资源
- **fonts/**: 项目字体资源

#### 测试文件 (tests/)
- **unit/**: 单元测试用例
- **integration/**: 集成测试用例
- **fixtures/**: 测试数据和夹具

#### 日志文件 (logs/)
- **agents/**: Agent运行日志
- **workflows/**: 工作流执行日志
- **system/**: 系统运行日志

#### 备份文件 (backups/)
- **configs/**: 配置文件备份
- **data/**: 重要数据备份

### 使用说明

1. **初始化项目**: 运行 `scripts/setup/init.sh` 进行项目初始化
2. **配置Agent**: 修改 `config/agents/` 下的配置文件
3. **启动服务**: 使用 `scripts/deploy/start.sh` 启动Agent服务
4. **查看日志**: 检查 `logs/` 目录下的相关日志文件
5. **备份恢复**: 使用 `backups/` 目录进行配置和数据备份

### 版本信息

- **项目版本**: v1.0.0
- **创建时间**: 2024-01-15
- **最后更新**: 2024-01-15
- **维护团队**: bytebot.ai Visual Design Squad

### 注意事项

1. 请勿直接修改 `config/` 目录下的配置文件，建议先备份
2. 日志文件会自动轮转，旧日志会移动到 `backups/` 目录
3. 测试环境和生产环境使用不同的配置文件
4. 敏感信息请使用环境变量，不要直接写入配置文件