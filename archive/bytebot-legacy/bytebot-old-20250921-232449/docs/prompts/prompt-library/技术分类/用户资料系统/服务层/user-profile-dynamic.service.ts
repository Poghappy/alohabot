import { z } from 'zod';
import { UserProfileService } from './user-profile.service';
import { UserProfile } from './user-profile.service';

/**
 * 动态更新配置
 */
interface DynamicUpdateConfig {
  /** 自动更新间隔（毫秒） */
  updateInterval: number;
  /** 是否启用实时更新 */
  enableRealTimeUpdate: boolean;
  /** 更新触发器 */
  triggers: {
    taskCompletion: boolean;
    toolUsage: boolean;
    environmentChange: boolean;
    teamChange: boolean;
  };
}

/**
 * 标签化字段配置
 */
interface TagConfig {
  /** 字段名称 */
  fieldName: string;
  /** 标签类型 */
  tagType: 'single' | 'multiple';
  /** 预定义标签 */
  predefinedTags: string[];
  /** 是否允许自定义标签 */
  allowCustomTags: boolean;
  /** 标签验证规则 */
  validationRules?: {
    maxLength?: number;
    pattern?: RegExp;
    required?: boolean;
  };
}

/**
 * 环境检测结果
 */
interface EnvironmentDetection {
  /** 系统环境 */
  systemEnvironment: {
    os: string;
    nodeVersion?: string;
    dockerInstalled: boolean;
    kubernetesAvailable: boolean;
  };
  /** 开发工具 */
  developmentTools: string[];
  /** 可用服务 */
  availableServices: string[];
  /** 网络配置 */
  networkConfig: {
    hasInternet: boolean;
    proxyConfigured: boolean;
    vpnActive: boolean;
  };
}

/**
 * 用户资料动态更新服务
 * 负责实现动态更新、标签化字段、自动化填充等功能
 */
export class UserProfileDynamicService {
  private userProfileService: UserProfileService;
  private updateConfig: DynamicUpdateConfig;
  private tagConfigs: Map<string, TagConfig>;
  private updateTimers: Map<string, NodeJS.Timeout>;

  constructor(
    userProfileService: UserProfileService,
    config?: Partial<DynamicUpdateConfig>
  ) {
    this.userProfileService = userProfileService;
    this.updateConfig = {
      updateInterval: 300000, // 5分钟
      enableRealTimeUpdate: true,
      triggers: {
        taskCompletion: true,
        toolUsage: true,
        environmentChange: true,
        teamChange: true
      },
      ...config
    };
    this.tagConfigs = new Map();
    this.updateTimers = new Map();
    
    this.initializeTagConfigs();
  }

  /**
   * 初始化标签配置
   */
  private initializeTagConfigs(): void {
    // 技术栈标签配置
    this.tagConfigs.set('techStack', {
      fieldName: 'technicalInfo.techStack',
      tagType: 'multiple',
      predefinedTags: [
        'n8n', 'Python', 'Node.js', 'JavaScript', 'TypeScript',
        'React', 'Vue', 'Angular', 'Docker', 'Kubernetes',
        'API', '数据库', 'MySQL', 'PostgreSQL', 'MongoDB',
        '云服务', 'AWS', 'Azure', 'GCP', 'Git', 'GitHub'
      ],
      allowCustomTags: true,
      validationRules: {
        maxLength: 50,
        pattern: /^[a-zA-Z0-9\u4e00-\u9fa5\-\.]+$/
      }
    });

    // 行业场景标签配置
    this.tagConfigs.set('industryScenario', {
      fieldName: 'basicInfo.industryScenario',
      tagType: 'multiple',
      predefinedTags: [
        'SaaS', '教育', '电商', '金融', '医疗', '制造业',
        '物流', '零售', '媒体', '游戏', '个人效率', '企业服务'
      ],
      allowCustomTags: true,
      validationRules: {
        maxLength: 30
      }
    });

    // 使用目的标签配置
    this.tagConfigs.set('usagePurpose', {
      fieldName: 'basicInfo.usagePurpose',
      tagType: 'multiple',
      predefinedTags: [
        '搭建自动化流程', '产品集成', '学习编程', '数据处理',
        'API开发', '系统部署', '测试自动化', '运维监控'
      ],
      allowCustomTags: true,
      validationRules: {
        maxLength: 50
      }
    });

    // 团队角色标签配置
    this.tagConfigs.set('teamRoles', {
      fieldName: 'teamInfo.teamRoles',
      tagType: 'multiple',
      predefinedTags: [
        '开发者', '设计师', '产品经理', '运营', '测试工程师',
        '数据分析师', '项目经理', 'DevOps工程师', 'Agent助手'
      ],
      allowCustomTags: true,
      validationRules: {
        maxLength: 30
      }
    });
  }

