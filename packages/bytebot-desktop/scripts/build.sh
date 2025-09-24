#!/bin/bash

# ByteBot Desktop 构建脚本
set -e

echo "🚀 开始构建 ByteBot Desktop..."

# 检查依赖
echo "📦 检查依赖..."
if ! command -v npm &> /dev/null; then
    echo "❌ npm 未安装"
    exit 1
fi

if ! command -v cargo &> /dev/null; then
    echo "❌ Rust/Cargo 未安装"
    exit 1
fi

# 安装前端依赖
echo "📦 安装前端依赖..."
npm install

# 构建前端
echo "🔨 构建前端..."
npm run build

# 构建 Tauri 应用
echo "🔨 构建 Tauri 应用..."
npm run tauri:build

echo "✅ 构建完成！"
echo "📁 构建产物位置:"
echo "   - macOS: src-tauri/target/release/bundle/macos/"
echo "   - Windows: src-tauri/target/release/bundle/nsis/"
echo "   - Linux: src-tauri/target/release/bundle/appimage/"

# 显示构建产物大小
if [ -d "src-tauri/target/release/bundle" ]; then
    echo "📊 构建产物大小:"
    du -sh src-tauri/target/release/bundle/* 2>/dev/null || echo "   构建产物目录为空"
fi