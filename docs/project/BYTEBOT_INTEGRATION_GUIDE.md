# 火鸟门户 + Bytebot AI桌面代理集成指南

## 📋 概述

本指南将帮助您将Bytebot AI桌面代理集成到火鸟门户系统中，实现自然语言控制的桌面自动化功能。

## 🎯 功能特性

### 核心功能
- **自然语言任务执行**: 用简单的中文描述任务，AI自动执行
- **完整桌面环境**: 基于Ubuntu Linux的虚拟桌面
- **多应用程序支持**: 浏览器、办公软件、开发工具等
- **实时桌面查看**: 通过noVNC观看AI实时操作
- **文件处理能力**: 支持PDF、Excel、图片等格式
- **API集成**: 完整的REST API接口

### 集成优势
- **统一管理**: 在火鸟门户中统一管理所有AI代理任务
- **数据共享**: 与Firecrawl数据采集、N8N工作流无缝集成
- **缓存共享**: 使用Redis实现高性能数据缓存
- **监控统一**: 统一的日志和监控系统

## 🚀 快速开始

### 1. 系统要求

**硬件要求**:
- CPU: 4核心以上
- 内存: 8GB以上 (推荐16GB)
- 存储: 20GB可用空间
- 网络: 稳定的互联网连接

**软件要求**:
- Docker 20.0+
- Docker Compose 2.0+
- Git 2.0+

### 2. 安装配置

#### 方法一: 自动化安装 (推荐)

```bash
# 1. 克隆项目
git clone https://github.com/your-org/firecrawl-data-collector.git
cd firecrawl-data-collector

# 2. 运行自动化安装脚本
chmod +x scripts/setup-bytebot.sh
./scripts/setup-bytebot.sh
```

#### 方法二: 手动安装

```bash
# 1. 配置环境变量
cp config/bytebot.env.example .env.bytebot
# 编辑.env.bytebot文件，填入API密钥

# 2. 创建必要目录
mkdir -p logs/bytebot data/bytebot_shared backups/bytebot

# 3. 拉取Docker镜像
docker pull ghcr.io/bytebot-ai/bytebot-desktop:edge
docker pull ghcr.io/bytebot-ai/bytebot-agent:edge
docker pull ghcr.io/bytebot-ai/bytebot-ui:edge

# 4. 启动服务
docker-compose -f docker-compose.bytebot.yml up -d
```

### 3. 配置API密钥

编辑`.env.bytebot`文件：

```bash
# Anthropic Claude API密钥 (推荐)
ANTHROPIC_API_KEY=sk-ant-api03-your-key-here

# OpenAI GPT API密钥 (备用)
OPENAI_API_KEY=sk-your-key-here

# Google Gemini API密钥 (可选)
GEMINI_API_KEY=your-key-here
```

## 🎮 使用指南

### 基础任务示例

#### 1. 网页数据采集
```
任务描述: "访问https://news.ycombinator.com，截取首页截图，并提取前10个新闻标题"

执行步骤:
1. 打开Firefox浏览器
2. 导航到指定网站
3. 等待页面完全加载
4. 截取页面截图
5. 提取新闻标题文本
6. 保存结果到文件
```

#### 2. 文档处理
```
任务描述: "打开上传的销售报告.xlsx文件，计算总销售额，并生成图表"

执行步骤:
1. 打开LibreOffice Calc
2. 加载Excel文件
3. 分析数据结构
4. 计算销售总额
5. 创建可视化图表
6. 导出为PDF格式
```

#### 3. 多步骤工作流
```
任务描述: "从公司邮箱下载今天的发票，整理到Excel表格中，并发送给财务部门"

执行步骤:
1. 打开邮件客户端
2. 搜索今天的发票邮件
3. 下载附件到指定目录
4. 打开Excel创建发票汇总表
5. 逐个处理发票信息
6. 发送汇总表给财务部门
```

### API调用示例

#### 创建任务

```python
import requests
import json

# 创建新的AI桌面代理任务
def create_bytebot_task(instruction, files=None):
    url = "http://localhost:9991/api/tasks"
    
    payload = {
        "instruction": instruction,
        "max_duration": 3600,  # 最大执行时间（秒）
        "ai_model": "claude-3-sonnet"  # AI模型选择
    }
    
    # 如果有文件需要上传
    files_data = {}
    if files:
        for i, file_path in enumerate(files):
            with open(file_path, 'rb') as f:
                files_data[f'file_{i}'] = f.read()
    
    response = requests.post(url, json=payload, files=files_data)
    return response.json()

# 使用示例
task_result = create_bytebot_task(
    instruction="分析这个Excel文件中的销售数据，生成月度报告",
    files=["./data/sales_data.xlsx"]
)

print(f"任务ID: {task_result['task_id']}")
```

