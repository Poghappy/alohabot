# ByteBot Ecosystem

[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/deploy/bytebot?referralCode=L9lKXQ)
[![Docker](https://img.shields.io/badge/docker-ready-blue.svg)](https://github.com/bytebot-ai/bytebot-ecosystem/tree/main/docker)
[![License](https://img.shields.io/badge/license-Apache%202.0-green.svg)](LICENSE)

**An AI that has its own computer to complete tasks for you**

## 🚀 Quick Start

```bash
# 1. 克隆项目
git clone https://github.com/bytebot-ai/bytebot-ecosystem.git
cd bytebot-ecosystem

# 2. 安装依赖
npm install

# 3. 配置环境变量
cp .env.example .env
# 编辑 .env 添加 API 密钥

# 4. 启动服务
npm run dev

# 5. 访问 Web UI
open http://localhost:9992
```

## 📁 项目结构

- `core/` - 核心功能模块
- `packages/` - 核心服务包
- `config/` - 统一配置管理
- `docs/` - 项目文档
- `docker/` - 容器化配置
- `.cursor/rules/` - Cursor规则文件

## 🔧 开发指南

详见 [开发文档](docs/README.md)

## 📚 文档

- [项目结构说明](docs/project/architecture.md)
- [API参考文档](docs/api-reference/)
- [部署指南](docs/deployment/)

## 🎯 核心服务

| 服务 | 端口 | 用途 | 状态 |
|------|------|------|------|
| **bytebot-ui** | 9992 | Web用户界面 | ✅ 运行中 |
| **bytebot-agent** | 9991 | AI智能体服务 | ✅ 运行中 |
| **bytebot-desktop** | 9990 | 虚拟桌面服务 | ✅ 运行中 |
| **bytebot-llm-proxy** | 9993 | LiteLLM代理 | ✅ 运行中 |

## 🛠️ 开发命令

```bash
# 开发环境
npm run dev

# 构建项目
npm run build

# 启动服务
npm run start

# 停止服务
npm run stop

# 运行测试
npm run test

# 代码检查
npm run lint

# 代码格式化
npm run format
```

## 📦 部署

### Docker部署
```bash
docker-compose up -d
```

### Kubernetes部署
```bash
helm install bytebot ./helm
```

## 🤝 贡献

欢迎贡献代码！请查看 [贡献指南](CONTRIBUTING.md) 了解详情。

## 📄 许可证

本项目采用 [Apache 2.0](LICENSE) 许可证。

## 🔗 相关链接

- [官方网站](https://bytebot.ai)
- [文档](https://docs.bytebot.ai)
- [Discord社区](https://discord.com/invite/d9ewZkWPTP)
- [GitHub仓库](https://github.com/bytebot-ai/bytebot-ecosystem)
