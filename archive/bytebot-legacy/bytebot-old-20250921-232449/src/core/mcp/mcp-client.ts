/**
 * ByteBot MCP (Model Context Protocol) 客户端
 * 负责与 MCP 服务器的连接、工具调用和协议通信
 */

import { EventEmitter } from 'events';
import { existsSync, readFileSync } from 'fs';
import * as yaml from 'js-yaml';
import { join } from 'path';

export interface MCPServer {
    name: string;
    description: string;
    type: 'builtin' | 'external';
    endpoint: string;
    capabilities: string[];
    config?: Record<string, any>;
}

export interface MCPTool {
    name: string;
    description: string;
    parameters: Record<string, any>;
    server: string;
}

export interface MCPToolCall {
    id: string;
    tool: string;
    parameters: Record<string, any>;
    timestamp: Date;
}

export interface MCPToolResult {
    id: string;
    success: boolean;
    result?: any;
    error?: string;
    timestamp: Date;
}

export interface MCPServerRegistry {
    version: string;
    servers: Record<string, MCPServer>;
    tool_chains: Record<string, {
        name: string;
        description: string;
        tools: string[];
        sequence: string[];
    }>;
    security: {
        allowed_origins: string[];
        rate_limits: Record<string, number>;
        access_control: Record<string, any>;
    };
}

export class MCPClient extends EventEmitter {
    private registry: MCPServerRegistry | null = null;
    private connectedServers: Map<string, any> = new Map();
    private availableTools: Map<string, MCPTool> = new Map();
    private callHistory: MCPToolCall[] = [];
    private resultHistory: MCPToolResult[] = [];
    private registryPath: string;

    constructor(registryPath?: string) {
        super();
        this.registryPath = registryPath || join(process.cwd(), 'config/mcp-servers/server-registry.yaml');
    }

    /**
     * 初始化 MCP 客户端
     */
    public async initialize(): Promise<void> {
        try {
            await this.loadRegistry();
            await this.connectToServers();
            await this.discoverTools();

            console.log(`✅ MCP 客户端初始化成功，连接了 ${this.connectedServers.size} 个服务器`);
            this.emit('initialized');
        } catch (error) {
            console.error('❌ MCP 客户端初始化失败:', error);
            this.emit('error', error);
            throw error;
        }
    }

    /**
     * 加载服务器注册表
     */
    private async loadRegistry(): Promise<void> {
        if (!existsSync(this.registryPath)) {
            throw new Error(`MCP 服务器注册表不存在: ${this.registryPath}`);
        }

        const registryContent = readFileSync(this.registryPath, 'utf8');
        this.registry = yaml.load(registryContent) as MCPServerRegistry;

        console.log(`📋 加载了 ${Object.keys(this.registry.servers).length} 个 MCP 服务器配置`);
    }

    /**
     * 连接到所有配置的服务器
     */
    private async connectToServers(): Promise<void> {
        if (!this.registry) {
            throw new Error('服务器注册表未加载');
        }

        const connectionPromises = Object.entries(this.registry.servers).map(
            ([serverId, server]) => this.connectToServer(serverId, server)
        );

        await Promise.allSettled(connectionPromises);
    }

    /**
     * 连接到单个服务器
     */
    private async connectToServer(serverId: string, server: MCPServer): Promise<void> {
        try {
            // 模拟服务器连接（实际实现需要根据具体的 MCP 协议）
            console.log(`🔌 连接到 MCP 服务器: ${server.name} (${server.endpoint})`);

            // 这里应该实现实际的 MCP 协议连接
            const connection = {
                id: serverId,
                server,
                connected: true,
                lastPing: new Date()
            };

            this.connectedServers.set(serverId, connection);
            this.emit('serverConnected', serverId, server);

        } catch (error) {
            console.error(`❌ 连接服务器失败 ${serverId}:`, error);
            this.emit('serverError', serverId, error);
        }
    }

    /**
     * 发现可用工具
     */
    private async discoverTools(): Promise<void> {
        for (const [serverId, connection] of this.connectedServers) {
            try {
                // 模拟工具发现（实际实现需要调用 MCP 协议的工具发现接口）
                const server = connection.server as MCPServer;

                for (const capability of server.capabilities) {
                    const tool: MCPTool = {
                        name: `${serverId}_${capability}`,
                        description: `${capability} 工具来自 ${server.name}`,
                        parameters: this.getToolParameters(capability),
                        server: serverId
                    };

                    this.availableTools.set(tool.name, tool);
                }

                console.log(`🔧 从 ${server.name} 发现了 ${server.capabilities.length} 个工具`);
            } catch (error) {
                console.error(`❌ 从服务器 ${serverId} 发现工具失败:`, error);
            }
        }

        console.log(`🛠️  总共发现了 ${this.availableTools.size} 个可用工具`);
    }

    /**
     * 获取工具参数定义（模拟）
     */
    private getToolParameters(capability: string): Record<string, any> {
        const parameterSchemas: Record<string, any> = {
            file_read: {
                type: 'object',
                properties: {
                    path: { type: 'string', description: '文件路径' }
                },
                required: ['path']
            },
            file_write: {
                type: 'object',
                properties: {
                    path: { type: 'string', description: '文件路径' },
                    content: { type: 'string', description: '文件内容' }
                },
                required: ['path', 'content']
            },
            web_search: {
                type: 'object',
                properties: {
                    query: { type: 'string', description: '搜索查询' },
                    limit: { type: 'number', description: '结果数量限制', default: 10 }
                },
                required: ['query']
            }
        };

        return parameterSchemas[capability] || {
            type: 'object',
            properties: {},
            required: []
        };
    }

