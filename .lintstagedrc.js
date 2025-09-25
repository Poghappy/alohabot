module.exports = {
  // TypeScript 和 JavaScript 文件
  '*.{ts,tsx,js,jsx}': [
    'eslint --fix',
    'prettier --write',
  ],
  
  // JSON 文件
  '*.json': [
    'prettier --write',
  ],
  
  // Markdown 文件
  '*.md': [
    'prettier --write',
  ],
  
  // YAML 文件
  '*.{yml,yaml}': [
    'prettier --write',
  ],
  
  // CSS 和样式文件
  '*.{css,scss,sass}': [
    'prettier --write',
  ],
  
  // 包配置文件
  'package.json': [
    'prettier --write',
  ],
  
  // Rust 文件 (如果存在)
  '*.rs': [
    'rustfmt --edition 2021',
  ],
};