#### 监控任务状态

```python
def monitor_task(task_id):
    url = f"http://localhost:9991/api/tasks/{task_id}"
    
    while True:
        response = requests.get(url)
        task_info = response.json()
        
        status = task_info['status']
        print(f"任务状态: {status}")
        
        if status in ['completed', 'failed', 'cancelled']:
            break
        
        time.sleep(5)  # 每5秒检查一次
    
    return task_info

# 监控任务执行
final_result = monitor_task(task_result['task_id'])
print(f"任务完成: {final_result}")
```

#### 直接桌面控制

```python
# 截取桌面截图
def take_screenshot():
    response = requests.get("http://localhost:9990/api/screenshot")
    with open("desktop_screenshot.png", "wb") as f:
        f.write(response.content)

# 在指定位置点击
def click_position(x, y):
    payload = {"x": x, "y": y}
    response = requests.post("http://localhost:9990/api/click", json=payload)
    return response.json()

# 输入文本
def type_text(text):
    payload = {"text": text}
    response = requests.post("http://localhost:9990/api/type", json=payload)
    return response.json()

# 使用示例
take_screenshot()
click_position(100, 200)
type_text("Hello, Bytebot!")
```

### 与火鸟门户集成

#### 在前端调用Bytebot

```typescript
// components/BytebotTaskCreator.tsx
import React, { useState } from 'react';

interface BytebotTaskCreatorProps {
  onTaskCreated: (taskId: string) => void;
}

export function BytebotTaskCreator({ onTaskCreated }: BytebotTaskCreatorProps) {
  const [instruction, setInstruction] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const createTask = async () => {
    setIsCreating(true);
    
    try {
      const response = await fetch('/api/bytebot/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instruction,
          ai_model: 'claude-3-sonnet'
        }),
      });
      
      const result = await response.json();
      onTaskCreated(result.task_id);
    } catch (error) {
      console.error('创建任务失败:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="bytebot-task-creator">
      <textarea
        value={instruction}
        onChange={(e) => setInstruction(e.target.value)}
        placeholder="请用自然语言描述您希望AI执行的任务..."
        className="w-full p-4 border rounded-lg"
        rows={4}
      />
      
      <button
        onClick={createTask}
        disabled={isCreating || !instruction.trim()}
        className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
      >
        {isCreating ? '创建中...' : '创建AI任务'}
      </button>
    </div>
  );
}
```

#### 后端API路由

```typescript
// pages/api/bytebot/tasks.ts
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    try {
      const { instruction, ai_model = 'claude-3-sonnet' } = req.body;
      
      // 调用Bytebot代理服务
      const bytebotResponse = await fetch('http://bytebot-agent:9991/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instruction,
          ai_model,
          max_duration: 3600
        }),
      });
      
      const taskResult = await bytebotResponse.json();
      
      // 可以在这里记录任务到数据库
      // await db.tasks.create({ ... });
      
      res.status(200).json(taskResult);
    } catch (error) {
      console.error('创建Bytebot任务失败:', error);
      res.status(500).json({ error: '创建任务失败' });
    }
  } else {
    res.status(405).json({ error: '方法不被允许' });
  }
}
```

## 🔧 高级配置

### 性能优化

#### 内存配置
```yaml
# docker-compose.bytebot.yml
bytebot-desktop:
  shm_size: "4g"  # 增加共享内存
  deploy:
    resources:
      limits:
        memory: 8G
      reservations:
        memory: 4G
```

#### 并发任务配置
```bash
# .env.bytebot
MAX_CONCURRENT_TASKS=3  # 根据硬件调整
TASK_TIMEOUT=7200       # 2小时超时
```

### 安全配置

#### API认证
```bash
# .env.bytebot
JWT_SECRET=your-strong-jwt-secret
ADMIN_API_KEY=your-admin-api-key
```

#### 网络隔离
```yaml
# docker-compose.bytebot.yml
networks:
  bytebot-internal:
    driver: bridge
    internal: true  # 内部网络，不能访问外网
```

### 监控配置

#### 日志配置
```bash
# .env.bytebot
LOG_LEVEL=INFO
LOG_FILE_PATH=./logs/bytebot/app.log
```

#### 健康检查
```yaml
# docker-compose.bytebot.yml
bytebot-agent:
  healthcheck:
    test: ["CMD", "curl", "-f", "http://localhost:9991/health"]
    interval: 30s
    timeout: 10s
    retries: 3
```

## 🐛 故障排除

### 常见问题