    /**
     * 获取可用工具列表
     */
    public getAvailableTools(): MCPTool[] {
        return Array.from(this.availableTools.values());
    }

    /**
     * 获取特定服务器的工具
     */
    public getServerTools(serverId: string): MCPTool[] {
        return Array.from(this.availableTools.values()).filter(tool => tool.server === serverId);
    }

    /**
     * 调用工具
     */
    public async callTool(toolName: string, parameters: Record<string, any>): Promise<MCPToolResult> {
        const tool = this.availableTools.get(toolName);
        if (!tool) {
            throw new Error(`工具不存在: ${toolName}`);
        }

        const connection = this.connectedServers.get(tool.server);
        if (!connection) {
            throw new Error(`服务器未连接: ${tool.server}`);
        }

        const callId = this.generateCallId();
        const call: MCPToolCall = {
            id: callId,
            tool: toolName,
            parameters,
            timestamp: new Date()
        };

        this.callHistory.push(call);
        this.emit('toolCalled', call);

        try {
            // 模拟工具调用（实际实现需要调用 MCP 协议的工具执行接口）
            console.log(`🔧 调用工具: ${toolName}`, parameters);

            // 这里应该实现实际的 MCP 工具调用
            const result = await this.simulateToolExecution(toolName, parameters);

            const toolResult: MCPToolResult = {
                id: callId,
                success: true,
                result,
                timestamp: new Date()
            };

            this.resultHistory.push(toolResult);
            this.emit('toolResult', toolResult);

            return toolResult;
        } catch (error) {
            const toolResult: MCPToolResult = {
                id: callId,
                success: false,
                error: error instanceof Error ? error.message : String(error),
                timestamp: new Date()
            };

            this.resultHistory.push(toolResult);
            this.emit('toolError', toolResult);

            return toolResult;
        }
    }

    /**
     * 模拟工具执行（用于测试）
     */
    private async simulateToolExecution(toolName: string, parameters: Record<string, any>): Promise<any> {
        // 模拟异步操作
        await new Promise(resolve => setTimeout(resolve, 100));

        if (toolName.includes('file_read')) {
            return { content: '模拟文件内容', size: 1024 };
        } else if (toolName.includes('web_search')) {
            return {
                results: [
                    { title: '搜索结果 1', url: 'https://example.com/1', snippet: '相关内容...' },
                    { title: '搜索结果 2', url: 'https://example.com/2', snippet: '更多内容...' }
                ],
                total: 2
            };
        } else {
            return { status: 'success', message: `工具 ${toolName} 执行成功` };
        }
    }

    /**
     * 执行工具链
     */
    public async executeToolChain(chainName: string, initialParameters: Record<string, any>): Promise<MCPToolResult[]> {
        if (!this.registry) {
            throw new Error('服务器注册表未加载');
        }

        const chain = this.registry.tool_chains[chainName];
        if (!chain) {
            throw new Error(`工具链不存在: ${chainName}`);
        }

        console.log(`⛓️  执行工具链: ${chain.name}`);
        const results: MCPToolResult[] = [];
        let context = initialParameters;

        for (const toolName of chain.sequence) {
            try {
                const result = await this.callTool(toolName, context);
                results.push(result);

                // 将结果传递给下一个工具
                if (result.success && result.result) {
                    context = { ...context, ...result.result };
                }
            } catch (error) {
                console.error(`❌ 工具链执行失败在工具 ${toolName}:`, error);
                break;
            }
        }

        this.emit('toolChainCompleted', chainName, results);
        return results;
    }

    /**
     * 获取调用历史
     */
    public getCallHistory(limit?: number): MCPToolCall[] {
        const history = this.callHistory.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        return limit ? history.slice(0, limit) : history;
    }

    /**
     * 获取结果历史
     */
    public getResultHistory(limit?: number): MCPToolResult[] {
        const history = this.resultHistory.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        return limit ? history.slice(0, limit) : history;
    }

    /**
     * 获取连接状态
     */
    public getConnectionStatus(): Record<string, boolean> {
        const status: Record<string, boolean> = {};
        for (const [serverId, connection] of this.connectedServers) {
            status[serverId] = connection.connected;
        }
        return status;
    }

    /**
     * 重新连接所有服务器
     */
    public async reconnect(): Promise<void> {
        console.log('🔄 重新连接所有 MCP 服务器...');
        this.connectedServers.clear();
        this.availableTools.clear();

        await this.connectToServers();
        await this.discoverTools();

        this.emit('reconnected');
    }

    /**
     * 生成调用ID
     */
    private generateCallId(): string {
        return `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * 断开连接
     */
    public async disconnect(): Promise<void> {
        console.log('🔌 断开所有 MCP 服务器连接...');

        for (const [serverId, connection] of this.connectedServers) {
            try {
                // 这里应该实现实际的断开连接逻辑
                connection.connected = false;
                this.emit('serverDisconnected', serverId);
            } catch (error) {
                console.error(`❌ 断开服务器 ${serverId} 连接失败:`, error);
            }
        }

        this.connectedServers.clear();
        this.availableTools.clear();
        this.emit('disconnected');
    }
}

// 导出单例实例
export const mcpClient = new MCPClient();
