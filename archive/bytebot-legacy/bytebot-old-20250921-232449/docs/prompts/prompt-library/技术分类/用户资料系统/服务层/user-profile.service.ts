import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

// 导入JSON Schema并转换为Zod Schema
const userProfileSchema = z.object({
  userId: z.string().regex(/^user_[0-9]{3,}$/, '用户ID格式不正确'),
  basicInfo: z.object({
    userRole: z.array(z.enum(['开发者', '产品经理', '设计师', '运营', '学生', '企业用户', '个人用户'])).min(1),
    usagePurpose: z.array(z.enum(['搭建自动化流程', '产品集成', '学习编程', '提升效率', '团队协作', '原型开发'])).min(1),
    industryScenario: z.array(z.enum(['SaaS', '教育', '电商', '金融', '医疗', '制造业', '媒体', '个人效率', '其他'])).min(1)
  }),
  technicalInfo: z.object({
    techStack: z.array(z.enum(['n8n', 'Python', 'Node.js', 'JavaScript', 'TypeScript', 'React', 'Vue', 'Docker', 'Kubernetes', 'API', '数据库', '云服务'])).optional(),
    techLevel: z.enum(['初学者', '中级', '高级', '专家']),
    toolFamiliarity: z.object({
      n8n: z.enum(['未接触', '基础', '熟练', '精通']).optional(),
      traeIDE: z.enum(['未接触', '入门', '熟练', '精通']).optional(),
      docker: z.enum(['未接触', '基础', '熟练', '精通']).optional()
    }).optional(),
    systemEnvironment: z.array(z.enum(['Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', '本地开发', '云服务'])).optional(),
    dataSource: z.array(z.enum(['MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Google Sheets', 'Excel', 'API', 'CSV', 'JSON'])).optional()
  }),
  teamInfo: z.object({
    teamSize: z.enum(['个人', '小团队(2-5人)', '中型团队(6-20人)', '大型团队(20+人)']),
    teamRoles: z.array(z.enum(['开发者', '设计师', '产品经理', '运营', '测试', 'DevOps', '数据分析师', 'Agent助手'])).optional(),
    collaborationTools: z.array(z.enum(['GitHub', 'GitLab', 'Notion', 'Confluence', 'Slack', 'Teams', '钉钉', '飞书', 'Google Drive', 'OneDrive'])).optional(),
    userGroups: z.array(z.enum(['Dev组', 'Ops组', '设计组', '产品组', '管理层', '实习生组'])).optional(),
    permissions: z.array(z.enum(['只读', '编辑', '管理', '部署', '删除'])).optional()
  }),
  goalRequirements: z.object({
    shortTermGoals: z.array(z.string()).optional(),
    longTermGoals: z.array(z.string()).optional(),
    kpis: z.array(z.object({
      name: z.string(),
      target: z.string(),
      current: z.string().optional()
    })).optional(),
    expectedOutcomes: z.array(z.enum(['SaaS MVP', '自动化脚本', '数据分析报告', 'API集成', '工作流优化', '团队效率提升'])).optional()
  }).optional(),
  resourcesConstraints: z.object({
    availableResources: z.array(z.string()).optional(),
    budgetConstraints: z.enum(['无限制', '$50/月以下', '$50-200/月', '$200-1000/月', '$1000+/月', '企业预算']).optional(),
    timeConstraints: z.object({
      dailyHours: z.number().min(0.5).max(24).optional(),
      projectDeadline: z.string().optional()
    }).optional(),
    riskTolerance: z.enum(['容忍试错', '谨慎稳妥', '必须稳定', '创新优先']).optional()
  }).optional(),
  aiAgentInfo: z.object({
    expectedRoles: z.array(z.enum(['开发助理', '自动运维', '创意生成', '数据分析', '测试助手', '文档生成', '代码审查'])).optional(),
    interactionMethods: z.array(z.enum(['Prompt对话', 'Workflow自动化', '脚本调用', 'API集成', '定时任务', '事件触发'])).optional(),
    decisionPriority: z.enum(['成本优先', '效率优先', '学习优先', '质量优先', '速度优先']).optional(),
    autonomyLevel: z.enum(['全自动', '半自动', '提示建议', '人工确认']).optional(),
    securityCompliance: z.array(z.enum(['GDPR', 'HIPAA', 'SOC2', 'ISO27001', '内部规范', '无特殊要求'])).optional()
  }).optional(),
  projectSource: z.object({
    sourceChannel: z.array(z.enum(['GitHub', '开源社区', '内部需求', '客户需求', '市场调研', '技术探索'])).optional(),
    sourceType: z.array(z.enum(['外部项目', '内部孵化', '客户定制', '开源贡献', '学习项目'])).optional()
  }).optional(),
  versionManagement: z.object({
    updateTimestamp: z.string(),
    version: z.string().regex(/^v\d+\.\d+\.\d+$/, '版本号格式不正确'),
    historyVersions: z.array(z.object({
      version: z.string(),
      timestamp: z.string(),
      changes: z.array(z.string()).optional()
    })).optional(),
    createdAt: z.string(),
    lastModifiedBy: z.string().optional()
  })
});

