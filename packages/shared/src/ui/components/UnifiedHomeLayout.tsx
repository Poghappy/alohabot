import React from 'react';
import { designTokens, componentStyles } from '../design-system';

interface UnifiedHomeLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  showOfflineIndicator?: boolean;
  showConnectionIndicator?: boolean;
  showTauriIndicator?: boolean;
  onAutomationClick?: () => void;
  className?: string;
}

/**
 * 统一的首页布局组件
 * 确保桌面端和Web端体验一致性
 */
export const UnifiedHomeLayout: React.FC<UnifiedHomeLayoutProps> = ({
  children,
  title = "我能帮您做什么？",
  subtitle,
  showOfflineIndicator = false,
  showConnectionIndicator = false,
  showTauriIndicator = false,
  onAutomationClick,
  className = "",
}) => {
  return (
    <div 
      className={`unified-home-layout ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: designTokens.colors.gray[50],
        fontFamily: designTokens.typography.fontFamily.sans.join(', '),
      }}
    >
      {/* 主内容区域 */}
      <main 
        className="unified-main"
        style={{
          flex: 1,
          overflow: 'hidden',
        }}
      >
        {/* 主网格布局 - 50/50 分割 */}
        <div 
          className="unified-main-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: designTokens.spacing[8],
            height: '100%',
            padding: designTokens.spacing[8],
          }}
        >
          {/* 主内容区域 */}
          <div 
            className="unified-content-area"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              overflowY: 'auto',
            }}
          >
            <div 
              className="unified-content-container"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '100%',
                maxWidth: '36rem',
              }}
            >
              {/* 标题区域 */}
              <div 
                className="unified-title-section"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  justifyContent: 'flex-start',
                  width: '100%',
                  marginBottom: designTokens.spacing[6],
                }}
              >
                <h1 
                  className="unified-main-title"
                  style={{
                    fontSize: designTokens.typography.fontSize['2xl'],
                    lineHeight: designTokens.typography.lineHeight.tight,
                    marginBottom: designTokens.spacing[1],
                    color: designTokens.colors.gray[900],
                    margin: 0,
                    fontWeight: designTokens.typography.fontWeight.bold,
                  }}
                >
                  {title}
                </h1>
                
                {subtitle && (
                  <p 
                    className="unified-subtitle"
                    style={{
                      fontSize: designTokens.typography.fontSize.base,
                      color: designTokens.colors.gray[600],
                      margin: 0,
                      marginTop: designTokens.spacing[2],
                    }}
                  >
                    {subtitle}
                  </p>
                )}

                {/* 状态指示器 */}
                {showOfflineIndicator && (
                  <div 
                    className="unified-offline-indicator"
                    style={{
                      backgroundColor: designTokens.colors.error[50],
                      color: designTokens.colors.error[600],
                      padding: `${designTokens.spacing[2]} ${designTokens.spacing[4]}`,
                      borderRadius: designTokens.borderRadius.md,
                      fontSize: designTokens.typography.fontSize.sm,
                      fontWeight: designTokens.typography.fontWeight.medium,
                      marginTop: designTokens.spacing[2],
                      border: `1px solid ${designTokens.colors.error[200]}`,
                    }}
                  >
                    🔴 离线模式 - 部分功能受限
                  </div>
                )}

                {showConnectionIndicator && (
                  <div 
                    className="unified-connection-indicator"
                    style={{
                      backgroundColor: designTokens.colors.warning[50],
                      color: designTokens.colors.warning[600],
                      padding: `${designTokens.spacing[2]} ${designTokens.spacing[4]}`,
                      borderRadius: designTokens.borderRadius.md,
                      fontSize: designTokens.typography.fontSize.sm,
                      fontWeight: designTokens.typography.fontWeight.medium,
                      marginTop: designTokens.spacing[2],
                      border: `1px solid ${designTokens.colors.warning[200]}`,
                    }}
                  >
                    🟡 连接中... - 实时更新暂不可用
                  </div>
                )}

                {showTauriIndicator && (
                  <div 
                    className="unified-tauri-indicator"
                    style={{
                      backgroundColor: designTokens.colors.primary[50],
                      color: designTokens.colors.primary[600],
                      padding: `${designTokens.spacing[2]} ${designTokens.spacing[4]}`,
                      borderRadius: designTokens.borderRadius.md,
                      fontSize: designTokens.typography.fontSize.sm,
                      fontWeight: designTokens.typography.fontWeight.medium,
                      marginTop: designTokens.spacing[2],
                      border: `1px solid ${designTokens.colors.primary[200]}`,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: designTokens.spacing[4],
                    }}
                  >
                    <span>🖥️ 桌面原生模式 - 增强功能已启用</span>
                    {onAutomationClick && (
                      <button 
                        onClick={onAutomationClick}
                        className="unified-automation-trigger-btn"
                        style={{
                          ...componentStyles.button.base,
                          ...componentStyles.button.sizes.sm,
                          ...componentStyles.button.variants.primary,
                        }}
                      >
                        🤖 自动化控制台
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* 子内容 */}
              <div 
                className="unified-content-children"
                style={{
                  width: '100%',
                }}
              >
                {children}
              </div>
            </div>
          </div>

          {/* 艺术图片区域 */}
          <div 
            className="unified-artwork-area"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: designTokens.colors.gray[100],
              borderRadius: designTokens.borderRadius.lg,
              padding: designTokens.spacing[8],
            }}
          >
            <div 
              className="unified-artwork-content"
              style={{
                textAlign: 'center',
                color: designTokens.colors.gray[500],
              }}
            >
              <div 
                style={{
                  fontSize: '4rem',
                  marginBottom: designTokens.spacing[4],
                }}
              >
                🤖
              </div>
              <h3 
                style={{
                  fontSize: designTokens.typography.fontSize.xl,
                  fontWeight: designTokens.typography.fontWeight.semibold,
                  marginBottom: designTokens.spacing[2],
                  color: designTokens.colors.gray[700],
                }}
              >
                字节机器人生态
              </h3>
              <p 
                style={{
                  fontSize: designTokens.typography.fontSize.base,
                  color: designTokens.colors.gray[500],
                  lineHeight: designTokens.typography.lineHeight.relaxed,
                }}
              >
                智能自动化助手，让工作更高效
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UnifiedHomeLayout;
