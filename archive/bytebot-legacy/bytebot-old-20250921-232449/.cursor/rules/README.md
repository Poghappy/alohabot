# ByteBot Cursor 规则集

本目录包含 ByteBot 项目的完整 Cursor 规则集，为开发团队提供一致的编码标准和最佳实践指导。

## 📋 规则文件列表

| 规则文件                     | 适用范围                     | 描述                       |
| ---------------------------- | ---------------------------- | -------------------------- |
| `overview.mdc`               | 全局                         | 项目开发规范总览和快速参考 |
| `project-structure.mdc`      | 全局                         | 项目结构和导航指南         |
| `typescript-standards.mdc`   | `*.ts,*.tsx`                 | TypeScript 编码标准        |
| `react-nextjs-standards.mdc` | `*.tsx,*.jsx`                | React/Next.js 开发标准     |
| `config-standards.mdc`       | `*.yaml,*.yml,*.json,*.env*` | 配置文件标准               |
| `api-design-standards.mdc`   | 手动应用                     | API 设计标准和最佳实践     |
| `security-standards.mdc`     | 手动应用                     | 安全开发标准               |
| `development-workflow.mdc`   | 手动应用                     | 开发工作流程指南           |

## 🚀 如何使用

### 自动应用的规则
- `overview.mdc` - 始终应用，提供项目总览
- `project-structure.mdc` - 始终应用，提供结构导航
- `typescript-standards.mdc` - 自动应用于 TypeScript 文件
- `react-nextjs-standards.mdc` - 自动应用于 React 组件文件
- `config-standards.mdc` - 自动应用于配置文件

### 手动应用的规则
在 Cursor 中，您可以通过以下方式手动应用规则：

1. **API 设计时**: 引用 `api-design-standards.mdc`
2. **安全审查时**: 引用 `security-standards.mdc`
3. **设置开发环境时**: 引用 `development-workflow.mdc`

### 在提示中引用规则
```
请根据 security-standards.mdc 中的安全规范来审查这段代码
```

## 📖 规则内容概览

### 🏗️ 项目架构规则
- **项目结构导航**: 核心模块位置和文件组织
- **开发工作流**: 环境设置、测试策略、部署流程
- **模块集成模式**: 新功能开发的标准流程

### 💻 代码质量规则
- **TypeScript 标准**: 类型定义、错误处理、异步编程
- **React/Next.js 规范**: 组件设计、状态管理、性能优化
- **API 设计原则**: RESTful 设计、响应格式、错误处理

### ⚙️ 配置管理规则
- **YAML/JSON 规范**: 文件结构、命名约定、验证规则
- **环境变量管理**: 敏感信息处理、配置验证
- **Docker 配置**: 容器化最佳实践

### 🔒 安全开发规则
- **输入验证**: 参数验证、数据清理、注入防护
- **身份验证**: JWT 管理、权限控制、会话安全
- **数据保护**: 加密存储、敏感信息脱敏

## 🔧 规则维护

### 更新规则
1. 修改对应的 `.mdc` 文件
2. 更新相关文档链接
3. 通知团队成员规则变更

### 添加新规则
1. 创建新的 `.mdc` 文件
2. 在 `overview.mdc` 中添加引用
3. 更新本 README 文件

### 规则验证
- 确保所有文件引用路径正确
- 验证 YAML frontmatter 格式
- 测试规则在 Cursor 中的应用效果

## 📚 相关文档

- **项目结构说明**: [../STRUCTURE_OVERVIEW.md](../STRUCTURE_OVERVIEW.md)
- **详细架构文档**: [../docs/project/NEW_PROJECT_STRUCTURE.md](../docs/project/NEW_PROJECT_STRUCTURE.md)
- **开发环境配置**: [../README.md](../README.md)

## 🤝 贡献指南

### 规则改进建议
1. 在团队会议中讨论
2. 创建 Issue 描述改进点
3. 提交 Pull Request
4. 经过代码审查后合并

### 最佳实践分享
- 在团队内分享实际使用经验
- 记录常见问题和解决方案
- 持续优化规则的实用性

---

> 💡 **提示**: 这些规则旨在提高开发效率和代码质量。如果某个规则在实际使用中造成困扰，请及时反馈给团队讨论调整。