export type UserProfile = z.infer<typeof userProfileSchema>;

/**
 * 用户资料管理服务
 * 实现用户资料的CRUD操作、自动化填充、版本管理等功能
 */
export class UserProfileService {
  private readonly profilesDir: string;
  private readonly schemaPath: string;

  constructor(baseDir: string = process.cwd()) {
    this.profilesDir = join(baseDir, '.trae', 'user-profiles');
    this.schemaPath = join(baseDir, 'packages', 'bytebot-agent', 'src', 'schemas', 'user-profile.schema.json');
    this.ensureDirectoryExists();
  }

  /**
   * 确保用户资料目录存在
   */
  private ensureDirectoryExists(): void {
    if (!existsSync(this.profilesDir)) {
      mkdirSync(this.profilesDir, { recursive: true });
    }
  }

  /**
   * 生成用户ID
   */
  private generateUserId(): string {
    const timestamp = Date.now().toString().slice(-6);
    return `user_${timestamp}`;
  }

  /**
   * 获取当前版本号
   */
  private getCurrentVersion(existingProfile?: UserProfile): string {
    if (!existingProfile) {
      return 'v1.0.0';
    }
    
    const currentVersion = existingProfile.versionManagement.version;
    const [major, minor, patch] = currentVersion.replace('v', '').split('.').map(Number);
    return `v${major}.${minor}.${patch + 1}`;
  }

  /**
   * 自动填充系统环境信息
   */
  private async autoFillSystemEnvironment(): Promise<('Docker' | 'Kubernetes' | 'AWS' | 'Azure' | 'GCP' | '本地开发' | '云服务')[]> {
    const environment: ('Docker' | 'Kubernetes' | 'AWS' | 'Azure' | 'GCP' | '本地开发' | '云服务')[] = [];
    
    try {
      // 检测Docker
      const { execSync } = require('child_process');
      try {
        execSync('docker --version', { stdio: 'ignore' });
        environment.push('Docker');
      } catch {}
      
      // 检测Kubernetes
      try {
        execSync('kubectl version --client', { stdio: 'ignore' });
        environment.push('Kubernetes');
      } catch {}
      
      // 检测云服务环境变量
      if (process.env.AWS_REGION || process.env.AWS_ACCESS_KEY_ID) {
        environment.push('AWS');
      }
      if (process.env.AZURE_SUBSCRIPTION_ID || process.env.AZURE_CLIENT_ID) {
        environment.push('Azure');
      }
      if (process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT) {
        environment.push('GCP');
      }
      
      // 默认本地开发环境
      if (environment.length === 0) {
        environment.push('本地开发');
      }
    } catch (error) {
      console.warn('自动检测系统环境失败:', error);
      environment.push('本地开发');
    }
    
    return environment;
  }