#### 1. 服务启动失败
```bash
# 检查日志
docker-compose -f docker-compose.bytebot.yml logs bytebot-agent

# 检查端口占用
netstat -tulpn | grep :9991

# 重启服务
docker-compose -f docker-compose.bytebot.yml restart bytebot-agent
```

#### 2. 任务执行超时
```bash
# 增加超时时间
echo "TASK_TIMEOUT=7200" >> .env.bytebot

# 重启服务
docker-compose -f docker-compose.bytebot.yml restart
```

#### 3. 内存不足
```bash
# 检查内存使用
docker stats

# 增加共享内存
# 修改docker-compose.bytebot.yml中的shm_size配置
```

#### 4. API密钥问题
```bash
# 验证API密钥
curl -H "Authorization: Bearer $ANTHROPIC_API_KEY" \
     https://api.anthropic.com/v1/models

# 检查环境变量
docker exec bytebot-agent env | grep API_KEY
```

### 调试模式

#### 启用调试日志
```bash
# .env.bytebot
LOG_LEVEL=DEBUG
DEBUG=true
```

#### 访问桌面环境
1. 打开浏览器访问 `http://localhost:9990`
2. 使用密码 `bytebot123` 登录
3. 直接观看AI操作过程

## 📊 监控和维护

### 性能监控

#### 系统资源监控
```bash
# 监控Docker容器资源使用
docker stats --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"

# 监控磁盘使用
df -h

# 监控网络连接
netstat -tulpn | grep -E ":(9990|9991|9992)"
```

#### 任务执行监控
```python
# 监控脚本示例
import requests
import time
from datetime import datetime

def monitor_bytebot_health():
    endpoints = [
        "http://localhost:9990/health",  # 桌面服务
        "http://localhost:9991/health",  # 代理服务
        "http://localhost:9992/health",  # UI服务
    ]
    
    for endpoint in endpoints:
        try:
            response = requests.get(endpoint, timeout=5)
            if response.status_code == 200:
                print(f"✅ {endpoint} - 正常")
            else:
                print(f"❌ {endpoint} - 异常 (状态码: {response.status_code})")
        except Exception as e:
            print(f"❌ {endpoint} - 连接失败: {e}")

# 每分钟检查一次
while True:
    print(f"\n=== {datetime.now()} ===")
    monitor_bytebot_health()
    time.sleep(60)
```

### 数据备份

#### 自动备份脚本
```bash
#!/bin/bash
# scripts/backup-bytebot.sh

BACKUP_DIR="./backups/bytebot/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

# 备份数据库
docker exec bytebot-postgres pg_dump -U postgres bytebotdb > "$BACKUP_DIR/bytebotdb.sql"

# 备份配置文件
cp .env.bytebot "$BACKUP_DIR/"
cp docker-compose.bytebot.yml "$BACKUP_DIR/"

# 备份用户数据
docker cp bytebot-desktop:/home/user "$BACKUP_DIR/desktop_data"

# 压缩备份
tar -czf "$BACKUP_DIR.tar.gz" -C "$BACKUP_DIR" .
rm -rf "$BACKUP_DIR"

echo "备份完成: $BACKUP_DIR.tar.gz"
```

### 更新维护

#### 更新Bytebot镜像
```bash
# 拉取最新镜像
docker pull ghcr.io/bytebot-ai/bytebot-desktop:edge
docker pull ghcr.io/bytebot-ai/bytebot-agent:edge
docker pull ghcr.io/bytebot-ai/bytebot-ui:edge

# 重启服务
docker-compose -f docker-compose.bytebot.yml up -d
```

#### 清理旧数据
```bash
# 清理旧的Docker镜像
docker image prune -f

# 清理旧的日志文件 (保留最近7天)
find ./logs/bytebot -name "*.log" -mtime +7 -delete

# 清理旧的备份文件 (保留最近30天)
find ./backups/bytebot -name "*.tar.gz" -mtime +30 -delete
```

## 🔗 相关资源

### 官方文档
- [Bytebot官方文档](https://docs.bytebot.ai)
- [Bytebot GitHub仓库](https://github.com/bytebot-ai/bytebot)
- [Docker官方文档](https://docs.docker.com)

### 社区支持
- [Bytebot Discord社区](https://discord.com/invite/d9ewZkWPTP)
- [GitHub Issues](https://github.com/bytebot-ai/bytebot/issues)

### 技术栈文档
- [Anthropic Claude API](https://docs.anthropic.com)
- [OpenAI API](https://platform.openai.com/docs)
- [PostgreSQL文档](https://www.postgresql.org/docs)
- [Redis文档](https://redis.io/documentation)

---

**更新时间**: 2025年9月22日  
**版本**: v1.0.0  
**维护者**: 火鸟门户开发团队
