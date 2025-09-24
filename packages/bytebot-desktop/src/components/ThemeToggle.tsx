import React from 'react';
import { useTheme } from '../hooks/useTheme';
import './ThemeToggle.css';

const ThemeToggle: React.FC = () => {
  const { theme, actualTheme, toggleTheme } = useTheme();

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return '☀️';
      case 'dark':
        return '🌙';
      case 'auto':
        return '🔄';
      default:
        return '🌙';
    }
  };

  const getThemeTooltip = () => {
    switch (theme) {
      case 'light':
        return '切换到深色模式';
      case 'dark':
        return '切换到自动模式';
      case 'auto':
        return '切换到浅色模式';
      default:
        return '切换主题';
    }
  };

  return (
    <button
      className="theme-toggle"
      onClick={toggleTheme}
      title={getThemeTooltip()}
      aria-label={`当前主题: ${actualTheme === 'light' ? '浅色' : '深色'}, 点击切换到${getThemeTooltip()}`}
    >
      <span className="theme-icon" aria-hidden="true">
        {getThemeIcon()}
      </span>
      <span className="theme-label">
        {theme === 'auto' ? '自动' : actualTheme === 'light' ? '浅色' : '深色'}
      </span>
    </button>
  );
};

export default ThemeToggle;