  /**
   * 自动填充协作工具
   */
  private async autoFillCollaborationTools(): Promise<('GitHub' | 'GitLab' | 'Notion' | 'Confluence' | 'Slack' | 'Teams' | '钉钉' | '飞书' | 'Google Drive' | 'OneDrive')[]> {
    const tools: ('GitHub' | 'GitLab' | 'Notion' | 'Confluence' | 'Slack' | 'Teams' | '钉钉' | '飞书' | 'Google Drive' | 'OneDrive')[] = [];
    
    try {
      const { execSync } = require('child_process');
      
      // 检测Git配置
      try {
        const gitRemote = execSync('git remote -v', { encoding: 'utf8', stdio: 'pipe' });
        if (gitRemote.includes('github.com')) {
          tools.push('GitHub');
        } else if (gitRemote.includes('gitlab.com')) {
          tools.push('GitLab');
        }
      } catch {}
      
      // 检测常见配置文件
      const configFiles = [
        { file: '.notion', tool: 'Notion' as const },
        { file: 'confluence.config.js', tool: 'Confluence' as const },
        { file: '.slack', tool: 'Slack' as const }
      ];
      
      for (const { file, tool } of configFiles) {
        if (existsSync(join(process.cwd(), file))) {
          tools.push(tool);
        }
      }
    } catch (error) {
      console.warn('自动检测协作工具失败:', error);
    }
    
    return tools;
  }

  /**
   * 自动填充可用资源
   */
  private async autoFillAvailableResources(): Promise<string[]> {
    const resources: string[] = [];
    
    try {
      const os = require('os');
      
      // 系统资源信息
      const totalMemory = Math.round(os.totalmem() / (1024 * 1024 * 1024));
      const cpuCount = os.cpus().length;
      
      resources.push(`内存${totalMemory}GB`);
      resources.push(`CPU${cpuCount}核`);
      
      // 检测云服务
      if (process.env.AWS_REGION) {
        resources.push('AWS云服务');
      }
      if (process.env.AZURE_SUBSCRIPTION_ID) {
        resources.push('Azure云服务');
      }
      if (process.env.GOOGLE_CLOUD_PROJECT) {
        resources.push('GCP云服务');
      }
      
      // 检测Docker资源
      try {
        const { execSync } = require('child_process');
        execSync('docker info', { stdio: 'ignore' });
        resources.push('Docker容器环境');
      } catch {}
      
    } catch (error) {
      console.warn('自动检测可用资源失败:', error);
      resources.push('本地开发环境');
    }
    
    return resources;
  }

  /**
   * 创建用户资料
   */
  async createUserProfile(profileData: Partial<UserProfile>): Promise<UserProfile> {
    const userId = profileData.userId || this.generateUserId();
    const now = new Date().toISOString();
    
    // 自动填充系统信息
    const systemEnvironment = await this.autoFillSystemEnvironment();
    const collaborationTools = await this.autoFillCollaborationTools();
    const availableResources = await this.autoFillAvailableResources();
    
    const profile: UserProfile = {
      userId,
      basicInfo: profileData.basicInfo || {
        userRole: ['个人用户'],
        usagePurpose: ['学习编程'],
        industryScenario: ['个人效率']
      },
      technicalInfo: {
        techLevel: profileData.technicalInfo?.techLevel || '初学者',
        systemEnvironment: profileData.technicalInfo?.systemEnvironment || systemEnvironment,
        ...profileData.technicalInfo
      },
      teamInfo: {
        teamSize: profileData.teamInfo?.teamSize || '个人',
        collaborationTools: profileData.teamInfo?.collaborationTools || collaborationTools,
        ...profileData.teamInfo
      },
      goalRequirements: profileData.goalRequirements,
      resourcesConstraints: {
        availableResources: profileData.resourcesConstraints?.availableResources || availableResources,
        ...profileData.resourcesConstraints
      },
      aiAgentInfo: profileData.aiAgentInfo,
      projectSource: profileData.projectSource,
      versionManagement: {
        updateTimestamp: now,
        version: 'v1.0.0',
        createdAt: now,
        lastModifiedBy: 'system',
        historyVersions: []
      }
    };
    
    // 验证数据
    const validatedProfile = userProfileSchema.parse(profile);
    
    // 保存到文件
    const filePath = join(this.profilesDir, `${userId}.json`);
    writeFileSync(filePath, JSON.stringify(validatedProfile, null, 2), 'utf8');
    
    return validatedProfile;
  }

