# Visual Design Squad Agent 故障排除指南

## 常见问题与解决方案

### 1. .env.template 文件无法在 IDE 中打开

#### 问题描述
在 Trae IDE 中尝试打开 `.env.template` 文件时，显示"暂无文件内容，或无法正常打开此文件"的错误信息。

#### 可能原因
1. **文件关联问题**：IDE 可能没有正确识别 `.env.template` 文件类型
2. **编码问题**：虽然文件是 UTF-8 编码，但可能存在特殊字符
3. **文件权限问题**：文件权限设置可能导致 IDE 无法正常读取
4. **IDE 缓存问题**：IDE 缓存可能导致文件显示异常

#### 解决方案

##### 方案 1：重命名文件扩展名
```bash
# 将 .env.template 重命名为 .env.template.txt
mv .env.template .env.template.txt
```

##### 方案 2：使用命令行查看和编辑
```bash
# 查看文件内容
cat .env.template

# 使用 vim 编辑
vim .env.template

# 使用 nano 编辑
nano .env.template
```

##### 方案 3：复制为 .env 文件
```bash
# 复制模板文件为实际配置文件
cp .env.template .env
```

##### 方案 4：清理 IDE 缓存
1. 关闭 Trae IDE
2. 清理缓存目录（具体路径根据 IDE 配置）
3. 重新启动 IDE

##### 方案 5：检查文件权限
```bash
# 检查文件权限
ls -la .env.template

# 修改文件权限（如果需要）
chmod 644 .env.template
```

#### 验证解决方案
执行以下命令验证文件是否正常：
```bash
# 检查文件类型和编码
file .env.template

# 检查文件内容前几行
head -10 .env.template

# 检查文件大小
wc -l .env.template
```

### 2. 环境变量配置问题

#### 问题描述
配置环境变量后，Agent 无法正常启动或功能异常。

#### 解决步骤
1. **检查环境变量格式**
   ```bash
   # 检查是否有语法错误
   source .env && echo "配置文件语法正确"
   ```

2. **验证必需变量**
   ```bash
   # 检查关键环境变量是否设置
   echo $TRAE_API_URL
   echo $AGENT_MODE
   echo $MCP_SERVER_URL
   ```

3. **重新加载配置**
   ```bash
   # 重新加载环境变量
   source .env
   
   # 或重启 Agent 服务
   ./scripts/deploy/restart.sh
   ```

### 3. MCP 工具连接问题

#### 问题描述
MCP 工具无法连接或执行失败。

#### 诊断步骤
1. **检查 MCP 服务状态**
   ```bash
   # 检查 MCP 服务是否运行
   curl -f $MCP_SERVER_URL/health || echo "MCP 服务不可用"
   ```

2. **验证认证配置**
   ```bash
   # 检查认证令牌是否正确
   echo $MCP_AUTH_TOKEN
   ```

3. **测试网络连接**
   ```bash
   # 测试网络连接
   ping -c 3 $(echo $MCP_SERVER_URL | cut -d'/' -f3)
   ```

### 4. Agent 启动失败

#### 问题描述
执行启动脚本时 Agent 无法正常启动。

#### 排查步骤
1. **检查依赖**
   ```bash
   # 运行依赖检查
   ./scripts/setup/init.sh --check-only
   ```

2. **查看日志**
   ```bash
   # 查看启动日志
   tail -f logs/system/startup.log
   
   # 查看错误日志
   tail -f logs/system/error.log
   ```

3. **验证配置**
   ```bash
   # 验证配置文件
   ./scripts/utils/validate-config.sh
   ```

### 5. 性能问题

#### 问题描述
Agent 运行缓慢或资源占用过高。

#### 优化建议
1. **调整并发设置**
   ```bash
   # 在 .env 文件中调整
   AGENT_MAX_CONCURRENT=3  # 降低并发数
   ```

2. **增加超时时间**
   ```bash
   # 增加超时设置
   AGENT_TIMEOUT=600  # 增加到 10 分钟
   ```

3. **监控资源使用**
   ```bash
   # 监控系统资源
   top -p $(pgrep -f "visual-design-squad")
   ```

## 联系支持

如果以上解决方案无法解决问题，请：

1. 收集错误日志：`./scripts/utils/collect-logs.sh`
2. 生成诊断报告：`./scripts/utils/diagnostic.sh`
3. 提交问题报告，包含：
   - 错误描述
   - 复现步骤
   - 系统环境信息
   - 相关日志文件

## 更新记录

- 2024-09-15：初始版本，添加基础故障排除指南
- 待更新：根据实际使用反馈持续完善