  /**
   * 启动动态更新
   */
  async startDynamicUpdate(userId: string): Promise<void> {
    if (!this.updateConfig.enableRealTimeUpdate) {
      return;
    }

    // 清除现有定时器
    this.stopDynamicUpdate(userId);

    // 设置新的定时器
    const timer = setInterval(async () => {
      try {
        await this.performDynamicUpdate(userId);
      } catch (error) {
        console.error(`动态更新失败 (用户: ${userId}):`, error);
      }
    }, this.updateConfig.updateInterval);

    this.updateTimers.set(userId, timer);
  }

  /**
   * 停止动态更新
   */
  stopDynamicUpdate(userId: string): void {
    const timer = this.updateTimers.get(userId);
    if (timer) {
      clearInterval(timer);
      this.updateTimers.delete(userId);
    }
  }

  /**
   * 执行动态更新
   */
  private async performDynamicUpdate(userId: string): Promise<void> {
    const profile = await this.userProfileService.getUserProfile(userId);
    if (!profile) {
      return;
    }

    const updates: Partial<UserProfile> = {};
    let hasUpdates = false;

    // 检测环境变化
    if (this.updateConfig.triggers.environmentChange) {
      const envDetection = await this.detectEnvironment();
      const envUpdates = this.generateEnvironmentUpdates(profile, envDetection);
      if (Object.keys(envUpdates).length > 0) {
        Object.assign(updates, envUpdates);
        hasUpdates = true;
      }
    }

    // 更新可用资源
    const resourceUpdates = await this.updateAvailableResources(profile);
    if (Object.keys(resourceUpdates).length > 0) {
      Object.assign(updates, resourceUpdates);
      hasUpdates = true;
    }

    // 应用更新
    if (hasUpdates) {
      await this.userProfileService.updateUserProfile(userId, updates);
    }
  }

  /**
   * 检测系统环境
   */
  private async detectEnvironment(): Promise<EnvironmentDetection> {
    const detection: EnvironmentDetection = {
      systemEnvironment: {
        os: process.platform,
        dockerInstalled: false,
        kubernetesAvailable: false
      },
      developmentTools: [],
      availableServices: [],
      networkConfig: {
        hasInternet: false,
        proxyConfigured: false,
        vpnActive: false
      }
    };

    try {
      // 检测 Node.js 版本
      detection.systemEnvironment.nodeVersion = process.version;

      // 检测 Docker
      try {
        const { execSync } = require('child_process');
        execSync('docker --version', { stdio: 'ignore' });
        detection.systemEnvironment.dockerInstalled = true;
        detection.developmentTools.push('Docker');
      } catch {
        // Docker 未安装
      }

      // 检测 Kubernetes
      try {
        const { execSync } = require('child_process');
        execSync('kubectl version --client', { stdio: 'ignore' });
        detection.systemEnvironment.kubernetesAvailable = true;
        detection.developmentTools.push('Kubernetes');
      } catch {
        // Kubernetes 未安装
      }

      // 检测网络连接
      try {
        const https = require('https');
        await new Promise((resolve, reject) => {
          const req = https.get('https://www.google.com', { timeout: 5000 }, resolve);
          req.on('error', reject);
          req.on('timeout', reject);
        });
        detection.networkConfig.hasInternet = true;
      } catch {
        // 网络不可用
      }

    } catch (error) {
      console.error('环境检测失败:', error);
    }

    return detection;
  }

  /**
   * 生成环境更新
   */
  private generateEnvironmentUpdates(
    profile: UserProfile,
    detection: EnvironmentDetection
  ): Partial<UserProfile> {
    const updates: Partial<UserProfile> = {};

    // 更新系统环境
    const currentSystemEnv = profile.technicalInfo.systemEnvironment || [];
    const detectedEnv = [
      detection.systemEnvironment.os,
      ...(detection.systemEnvironment.dockerInstalled ? ['Docker'] : []),
      ...(detection.systemEnvironment.kubernetesAvailable ? ['Kubernetes'] : [])
    ];

    const newEnvItems = detectedEnv.filter(env => !currentSystemEnv.includes(env));
    if (newEnvItems.length > 0) {
      updates.technicalInfo = {
        ...updates.technicalInfo,
        ...profile.technicalInfo,
        systemEnvironment: [...currentSystemEnv, ...newEnvItems]
      };
    }

    return updates;
  }