  /**
   * 获取用户资料
   */
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const filePath = join(this.profilesDir, `${userId}.json`);
    
    if (!existsSync(filePath)) {
      return null;
    }
    
    try {
      const content = readFileSync(filePath, 'utf8');
      const profile = JSON.parse(content);
      return userProfileSchema.parse(profile);
    } catch (error) {
      console.error(`读取用户资料失败 ${userId}:`, error);
      return null;
    }
  }

  /**
   * 更新用户资料
   */
  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    const existingProfile = await this.getUserProfile(userId);
    if (!existingProfile) {
      return null;
    }
    
    const now = new Date().toISOString();
    const newVersion = this.getCurrentVersion(existingProfile);
    
    // 记录历史版本
    const historyVersions = existingProfile.versionManagement.historyVersions || [];
    historyVersions.push({
      version: existingProfile.versionManagement.version,
      timestamp: existingProfile.versionManagement.updateTimestamp,
      changes: this.getChanges(existingProfile, updates)
    });
    
    // 合并更新
    const updatedProfile: UserProfile = {
      ...existingProfile,
      ...updates,
      userId, // 确保userId不被覆盖
      versionManagement: {
        ...existingProfile.versionManagement,
        updateTimestamp: now,
        version: newVersion,
        lastModifiedBy: updates.versionManagement?.lastModifiedBy || 'system',
        historyVersions
      }
    };
    
    // 验证数据
    const validatedProfile = userProfileSchema.parse(updatedProfile);
    
    // 保存到文件
    const filePath = join(this.profilesDir, `${userId}.json`);
    writeFileSync(filePath, JSON.stringify(validatedProfile, null, 2), 'utf8');
    
    return validatedProfile;
  }

  /**
   * 获取变更记录
   */
  private getChanges(oldProfile: UserProfile, updates: Partial<UserProfile>): string[] {
    const changes: string[] = [];
    
    // 简单的变更检测
    Object.keys(updates).forEach(key => {
      if (key !== 'versionManagement' && JSON.stringify(oldProfile[key as keyof UserProfile]) !== JSON.stringify(updates[key as keyof UserProfile])) {
        changes.push(`更新了${key}`);
      }
    });
    
    return changes;
  }

  /**
   * 删除用户资料
   */
  async deleteUserProfile(userId: string): Promise<boolean> {
    const filePath = join(this.profilesDir, `${userId}.json`);
    
    if (!existsSync(filePath)) {
      return false;
    }
    
    try {
      const fs = require('fs');
      fs.unlinkSync(filePath);
      return true;
    } catch (error) {
      console.error(`删除用户资料失败 ${userId}:`, error);
      return false;
    }
  }

  /**
   * 列出所有用户资料
   */
  async listUserProfiles(): Promise<UserProfile[]> {
    const fs = require('fs');
    const profiles: UserProfile[] = [];
    
    try {
      const files = fs.readdirSync(this.profilesDir);
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          const userId = file.replace('.json', '');
          const profile = await this.getUserProfile(userId);
          if (profile) {
            profiles.push(profile);
          }
        }
      }
    } catch (error) {
      console.error('列出用户资料失败:', error);
    }
    
    return profiles;
  }

  /**
   * 根据条件搜索用户资料
   */
  async searchUserProfiles(criteria: {
    userRole?: string[];
    techLevel?: string;
    teamSize?: string;
    industryScenario?: string[];
  }): Promise<UserProfile[]> {
    const allProfiles = await this.listUserProfiles();
    
    return allProfiles.filter(profile => {
      if (criteria.userRole && !criteria.userRole.some(role => profile.basicInfo.userRole.includes(role as any))) {
        return false;
      }
      
      if (criteria.techLevel && profile.technicalInfo.techLevel !== criteria.techLevel as any) {
        return false;
      }
      
      if (criteria.teamSize && profile.teamInfo.teamSize !== criteria.teamSize as any) {
        return false;
      }
      
      if (criteria.industryScenario && !criteria.industryScenario.some(scenario => profile.basicInfo.industryScenario.includes(scenario as any))) {
        return false;
      }
      
      return true;
    });
  }

  /**
   * 获取用户资料统计信息
   */
  async getProfileStatistics(): Promise<{
    totalProfiles: number;
    userRoleDistribution: Record<string, number>;
    techLevelDistribution: Record<string, number>;
    teamSizeDistribution: Record<string, number>;
    industryDistribution: Record<string, number>;
  }> {
    const profiles = await this.listUserProfiles();
    
    const stats = {
      totalProfiles: profiles.length,
      userRoleDistribution: {} as Record<string, number>,
      techLevelDistribution: {} as Record<string, number>,
      teamSizeDistribution: {} as Record<string, number>,
      industryDistribution: {} as Record<string, number>
    };
    
    profiles.forEach(profile => {
      // 用户角色分布
      profile.basicInfo.userRole.forEach(role => {
        stats.userRoleDistribution[role] = (stats.userRoleDistribution[role] || 0) + 1;
      });
      
      // 技术水平分布
      const techLevel = profile.technicalInfo.techLevel;
      stats.techLevelDistribution[techLevel] = (stats.techLevelDistribution[techLevel] || 0) + 1;
      
      // 团队规模分布
      const teamSize = profile.teamInfo.teamSize;
      stats.teamSizeDistribution[teamSize] = (stats.teamSizeDistribution[teamSize] || 0) + 1;
      
      // 行业分布
      profile.basicInfo.industryScenario.forEach(industry => {
        stats.industryDistribution[industry] = (stats.industryDistribution[industry] || 0) + 1;
      });
    });
    
    return stats;
  }

  /**
   * 导出用户资料
   */
  async exportUserProfile(userId: string, format: 'json' | 'yaml' = 'json'): Promise<string | null> {
    const profile = await this.getUserProfile(userId);
    if (!profile) {
      return null;
    }
    
    if (format === 'json') {
      return JSON.stringify(profile, null, 2);
    } else if (format === 'yaml') {
      const yaml = require('yaml');
      return yaml.stringify(profile);
    }
    
    return null;
  }

  /**
   * 导入用户资料
   */
  async importUserProfile(data: string, format: 'json' | 'yaml' = 'json'): Promise<UserProfile | null> {
    try {
      let profileData: any;
      
      if (format === 'json') {
        profileData = JSON.parse(data);
      } else if (format === 'yaml') {
        const yaml = require('yaml');
        profileData = yaml.parse(data);
      } else {
        throw new Error('不支持的格式');
      }
      
      return await this.createUserProfile(profileData);
    } catch (error) {
      console.error('导入用户资料失败:', error);
      return null;
    }
  }

  /**
   * 验证用户资料数据
   */
  validateProfile(profileData: any): { valid: boolean; errors: string[] } {
    try {
      userProfileSchema.parse(profileData);
      return { valid: true, errors: [] };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          valid: false,
          errors: error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
        };
      }
      return { valid: false, errors: [error.message] };
    }
  }
}

// 导出单例实例
export const userProfileService = new UserProfileService();