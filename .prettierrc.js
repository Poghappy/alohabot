module.exports = {
  // 基础格式化选项
  semi: true,
  trailingComma: 'es5',
  singleQuote: true,
  printWidth: 100,
  tabWidth: 4,
  useTabs: false,
  
  // JSX 特定选项
  jsxSingleQuote: true,
  jsxBracketSameLine: false,
  
  // 其他选项
  arrowParens: 'avoid',
  endOfLine: 'lf',
  bracketSpacing: true,
  bracketSameLine: false,
  
  // 文件特定覆盖
  overrides: [
    {
      files: '*.json',
      options: {
        tabWidth: 2,
      },
    },
    {
      files: '*.md',
      options: {
        tabWidth: 2,
        printWidth: 80,
      },
    },
    {
      files: '*.yml',
      options: {
        tabWidth: 2,
      },
    },
    {
      files: '*.yaml',
      options: {
        tabWidth: 2,
      },
    },
  ],
};