  /**
   * 更新可用资源
   */
  private async updateAvailableResources(profile: UserProfile): Promise<Partial<UserProfile>> {
    const updates: Partial<UserProfile> = {};

    try {
      // 检测系统资源
      const os = require('os');
      const totalMemory = Math.round(os.totalmem() / (1024 * 1024 * 1024)); // GB
      const freeMemory = Math.round(os.freemem() / (1024 * 1024 * 1024)); // GB
      const cpuCount = os.cpus().length;

      const resourceInfo = [
        `内存: ${totalMemory}GB (可用: ${freeMemory}GB)`,
        `CPU: ${cpuCount}核心`,
        `系统: ${os.type()} ${os.release()}`
      ];

      // 注释掉resourcesAndLimitations相关代码，因为该字段在UserProfile类型中不存在
       // const currentResources = profile.resourcesAndLimitations.availableResources || [];
       // const systemResourceExists = currentResources.some(resource => 
       //   resource.includes('内存:') || resource.includes('CPU:') || resource.includes('系统:')
       // );

      // 由于resourcesAndLimitations字段不存在，暂时跳过资源信息更新
      // const systemResourceExists = false;
      // if (!systemResourceExists) {
      //   updates.resourcesAndLimitations = {
      //     ...updates.resourcesAndLimitations,
      //     ...profile.resourcesAndLimitations,
      //     availableResources: [...currentResources, ...resourceInfo]
      //   };
      // }

    } catch (error) {
      console.error('资源检测失败:', error);
    }

    return updates;
  }

  /**
   * 处理标签化字段
   */
  async processTaggedField(
    userId: string,
    fieldName: string,
    tags: string[]
  ): Promise<{ valid: string[]; invalid: string[]; suggestions: string[] }> {
    const tagConfig = this.tagConfigs.get(fieldName);
    if (!tagConfig) {
      throw new Error(`未找到字段 ${fieldName} 的标签配置`);
    }

    const result = {
      valid: [] as string[],
      invalid: [] as string[],
      suggestions: [] as string[]
    };

    for (const tag of tags) {
      // 验证标签
      const isValid = this.validateTag(tag, tagConfig);
      if (isValid) {
        result.valid.push(tag);
      } else {
        result.invalid.push(tag);
      }
    }

    // 生成建议标签
    result.suggestions = this.generateTagSuggestions(tags, tagConfig);

    return result;
  }

  /**
   * 验证标签
   */
  private validateTag(tag: string, config: TagConfig): boolean {
    const rules = config.validationRules;
    if (!rules) {
      return true;
    }

    // 检查长度
    if (rules.maxLength && tag.length > rules.maxLength) {
      return false;
    }

    // 检查模式
    if (rules.pattern && !rules.pattern.test(tag)) {
      return false;
    }

    return true;
  }

  /**
   * 生成标签建议
   */
  private generateTagSuggestions(inputTags: string[], config: TagConfig): string[] {
    const suggestions: string[] = [];
    const predefinedTags = config.predefinedTags;

    for (const inputTag of inputTags) {
      // 查找相似的预定义标签
      const similarTags = predefinedTags.filter(predefinedTag => {
        const similarity = this.calculateStringSimilarity(inputTag.toLowerCase(), predefinedTag.toLowerCase());
        return similarity > 0.6 && !inputTags.includes(predefinedTag);
      });

      suggestions.push(...similarTags.slice(0, 3)); // 最多3个建议
    }

    // 去重并返回
    return [...new Set(suggestions)];
  }

