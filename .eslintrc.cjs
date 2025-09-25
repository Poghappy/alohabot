module.exports = {
  root: true,
  env: {
    browser: true,
    es2022: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ['@typescript-eslint', 'react', 'react-hooks'],
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    // 通用规则
    'no-console': 'warn',
    'no-debugger': 'error',
    'no-unused-vars': 'off', // 使用 TypeScript 版本
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'prefer-const': 'error',
    'no-var': 'error',
    'object-shorthand': 'error',
    'prefer-template': 'error',

    // TypeScript 规则 - 放宽以减少错误
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-inferrable-types': 'off',
    '@typescript-eslint/ban-ts-comment': 'warn',

    // React 规则
    'react/react-in-jsx-scope': 'off', // Next.js 不需要
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
  },
  overrides: [
    {
      // TypeScript 文件
      files: ['**/*.ts', '**/*.tsx'],
      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint'],
      rules: {
        // 禁用 JS 规则，使用 TS 版本
        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
        '@typescript-eslint/no-explicit-any': 'warn',
      },
    },
    {
      // JavaScript 文件（非 TypeScript）
      files: ['**/*.js', '**/*.jsx'],
      parser: 'espree',
      extends: ['eslint:recommended', 'prettier'],
      rules: {
        '@typescript-eslint/no-unused-vars': 'off',
        'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      },
    },
    {
      // Node.js 配置文件
      files: ['**/*.config.{js,cjs,mjs}', '**/scripts/**/*.js'],
      env: {
        node: true,
        browser: false,
      },
      parser: 'espree',
    },
    {
      // 测试文件
      files: ['**/*.test.{js,jsx,ts,tsx}', '**/*.spec.{js,jsx,ts,tsx}', '**/jest.*.{js,ts}'],
      env: {
        jest: true,
      },
      globals: {
        beforeAll: 'readonly',
        afterAll: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        jest: 'readonly',
        global: 'writable',
      },
    },
  ],
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'build/',
    '.next/',
    'target/',
    '*.min.js',
    'coverage/',
    '.turbo/',
    // 忽略 archive 目录中的旧代码
    'archive/',
    // 忽略生成的文件
    'prisma/generated/',
    '**/*.d.ts',
  ],
};