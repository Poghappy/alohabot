# ByteBot Desktop 分发指南

## 📦 应用信息

- **应用名称**: ByteBot Desktop
- **版本**: 1.0.0
- **标识符**: com.bytebot.desktop
- **类别**: DeveloperTool
- **描述**: AI-powered desktop assistant

## 🎯 支持平台

### macOS
- **最低版本**: macOS 10.13 (High Sierra)
- **架构**: x64, ARM64 (Apple Silicon)
- **格式**: .app, .dmg
- **签名**: 需要 Apple Developer 证书（可选）

### Windows
- **最低版本**: Windows 10
- **架构**: x64
- **格式**: .exe (NSIS installer)
- **签名**: 需要代码签名证书（可选）

### Linux
- **发行版**: Ubuntu 18.04+, Debian 10+, CentOS 8+
- **架构**: x64
- **格式**: .AppImage, .deb, .rpm

## 🔧 构建配置

### 环境要求
- Node.js 18+
- Rust 1.70+
- npm/yarn
- Tauri CLI

### 构建命令
```bash
# 开发模式
npm run tauri:dev

# 生产构建
npm run tauri:build

# 使用构建脚本
./scripts/build.sh
```

## 📁 构建产物

### macOS
```
src-tauri/target/release/bundle/macos/
├── ByteBot Desktop.app          # 应用程序包
└── ByteBot Desktop.dmg          # 磁盘镜像（可选）
```

### Windows
```
src-tauri/target/release/bundle/nsis/
└── ByteBot Desktop_1.0.0_x64_en-US.exe  # 安装程序
```

### Linux
```
src-tauri/target/release/bundle/
├── appimage/
│   └── ByteBot Desktop_1.0.0_amd64.AppImage
├── deb/
│   └── bytebot-desktop_1.0.0_amd64.deb
└── rpm/
    └── bytebot-desktop-1.0.0.x86_64.rpm
```

## 🚀 分发策略

### 1. 直接下载
- GitHub Releases
- 官方网站下载
- 文件托管服务

### 2. 应用商店
- Mac App Store (需要 Apple Developer 账户)
- Microsoft Store (需要 Microsoft Partner 账户)
- Snap Store (Linux)

### 3. 包管理器
- Homebrew (macOS)
- Chocolatey (Windows)
- apt/yum (Linux)

## 🔐 代码签名

### macOS
```bash
# 使用 Apple Developer 证书
security find-identity -v -p codesigning
codesign --force --deep --sign "Developer ID Application: Your Name" "ByteBot Desktop.app"
```

### Windows
```bash
# 使用 signtool
signtool sign /f certificate.p12 /p password "ByteBot Desktop.exe"
```

## 📊 性能优化

### 应用大小
- **目标大小**: < 50MB
- **实际大小**: ~30MB (包含所有依赖)
- **压缩后**: ~20MB

### 启动时间
- **冷启动**: < 3秒
- **热启动**: < 1秒
- **内存占用**: < 100MB

## 🧪 测试策略

### 功能测试
- [ ] 基本功能测试
- [ ] 系统集成测试
- [ ] 多语言测试
- [ ] 主题切换测试

### 平台测试
- [ ] macOS 10.13+ 测试
- [ ] Windows 10+ 测试
- [ ] Ubuntu 18.04+ 测试
- [ ] 不同屏幕分辨率测试

### 性能测试
- [ ] 启动时间测试
- [ ] 内存使用测试
- [ ] CPU 使用测试
- [ ] 网络请求测试

## 📋 发布清单

### 发布前检查
- [ ] 所有功能正常工作
- [ ] 构建无错误
- [ ] 代码签名完成
- [ ] 文档更新
- [ ] 版本号更新
- [ ] 变更日志更新

### 发布后任务
- [ ] 创建 GitHub Release
- [ ] 更新下载链接
- [ ] 发送通知邮件
- [ ] 监控用户反馈
- [ ] 收集使用统计

## 🔄 自动更新

### 配置
```json
{
  "updater": {
    "active": true,
    "endpoints": ["https://api.bytebot.ai/updates"],
    "dialog": true,
    "pubkey": "YOUR_PUBLIC_KEY"
  }
}
```

### 实现
- 检查更新
- 下载更新
- 验证签名
- 安装更新
- 重启应用

## 📈 分析统计

### 用户统计
- 下载量
- 安装量
- 活跃用户
- 崩溃报告

### 性能统计
- 启动时间
- 响应时间
- 错误率
- 资源使用

## 🆘 支持

### 用户支持
- GitHub Issues
- 邮件支持
- 文档中心
- 社区论坛

### 开发者支持
- API 文档
- 开发指南
- 示例代码
- 技术博客
