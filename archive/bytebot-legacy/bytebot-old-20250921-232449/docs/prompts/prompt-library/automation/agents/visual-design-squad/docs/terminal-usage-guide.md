# 终端使用指南

## 概述

本指南帮助您在 Visual Design Squad Agent 项目中有效使用终端进行文件操作和配置管理。

## 当前终端状态

### 终端信息
- **终端ID**: 3
- **Shell类型**: zsh
- **当前目录**: `/Users/zhiledeng/Downloads/新闻模块api接口/bytebot/提示词库/automation/agents/visual-design-squad`
- **状态**: 正在运行 nano 编辑器

### 可用文件
```bash
# 环境配置文件
.env                    # 实际环境配置文件
.env.example           # 环境配置示例文件
.env.template          # 环境配置模板文件
.env.template.txt      # 环境配置模板文本版本
```

## 文件操作命令

### 查看文件内容
```bash
# 查看完整文件内容
cat .env.example

# 查看文件前20行
head -20 .env.example

# 查看文件后20行
tail -20 .env.example

# 分页查看文件内容
less .env.example
```

### 编辑文件
```bash
# 使用 nano 编辑器（推荐新手使用）
nano .env.example

# 使用 vim 编辑器（适合有经验的用户）
vim .env.example

# 使用 VS Code 编辑器
code .env.example
```

### 文件管理
```bash
# 复制文件
cp .env.template .env

# 移动/重命名文件
mv .env.template .env.backup

# 删除文件
rm .env.backup

# 查看文件详细信息
ls -la .env*
```

## Nano 编辑器使用指南

### 基本操作
- **打开文件**: `nano filename`
- **保存文件**: `Ctrl + O`，然后按 `Enter` 确认
- **退出编辑器**: `Ctrl + X`
- **搜索文本**: `Ctrl + W`
- **复制行**: `Alt + 6`
- **粘贴行**: `Ctrl + U`
- **剪切行**: `Ctrl + K`

### 导航操作
- **移动光标**: 使用方向键
- **跳到行首**: `Ctrl + A`
- **跳到行尾**: `Ctrl + E`
- **跳到文件开头**: `Ctrl + Y`
- **跳到文件结尾**: `Ctrl + V`

### 编辑操作
- **删除字符**: `Backspace` 或 `Delete`
- **删除整行**: `Ctrl + K`
- **撤销操作**: `Alt + U`
- **重做操作**: `Alt + E`

## 环境配置文件说明

### .env.template
- **用途**: 环境配置模板文件
- **内容**: 包含所有可配置项的示例
- **使用**: 复制为 `.env` 文件并修改实际值

### .env.example
- **用途**: 环境配置示例文件
- **内容**: 与 `.env.template` 相同
- **使用**: 参考配置格式和选项

### .env
- **用途**: 实际环境配置文件
- **内容**: 包含真实的配置值
- **注意**: 不应提交到版本控制系统

## 常见问题解决

### 文件无法打开
```bash
# 检查文件是否存在
ls -la .env.example

# 检查文件权限
stat .env.example

# 检查文件编码
file .env.example
```

### 编辑器问题
```bash
# 如果 nano 无响应，强制退出
Ctrl + C

# 检查可用编辑器
which nano vim code

# 使用备用编辑器
vim .env.example
```

### 权限问题
```bash
# 修改文件权限
chmod 644 .env.example

# 修改文件所有者
sudo chown $USER .env.example
```

## 最佳实践

### 配置文件管理
1. **备份重要配置**: 在修改前创建备份
2. **使用模板**: 基于 `.env.template` 创建配置
3. **验证配置**: 修改后验证配置文件格式
4. **安全管理**: 不要在配置文件中硬编码敏感信息

### 终端操作
1. **确认操作**: 删除文件前确认路径和文件名
2. **使用Tab补全**: 利用Tab键自动补全文件名
3. **查看历史**: 使用 `history` 命令查看操作历史
4. **定期清理**: 定期清理不需要的临时文件

## 快捷操作

### 快速配置环境
```bash
# 复制模板文件
cp .env.template .env

# 编辑配置文件
nano .env

# 验证配置文件
cat .env | grep -v "^#" | grep -v "^$"
```

### 快速查看配置
```bash
# 查看所有环境变量
env | grep -E "(TRAE|AGENT|MCP)"

# 查看配置文件差异
diff .env.template .env
```

## 获取帮助

### 命令帮助
```bash
# 查看命令帮助
man nano
man vim
man ls

# 查看命令简短帮助
nano --help
vim --help
```

### 项目帮助
- 查看项目文档: `docs/` 目录
- 故障排除指南: `troubleshooting.md`
- 快速开始指南: `quick-start.md`

---

**注意**: 本指南基于当前终端状态编写，如有疑问请参考项目文档或联系技术支持。