  /**
   * 计算字符串相似度
   */
  private calculateStringSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) {
      return 1.0;
    }
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  /**
   * 计算编辑距离
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  /**
   * 触发更新事件
   */
  async triggerUpdate(
    userId: string,
    eventType: keyof DynamicUpdateConfig['triggers'],
    eventData?: any
  ): Promise<void> {
    if (!this.updateConfig.triggers[eventType]) {
      return;
    }

    try {
      switch (eventType) {
        case 'taskCompletion':
          await this.handleTaskCompletionUpdate(userId, eventData);
          break;
        case 'toolUsage':
          await this.handleToolUsageUpdate(userId, eventData);
          break;
        case 'environmentChange':
          await this.performDynamicUpdate(userId);
          break;
        case 'teamChange':
          await this.handleTeamChangeUpdate(userId, eventData);
          break;
      }
    } catch (error) {
      console.error(`更新事件处理失败 (${eventType}):`, error);
    }
  }

  /**
   * 处理任务完成更新
   */
  private async handleTaskCompletionUpdate(userId: string, taskData: any): Promise<void> {
    const profile = await this.userProfileService.getUserProfile(userId);
    if (!profile) return;

    const updates: Partial<UserProfile> = {};

    // 更新技能水平
    if (taskData.taskType && taskData.success) {
      const currentLevel = profile.technicalInfo.techLevel;
      if (currentLevel === '初学者' && taskData.complexity === 'medium') {
        updates.technicalInfo = {
          ...updates.technicalInfo,
          ...profile.technicalInfo,
          techLevel: '中级'
        };
      } else if (currentLevel === '中级' && taskData.complexity === 'high') {
        updates.technicalInfo = {
          ...updates.technicalInfo,
          ...profile.technicalInfo,
          techLevel: '高级'
        };
      }
    }

    if (Object.keys(updates).length > 0) {
      await this.userProfileService.updateUserProfile(userId, updates);
    }
  }

  /**
   * 处理工具使用更新
   */
  private async handleToolUsageUpdate(userId: string, toolData: any): Promise<void> {
    const profile = await this.userProfileService.getUserProfile(userId);
    if (!profile) return;

    const updates: Partial<UserProfile> = {};

    // 更新工具熟悉度
    if (toolData.toolName && toolData.success) {
      const currentFamiliarity = profile.technicalInfo.toolFamiliarity || {};
      const currentLevel = currentFamiliarity[toolData.toolName] || '入门';
      
      let newLevel = currentLevel;
      if (currentLevel === '入门' && toolData.complexity === 'medium') {
        newLevel = '基础';
      } else if (currentLevel === '基础' && toolData.complexity === 'high') {
        newLevel = '熟练';
      }

      if (newLevel !== currentLevel) {
        updates.technicalInfo = {
          ...updates.technicalInfo,
          ...profile.technicalInfo,
          toolFamiliarity: {
            ...currentFamiliarity,
            [toolData.toolName]: newLevel
          }
        };
      }
    }

    if (Object.keys(updates).length > 0) {
      await this.userProfileService.updateUserProfile(userId, updates);
    }
  }

  /**
   * 处理团队变化更新
   */
  private async handleTeamChangeUpdate(userId: string, teamData: any): Promise<void> {
    const profile = await this.userProfileService.getUserProfile(userId);
    if (!profile) return;

    const updates: Partial<UserProfile> = {};

    // 更新团队信息
    if (teamData.newMembers || teamData.removedMembers) {
      const currentSize = profile.teamInfo.teamSize;
      let newSize = currentSize;

      if (teamData.newMembers) {
        const memberCount = Array.isArray(teamData.newMembers) ? teamData.newMembers.length : 1;
        if (currentSize === '个人' && memberCount > 0) {
          newSize = '小团队(2-5人)';
        } else if (currentSize === '小团队(2-5人)' && memberCount > 3) {
          newSize = '大型团队(20+人)';
        }
      }

      if (newSize !== currentSize) {
        updates.teamInfo = {
          ...updates.teamInfo,
          ...profile.teamInfo,
          teamSize: newSize
        };
      }
    }

    if (Object.keys(updates).length > 0) {
      await this.userProfileService.updateUserProfile(userId, updates);
    }
  }

  /**
   * 获取标签配置
   */
  getTagConfig(fieldName: string): TagConfig | undefined {
    return this.tagConfigs.get(fieldName);
  }

  /**
   * 设置标签配置
   */
  setTagConfig(fieldName: string, config: TagConfig): void {
    this.tagConfigs.set(fieldName, config);
  }

  /**
   * 获取所有标签配置
   */
  getAllTagConfigs(): Map<string, TagConfig> {
    return new Map(this.tagConfigs);
  }

  /**
   * 清理资源
   */
  cleanup(): void {
    // 清除所有定时器
    for (const [userId, timer] of this.updateTimers) {
      clearInterval(timer);
    }
    this.updateTimers.clear();
  }
}

/**
 * 导出类型定义
 */
export type {
  DynamicUpdateConfig,
  TagConfig,
  EnvironmentDetection
};