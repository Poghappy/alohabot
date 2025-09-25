module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // 类型枚举
    'type-enum': [
      2,
      'always',
      [
        'feat',     // 新功能
        'fix',      // 修复问题
        'docs',     // 文档变更
        'style',    // 代码格式化
        'refactor', // 代码重构
        'perf',     // 性能优化
        'test',     // 测试相关
        'chore',    // 构建过程或辅助工具的变动
        'ci',       // CI 配置文件和脚本的变动
        'build',    // 构建系统或外部依赖的变动
        'revert',   // 回滚 commit
      ],
    ],
    
    // 范围枚举 (可选)
    'scope-enum': [
      2,
      'always',
      [
        'core',       // 核心功能
        'ui',         // 用户界面
        'api',        // API 相关
        'desktop',    // 桌面应用
        'agent',      // AI 智能体
        'mcp',        // MCP 协议
        'docker',     // Docker 相关
        'auth',       // 认证授权
        'db',         // 数据库
        'config',     // 配置相关
        'deps',       // 依赖更新
        'ci',         // CI/CD
        'docs',       // 文档
        'test',       // 测试
        'security',   // 安全相关
        'perf',       // 性能相关
      ],
    ],
    
    // 主题规则
    'subject-case': [2, 'never', ['start-case', 'pascal-case', 'upper-case']],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'subject-max-length': [2, 'always', 72],
    'subject-min-length': [2, 'always', 3],
    
    // 类型规则
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],
    
    // 范围规则
    'scope-case': [2, 'always', 'lower-case'],
    
    // 头部规则
    'header-max-length': [2, 'always', 100],
    'header-min-length': [2, 'always', 10],
    
    // 正文规则
    'body-leading-blank': [2, 'always'],
    'body-max-line-length': [2, 'always', 100],
    
    // 脚注规则
    'footer-leading-blank': [2, 'always'],
    'footer-max-line-length': [2, 'always', 100],
  },
  
  // 自定义解析器选项
  parserPreset: {
    parserOpts: {
      headerPattern: /^(\w*)(?:\(([^)]*)\))?: (.*)$/,
      headerCorrespondence: ['type', 'scope', 'subject'],
    },
  },
  
  // 忽略规则 (用于特殊情况)
  ignores: [
    (commit) => commit.includes('WIP'),
    (commit) => commit.includes('Merge'),
  ],
  
  // 默认忽略
  defaultIgnores: true,
  
  // 帮助 URL
  helpUrl: 'https://github.com/conventional-changelog/commitlint/#what-is-commitlint',
};
