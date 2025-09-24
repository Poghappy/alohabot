/**
 * ByteBot 提示词管理器
 * 负责系统提示词的动态加载、管理和版本控制
 */

import { existsSync, readFileSync } from 'fs';
import * as yaml from 'js-yaml';
import { join } from 'path';

export interface SystemPrompt {
    name: string;
    description: string;
    content: string;
    version?: string;
    tags?: string[];
}

export interface PromptTemplate {
    name: string;
    variables: string[];
    template: string;
}

export interface PromptConfig {
    version: string;
    last_updated: string;
    core_prompts: Record<string, SystemPrompt>;
    dynamic_templates: Record<string, PromptTemplate>;
    version_history: Array<{
        version: string;
        date: string;
        changes: string;
    }>;
}

export class PromptManager {
    private config: PromptConfig | null = null;
    private configPath: string;
    private userContext: Record<string, any> = {};

    constructor(configPath?: string) {
        this.configPath = configPath || join(process.cwd(), 'config/prompt-templates/system-prompts.yaml');
    }

    /**
     * 加载提示词配置
     */
    public async loadConfig(): Promise<void> {
        try {
            if (!existsSync(this.configPath)) {
                throw new Error(`提示词配置文件不存在: ${this.configPath}`);
            }

            const configContent = readFileSync(this.configPath, 'utf8');
            this.config = yaml.load(configContent) as PromptConfig;

            console.log(`✅ 提示词配置加载成功，版本: ${this.config.version}`);
        } catch (error) {
            console.error('❌ 加载提示词配置失败:', error);
            throw error;
        }
    }

    /**
     * 获取系统提示词
     */
    public getSystemPrompt(promptId: string): SystemPrompt | null {
        if (!this.config) {
            throw new Error('提示词配置未加载，请先调用 loadConfig()');
        }

        return this.config.core_prompts[promptId] || null;
    }

    /**
     * 获取所有可用的系统提示词
     */
    public getAvailablePrompts(): string[] {
        if (!this.config) {
            return [];
        }

        return Object.keys(this.config.core_prompts);
    }

    /**
     * 渲染动态提示词模板
     */
    public renderTemplate(templateId: string, variables: Record<string, any>): string {
        if (!this.config) {
            throw new Error('提示词配置未加载，请先调用 loadConfig()');
        }

        const template = this.config.dynamic_templates[templateId];
        if (!template) {
            throw new Error(`模板不存在: ${templateId}`);
        }

        let renderedContent = template.template;

        // 替换变量
        for (const [key, value] of Object.entries(variables)) {
            const placeholder = `{${key}}`;
            renderedContent = renderedContent.replace(new RegExp(placeholder, 'g'), String(value));
        }

        return renderedContent;
    }

    /**
     * 设置用户上下文
     */
    public setUserContext(context: Record<string, any>): void {
        this.userContext = { ...this.userContext, ...context };
    }

    /**
     * 获取用户上下文
     */
    public getUserContext(): Record<string, any> {
        return this.userContext;
    }

    /**
     * 组合系统提示词和用户上下文
     */
    public buildContextualPrompt(promptId: string, additionalContext?: Record<string, any>): string {
        const systemPrompt = this.getSystemPrompt(promptId);
        if (!systemPrompt) {
            throw new Error(`系统提示词不存在: ${promptId}`);
        }

        let contextualPrompt = systemPrompt.content;

        // 如果有用户上下文模板，添加用户信息
        if (this.config?.dynamic_templates.user_context) {
            const userContextContent = this.renderTemplate('user_context', {
                ...this.userContext,
                ...additionalContext
            });
            contextualPrompt += '\n\n' + userContextContent;
        }

        return contextualPrompt;
    }

    /**
     * 重新加载配置（热更新）
     */
    public async reloadConfig(): Promise<void> {
        console.log('🔄 重新加载提示词配置...');
        await this.loadConfig();
    }

    /**
     * 获取配置版本信息
     */
    public getVersionInfo(): { version: string; lastUpdated: string } | null {
        if (!this.config) {
            return null;
        }

        return {
            version: this.config.version,
            lastUpdated: this.config.last_updated
        };
    }
}

// 导出单例实例
export const promptManager = new PromptManager();
