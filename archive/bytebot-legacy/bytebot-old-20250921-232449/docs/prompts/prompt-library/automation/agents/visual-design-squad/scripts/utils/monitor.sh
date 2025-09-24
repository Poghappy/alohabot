#!/bin/bash

# 监控脚本
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

while true; do
    # 检查 Agent 健康状态
    if ! trae agent health-check &> /dev/null; then
        echo "$(date '+%Y-%m-%d %H:%M:%S') [MONITOR] Agent 健康检查失败" >> "$PROJECT_DIR/logs/system/monitor.log"
    fi
    
    # 检查日志文件大小
    find "$PROJECT_DIR/logs" -name "*.log" -size +10M -exec echo "$(date '+%Y-%m-%d %H:%M:%S') [MONITOR] 日志文件过大: {}" \; >> "$PROJECT_DIR/logs/system/monitor.log"
    
    # 等待 5 分钟
    sleep 300
done
