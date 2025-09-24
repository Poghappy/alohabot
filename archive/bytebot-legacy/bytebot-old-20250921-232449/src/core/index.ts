/**
 * ByteBot 核心模块索引
 * 统一导出所有核心功能模块
 */

// 提示词管理
export { PromptManager, promptManager } from './prompts/prompt-manager';
export type { PromptConfig, PromptTemplate, SystemPrompt } from './prompts/prompt-manager';

// 对话历史管理
export { ConversationManager, conversationManager } from './history/conversation-manager';
export type {
    ConversationSession,
    ConversationStorage, Message
} from './history/conversation-manager';

// MCP 客户端
export { MCPClient, mcpClient } from './mcp/mcp-client';
export type {
    MCPServer, MCPServerRegistry, MCPTool,
    MCPToolCall,
    MCPToolResult
} from './mcp/mcp-client';

/**
 * 初始化所有核心模块
 */
export async function initializeCoreModules(): Promise<void> {
    console.log('🚀 初始化 ByteBot 核心模块...');

    try {
        // 初始化提示词管理器
        await promptManager.loadConfig();
        console.log('✅ 提示词管理器初始化完成');

        // 初始化 MCP 客户端
        await mcpClient.initialize();
        console.log('✅ MCP 客户端初始化完成');

        // 对话管理器会在构造时自动初始化
        console.log('✅ 对话历史管理器初始化完成');

        console.log('🎉 所有核心模块初始化成功！');
    } catch (error) {
        console.error('❌ 核心模块初始化失败:', error);
        throw error;
    }
}

/**
 * 清理所有核心模块
 */
export async function cleanupCoreModules(): Promise<void> {
    console.log('🧹 清理 ByteBot 核心模块...');

    try {
        // 断开 MCP 连接
        await mcpClient.disconnect();

        // 保存对话历史
        conversationManager.save();

        console.log('✅ 核心模块清理完成');
    } catch (error) {
        console.error('❌ 核心模块清理失败:', error);
    }
}
