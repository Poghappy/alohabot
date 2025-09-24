/**
 * ByteBot 对话历史管理器
 * 负责用户对话历史的存储、检索和会话管理
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';

export interface Message {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
    metadata?: Record<string, any>;
}

export interface ConversationSession {
    id: string;
    userId: string;
    title?: string;
    messages: Message[];
    createdAt: Date;
    updatedAt: Date;
    metadata?: Record<string, any>;
}

export interface ConversationStorage {
    sessions: Record<string, ConversationSession>;
    userSessions: Record<string, string[]>; // userId -> sessionIds
}

export class ConversationManager {
    private storage: ConversationStorage;
    private storagePath: string;
    private maxHistoryDays: number;
    private autoSave: boolean;

    constructor(options?: {
        storagePath?: string;
        maxHistoryDays?: number;
        autoSave?: boolean;
    }) {
        this.storagePath = options?.storagePath || join(process.cwd(), 'data/conversation-history/conversations.json');
        this.maxHistoryDays = options?.maxHistoryDays || 30;
        this.autoSave = options?.autoSave !== false;

        this.storage = {
            sessions: {},
            userSessions: {}
        };

        this.ensureStorageDirectory();
        this.loadStorage();
    }

    /**
     * 确保存储目录存在
     */
    private ensureStorageDirectory(): void {
        const dir = dirname(this.storagePath);
        if (!existsSync(dir)) {
            mkdirSync(dir, { recursive: true });
        }
    }

    /**
     * 加载存储数据
     */
    private loadStorage(): void {
        try {
            if (existsSync(this.storagePath)) {
                const data = readFileSync(this.storagePath, 'utf8');
                this.storage = JSON.parse(data, (key, value) => {
                    // 将日期字符串转换回 Date 对象
                    if (key === 'timestamp' || key === 'createdAt' || key === 'updatedAt') {
                        return new Date(value);
                    }
                    return value;
                });
            }
        } catch (error) {
            console.error('❌ 加载对话历史失败:', error);
            // 初始化空存储
            this.storage = {
                sessions: {},
                userSessions: {}
            };
        }
    }

    /**
     * 保存存储数据
     */
    private saveStorage(): void {
        if (!this.autoSave) return;

        try {
            const data = JSON.stringify(this.storage, null, 2);
            writeFileSync(this.storagePath, data, 'utf8');
        } catch (error) {
            console.error('❌ 保存对话历史失败:', error);
        }
    }

    /**
     * 创建新的对话会话
     */
    public createSession(userId: string, title?: string): ConversationSession {
        const sessionId = this.generateSessionId();
        const now = new Date();

        const session: ConversationSession = {
            id: sessionId,
            userId,
            title: title || `对话 ${sessionId.slice(-8)}`,
            messages: [],
            createdAt: now,
            updatedAt: now
        };

        this.storage.sessions[sessionId] = session;

        if (!this.storage.userSessions[userId]) {
            this.storage.userSessions[userId] = [];
        }
        this.storage.userSessions[userId].push(sessionId);

        this.saveStorage();
        return session;
    }

    /**
     * 添加消息到会话
     */
    public addMessage(sessionId: string, message: Omit<Message, 'id' | 'timestamp'>): Message {
        const session = this.storage.sessions[sessionId];
        if (!session) {
            throw new Error(`会话不存在: ${sessionId}`);
        }

        const fullMessage: Message = {
            ...message,
            id: this.generateMessageId(),
            timestamp: new Date()
        };

        session.messages.push(fullMessage);
        session.updatedAt = new Date();

        this.saveStorage();
        return fullMessage;
    }

    /**
     * 获取会话
     */
    public getSession(sessionId: string): ConversationSession | null {
        return this.storage.sessions[sessionId] || null;
    }

    /**
     * 获取用户的所有会话
     */
    public getUserSessions(userId: string, limit?: number): ConversationSession[] {
        const sessionIds = this.storage.userSessions[userId] || [];
        const sessions = sessionIds
            .map(id => this.storage.sessions[id])
            .filter(session => session !== undefined)
            .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

        return limit ? sessions.slice(0, limit) : sessions;
    }

    /**
     * 获取会话的最近消息
     */
    public getRecentMessages(sessionId: string, limit: number = 10): Message[] {
        const session = this.getSession(sessionId);
        if (!session) {
            return [];
        }

        return session.messages.slice(-limit);
    }

    /**
     * 搜索消息
     */
    public searchMessages(userId: string, query: string, options?: {
        sessionId?: string;
        limit?: number;
        startDate?: Date;
        endDate?: Date;
    }): Message[] {
        const sessions = options?.sessionId
            ? [this.getSession(options.sessionId)].filter(s => s !== null) as ConversationSession[]
            : this.getUserSessions(userId);

        const results: Message[] = [];
        const limit = options?.limit || 50;

        for (const session of sessions) {
            for (const message of session.messages) {
                // 时间过滤
                if (options?.startDate && message.timestamp < options.startDate) continue;
                if (options?.endDate && message.timestamp > options.endDate) continue;

                // 内容搜索
                if (message.content.toLowerCase().includes(query.toLowerCase())) {
                    results.push(message);
                    if (results.length >= limit) break;
                }
            }
            if (results.length >= limit) break;
        }

        return results.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    }

    /**
     * 更新会话标题
     */
    public updateSessionTitle(sessionId: string, title: string): void {
        const session = this.storage.sessions[sessionId];
        if (!session) {
            throw new Error(`会话不存在: ${sessionId}`);
        }

        session.title = title;
        session.updatedAt = new Date();
        this.saveStorage();
    }

    /**
     * 删除会话
     */
    public deleteSession(sessionId: string): void {
        const session = this.storage.sessions[sessionId];
        if (!session) {
            return;
        }

        // 从用户会话列表中移除
        const userSessions = this.storage.userSessions[session.userId];
        if (userSessions) {
            const index = userSessions.indexOf(sessionId);
            if (index > -1) {
                userSessions.splice(index, 1);
            }
        }

        // 删除会话
        delete this.storage.sessions[sessionId];
        this.saveStorage();
    }

    /**
     * 清理过期会话
     */
    public cleanupExpiredSessions(): number {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - this.maxHistoryDays);

        let deletedCount = 0;
        const sessionIds = Object.keys(this.storage.sessions);

        for (const sessionId of sessionIds) {
            const session = this.storage.sessions[sessionId];
            if (session.updatedAt < cutoffDate) {
                this.deleteSession(sessionId);
                deletedCount++;
            }
        }

        console.log(`🧹 清理了 ${deletedCount} 个过期会话`);
        return deletedCount;
    }

    /**
     * 获取统计信息
     */
    public getStatistics(userId?: string): {
        totalSessions: number;
        totalMessages: number;
        averageMessagesPerSession: number;
        oldestSession?: Date;
        newestSession?: Date;
    } {
        const sessions = userId
            ? this.getUserSessions(userId)
            : Object.values(this.storage.sessions);

        const totalSessions = sessions.length;
        const totalMessages = sessions.reduce((sum, session) => sum + session.messages.length, 0);
        const averageMessagesPerSession = totalSessions > 0 ? totalMessages / totalSessions : 0;

        const dates = sessions.map(s => s.createdAt).sort((a, b) => a.getTime() - b.getTime());
        const oldestSession = dates[0];
        const newestSession = dates[dates.length - 1];

        return {
            totalSessions,
            totalMessages,
            averageMessagesPerSession: Math.round(averageMessagesPerSession * 100) / 100,
            oldestSession,
            newestSession
        };
    }

    /**
     * 生成会话ID
     */
    private generateSessionId(): string {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * 生成消息ID
     */
    private generateMessageId(): string {
        return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * 手动保存
     */
    public save(): void {
        this.saveStorage();
    }
}

// 导出单例实例
export const conversationManager = new ConversationManager();
