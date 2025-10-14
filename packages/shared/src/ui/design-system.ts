/**
 * 字节机器人生态 - 统一设计系统
 * 确保桌面端和Web端体验一致性
 */

// 设计令牌
export const designTokens = {
  // 颜色系统
  colors: {
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
    },
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    },
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
    },
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
    },
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
    },
  },
  
  // 字体系统
  typography: {
    fontFamily: {
      sans: [
        '-apple-system',
        'BlinkMacSystemFont',
        'Segoe UI',
        'Roboto',
        'Oxygen',
        'Ubuntu',
        'Cantarell',
        'Fira Sans',
        'Droid Sans',
        'Helvetica Neue',
        'sans-serif',
      ],
      mono: [
        'SFMono-Regular',
        'Menlo',
        'Monaco',
        'Consolas',
        'Liberation Mono',
        'Courier New',
        'monospace',
      ],
    },
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',    // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem', // 36px
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
    },
  },
  
  // 间距系统
  spacing: {
    0: '0',
    1: '0.25rem',   // 4px
    2: '0.5rem',    // 8px
    3: '0.75rem',   // 12px
    4: '1rem',      // 16px
    5: '1.25rem',   // 20px
    6: '1.5rem',    // 24px
    8: '2rem',      // 32px
    10: '2.5rem',   // 40px
    12: '3rem',     // 48px
    16: '4rem',     // 64px
    20: '5rem',     // 80px
    24: '6rem',     // 96px
  },
  
  // 圆角系统
  borderRadius: {
    none: '0',
    sm: '0.125rem',   // 2px
    base: '0.25rem',  // 4px
    md: '0.375rem',   // 6px
    lg: '0.5rem',     // 8px
    xl: '0.75rem',    // 12px
    '2xl': '1rem',    // 16px
    full: '9999px',
  },
  
  // 阴影系统
  boxShadow: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  },
  
  // 断点系统
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
} as const;

// 组件样式配置
export const componentStyles = {
  // 按钮样式
  button: {
    base: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: designTokens.borderRadius.md,
      fontWeight: designTokens.typography.fontWeight.medium,
      transition: 'all 0.2s ease-in-out',
      cursor: 'pointer',
      border: 'none',
      outline: 'none',
    },
    sizes: {
      sm: {
        padding: `${designTokens.spacing[2]} ${designTokens.spacing[3]}`,
        fontSize: designTokens.typography.fontSize.sm,
      },
      base: {
        padding: `${designTokens.spacing[2]} ${designTokens.spacing[4]}`,
        fontSize: designTokens.typography.fontSize.base,
      },
      lg: {
        padding: `${designTokens.spacing[3]} ${designTokens.spacing[6]}`,
        fontSize: designTokens.typography.fontSize.lg,
      },
    },
    variants: {
      primary: {
        backgroundColor: designTokens.colors.primary[600],
        color: 'white',
        '&:hover': {
          backgroundColor: designTokens.colors.primary[700],
        },
        '&:focus': {
          boxShadow: `0 0 0 3px ${designTokens.colors.primary[200]}`,
        },
      },
      secondary: {
        backgroundColor: designTokens.colors.gray[100],
        color: designTokens.colors.gray[900],
        '&:hover': {
          backgroundColor: designTokens.colors.gray[200],
        },
        '&:focus': {
          boxShadow: `0 0 0 3px ${designTokens.colors.gray[200]}`,
        },
      },
      danger: {
        backgroundColor: designTokens.colors.error[600],
        color: 'white',
        '&:hover': {
          backgroundColor: designTokens.colors.error[700],
        },
        '&:focus': {
          boxShadow: `0 0 0 3px ${designTokens.colors.error[200]}`,
        },
      },
    },
  },
  
  // 输入框样式
  input: {
    base: {
      width: '100%',
      padding: `${designTokens.spacing[2]} ${designTokens.spacing[3]}`,
      border: `1px solid ${designTokens.colors.gray[300]}`,
      borderRadius: designTokens.borderRadius.md,
      fontSize: designTokens.typography.fontSize.base,
      lineHeight: designTokens.typography.lineHeight.normal,
      transition: 'border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
      '&:focus': {
        outline: 'none',
        borderColor: designTokens.colors.primary[500],
        boxShadow: `0 0 0 3px ${designTokens.colors.primary[200]}`,
      },
      '&:disabled': {
        backgroundColor: designTokens.colors.gray[50],
        color: designTokens.colors.gray[500],
        cursor: 'not-allowed',
      },
    },
  },
  
  // 卡片样式
  card: {
    base: {
      backgroundColor: 'white',
      borderRadius: designTokens.borderRadius.lg,
      boxShadow: designTokens.boxShadow.base,
      padding: designTokens.spacing[6],
    },
  },
  
  // 布局样式
  layout: {
    container: {
      maxWidth: '1280px',
      margin: '0 auto',
      padding: `0 ${designTokens.spacing[4]}`,
    },
    grid: {
      display: 'grid',
      gap: designTokens.spacing[6],
    },
    flex: {
      display: 'flex',
      alignItems: 'center',
    },
  },
} as const;

// 主题配置
export const themes = {
  light: {
    background: designTokens.colors.gray[50],
    surface: 'white',
    text: {
      primary: designTokens.colors.gray[900],
      secondary: designTokens.colors.gray[600],
      muted: designTokens.colors.gray[500],
    },
    border: designTokens.colors.gray[200],
  },
  dark: {
    background: designTokens.colors.gray[900],
    surface: designTokens.colors.gray[800],
    text: {
      primary: designTokens.colors.gray[100],
      secondary: designTokens.colors.gray[300],
      muted: designTokens.colors.gray[400],
    },
    border: designTokens.colors.gray[700],
  },
} as const;

// 响应式工具函数
export const responsive = {
  sm: `@media (min-width: ${designTokens.breakpoints.sm})`,
  md: `@media (min-width: ${designTokens.breakpoints.md})`,
  lg: `@media (min-width: ${designTokens.breakpoints.lg})`,
  xl: `@media (min-width: ${designTokens.breakpoints.xl})`,
  '2xl': `@media (min-width: ${designTokens.breakpoints['2xl']})`,
} as const;

// 动画配置
export const animations = {
  duration: {
    fast: '0.15s',
    normal: '0.2s',
    slow: '0.3s',
  },
  easing: {
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  },
} as const;

// 导出类型
export type DesignTokens = typeof designTokens;
export type ComponentStyles = typeof componentStyles;
export type Themes = typeof themes;
export type Responsive = typeof responsive;
export type Animations = typeof animations;
